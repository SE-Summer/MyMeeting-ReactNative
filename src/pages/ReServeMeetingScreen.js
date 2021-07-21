import {View, StyleSheet, TextInput, Text, ToastAndroid} from "react-native";
import * as React from "react";
import {Component} from "react";
import {DateTimeModal} from "../components/DateTimeModal";
import {TouchableItem} from "../components/Item";
import {Divider} from "react-native-elements";
import {TextButton} from "../components/MyButton";
import moment from "moment";
import {config_key} from "../utils/Constants";
import {reserve} from "../service/MeetingService";
import * as Progress from "react-native-progress";

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
            showTimeStart: false,
            startTime: moment().add(1, 'h'),
            showTimeEnd: false,
            endTime: moment().add(2, 'h'),
            loading: false,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.setOptions({
            headerRight: () => {
                if (this.state.loading) {
                    return (
                        <Progress.CircleSnail color={['#9be3b1', '#06b45f', '#05783d']} style={{marginRight: 7}}/>
                    )
                }

                return (
                    <TextButton text={"完成"} pressEvent={() => {
                        const {nameText, secretText} = this.state;

                        if (nameText == null || nameText.length === 0 || secretText == null || secretText.length !== 0) {
                            return;
                        }

                        this.setState({
                            loading: true,
                        }, async () => {
                            await this.onCommit();
                        })
                    }} />
                )
            },
        })
    }

    onCommit = async () => {
        const {nameText, secretText, startTime, endTime} = this.state;

        const inf = {};
        inf.start_time = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
        inf.end_time = moment(endTime).format('YYYY-MM-DD HH:mm:ss');
        inf.topic = nameText;
        inf.password = secretText;
        inf.host = config_key.userId;
        inf.max_num = 50;

        const response = await reserve(inf);
        if (response != null) {
            ToastAndroid.showWithGravity(
                '预约成功',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            )
            this.props.navigation.pop();
        } else {
            ToastAndroid.showWithGravity(
                '预约失败',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            )
            this.setState({
                loading: false,
            })
        }
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
                        onChangeText={value => {
                            this.setState({
                                nameText: value,
                            })
                        }}
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
                        onChangeText={value => {
                            this.setState({
                                secretText: value,
                            })
                        }}
                    />
                </View>
                <View style={{marginTop: 100, marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "white"}}>
                    <TouchableItem
                        text={"开始时间"}
                        pressEvent={() => {
                            this.setState({
                            showTimeStart: true,
                            });
                        }}
                        rightComponent={
                            <Text style={style.itemText}>{moment(this.state.startTime).format('YYYY-MM-DD HH:mm')}</Text>
                        }
                    />
                    <DateTimeModal
                        visible={this.state.showTimeStart}
                        date={this.state.startTime}
                        mode={'datetime'}
                        dateChange={(time) => {
                            this.setState({
                                startTime: time,
                            })
                        }}
                        onOk={() => {
                            this.setState({
                                showTimeStart: false,
                            })
                        }}
                        text={"时间"}
                    />
                    <Divider style={style.divider} />
                    <TouchableItem
                        text={"结束时间"}
                        pressEvent={() => {
                            this.setState({
                                showTimeEnd: true,
                            });
                        }}
                        rightComponent={
                            <Text style={style.itemText}>{moment(this.state.endTime).format('YYYY-MM-DD HH:mm')}</Text>
                    }/>
                    <DateTimeModal
                        visible={this.state.showTimeEnd}
                        date={this.state.endTime}
                        mode={'datetime'}
                        dateChange={(time) => {
                            this.setState({
                                endTime: time,
                            })
                        }}
                        onOk={() => {
                            this.setState({
                                showTimeEnd: false,
                            })
                        }}
                        text={"时间"}
                    />
                </View>
            </View>
        );
    }
}
