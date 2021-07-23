import {registerGlobals} from 'react-native-webrtc'
import * as mediasoupClient from "mediasoup-client";
import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../utils/Types";
import {printError} from "../utils/PrintError";
import {serviceConfig, SignalMethod, SignalType, TransportType} from "../ServiceConfig";
import {SignalingService} from "./SignalingService";
import {PeerMedia} from "../utils/media/PeerMedia";

export class MediaService
{
    private roomToken: string = null;
    private userToken: string = null;
    private serverURL: string = null;
    private displayName: string = null;
    private deviceName: string = null;

    private signaling: SignalingService = null;
    private device: mediasoupTypes.Device = null;

    private sendTransport: mediasoupTypes.Transport = null;
    private recvTransport: mediasoupTypes.Transport = null;

    private producers: Map<string, mediasoupTypes.Producer> = null;
    private peerMeida: PeerMedia = null;

    private sendTransportOpt: mediasoupTypes.TransportOptions = null;
    private joined: boolean = null;

    private updateStreamsCallback: () => void = null;

    constructor(updateOutputStreams: () => void)
    {
        try {
            registerGlobals();
            this.device = new mediasoupClient.Device();

            this.producers = new Map<string, mediasoupTypes.Producer>();
            this.peerMeida = new PeerMedia();

            this.joined = false;
            console.log('set joined to false in constructor');
            this.updateStreamsCallback = updateOutputStreams;
        } catch (err) {
            printError(err);
        }
    }

    public getPeerMedia()
    {
        return this.peerMeida.getPeerMedia();
    }


    // steps for connection:
    // create a signaling client which has a socketio inside, then try to connect to server
    // wait until the connection is built
    // send request to get routerRtpCapabilities from server
    // load the routerRtpCapabilities into device
    //
    public async joinMeeting(roomToken: string, userToken: string, displayName: string, deviceName: string)
    {
        console.log('Try to join meeting');
        this.roomToken = roomToken;
        this.userToken = userToken;
        this.serverURL = `${serviceConfig.serverURL}?roomId=${this.roomToken}&peerId=${this.userToken}`;
        this.displayName = deviceName;
        this.deviceName = deviceName;

        this.signaling = new SignalingService(this.serverURL, {
            // timeout: 3000,
            // reconnection: true,
            // reconnectionAttempts: Infinity,
            // reconnectionDelayMax: 2000,
            // transports: ['websocket'],
        });

        await this.signaling.waitForConnection();
        this.registerSignalingListeners();

        const rtpCapabilities = await this.signaling.sendRequest(SignalMethod.getRouterRtpCapabilities);
        console.log("Router RTP Capabilities: " + JSON.stringify(rtpCapabilities));

        try {
            await this.device.load({routerRtpCapabilities: rtpCapabilities});
            console.log("Device SCTP Capabilities: " + JSON.stringify(this.device.sctpCapabilities));
        } catch (err) {
            printError(err);
        }

        await this.createSendTransport();
        await this.createRecvTransport();

        const _peerInfos = (await this.signaling.sendRequest(SignalMethod.join, {
            displayName: this.displayName,
            joined: this.joined,
            device: this.deviceName,
            rtpCapabilities: this.device.rtpCapabilities,
        } as types.JoinRequest)) as types.PeerInfo[];

        for (const info of _peerInfos) {
            this.peerMeida.addPeerInfo(info);
        }

        this.joined = true;
        console.log('set joined to true in joining meeting');
    }

    public async sendMediaStream(stream: MediaStream)
    {
        try {
            const videoTracks = stream.getVideoTracks();
            let i = 0;
            for (const track of videoTracks) {
                const source = `${this.userToken}_video_${i++}`;
                const params: mediasoupTypes.ProducerOptions = {
                    track,
                    appData: { source },
                    codec: this.device.rtpCapabilities.codecs.find(codec => codec.mimeType === 'video/H264')
                }

                const producer = await this.sendTransport.produce(params);

                producer.on('transportclose', () => {
                    console.log(`video source ${source} transportclose!`);
                    this.producers.delete(source);
                });

                producer.on('trackended', () => {
                    console.log(`video source ${source} transportclose!`);
                    this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
                    this.producers.delete(source);
                });

                this.producers.set(producer.id, producer);

                console.log(`Producing ${source}`);
            }
            i = 0;
            const audioTracks = stream.getAudioTracks();
            for (const track of audioTracks) {
                const source = `${this.userToken}_audio_${i++}`;
                const params: mediasoupTypes.ProducerOptions = {
                    track,
                    appData: { source },
                }

                const producer = await this.sendTransport.produce(params);

                producer.on('transportclose', () => {
                    console.log(`audio source ${source} transportclose!`);
                    this.producers.delete(producer.id);
                });

                producer.on('trackended', () => {
                    console.log(`audio source ${source} transportclose!`);
                    this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
                    this.producers.delete(producer.id);
                });

                this.producers.set(producer.id, producer);
                console.log(`Producing ${source}`);
            }
        } catch (err) {
            printError(err);
        }
    }

