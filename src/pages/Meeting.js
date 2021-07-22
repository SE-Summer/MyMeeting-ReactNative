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
        const _inputStream = await this.mediaStreamFactory.getCamFrontStream(100, 200, 30);
        this.setState({
            inputStream: _inputStream,
        });
        await this.mediaService.joinMeeting('room_today', 'user_LeC');
        await this.mediaService.sendMediaStream(_inputStream);
        await this.mediaService.sendMediaStream(await this.mediaStreamFactory.getMicStream());
    }

    async play()
    {
        const peerTracks = this.mediaService.getPeerTracks();
        let _outputStream = [];
        for (const tracks of peerTracks) {
            _outputStream.push(new MediaStream(tracks[1]))
        }
        console.log(_outputStream[0].getVideoTracks());
        this.setState({
            outputStreams: _outputStream
        });
    }

    renderOutputStreams()
    {
        if (this.state.outputStreams == null)
            return;
        const len = this.state.outputStreams.length;
        for (let i = 0; i < len; i++) {
            return (<RTCView style={{height: 200, width: 100}} zOrder={5}  streamURL={this.state.outputStreams[i].toURL()} />);
        }
    }

    render() {
        return (
            <View>
                <Text>
                    Input stream:
                </Text>
                {this.state.inputStream && <RTCView style={{height: 200, width: 100}} zOrder={5}  streamURL={this.state.inputStream.toURL()} />}
                <Text>
                    Received stream:
                </Text>
                {this.renderOutputStreams()}
                <Button onPress={() => this.startStreaming()} title="START!" />
                <Button onPress={() => this.play()} title="Play!" />
            </View>
        );
    }

}
