import {registerGlobals} from 'react-native-webrtc'
import * as mediasoupClient from "mediasoup-client";
import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../utils/Types";
import {printError} from "../utils/PrintError";
import {serviceConfig, SignalMethod, SignalType, sockectConnectionOptions, TransportType} from "../ServiceConfig";
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

    // track.id ==> producer
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
            this.updateStreamsCallback = updateOutputStreams;

        } catch (err) {
            printError(err);
        }
    }

    public getPeerDetails()
    {
        return this.peerMeida.getPeerDetails();
    }

    private log(info: string, err = null)
    {
        if (!info || !this.device) {
            console.log('[Logger error] Try to access null');
        }
        console.log(`${info}   with device name: ${this.deviceName}`);
        if (err) {
            printError(err);
        }
    }


    // steps for connection:
    // create a signaling client which has a socketio inside, then try to connect to server
    // wait until the connection is built
    // send request to get routerRtpCapabilities from server
    // load the routerRtpCapabilities into device
    //
    public async joinMeeting(roomToken: string, userToken: string, displayName: string, deviceName: string)
    {
        if (this.joined) {
            this.log('[Log]  Already joined a meeting');
            return;
        }

        this.log('[Log]  Try to join meeting with roomToken = ' + roomToken);
        this.roomToken = roomToken;
        this.userToken = userToken;
        this.serverURL = `${serviceConfig.serverURL}?roomId=${this.roomToken}&peerId=${this.userToken}`;
        this.displayName = displayName;
        this.deviceName = deviceName;

        try {
            this.signaling = new SignalingService(this.serverURL, sockectConnectionOptions);

            await this.signaling.waitForConnection();
            this.registerSignalingListeners();

        } catch (err) {
            this.log('[Error]  Fail to connect socket', err);
            await this.leaveMeeting();
            return;
        }

        try {
            const rtpCapabilities = await this.signaling.sendRequest(SignalMethod.getRouterRtpCapabilities);
            this.log('[Log]  Router RTP Capabilities received');

            await this.device.load({routerRtpCapabilities: rtpCapabilities});

            await this.createSendTransport();
            await this.createRecvTransport();

        } catch (err) {
            this.log('[Error]  Fail to prepare device and transports', err);
            await this.leaveMeeting();
            return;
        }

        try {
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

        } catch (err) {
            this.log('[Error]  Fail to join the meeting', err);
            await this.leaveMeeting();
            return;
        }
    }

    public async sendMediaStream(stream: MediaStream)
    {
        try {
            const tracks = stream.getTracks();
            let videoTrackCount = 0;
            let audioTrackCount = 0;
            for (const track of tracks) {
                let source: string = null;
                let params: mediasoupTypes.ProducerOptions = null;
                if (track.kind === 'video') {
                    source = `Video_from_${this.userToken}_track${++videoTrackCount}`;
                    params = {
                        track,
                        appData: { source },
                        codec: this.device.rtpCapabilities.codecs.find(codec => codec.mimeType === 'video/H264')
                    }
                } else {
                    source = `Audio_from_${this.userToken}_track${++audioTrackCount}`;
                    params = {
                        track,
                        appData: { source },
                    }
                }

                const producer = await this.sendTransport.produce(params);

                producer.on('transportclose', () => {
                    this.log(`[Producer event]  ${source}_transport_close`);
                    this.producers.delete(track.id);
                });

                producer.on('trackended', () => {
                   this.log(`[Producer event]  ${source}_track_ended`);
                    this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
                    this.producers.delete(track.id);
                });

                this.producers.set(track.id, producer);

                this.log(`[Log]  Producing ${source}`);
            }
        } catch (err) {
            this.log('[Error]  Fail to send MediaStream', err);
        }
    }

    public async leaveMeeting()
    {
        await this.signaling.sendRequest(SignalMethod.close);

        delete this.sendTransport;
        delete this.recvTransport;
        delete this.sendTransportOpt;
        delete this.device;
        delete this.producers;
        delete this.peerMeida;
        delete this.signaling;

        this.sendTransport = null;
        this.recvTransport = null;
        this.sendTransportOpt = null;
        this.device = new mediasoupClient.Device();
        this.producers = new Map<string, mediasoupTypes.Producer>();
        this.peerMeida = new PeerMedia();
        this.joined = false;
        this.signaling = null;
    }

    public async closeTrack(track: MediaStreamTrack)
    {
        const producer = this.producers.get(track.id);
        console.log(producer);
        await this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
        this.producers.delete(track.id);
    }

    private async createSendTransport()
    {
        this.sendTransportOpt = await this.signaling.sendRequest(SignalMethod.createTransport, {
            transportType: TransportType.producer,
            sctpCapabilities: this.device.sctpCapabilities,
        } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions;

        this.log('[Log]  sendTransportOptions received');

        this.sendTransport = this.device.createSendTransport(this.sendTransportOpt);

        this.sendTransport.on('connect', async ({dtlsParameters}, done) => {
            this.log('[Transport event]  event: connect, handled by sendTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport, {
                    transportId: this.sendTransport.id,
                    dtlsParameters,
                } as types.ConnectTransportRequest);
            done();
        });

        this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, done, errBack) => {
            this.log('[Transport event]  event: produce, handled by sendTransport');
            try {
                // producerId
                const {producerId} = await this.signaling.sendRequest(
                    SignalMethod.produce, {
                        transportId : this.sendTransport.id,
                        kind,
                        rtpParameters,
                        appData
                    }) as {producerId: string};
                done({id: producerId});
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
            this.log('[Transport event]  event: connect, handled by recvTransport');
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
            this.log('[Signaling]  Handling newPeer notification...');
            this.peerMeida.addPeerInfo(data);
            this.log(`[Signaling]  Add peerId = ${data.id}`);
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newConsumer, async (data: types.ConsumerInfo) => {
            this.log('[Signaling]  Handling newConsumer notification...');
            const consumer = await this.recvTransport.consume({
                id            : data.consumerId,
                producerId    : data.producerId,
                kind          : data.kind,
                rtpParameters : data.rtpParameters
            });
            this.log('[Signaling]  Creating consumer kind = ' + data.kind);
            const { track } = consumer;
            this.log(`[Signaling]  Add trackId = ${track.id} sent from peerId = ${data.producerPeerId}`);
            this.peerMeida.addConsumerAndTrack(data.producerPeerId, consumer, track);
            this.updateStreamsCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.consumerClosed, ({ consumerId }) => {
            this.log('[Signaling]  Handling consumerClosed notification...');
            this.log(`[Signaling]  Delete consumer id = ${consumerId}`);
            this.peerMeida.deleteConsumerAndTrack(consumerId);
            this.updateStreamsCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.peerClosed, ({ peerId }) => {
            this.log('[Signaling]  Handling peerClosed notification...');
            this.log(`[Signaling]  Delete peer id = ${peerId}`);
            this.peerMeida.deletePeer(peerId);
            this.updateStreamsCallback();
        })
    }
}
