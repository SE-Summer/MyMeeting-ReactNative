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
        this.mediaService = new MediaService(this.updateStreams.bind(this));
        this.state = {
            inputStream: null,
            outputStreams: null,
        };
    }

    async updateStreams()
    {
        this.setState({
            outputStreams: await this.mediaService.getPeerMediaStreams(),
        });
    }

    async startStreaming()
    {
        await this.mediaService.joinMeeting('room_today', 'user_shenwhang');
        const _inputStream = await this.mediaStreamFactory.getCamFrontStream(100, 200, 30);
        this.setState({
            inputStream: _inputStream,
        });
        await this.mediaService.sendMediaStream(_inputStream);
        await this.mediaService.sendMediaStream(await this.mediaStreamFactory.getMicStream());
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {
                    this.state.inputStream && <RTCView style={{height: 200, width: 100}} zOrder={1}  streamURL={this.state.inputStream.toURL()} />
                }

                {
                    this.state.outputStreams && this.state.outputStreams.forEach((stream, id) => {
                        return (
                            <View>
                                <Text>
                                    {id}:
                                </Text>
                                <RTCView style={{height: 200, width: 100}} zOrder={1}  streamURL={this.state.inputStream.toURL()} />
                            </View>
                        )
                    })
                }
                <Button onPress={() => this.startStreaming()} title="START!" />
            </View>
        );
    }

}
