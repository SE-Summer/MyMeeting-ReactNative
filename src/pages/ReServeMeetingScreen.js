import {View, StyleSheet, TextInput, Text, Alert} from "react-native";
import * as React from "react";
import {Component} from "react";
import {DateTimeModal} from "../components/DateTimeModal";
import {TouchableItem} from "../components/Item";
import {Divider} from "react-native-elements";
import {TextButton} from "../components/MyButton";
import moment from "moment";
import {config, config_key} from "../Constants";
import {reserve} from "../service/MeetingService";
import * as Progress from "react-native-progress";

const style = StyleSheet.create({
    input: {
        fontSize: 17,
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
            startTime: moment().add(1, 'h').toDate(),
            showTimeEnd: false,
            endTime: moment().add(2, 'h').toDate(),
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
                        this.refs.textInput1.blur();
                        this.refs.textInput2.blur();
                        const {nameText, secretText} = this.state;

                        if (nameText == null || nameText.length === 0 || secretText == null || secretText.length !== 8) {
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
        const {navigation} = this.props;

        const inf = {};
        inf.start_time = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
        inf.end_time = moment(endTime).format('YYYY-MM-DD HH:mm:ss');
        inf.topic = nameText;
        inf.password = secretText;
        inf.token = config_key.token;
        inf.max_num = 50;

        const response = await reserve(inf);
        if (response != null) {
            switch (response.status) {
                case 200: {
                    console.log(response.data);
                    const room = response.data.room;
                    const msg = '会议主题：' + room.topic + '\n会议号：' + room.id + '\n会议密码：'
                        + room.password + '\n' + '开始时间： ' + moment(room.start_time).format('YY-MM-DD HH:mm:ss') +
                        '\n结束时间：' + moment(room.end_time).format('YY-MM-DD HH:mm:ss') ;
                    Alert.alert(
                        '预约信息',
                        msg,
                        [
                            {
                                text: "确定",
                                onPress: () => {
                                    navigation.pop();
                                },
                                style: "cancel",
                            },
                        ],
                    )
                    break;
                }
                case 401: {
                    toast.show(response.data.error, {type: 'danger', duration: 1300, placement: 'top'})
                    break;
                }
            }
        } else {
            toast.show('预约失败', {type: 'danger', duration: 1300, placement: 'top'})
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
                        ref={'textInput1'}
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
                        ref={'textInput2'}
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
