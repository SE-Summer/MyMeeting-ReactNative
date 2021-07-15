import {Button, View} from "react-native";
import * as React from "react";
import {Component} from "react";

export default class MeetingScreen extends Component{
    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Button onPress={() => this.props.navigation.goBack()} title="Meeting, Go back home" />
            </View>
        );
    }

}
