import * as React from 'react';
import {Component} from "react";
import {View} from "react-native";
import {RTCView} from "react-native-webrtc";

export default class Window extends Component {
    render() {
        const {style} = this.props;
        return (
            <View style={[style,{borderColor:'#aaaaaa', borderWidth: 1}]} >
                {this.props.stream && <RTCView streamURL={this.props.stream.toURL()} mirror={true}/>}
                {this.props.children}
            </View>
        );
    }
}
