import * as React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Divider} from "react-native-elements";
import { Component } from "react";
import {MyButton, MyButtonOutLined} from "../components/MyButton";

export default class HomeScreen extends Component{
    navigateToCreateMeeting = () => {
        this.props.navigation.navigate('CreateMeeting');
    }

    navigateToMeeting = () => {
        this.props.navigation.navigate('Meeting');
    }

    render() {
        return (
            <View style={{backgroundColor: "white", flex: 1}}>
                <View style={styles.buttonContainer}>
                    <MyButton text={"创建会议"} pressEvent={this.navigateToCreateMeeting}/>
                    <MyButtonOutLined text={"加入会议"} pressEvent={this.navigateToMeeting}/>
                </View>
                <Divider style={{margin: 10}}/>
                <View style={{flex: 1, justifyContent: "center"}}>
                    <Text style={styles.infText}>暂无会议进行</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 70,
        marginBottom: 60,
        flexDirection: "row",
        justifyContent: "space-around",
    },
    infText: {
        textAlign: "center",
        fontSize: 17,
    }
});
