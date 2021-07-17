import {Button, TextInput, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {Divider} from "react-native-elements";

export default class MeetingScreen extends Component{
    constructor(props) {
        super(props);
        this.state = {
            nameText: null,
            value: null,
        }
    }


    render() {
        return (
            <View style={{ flex: 1}}>
                <View style={{borderRadius: 10, marginTop: 20, marginRight: 10, marginLeft: 10, backgroundColor: "white"}}>
                    <TextInput
                        value={this.state.nameText}
                        style={{transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }]}}
                        placeholder={"会议号"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={12}
                    />
                    <Divider />
                    <TextInput
                        value={this.state.secretText}
                        style={{transform: [{scaleX: 1.1}, {scaleY: 1.1}]}}
                        placeholder={"会议密码(8位数字)"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={8}
                        secureTextEntry={true}
                    />
                </View>
            </View>
        );
    }

}
