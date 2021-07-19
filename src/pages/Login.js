import * as React from "react";
import {View, StyleSheet, TextInput, ImageBackground, Image, BackHandler, ToastAndroid, Text} from "react-native";
import {FlashButton, MyButton} from "../components/MyButton";
import {Component} from "react";
import {MaskedMyMeeting} from "../components/MaskedText";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {config_key, utils} from "../utils/Constants";
import { Dimensions } from 'react-native';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const InputLabel = ({text}) => {
    if (text == null) {
        return <View/>;
    } else {
        return (
            <View>
                <Text style={{color: 'red', fontSize: 12}}>{text}</Text>
            </View>
        )
    }
}

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: config_key.username,
            password: null,
            backTimes: 0,
            userInput: 0,
            passwordInput: 0,
            nameTip: null,
            passwordTip: null,
        }
    }

    backAction = () => {
        if (this.state.backTimes === 1) {
            BackHandler.exitApp();
        } else {
            ToastAndroid.showWithGravity(
                "再按一次退出MyMeeting",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            )
            this.setState({
                backTimes: 1,
            })
        }
        return true;
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            this.setState({backTimes: 0});
            BackHandler.addEventListener("hardwareBackPress", this.backAction);
        })
        this.props.navigation.addListener('blur', () => {
            BackHandler.removeEventListener("hardwareBackPress", this.backAction);
        })
    }

    log = async () => {
        const {username, password} = this.state;
        const nameFilled = username != null && username.length !== 0;
        if (!nameFilled) {
            this.setState({
                userInput: 1,
                nameTip: '输入用户名',
                backTimes: 0,
            })
        }

        const passwordFilled = password != null && password.length !== 0;
        if (!passwordFilled) {
            this.setState({
                passwordInput: 1,
                passwordTip: '输入密码',
                backTimes: 0,
            })
        }

        if (nameFilled && passwordFilled) {
            if (await this.confirm()) {
                this.setState({
                    password: null,
                    backTimes: 0,
                    userInput: 0,
                    passwordInput: 0,
                    nameTip: null,
                    passwordTip: null,
                })
                this.props.navigation.navigate('Tab');
            } else {
                this.setState({
                    username: null,
                    password: null,
                    backTimes: 0,
                    userInput: 1,
                    passwordInput: 1,
                    nameTip: '用户名或密码错误',
                    passwordTip: '用户名或密码错误',
                })
            }
        }
    }

    confirm = async () => {
        return true;
    }

    register = () => {
        this.props.navigation.navigate('Register');
    }

    onUsernameChange = (value) => {
        const unfilled = value == null || value.length === 0;
        this.setState({
            username: value,
            userInput: unfilled ? 1 : 0,
            nameTip: unfilled ? '输入用户名' : null,
            backTimes: 0,
        })
    }

    onPasswordChange = (value) => {
        const unfilled = value == null || value.length === 0;
        this.setState({
            password: value,
            passwordInput: unfilled ? 1 : 0,
            passwordTip: unfilled ? '输入密码' : null,
            backTimes: 0,
        })
    }

    flashStart = () => {
        this.props.navigation.navigate('JoinMeeting', {'quickJoin': true});
    }

    render() {
        return (
            <KeyboardAwareScrollView style={{backgroundColor: "white", flex: 1}}>
                <View style={styles.topFillContainer}>
                    <View style={styles.topContainer}>
                        <Image source={require('../assets/triAngle.png')} style={styles.triAngleImg}/>
                        <View style={{flex: 1, alignItems: "center"}}>
                            <FlashButton pressEvent={this.flashStart}/>
                        </View>
                    </View>
                </View>
                <View style={styles.titleContainer}>
                    <MaskedMyMeeting />
                </View>
                <View style={styles.imgFillContainer}>
                    <ImageBackground source={require('../assets/greyBg.png')} style={styles.imageView}>
                        <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                                <InputLabel text={this.state.nameTip}/>
                            </View>
                            <ImageBackground source={utils.buttonOutline[this.state.userInput]} style={styles.imgBg}>
                                <TextInput
                                    value={this.state.username}
                                    style={styles.input}
                                    placeholder={"用户名"}
                                    numberOfLines={1}
                                    maxLength={15}
                                    placeholderTextColor={'#aaaaaa'}
                                    selectionColor={"green"}
                                    keyboardType={"visible-password"}
                                    onChangeText={this.onUsernameChange}
                                />
                            </ImageBackground>
                            <View style={styles.labelContainer}>
                                <InputLabel text={this.state.passwordTip}/>
                            </View>
                            <ImageBackground source={utils.buttonOutline[this.state.passwordInput]} style={styles.imgBg}>
                                <TextInput
                                    value={this.state.password}
                                    style={styles.input}
                                    placeholder={"密码"}
                                    numberOfLines={1}
                                    secureTextEntry={true}
                                    maxLength={20}
                                    placeholderTextColor={'#aaaaaa'}
                                    selectionColor={"green"}
                                    onChangeText={this.onPasswordChange}
                                />
                            </ImageBackground>
                        </View>
                    </ImageBackground>
                </View>
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
    topContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    topFillContainer: {
        height: windowHeight * 0.11,
    },
    titleContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: windowHeight * 0.31,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: windowHeight * 0.18,
    },
    imgFillContainer: {
        height: windowHeight * 0.4,
        justifyContent: 'center'
    },
    imageView: {
        width: windowWidth,
        height: windowWidth * 0.9,
        alignItems: "center",
    },
    imgBg: {
        width: windowWidth * 4 / 5,
        height: windowWidth * 3 / 20,
        justifyContent: 'center',
    },
    inputContainer: {
        justifyContent: "center",
        marginTop: windowWidth * 0.3,
    },
    input: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
        marginLeft: 20,
        marginRight: 20,
        color: "white",
    },
    labelContainer: {
        marginLeft: 20,
        width: windowWidth / 5,
        height: windowWidth / 20,
    },
    triAngleImg: {
        width: windowWidth * 3 / 4,
        height: windowWidth * 9 / 40
    }
})
