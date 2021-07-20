import {registerGlobals} from 'react-native-webrtc'
import * as mediasoupClient from "mediasoup-client";
import {types as mediasoupTypes} from "mediasoup-client";
import {printError} from "../utils/PrintError";
import {serviceConfig, SignalMethod, SignalType} from "../ServiceConfig";
import {SignalingService} from "./SignalingService";

export class MeetingService
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
    private consumingStream: MediaStream = null;

    public getStream()
    {
        return this.consumingStream;
    }

    constructor()
    {
        try {
            registerGlobals();
            this.device = new mediasoupClient.Device();
        } catch (err) {
            printError(err);
        }
    }

    public async joinMeeting(roomToken: string, userToken: string)
    {
        this.roomToken = roomToken;
        this.userToken = userToken;
        this.serverURL = `${serviceConfig.serverWsURL}?roomId=${this.roomToken}&peerId=${this.userToken}`;

        this.signaling = new SignalingService(this.serverURL, {
            timeout: 3000,
            // reconnection: true,
            // reconnectionAttempts: Infinity,
            // reconnectionDelayMax: 2000,
            transports: ['websocket'],
        });

        await this.signaling.waitForConnection();

        const rtpCapabilities = await this.signaling.sendRequest(SignalMethod.getRouterRtpCapabilities);
        console.log("Router RTP Capabilities: " + JSON.stringify(rtpCapabilities));

        await this.device.load({routerRtpCapabilities: rtpCapabilities});
        console.log("Device SCTP Capabilities: " + JSON.stringify(this.device.sctpCapabilities));

        const peerInfos = await this.signaling.sendRequest(SignalMethod.join, {
            displayName: 'qwertyu',
            joined: false,
            device: "test",
            rtpCapabilities: this.device.rtpCapabilities,
        });

        const body = {
            transportType: 'producer',
            sctpCapabilities: this.device.sctpCapabilities,
        }

        const {
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters
        } = await this.signaling.sendRequest(SignalMethod.createTransport, body) as mediasoupTypes.TransportOptions;

        console.log("Transport ID: " + id);
        console.log("Transport ICE Parameters: " + JSON.stringify(iceParameters));
        console.log("Transport DTLS Parameters: " + JSON.stringify(dtlsParameters));
        console.log("Transport SCTP Parameters: " + JSON.stringify(sctpParameters));

        this.sendTransport = this.device.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters
        });

        this.sendTransport.on('connect', async ({dtlsParameters}, done) => {
            console.log('Connect event, handled by sendTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport,
                {
                    transportId: this.sendTransport.id,
                    dtlsParameters,
                });
            console.log('Connect event handling done');
            done();
        });

        this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, done, errBack) => {
            console.log('Produce event, handled by sendTransport');
            try {
                const {id} = await this.signaling.sendRequest(
                    SignalMethod.produce,
                    {
                        transportId : this.sendTransport.id,
                        kind,
                        rtpParameters,
                        appData
                    }) as {id: string};
                console.log(id);
                done({id});
            } catch (err) {
                errBack(err);
            }
        });

        this.recvTransport = this.device.createRecvTransport(
            await this.signaling.sendRequest(SignalMethod.createTransport, {
                transportType: 'consumer',
                sctpCapabilities: this.device.sctpCapabilities,
            }) as mediasoupTypes.TransportOptions
        );

        this.recvTransport.on('connect', async ({dtlsParameters}, done) => {
            console.log('Connect event, handled by recvTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport,
                {
                    transportId: this.recvTransport.id,
                    dtlsParameters,
                });
            console.log('Connect event handling done');
            done();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newPeer, async (data) => {
            this.consumer = await this.recvTransport.consume({
                id            : data.consumerId,
                producerId    : data.producerId,
                kind          : data.kind,
                rtpParameters : data.rtpParameters
            });
            const { track } = this.consumer;
            // this.consumingStream = new MediaStream([track]);
        })
    }

    public async sendVideoTrack(stream: MediaStream)
    {
        const source = "1_cameramic_video";
        const tracks = stream.getVideoTracks();
        const track = tracks[0];
        const params: mediasoupTypes.ProducerOptions = {
            track,
            appData: {
                source,
            },
            codec: this.device.rtpCapabilities.codecs.find(codec => codec.mimeType === 'video/H264')
        }

        try {
            this.producer = await this.sendTransport.produce(params);
            console.log('Start to produce in sendVideoTrack()');
        } catch (err) {
            printError(err);
        }
    }

    public async subscribeVideo()
    {
        const peerInfos = await this.signaling.sendRequest(SignalMethod.consume, {subscribeIds: [this.userToken]});
        const peerInfo = peerInfos[0];
        console.log(peerInfos);
        this.consumer = await this.recvTransport.consume({
            id            : peerInfo.consumerId,
            producerId    : peerInfo.producerId,
            kind          : peerInfo.kind,
            rtpParameters : peerInfo.rtpParameters
        });
        const { track } = this.consumer;
        this.consumingStream = new MediaStream([track]);
        console.log(track);
        console.log('new track added' + this.consumingStream.getVideoTracks().length);
    }
}
