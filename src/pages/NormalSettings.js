import * as React from 'react';
import {Component} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import {logout} from "../service/UserService";

export default class NormalSettings extends Component {
    logOut = async () => {
        await logout();
        this.props.navigation.navigate('Login');
    }

    render() {
        return (
            <View>
                <TouchableOpacity onPress={this.logOut} style={{
                    margin: 20,
                    padding: 14,
                    backgroundColor:"white",
                    borderRadius: 10
                }}>
                    <Text style={{fontSize:15, textAlign: "center", color: "red"}}>退出登录</Text>
                </TouchableOpacity>
            </View>
        )
    }
}
