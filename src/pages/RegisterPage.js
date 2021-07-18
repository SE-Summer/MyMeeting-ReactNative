import * as React from "react";
import {Component} from "react";
import {TextInput, View, StyleSheet} from "react-native";
import {Divider} from "react-native-elements";

const styles = StyleSheet.create({
    input: {
        transform: [{scaleX: 1.1}, {scaleY: 1.1}],
        marginLeft: 30,
        marginRight: 30,
    },
    usernameContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
    }
})

export default class RegisterPage extends Component {
    constructor() {
        super();
        this.state = {
            username: null,
            password: null,
        }
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <View style={styles.usernameContainer}>
                    <TextInput
                        value={this.state.username}
                        style={styles.input}
                        placeholder={"用户名"}
                        textAlign={"center"}
                        numberOfLines={1}
                    />
                </View>
                <View>
                    <TextInput
                        value={this.state.password}
                        style={styles.input}
                        placeholder={"密码"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={8}
                        secureTextEntry={true}
                    />
                    <Divider />
                    <TextInput
                        value={this.state.password}
                        style={styles.input}
                        placeholder={"再次输入密码"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={8}
                        secureTextEntry={true}
                    />
                </View>
            </View>
        );
    }
}
