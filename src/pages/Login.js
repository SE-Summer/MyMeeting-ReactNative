import * as React from "react";
import {View, StyleSheet, TextInput, ImageBackground, Image} from "react-native";
import {MyButton} from "../components/MyButton";
import {Component} from "react";
import {MaskedMyMeeting} from "../components/MaskedText";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
        }
    }


    log = () => {
        this.props.navigation.navigate('Tab');
    }

    register = () => {

    }


    render() {
        return (
            <KeyboardAwareScrollView style={{backgroundColor: "white", flex: 1}}>
                <Image source={require('../assets/triAngle.png')} style={{width: 267, height: 80}}/>
                <View style={{height: 30}}/>
                <View style={styles.titleContainer}>
                    <MaskedMyMeeting />
                </View>
                <ImageBackground source={require('../assets/greyBg.png')} style={{width: 400, height: 320}}>
                    <View style={styles.inputContainer}>
                        <ImageBackground source={require('../assets/myButton_Outlined.png')} style={styles.imgBg}>
                            <TextInput
                                value={this.state.username}
                                style={styles.input}
                                placeholder={"用户名"}
                                numberOfLines={1}
                                maxLength={20}
                                placeholderTextColor={"white"}
                                selectionColor={"green"}
                                keyboardType={"visible-password"}
                            />
                        </ImageBackground>
                        <ImageBackground source={require('../assets/myButton_Outlined.png')} style={styles.imgBg}>
                            <TextInput
                                value={this.state.username}
                                style={styles.input}
                                placeholder={"密码"}
                                numberOfLines={1}
                                secureTextEntry={true}
                                maxLength={20}
                                placeholderTextColor={"white"}
                                selectionColor={"green"}
                            />
                        </ImageBackground>
                    </View>
                </ImageBackground>

                <View style={styles.buttonContainer}>
                    <MyButton pressEvent={this.log} text={"登录"}/>
                    <View style={{width: 30}}/>
                    <MyButton pressEvent={this.register} text={"注册"}/>
                </View>
            </KeyboardAwareScrollView>

        )
    }
}

const styles = StyleSheet.create({
    titleContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    inputContainer: {
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30,
        marginTop: 110,
    },
    buttonContainer: {
        marginTop: 40,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    imgBg: {
        width: 288,
        height: 54,
        marginLeft: 10,
        marginTop: 10,
    },
    input: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
        marginLeft: 20,
        marginRight: 20,
        color: "white"
    }
})
