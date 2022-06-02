import {View, StyleSheet, TextInput, Text} from "react-native";
import * as React from "react";
import {Component} from "react";
import {DateTimeModal} from "../components/DateTimeModal";
import {TouchableItem} from "../components/Item";
import {Divider} from "react-native-elements";
import {TextButton} from "../components/MyButton";
import moment from "moment";
import {config_key} from "../Constants";
import {reserve} from "../service/MeetingService";
import * as Progress from "react-native-progress";
import {MyAlert} from "../components/MyAlert";
import Ionicons from "react-native-vector-icons/Ionicons";

const style = StyleSheet.create({
    input: {
        fontSize: 17,
        color: 'black',
    },
    divider: {
        marginLeft: 20,
        marginRight: 20,
    },
    itemText: {
        fontSize: 16,
    }
})

export default class ReServeMeetingScreen extends Component{
    constructor() {
        super();
        this.meetingTopicInput = React.createRef();
        this.meetingPasswordInput = React.createRef();
        this.state={
            nameText: null,
            secretText: null,
            showTimeStart: false,
            startTime: moment().add(1, 'h').toDate(),
            showTimeEnd: false,
            endTime: moment().add(2, 'h').toDate(),
            loading: 'normal',
            modalVisible: false,
            msg: null,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.setOptions({
            headerRight: () => {
                if (this.state.loading === 'waiting') {
                    return (
                        <Progress.CircleSnail color={['#9be3b1', '#06b45f', '#05783d']} style={{marginRight: 7}}/>
                    )
                }

                if (this.state.loading === 'success') {
                    return (
                        <Ionicons name={'checkmark-circle-outline'} style={{color: '#44CE55', marginRight: 9}} size={28}/>
                    )
                }

                return (
                    <TextButton text={"完成"} pressEvent={() => {
                        this.meetingTopicInput.current.blur();
                        this.meetingTopicInput.current.clear();
                        this.meetingPasswordInput.current.blur();
                        this.meetingPasswordInput.current.clear();

                        const {nameText, secretText} = this.state;

                        if (nameText == null || nameText.length === 0 || secretText == null || secretText.length !== 8) {
                            toast.show('输入信息格式有误',{type: 'warning', duration: 800, placement: 'top'})
                            return;
                        }

                        this.setState({
                            loading: 'waiting',
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
        inf.token = config_key.token;
        inf.max_num = 50;

        const response = await reserve(inf);
        if (response != null) {
            switch (response.status) {
                case 200: {
                    const room = response.data.room;
                    const msg = '会议主题：' + room.topic + '\n会议号：' + room.id + '\n会议密码：'
                        + room.password + '\n' + '开始时间： ' + moment(room.start_time).format('YY-MM-DD HH:mm:ss') +
                        '\n结束时间：' + moment(room.end_time).format('YY-MM-DD HH:mm:ss') ;
                    this.setState({
                        loading: 'success',
                        msg: msg,
                        modalVisible: true,
                    })
                    break;
                }
                case 401: {
                    toast.show(response.data.error, {type: 'danger', duration: 1300, placement: 'top'})
                    this.setState({
                        loading: 'normal',
                    })
                    break;
                }
            }
        } else {
            toast.show('预约失败', {type: 'danger', duration: 1300, placement: 'top'})
            this.setState({
                loading: 'normal',
            })
        }
    }

    render() {
        return (
            <View style={{backgroundColor: "#EDEDED", flex: 1}}>
                <MyAlert
                    title={'预约成功'}
                    okButton={
                        <TextButton
                            text={'确定'}
                            pressEvent={() => {
                                this.props.navigation.pop();
                            }}
                            containerStyle={{backgroundColor: 'green', borderRadius: 5}}
                            fontStyle={{fontSize: 14, color: 'white'}}
                        />
                    }
                    visible={this.state.modalVisible}
                    setVisible={(value) => {this.setState({modalVisible: value})}}
                    content={this.state.msg}
                    backEvent={() => {
                        this.props.navigation.pop();
                    }}
                />
                <View style={{borderRadius: 10, marginTop: 20, marginRight: 10, marginLeft: 10, backgroundColor: "white"}}>
                    <TextInput
                        ref={this.meetingTopicInput}
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
                        ref={this.meetingPasswordInput}
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
