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
        this.mediaService = new MediaService(this.updateOutputStreams.bind(this));
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
        await this.mediaService.joinMeeting('room_today', 'user_' + this.props.route.params.id);
        await this.mediaService.sendMediaStream(_inputStream);
        await this.mediaService.sendMediaStream(await this.mediaStreamFactory.getMicStream());
    }

    async updateOutputStreams()
    {
        const peerTracks = this.mediaService.getPeerTracks();
        let _outputStream = [];
        let i = 0;
        for (const tracks of peerTracks) {
            _outputStream.push(new MediaStream(tracks[1]))
        }
        this.setState({
            outputStreams: _outputStream
        });
    }

    render() {
        return (
            <View>
                <Text>
                    Input stream:
                </Text>
                {this.state.inputStream && <RTCView style={{height: 200, width: 100}} zOrder={5}  streamURL={this.state.inputStream.toURL()} mirror={true}/>}
                <Text>
                    Received stream:
                </Text>
                {this.state.outputStreams && this.state.outputStreams.map((stream, index) => {
                    return <RTCView style={{height: 200, width: 100}} zOrder={5}  streamURL={stream.toURL()} mirror={true}/>;
                })}
                <Button onPress={() => this.startStreaming()} title="START!" />
            </View>
        );
    }

}
