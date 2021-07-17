import {View, StyleSheet, TextInput} from "react-native";
import * as React from "react";
import {Component} from "react";
import {SwitchItem} from "../components/Item";
import {Divider} from "react-native-elements";

const style = StyleSheet.create({
    input: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }]
    },
    divider: {
        marginLeft: 5,
        marginRight: 5,
    },
    itemText: {
        fontSize: 16,
    }
})

export default class ReServeMeetingScreen extends Component{
    constructor() {
        super();
        this.state={
            nameText: null,
            secretText: null,
            cameraStatus: true,
            microphoneStatus: true,
        }
    }

    cameraSwitch = (value) => {
        this.setState({
            cameraStatus: value,
        })
    }

    microphoneSwitch = (value) => {
        this.setState({
            microphoneStatus: value,
        })
    }

    render() {
        return (
            <View style={{backgroundColor: "#EDEDED", flex: 1}}>
                <View style={{borderRadius: 10, marginTop: 20, marginRight: 10, marginLeft: 10, backgroundColor: "white"}}>
                    <TextInput
                        value={this.state.nameText}
                        style={style.input}
                        placeholder={"会议标题"}
                        textAlign={"center"}
                        numberOfLines={1}
                    />
                    <Divider />
                    <TextInput
                        value={this.state.secretText}
                        style={style.input}
                        placeholder={"会议密码(8位数字)"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={8}
                        secureTextEntry={true}
                    />
                </View>
                <View style={{marginTop: 60, marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "white"}}>
                    <SwitchItem text={"摄像头"} status={this.state.cameraStatus} switchEvent={this.cameraSwitch}/>
                    <Divider style={style.divider}/>
                    <SwitchItem text={"麦克风"} status={this.state.microphoneStatus} switchEvent={this.microphoneSwitch}/>
                </View>
            </View>
        );
    }
}
