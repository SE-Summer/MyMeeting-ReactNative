import {registerGlobals} from 'react-native-webrtc'
import * as mediasoupClient from "mediasoup-client";
import {types as mediasoupTypes} from "mediasoup-client";
import {printError} from "../utils/PrintError";
import {RequestMethod, serviceConfig} from "../ServiceConfig";
import {SignalingService} from "./SignalingService";

export class MeetingService
{
    private roomToken: string = null;
    private userToken: string = null;
    private serverWsURL: string = null;
    private signaling: SignalingService = null;
    private device: mediasoupTypes.Device = null;
    private sendTransport: mediasoupTypes.Transport = null;
    private producer: mediasoupTypes.Producer = null;

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
        this.serverWsURL = `${serviceConfig.serverWsURL}?roomToken=${this.roomToken}&userToken=${this.userToken}`;

        this.signaling = new SignalingService(this.serverWsURL, {
            timeout: 3000,
            reconnection:	true,
            reconnectionAttempts: Infinity,
            reconnectionDelayMax: 2000,
            transports: ['websocket'],
        });

        await this.signaling.waitForConnection();

        const rtpCapabilities = await this.signaling.send(RequestMethod.getRouterRtpCapabilitiesRequest);
        console.log("Router RTP Capabilities: " + JSON.stringify(rtpCapabilities));

        await this.device.load({routerRtpCapabilities: rtpCapabilities});
        console.log("Device SCTP Capabilities: " + JSON.stringify(this.device.sctpCapabilities));

        const body = {
            sctpCapabilities: this.device.sctpCapabilities,
        }

        const {
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters
        } = await this.signaling.send(RequestMethod.createTransportRequest, body) as mediasoupTypes.TransportOptions;

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
            console.log('Connect event, handled by sendTransport')
            await this.signaling.send(
                RequestMethod.connectTransportRequest,
                {
                    transportId: this.sendTransport.id,
                    dtlsParameters
                });
            console.log('Connect event handling done');
            done();
        });

        this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, done, errBack) => {
            console.log('Produce event, handled by sendTransport');
            try {
                const {id} = await this.signaling.send(
                    RequestMethod.produceRequest,
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

    public async subscribeVideoTrack()
    {

    }
}
