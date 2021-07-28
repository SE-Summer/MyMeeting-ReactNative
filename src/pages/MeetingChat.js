import {View} from "react-native";
import * as React from 'react';
import {Component} from "react";
import {ChatBubble} from "../components/ChatBubble";
import moment from "moment";

export default class MeetingChat extends Component {
    render() {
        return (
            <View>
                <ChatBubble text={'测试我的bubble'} time={moment()} maxWidth={300} myInf={true}/>
                <ChatBubble text={'测试我的bubblebubblebubblebubblebubblebubblebubble'} time={moment()} maxWidth={300} myInf={false}/>
            </View>
        );
    }
}
