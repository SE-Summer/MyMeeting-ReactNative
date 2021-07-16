import {Button, SafeAreaView, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import Video from "react-native-video";
import {printError} from "../utils/printError";
import {mediaDevices, MediaStream, RTCView} from "react-native-webrtc";
import {MediaStreamFactory} from "../utils/local_media/MediaStreamFactory";

export default class CreateMeetingScreen extends Component
{

    constructor(props) {
        super(props);
        this.state = {
            stream: null,
            mediaStreamFactory: new MediaStreamFactory(),
        };
    }

    playVideoFromCamera()
    {
        this.state.mediaStreamFactory.getCamFrontAndMicStream()
            .then((stream) => {
                console.log(stream);
                this.setState({
                    stream: stream,
                })
            })
            .catch(printError);
        mediaDevices.enumerateDevices().then(sourceInfos => {
            console.log(sourceInfos);
        });

    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <SafeAreaView>
                    {
                        this.state.stream && <RTCView style={{height: 640, width: 540}} zOrder={1}  streamURL={this.state.stream.toURL()} />
                    }
                </SafeAreaView>



                <Button onPress={() => this.props.navigation.goBack()} title="Create, Go back home" />
                <Button onPress={() => this.playVideoFromCamera()} title="play video" />
            </View>
        );
    }

}
