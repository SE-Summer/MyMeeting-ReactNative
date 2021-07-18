import {registerGlobals} from 'react-native-webrtc'
import { types as mediasoupTypes } from "mediasoup-client";
import * as mediasoupClient from "mediasoup-client";
import {printError} from "../utils/PrintError";
import {serviceConfig, SIMULCASTENCODING} from "../ServiceConfig";
import {getRequest, postRequest} from "../utils/Ajax";

export class MeetingService
{
    private roomId: string = null;
    private userId: string = null;
    private device: mediasoupTypes.Device = null;
    private sendTransport: mediasoupTypes.Transport = null;
    private producer: mediasoupTypes.Producer = null;
    private routerRtpCapabilities: mediasoupTypes.RtpCapabilities = null;

    constructor()
    {
        try {
            registerGlobals();
            this.device = new mediasoupClient.Device();
        } catch (err) {
            printError(err);
        }
    }

    public async joinMeeting(roomId: string)
    {
        const rtpCapabilities = await getRequest(serviceConfig.getRouterRtpCapabilitiesURL /* + '?roomId=' + roomId */);
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
        } = await postRequest(serviceConfig.createProducerTransportURL, body);

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
            await postRequest(
                serviceConfig.connectTransportURL,
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
                const {id} = await postRequest(
                    serviceConfig.produceURL,
                    {
                        transportId : this.sendTransport.id,
                        kind,
                        rtpParameters,
                        appData
                    });
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
