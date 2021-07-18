import {TextInput, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {Divider} from "react-native-elements";
import {SwitchItem} from "../components/Item";
import {TextButton} from "../components/MyButton";
import {config_key} from "../utils/Constants";

export default class JoinMeetingScreen extends Component{
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            password: null,
            cameraStatus: config_key.camera,
            microphoneStatus: config_key.microphone,
        }
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerRight: () => {
                return (
                    <TextButton text={"加入"} pressEvent={() => {
                        this.props.navigation.navigate('Meeting', {'id': this.state.id, 'password': this.state.password})
                    }} />
                )
            },
        })
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

    meetingIdChange = (value) => {
        this.setState({
            id: value,
        })
    }

    passwordChange = (value) => {
        this.setState({
            password: value,
        })
    }

    render() {
        return (
            <View style={{ flex: 1}}>
                <View style={{borderRadius: 10, marginTop: 20, marginRight: 10, marginLeft: 10, backgroundColor: "white"}}>
                    <TextInput
                        value={this.state.id}
                        style={{transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }]}}
                        placeholder={"会议号"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={12}
                        onChangeText={this.meetingIdChange}
                    />
                    <Divider />
                    <TextInput
                        value={this.state.password}
                        style={{transform: [{scaleX: 1.1}, {scaleY: 1.1}]}}
                        placeholder={"会议密码(8位数字)"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={8}
                        secureTextEntry={true}
                        onChangeText={this.passwordChange}
                    />
                </View>
                <View style={{marginTop: 60, marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "white"}}>
                    <SwitchItem text={"摄像头"} status={this.state.cameraStatus} switchEvent={this.cameraSwitch}/>
                    <Divider/>
                    <SwitchItem text={"麦克风"} status={this.state.microphoneStatus} switchEvent={this.microphoneSwitch}/>
                </View>
            </View>
        );
    }

}
