import {View, StyleSheet, TextInput} from "react-native";
import * as React from "react";
import {Component} from "react";
import {SwitchItem} from "../components/Item";
import {Divider} from "react-native-elements";
import {TextButton} from "../components/MyButton";
import {config_key} from "../utils/Constants";
import {create, join} from "../service/MeetingService";
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

const style = StyleSheet.create({
    input: {
        fontSize: 18,
        padding: 7
    },
    divider: {
        marginLeft: 5,
        marginRight: 5,
    },
    itemText: {
        fontSize: 16,
    }
})

export default class CreateMeetingScreen extends Component{
    constructor() {
        super();
        this.state={
            name: null,
            id: null,
            password: null,
            cameraStatus: config_key.camera,
            microphoneStatus: config_key.microphone,
            loading: false,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.addListener('focus', () => {
            this.setState({
                loading: false,
            })
        })
        navigation.setOptions({
            headerRight: () => {
                if (this.state.loading) {
                    return (
                        <Progress.CircleSnail spinDuration={4000} duration={800} color={['#9be3b1', '#06b45f', '#05783d']} style={{marginRight: 7}}/>
                    )
                }
                return (
                    <TextButton text={"完成"} pressEvent={
                        () => {
                            this.refs.textInput1.blur();
                            this.refs.textInput2.blur();
                            const {name, password} = this.state;
                            if (name == null || name.length === 0 || password == null || password.length !== 8) {
                                toast.show('输入信息格式有误', {type: 'warning', duration: 1300, placement: 'top'})
                                return;
                            }

                            this.setState({
                                loading: true
                            }, async () => {
                                const response = await create(this.state.name, this.state.password);
                                if (response == null) {
                                    toast.show('创建失败', {type: 'danger', duration: 1300, placement: 'top'})
                                } else {
                                    switch (response.status) {
                                        case 200: {
                                            await this.joinAfterCreate(response.data.room);
                                            break;
                                        }
                                        case 401: {
                                            toast.show(response.data.error, {type: 'danger', duration: 1300, placement: 'top'});
                                        }
                                    }
                                }
                            })
                        }}
                    />
                )
            },
        })
    }

    joinAfterCreate = async (room) => {
        const response = await join(room.id, room.password);
        if (response.status === 200) {
            this.setState({
                loading: false
            }, () => {
                const room = response.data.room;
                const params = {
                    roomInf: room,
                    cameraStatus: this.state.cameraStatus,
                    microphoneStatus: this.state.microphoneStatus,
                }
                this.props.navigation.navigate('Meeting', params);
            })
        } else {
            toast.show(response.data.error, {type: 'danger', duration: 1300, placement: 'top'});
            this.setState({
                loading: false,
            })
        }
    }

    navigate = () => {
        this.props.navigation.navigate('Meeting', {'id': this.state.id, 'password': this.state.password})
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

    meetingNameChange = (value) => {
        this.setState({
            name: value,
        })
    }

    meetingPasswordChange = (value) => {
        this.setState({
            password: value,
        })
    }

    render() {
        return (
            <SafeAreaView style={{backgroundColor: "#EDEDED", flex: 1}}>
                <View style={{borderRadius: 10, marginTop: 20, marginRight: 10, marginLeft: 10, backgroundColor: "white"}}>
                    <TextInput
                        ref={"textInput1"}
                        value={this.state.name}
                        style={style.input}
                        placeholder={"会议标题"}
                        textAlign={"center"}
                        numberOfLines={1}
                        onChangeText={this.meetingNameChange}
                    />
                    <Divider />
                    <TextInput
                        ref={"textInput2"}
                        value={this.state.password}
                        style={style.input}
                        placeholder={"会议密码(8位数字)"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={8}
                        secureTextEntry={true}
                        onChangeText={this.meetingPasswordChange}
                    />
                </View>
                <View style={{marginTop: 60, marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "white"}}>
                    <SwitchItem text={"摄像头"} status={this.state.cameraStatus} switchEvent={this.cameraSwitch}/>
                    <Divider style={style.divider}/>
                    <SwitchItem text={"麦克风"} status={this.state.microphoneStatus} switchEvent={this.microphoneSwitch}/>
                </View>
            </SafeAreaView>
        );
    }
}
