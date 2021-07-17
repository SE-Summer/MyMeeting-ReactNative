import {Button, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {printError} from "../utils/printError";
import {mediaDevices, MediaStream, registerGlobals, RTCView} from "react-native-webrtc";
import {MediaStreamFactory} from "../utils/local_media/MediaStreamFactory";
import * as mediasoupClient from "mediasoup-client";
import {getRequest} from "../utils/ajax";
import {serviceConfig} from "../serviceConfig";
import {Device} from "mediasoup-client";
import { types as mediasoupTypes } from "mediasoup-client";

export default class CreateMeetingScreen extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            stream: null,
            mediaStreamFactory: new MediaStreamFactory(),
        };
        this.device = null;
        try {
            registerGlobals();
            this.device = new mediasoupClient.Device();
            console.log(this.device);
        } catch (err) {
            printError(err);
        }

        getRequest('http://192.168.0.101:4443/getRouterRtpCapabilities', async (_rtpCapabilities) => {
            // const rtpCapabilities = JSON.parse(_rtpCapabilities);
            console.log(_rtpCapabilities);
            await this.device.load({routerRtpCapabilities: _rtpCapabilities});

            console.log("sctp:  " + JSON.stringify(this.device.sctpCapabilities));
        })
    }

    async playVideoFromCamera()
    {
        this.state.mediaStreamFactory.getCamFrontAndMicStream(200,100, 30)
            .then(async (stream) => {
                console.log(stream);
                this.setState({
                    stream: stream,
                });
                if (!this.device.canProduce('video')) {
                    console.log('cannot produce video');
                    return;
                }
                const tracks = stream.getVideoTracks();
                const track = tracks[0];
                if (!track) {
                    console.log("did not find video track");
                    return;
                }

                const source =  '111_src_video'
                const params: mediaTypes.ProducerOptions = {
                    track,
                    appData: {
                        source
                    },
                    codec: this.media.device.rtpCapabilities.codecs.find(codec => codec.mimeType === 'video/H264')
                };

                this.sendTransport = this.device.createSendTransport();

                this.producer = await this.media.sendTransport.produce(params);

            })
            .catch(printError);

    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {
                    this.state.stream && <RTCView style={{height: 200, width: 100}} zOrder={1}  streamURL={this.state.stream.toURL()} />
                }



                <Button onPress={() => this.props.navigation.goBack()} title="Create, Go back home" />
                <Button onPress={() => this.playVideoFromCamera()} title="play video" />
            </View>
        );
    }

}
