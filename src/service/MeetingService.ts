import {registerGlobals} from 'react-native-webrtc'
import { types as mediasoupTypes } from "mediasoup-client";
import * as mediasoupClient from "mediasoup-client";
import {printError} from "../utils/PrintError";
import {serviceConfig} from "../ServiceConfig";
import {getRequest, postRequest} from "../utils/Ajax";

export class MeetingService
{
    private roomId: string = null;
    private userId: string = null;
    private device: mediasoupTypes.Device = null;
    private sendTransport: mediasoupTypes.Transport = null;
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
        const rtpCapabilities = await getRequest(serviceConfig.getRouterRtpCapabilitiesURL + '?roomId=' + roomId);
        await this.device.load({routerRtpCapabilities: rtpCapabilities});
        console.log("sctp:  " + JSON.stringify(this.device.sctpCapabilities));
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
        this.sendTransport = this.device.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters
        });

        this.sendTransport.on('connect', async ({dtlsParameters}, done) => {
            await postRequest(serviceConfig.connectTransportURL,
                {
                    transportId: this.sendTransport.id,
                    dtlsParameters
                });
            done();
        })
    }
}
