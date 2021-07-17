import {Text, TouchableOpacity, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import UserInf from "../components/UserInf";
import {StyleSheet} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Divider} from "react-native-elements";

const Item = ({icon, text, func}) => {
    return(
        <TouchableOpacity onPress={func} style={{flexDirection: "row", padding: 15}}>
            <Ionicons name={icon} size={23} color={"#058451"} style={{}}/>
            <Text style={{fontSize:15, textAlign: "left", marginLeft: 20}}>{text}</Text>
            <View style={{alignItems: "flex-end", flex: 1}}>
                <Ionicons name={"ios-chevron-forward"} size={23}/>
            </View>
        </TouchableOpacity>
    )
}

export default class UserScreen extends Component{
    navigateToHistory = () => {
        this.props.navigation.navigate('History');
    }

    navigateToSettings = () => {

    }

    navigateToMeetingSettings = () => {

    }

    logOut = () => {
        this.props.navigation.navigate('Login')
    }

    render() {
        return (
            <View>
                <UserInf style={userScreenStyles.inf}/>
                <View style={userScreenStyles.optionsContainer}>
                    <Item icon={"document-text"} text={"历史记录"} func={this.navigateToHistory}/>
                </View>
                <View style={userScreenStyles.optionsContainer}>
                    <Item icon={"settings-outline"} text={"会议设置"} func={this.navigateToMeetingSettings}/>
                    <Divider />
                    <Item icon={"settings"} text={"通用"} func={this.navigateToSettings} />
                </View>
                <TouchableOpacity onPress={this.logOut} style={userScreenStyles.logOut}>
                    <Text style={{fontSize:15, textAlign: "center", color: "red"}}>退出登录</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const userScreenStyles = StyleSheet.create({
    inf: {
        elevation: 5,
    },
    logOut: {
        marginRight: 10,
        marginLeft: 10,
        marginTop: 100,
        padding: 14,
        backgroundColor:"white",
        borderRadius: 10
    },
    optionsContainer: {
        marginRight: 10,
        marginLeft: 10,
        marginTop: 30,
        backgroundColor:"white",
        borderRadius: 10
    }
})
