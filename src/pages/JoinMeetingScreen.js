import {Platform, TextInput, ToastAndroid, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {Divider} from "react-native-elements";
import {SwitchItem} from "../components/Item";
import {TextButton} from "../components/MyButton";
import {config_key} from "../utils/Constants";
import {join} from "../service/MeetingService";
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

export default class JoinMeetingScreen extends Component{
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            password: null,
            cameraStatus: config_key.camera,
            microphoneStatus: config_key.microphone,
            loading: false,
        }
    }

    componentDidMount() {
        const {route, navigation} = this.props;
        navigation.addListener('focus', () => {
            this.setState({
                loading: false,
            })
        })
        navigation.setOptions({
            title: route.params.quickJoin ? '快速参会' : null,
            headerRight: () => {
                if (this.state.loading) {
                    return (
                        <Progress.CircleSnail spinDuration={4000} duration={800} color={['#9be3b1', '#06b45f', '#05783d']} style={{marginRight: 7}}/>
                    )
                }

                return (
                    <TextButton text={"加入"} pressEvent={
                        () => {
                            this.refs.textInput1.blur();
                            this.refs.textInput2.blur();
                            const {id, password} = this.state;
                            if (id == null || id.length === 0 || password == null || password.length === 0)
                                return;

                            this.setState({
                                loading: true,
                            }, async () => {
                                await this.joinM();
                            })
                        }}
                    />
                )
            },
        })
    }

    joinM = async () => {
        const response = await join(parseInt(this.state.id), this.state.password, this.navigate);
        if (response == null) {
            if (Platform.OS === 'android')
                ToastAndroid.showWithGravity(
                    '错误',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                )
            return;
        }

        switch (response.status) {
            case 200: {
                const room = response.data.room;
                const params = {
                    roomInf: room,
                    cameraStatus: this.state.cameraStatus,
                    microphoneStatus: this.state.microphoneStatus,
                }
                this.props.navigation.navigate('Meeting', params);
                return;
            }
            case 401: {
                ToastAndroid.showWithGravity(
                    response.data.error,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                )
                this.setState({
                    loading: false,
                })
                return;
            }
            default: {
                ToastAndroid.showWithGravity(
                    '错误',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                )
                this.setState({
                    loading: false,
                })
            }
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
            <SafeAreaView style={{ flex: 1}}>
                <View style={{borderRadius: 10, marginTop: 20, marginRight: 10, marginLeft: 10, backgroundColor: "white"}}>
                    <TextInput
                        ref={'textInput1'}
                        value={this.state.id}
                        style={{fontSize:18, padding: 7}}
                        placeholder={"会议号"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={12}
                        onChangeText={this.meetingIdChange}
                    />
                    <Divider />
                    <TextInput
                        ref={'textInput2'}
                        value={this.state.password}
                        style={{fontSize: 18, padding: 7}}
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
            </SafeAreaView>
        );
    }

}
