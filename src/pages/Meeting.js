import {Button, Text, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {RTCView} from "react-native-webrtc";
import {MediaStreamFactory} from "../utils/media/MediaStreamFactory";
import {MediaService} from "../service/MediaService";

export default class Meeting extends Component
{
    constructor(props) {
        super(props);
        this.mediaStreamFactory = new MediaStreamFactory();
        this.mediaService = new MediaService(this.updateOutputStreams.bind(this));
        this.state = {
            inputStream: null,
        };
    }

    async startStreaming()
    {
        const _inputStream = await this.mediaStreamFactory.getCamFrontStream(100, 200, 30);
        this.setState({
            inputStream: _inputStream,
        });

        const userToken = this.props.route.params.id;

        await this.mediaService.joinMeeting('room_today', 'user_' + userToken, 'displayName_' + userToken, 'deviceName_' + userToken);
        await this.mediaService.sendMediaStream(_inputStream);
        await this.mediaService.sendMediaStream(await this.mediaStreamFactory.getMicStream());
    }

    async leaveMeeting()
    {
        delete this.state.inputStream;
        delete this.state.peerMedia;
        await this.mediaService.leaveMeeting();
        this.setState({
            peerMedia: null,
            inputStream: null,
        });
    }

    async updateOutputStreams()
    {
        this.setState({
            peerMedia: this.mediaService.getPeerMedia(),
        });
    }

    renderMeetings()
    {
        if (this.state.peerMedia == null)
            return null;

        return (
            <View>
                {this.state.peerMedia.map((peerDetail, index) => {
                    if (peerDetail.getTracks().length === 0) {
                        return (<Text>{index}:{peerDetail.getPeerInfo().displayName} no media</Text>);
                    } else {
                        const stream = new MediaStream(peerDetail.getTracks());
                        return (
                            <View>
                                <RTCView style={{height: 200, width: 100}} zOrder={5} streamURL={stream.toURL()} mirror={true} key={index}/>
                                <Text>{index}:{peerDetail.getPeerInfo().displayName}</Text>
                            </View>
                        )
                    }
                })}
            </View>
        )

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
                {this.renderMeetings()}
                <Button onPress={() => this.startStreaming()} title="START!" />
                <Button onPress={() => this.leaveMeeting()} title="STOP!" />
            </View>
        );
    }

}