    public async leaveMeeting()
    {
        await this.signaling.sendRequest(SignalMethod.close);

        this.sendTransport = null;
        this.recvTransport = null;
        this.sendTransportOpt = null;
        this.device = new mediasoupClient.Device();
        this.producers = new Map<string, mediasoupTypes.Producer>();
        this.peerMeida = new PeerMedia();

        this.joined = false;
        console.log('set joined to false in leaving meeting');
        delete this.signaling;
        this.signaling = null;
    }

    private async createSendTransport()
    {
        this.sendTransportOpt = await this.signaling.sendRequest(SignalMethod.createTransport, {
            transportType: TransportType.producer,
            sctpCapabilities: this.device.sctpCapabilities,
        } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions;

        // console.log("Transport ID: " + this.sendTransportOpt.id);
        // console.log("Transport ICE Candidates: " + JSON.stringify(this.sendTransportOpt.iceCandidates));
        // console.log("Transport ICE Parameters: " + JSON.stringify(this.sendTransportOpt.iceParameters));
        // console.log("Transport DTLS Parameters: " + JSON.stringify(this.sendTransportOpt.dtlsParameters));
        // console.log("Transport SCTP Parameters: " + JSON.stringify(this.sendTransportOpt.sctpParameters));

        this.sendTransport = this.device.createSendTransport(this.sendTransportOpt);

        this.sendTransport.on('connect', async ({dtlsParameters}, done) => {
            console.log('Connect event, handled by sendTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport, {
                    transportId: this.sendTransport.id,
                    dtlsParameters,
                } as types.ConnectTransportRequest);
            console.log('Connect event handling done');
            done();
        });

        this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, done, errBack) => {
            console.log('Produce event, handled by sendTransport');
            try {
                // producerId
                const {id} = await this.signaling.sendRequest(
                    SignalMethod.produce, {
                        transportId : this.sendTransport.id,
                        kind,
                        rtpParameters,
                        appData
                    }) as {id: string};
                done({id});
            } catch (err) {
                errBack(err);
            }
        });
    }

    private async createRecvTransport()
    {
        this.recvTransport = this.device.createRecvTransport(
            await this.signaling.sendRequest(SignalMethod.createTransport, {
                transportType: TransportType.consumer,
                sctpCapabilities: this.device.sctpCapabilities,
            } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions
        );

        this.recvTransport.on('connect', async ({dtlsParameters}, done) => {
            console.log('Connect event, handled by recvTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport, {
                    transportId: this.recvTransport.id,
                    dtlsParameters,
                } as types.ConnectTransportRequest);
            done();
        });
    }

    private registerSignalingListeners()
    {
        this.signaling.registerListener(SignalType.notify, SignalMethod.newPeer, async (data: types.PeerInfo) => {
            console.log('Handling newPeer notification...');
            this.peerMeida.addPeerInfo(data);
            console.log('Add peerInfo: ', data);
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newConsumer, async (data: types.ConsumerInfo) => {
            console.log('Handling newConsumer notification...');
            const consumer = await this.recvTransport.consume({
                id            : data.consumerId,
                producerId    : data.producerId,
                kind          : data.kind,
                rtpParameters : data.rtpParameters
            });
            console.log('Creating consumer kind:' + data.kind);
            const { track } = consumer;
            console.log('Add track: ' + JSON.stringify(track));
            this.peerMeida.addConsumerAndTrack(data.producerPeerId, consumer, track);
            this.updateStreamsCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.consumerClosed, ({ consumerId }) => {
            console.log('Handling consumerClosed notification...');
            this.peerMeida.deleteConsumerAndTrack(consumerId);
            this.updateStreamsCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.peerClosed, ({ peerId }) => {
            console.log('Handling peerClosed notification...');
            this.peerMeida.deletePeer(peerId);
            this.updateStreamsCallback();
        })
    }
}
