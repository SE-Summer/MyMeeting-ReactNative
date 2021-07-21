import {registerGlobals} from 'react-native-webrtc'
import * as mediasoupClient from "mediasoup-client";
import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../utils/Types";
import {printError} from "../utils/PrintError";
import {serviceConfig, SignalMethod, SignalType, TransportType} from "../ServiceConfig";
import {SignalingService} from "./SignalingService";

export class MediaService
{
    private roomToken: string = null;
    private userToken: string = null;
    private serverURL: string = null;

    private signaling: SignalingService = null;
    private device: mediasoupTypes.Device = null;
    private sendTransport: mediasoupTypes.Transport = null;
    private recvTransport: mediasoupTypes.Transport = null;
    private producer: mediasoupTypes.Producer = null;
    private consumer: mediasoupTypes.Consumer = null;

    private peerIds: Set<string> = null;
    private peerInfos: Map<string, types.PeerInfo> = null;
    private peerMediaStreams: Map<string, MediaStream> = null;

    private sendTransportOpt: mediasoupTypes.TransportOptions = null;
    private joined: boolean = null;

    private updatePeerMediaStreamCallback: () => void = null;

    public getPeerIds()
    {
        return this.peerIds;
    }

    public getPeerInfo(id: string): types.PeerInfo
    {
        const info = this.peerInfos.get(id);
        return (info == undefined) ? null : info;
    }

    public getPeerMediaStreams()
    {
        return this.peerMediaStreams;
    }

    public getPeerMediaStream(id: string): MediaStream
    {
        const stream = this.peerMediaStreams.get(id);
        return (stream == undefined) ? null : stream;
    }

    constructor(updatePeerMediaStreams: () => void)
    {
        try {
            registerGlobals();
            this.updatePeerMediaStreamCallback = updatePeerMediaStreams;
            this.device = new mediasoupClient.Device();
            this.peerIds = new Set<string>();
            this.peerInfos = new Map<string, types.PeerInfo>();
            this.peerMediaStreams = new Map<string, MediaStream>();
            this.joined = false;

        } catch (err) {
            printError(err);
        }
    }

    public async joinMeeting(roomToken: string, userToken: string)
    {
        this.roomToken = roomToken;
        this.userToken = userToken;
        this.serverURL = `${serviceConfig.serverURL}?roomId=${this.roomToken}&peerId=${this.userToken}`;

        this.signaling = new SignalingService(this.serverURL, {
            // timeout: 3000,
            // reconnection: true,
            // reconnectionAttempts: Infinity,
            // reconnectionDelayMax: 2000,
            // transports: ['websocket'],
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newPeer, async (data: types.PeerInfo) => {
            console.log('Handling newPeer notification...');
            this.peerIds.add(data.id);
            this.peerInfos.set(data.id, data);
        })

        this.signaling.registerListener(SignalType.notify, SignalMethod.newConsumer, async (data: types.ConsumerInfo) => {
            console.log('Handling newConsumer notification...');
            this.consumer = await this.recvTransport.consume({
                id            : data.consumerId,
                producerId    : data.producerId,
                kind          : data.kind,
                rtpParameters : data.rtpParameters
            });
            const { track } = this.consumer;
            if (this.peerMediaStreams.has(data.producerPeerId)) {
                this.peerMediaStreams.get(data.producerPeerId).addTrack(track);
            } else {
                this.peerMediaStreams.set(data.producerPeerId, new MediaStream([track]));
            }
            this.updatePeerMediaStreamCallback();
        })

        await this.signaling.waitForConnection();

        const rtpCapabilities = await this.signaling.sendRequest(SignalMethod.getRouterRtpCapabilities);
        console.log("Router RTP Capabilities: " + JSON.stringify(rtpCapabilities));

        await this.device.load({routerRtpCapabilities: rtpCapabilities});
        console.log("Device SCTP Capabilities: " + JSON.stringify(this.device.sctpCapabilities));

        const _peerInfos = (await this.signaling.sendRequest(SignalMethod.join, {
            displayName: 'shenwhang',
            joined: this.joined,
            device: "test_swh",
            rtpCapabilities: this.device.rtpCapabilities,
        } as types.JoinRequest)) as types.PeerInfo[];

        for (const info of _peerInfos) {
            this.peerIds.add(info.id);
            this.peerInfos.set(info.id, info);
        }

        this.joined = true;

        this.sendTransportOpt = await this.signaling.sendRequest(SignalMethod.createTransport, {
            transportType: TransportType.producer,
            sctpCapabilities: this.device.sctpCapabilities,
        } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions;


        console.log("Transport ID: " + this.sendTransportOpt.id);
        console.log("Transport ICE Candidates: " + JSON.stringify(this.sendTransportOpt.iceCandidates));
        console.log("Transport ICE Parameters: " + JSON.stringify(this.sendTransportOpt.iceParameters));
        console.log("Transport DTLS Parameters: " + JSON.stringify(this.sendTransportOpt.dtlsParameters));
        console.log("Transport SCTP Parameters: " + JSON.stringify(this.sendTransportOpt.sctpParameters));

        this.sendTransport = this.device.createSendTransport(this.sendTransportOpt);

        this.sendTransport.on('connect', async ({dtlsParameters}, done) => {
            console.log('Connect event, handled by sendTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport,
                {
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
                    SignalMethod.produce,
                    {
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

        this.recvTransport = this.device.createRecvTransport(
            await this.signaling.sendRequest(SignalMethod.createTransport, {
                transportType: TransportType.consumer,
                sctpCapabilities: this.device.sctpCapabilities,
            } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions
        );

        this.recvTransport.on('connect', async ({dtlsParameters}, done) => {
            console.log('Connect event, handled by recvTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport,
                {
                    transportId: this.recvTransport.id,
                    dtlsParameters,
                } as types.ConnectTransportRequest);
            done();
        });
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
                this.producer = await this.sendTransport.produce(params);
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
                this.producer = await this.sendTransport.produce(params);
                console.log(`Producing ${source}`);
            }
        } catch (err) {
            printError(err);
        }
    }
}
