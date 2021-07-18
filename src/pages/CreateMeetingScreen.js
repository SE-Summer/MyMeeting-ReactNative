import {Button, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {RTCView} from "react-native-webrtc";
import {MediaStreamFactory} from "../utils/local_media/MediaStreamFactory";
import {MeetingService} from "../service/MeetingService";

export default class CreateMeetingScreen extends Component
{
    constructor(props) {
        super(props);
        this.mediaStreamFactory = new MediaStreamFactory(),
        this.state = {
            stream: null,
        };
        this.meetingService = new MeetingService();
    }

    async playVideoFromCamera()
    {
        const videoStream = await this.mediaStreamFactory.getCamFrontStream(200, 100, 30);
        this.setState({
            stream: videoStream,
        });
        await this.meetingService.joinMeeting("12");
    }

    async produceVideo()
    {
        await this.meetingService.sendVideoTrack(this.state.stream);
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {
                    this.state.stream && <RTCView style={{height: 200, width: 100}} zOrder={1}  streamURL={this.state.stream.toURL()} />
                }



                <Button onPress={() => this.props.navigation.goBack()} title="Create, Go back home" />
                <Button onPress={() => this.playVideoFromCamera()} title="play video" />
                <Button onPress={() => this.produceVideo()} title="produce video" />
            </View>
        );
    }

}
