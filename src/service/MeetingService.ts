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

    public joinMeeting(roomId: string)
    {
        getRequest(serviceConfig.getRouterRtpCapabilitiesURL + '?roomId=' + roomId, (rtpCapabilities) => {
            this.device.load({routerRtpCapabilities: rtpCapabilities})
                .then(() => {
                    console.log("sctp:  " + JSON.stringify(this.device.sctpCapabilities));
                    let body = {
                        sctpCapabilities: this.device.sctpCapabilities,
                    }
                    postRequest(serviceConfig.createProducerTransportURL, body, () => {

                    })
                })
        });
    }
}
