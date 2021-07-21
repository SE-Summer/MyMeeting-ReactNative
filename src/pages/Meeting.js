import {Button, Text, View} from "react-native";
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
        this.mediaService = new MediaService();
        this.state = {
            inputStream: null,
            outputStreams: null,
        };
    }

    async startStreaming()
    {
        await this.mediaService.joinMeeting('room_today', 'user_LeC');
        const _inputStream = await this.mediaStreamFactory.getCamFrontStream(100, 200, 30);
        this.setState({
            inputStream: _inputStream,
        });
        await this.mediaService.sendMediaStream(_inputStream);
        // await this.mediaService.sendMediaStream(await this.mediaStreamFactory.getMicStream());
    }

    async play()
    {
        const streams = await this.mediaService.getPeerMediaStreams();
        console.log(streams);
        this.setState({
            outputStreams: new MediaStream(streams)
        });
    }

    render() {
        return (
            <View>
                {
                    // this.state.inputStream && <RTCView style={{height: 200, width: 100}} zOrder={1}  streamURL={this.state.inputStream.toURL()} />
                }

                {
                    this.state.outputStreams && <RTCView style={{height: 200, width: 100}} zOrder={5}  streamURL={this.state.outputStreams.toURL()} />
                }
                <Button onPress={() => this.startStreaming()} title="START!" />
                <Button onPress={() => this.play()} title="Play!" />
            </View>
        );
    }

}
