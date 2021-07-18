import * as React from 'react';
import {Component} from "react";
import {Text, View} from "react-native";

export default class MeetingPage extends Component {
    render() {
        return (
            <View style={{flex: 1}}>
                <Text>{JSON.stringify(this.props.route.params.id)}</Text>
            </View>
        );
    }
}
