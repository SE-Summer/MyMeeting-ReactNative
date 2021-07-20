import {View, StyleSheet, TextInput, Text} from "react-native";
import * as React from "react";
import {Component} from "react";
import {DateTimeModal} from "../components/DateTimeModal";
import {SwitchItem, TouchableItem} from "../components/Item";
import {Divider} from "react-native-elements";
import {TextButton} from "../components/MyButton";

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
            showDate: false,
            date: new Date(),
            showTimeStart: false,
            startTime: new Date(),
            showTimeEnd: false,
            endTime: new Date(),
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.setOptions({
            headerRight: () => {
                return (
                    <TextButton text={"完成"} pressEvent={() => {}} />
                )
            },
        })
    }

    showDatePicker = () => {
        this.setState({
            showDate: true,
        })
    }

    finishDatePicker = () => {
        this.setState({
            showDate: false,
        });
    }

    handleDateChange = (date) => {
        this.setState({
            date: date
        });
    }

    showTimeStartPicker = () => {
        this.setState({
            showTimeStart: true,
        });
    }

    finishTimeStartPicker = () => {
        this.setState({
            showTimeStart: false,
        })
    }

    handleStartTimeChange = (time) => {
        this.setState({
            startTime: time,
        })
    }

    showTimeEndPicker = () => {
        this.setState({
            showTimeEnd: true,
        });
    }

    finishTimeEndPicker = () => {
        this.setState({
            showTimeEnd: false,
        })
    }

    handleEndTimeChange = (time) => {
        this.setState({
            endTime: time,
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
                <View style={{marginTop: 100, marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "white"}}>
                    <TouchableItem text={"日期"} pressEvent={this.showDatePicker} rightComponent={
                        <Text style={style.itemText}>{this.state.date.toDateString()}</Text>
                    }/>
                    <DateTimeModal
                        visible={this.state.showDate}
                        date={this.state.date}
                        mode={'date'}
                        dateChange={this.handleDateChange}
                        onOk={this.finishDatePicker}
                        text={"日期"}
                    />
                    <Divider style={style.divider}/>
                    <TouchableItem text={"开始时间"} pressEvent={this.showTimeStartPicker} rightComponent={
                        <Text style={style.itemText}>{this.state.startTime.getHours()}时{this.state.startTime.getMinutes()}分</Text>
                    }/>
                    <DateTimeModal
                        visible={this.state.showTimeStart}
                        date={this.state.startTime}
                        mode={'time'}
                        dateChange={this.handleStartTimeChange}
                        onOk={this.finishTimeStartPicker}
                        text={"时间"}
                    />
                    <Divider style={style.divider} />
                    <TouchableItem text={"结束时间"} pressEvent={this.showTimeEndPicker} rightComponent={
                        <Text style={style.itemText}>{this.state.endTime.getHours()}时{this.state.endTime.getMinutes()}分</Text>
                    }/>
                    <DateTimeModal
                        visible={this.state.showTimeEnd}
                        date={this.state.endTime}
                        mode={'time'}
                        dateChange={this.handleEndTimeChange}
                        onOk={this.finishTimeEndPicker}
                        text={"时间"}
                    />
                </View>
            </View>
        );
    }
}
