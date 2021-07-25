import * as React from 'react';
import {Component} from "react";
import {View} from "react-native";
import {RTCView} from "react-native-webrtc";

export default class Window extends Component {
    render() {
        const {style} = this.props;
        return (
            <View style={[style,{borderColor:'#aaaaaa', borderWidth: 1}]} >
                {this.props.stream && <RTCView style={{flex: 1}} streamURL={this.props.stream.toURL()} mirror={true}/>}
                {/*<RTCView style={{height: 200, width: 100}} zOrder={5}  streamURL={stream.toURL()} />*/}
                {this.props.children}
            </View>
        );
    }
}
