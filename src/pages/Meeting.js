import {Button, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {RTCView} from "react-native-webrtc";
import {MediaStreamFactory} from "../utils/local_media/MediaStreamFactory";
import {MediaService} from "../service/MediaService";

export default class Meeting extends Component
{
    constructor(props) {
        super(props);
        this.mediaStreamFactory = new MediaStreamFactory();
        this.meetingService = new MediaService();
        this.state = {
            inputStream: null,
            outputStream: null,
        };
    }

    updateStream()
    {
        console.log(this.meetingService.getStream());
        this.setState({
            outputStream: this.meetingService.getStream(),
        });
    }

    async playVideoFromCamera()
    {
        const videoStream = await this.mediaStreamFactory.getCamFrontStream(200, 100, 30);
        this.setState({
            inputStream: videoStream,
        });
        await this.meetingService.joinMeeting("12", "hhh");
    }

    async produceVideo()
    {
        await this.meetingService.sendVideoTrack(this.state.inputStream);
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {/*{*/}
                {/*    this.state.inputStream && <RTCView style={{height: 200, width: 100}} zOrder={1}  streamURL={this.state.inputStream.toURL()} />*/}
                {/*}*/}

                {/*{*/}
                {/*    this.state.outputStream && <RTCView style={{height: 200, width: 100}} zOrder={1}  streamURL={this.state.outputStream.toURL()} />*/}
                {/*}*/}

            </View>
        );
    }

}
