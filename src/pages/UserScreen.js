import {Text, TouchableOpacity, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import UserInf from "../components/UserInf";
import {StyleSheet} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Divider} from "react-native-elements";

const Item = ({icon, text, func}) => {
    return(
        <TouchableOpacity onPress={func} style={{flexDirection: "row", padding: 15, backgroundColor:"white"}}>
            <Ionicons name={icon} size={23} color={"green"} style={{}}/>
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

    logOut = () => {

    }

    render() {
        return (
            <View>
                <UserInf style={userScreenStyles.inf}/>
                <View style={{marginTop: 20}}>
                    <Item icon={"document-text"} text={"会议记录"} func={this.navigateToHistory}/>
                    <Divider />
                    <Item icon={"settings"} text={"通用"} func={this.navigateToSettings()} />
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
        marginTop: 10,
    },
    logOut: {
        marginRight: 10,
        marginLeft: 10,
        marginTop: 30,
        padding: 15,
        backgroundColor:"white",
        borderRadius: 10
    }
})
