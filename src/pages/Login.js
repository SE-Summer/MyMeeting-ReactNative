import * as React from "react";
import {
    View,
    StyleSheet,
    TextInput,
    ImageBackground,
    Image,
    Text, ScrollView,
} from "react-native";
import {FlashButton, MyButton} from "../components/MyButton";
import {Component} from "react";
import {MaskedMyMeeting} from "../components/MaskedText";
import {config_key} from "../Constants";
import {validateEmail, windowHeight, windowWidth} from "../utils/Utils";
import {loginService} from "../service/UserService";
import { SafeAreaView } from 'react-native-safe-area-context';
import RNExitApp from 'react-native-exit-app';

const smallUtils = {
    buttonOutline: [require('../resources/image/myButton_Outlined.png'), require('../resources/image/myButton_Outline_error.png')],
}

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
            userEmail: config_key.email,
            password: null,
            backTimes: 0,
            userInput: 0,
            passwordInput: 0,
            EmailTip: null,
            passwordTip: null,
        }
    }

    backAction = () => {
        if (this.state.backTimes === 1) {
            RNExitApp.exitApp();
        } else {
            toast.show('再按一次退出MyMeeting', {type: 'normal', duration: 1300, placement: 'top'})
            this.setState({
                backTimes: 1,
            })
        }
        return true;
    }

    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            this.setState({
                userEmail: config_key.email,
                password: null,
                backTimes: 0,
                userInput: 0,
                passwordInput: 0,
                EmailTip: null,
                passwordTip: null,
            });
        })
        this.props.navigation.addListener('beforeRemove', e => {
            if (e.data.action.type === 'GO_BACK') {
                e.preventDefault();
                this.backAction();
            }
        })
    }

    log = async () => {
        const {userEmail, password} = this.state;

        const EmailFilled = userEmail != null && userEmail.length !== 0;
        if (!EmailFilled) {
            this.setState({
                userInput: 1,
                EmailTip: '输入邮箱',
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

        if (EmailFilled && passwordFilled) {
            if (await loginService(this.state.userEmail, this.state.password)){
                this.setState({
                    password: null,
                    backTimes: 0,
                    userInput: 0,
                    passwordInput: 0,
                    EmailTip: null,
                    passwordTip: null,
                })
                this.props.navigation.navigate('Tab');
            } else {
                this.setState({
                    userEmail: null,
                    password: null,
                    backTimes: 0,
                    userInput: 1,
                    passwordInput: 1,
                    EmailTip: '邮箱或密码错误',
                    passwordTip: null,
                })
            }
        }
    }

    register = () => {
        this.props.navigation.navigate('EmailCheck');
    }

    onUserEmailChange = (value) => {
        const unfilled = value == null || value.length === 0;
        const validated = validateEmail(value);
        this.setState({
            userEmail: value,
            userInput: unfilled || !validated ? 1 : 0,
            EmailTip: unfilled ? '输入邮箱' : (validated ? null : '格式不对'),
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
            <SafeAreaView style={{flex: 1}}>
                <ScrollView style={{backgroundColor: "white", flex: 1}}>
                    <View style={styles.topFillContainer}>
                        <View style={styles.topContainer}>
                            <Image source={require('../resources/image/triAngle.png')} style={styles.triAngleImg}/>
                            <View style={{flex: 1, alignItems: "center"}}>
                                <FlashButton pressEvent={this.flashStart}/>
                            </View>
                        </View>
                    </View>
                    <View style={styles.titleContainer}>
                        <MaskedMyMeeting />
                    </View>
                    <View style={styles.imgFillContainer}>
                        <ImageBackground source={require('../resources/image/greyBg.png')} style={styles.imageView}>
                            <View style={styles.inputContainer}>
                                <View style={styles.labelContainer}>
                                    <InputLabel text={this.state.EmailTip}/>
                                </View>
                                <ImageBackground source={smallUtils.buttonOutline[this.state.userInput]} style={styles.imgBg}>
                                    <TextInput
                                        value={this.state.userEmail}
                                        style={styles.input}
                                        placeholder={"邮箱"}
                                        numberOfLines={1}
                                        placeholderTextColor={'#aaaaaa'}
                                        selectionColor={"green"}
                                        keyboardType={"email-address"}
                                        textContentType={'emailAddress'}
                                        onChangeText={this.onUserEmailChange}
                                    />
                                </ImageBackground>
                                <View style={styles.labelContainer}>
                                    <InputLabel text={this.state.passwordTip}/>
                                </View>
                                <ImageBackground source={smallUtils.buttonOutline[this.state.passwordInput]} style={styles.imgBg}>
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
                        <MyButton pressEvent={this.register} text={"注册"}/>
                    </View>
                </ScrollView>
            </SafeAreaView>
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
        justifyContent: "flex-start",
        height: windowHeight * 0.31,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: windowHeight * 0.16,
    },
    imgFillContainer: {
        height: windowHeight * 0.36,
        justifyContent: 'center',
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
        marginLeft: 10,
        marginRight: 10,
        color: "white",
        fontSize: 17,
    },
    labelContainer: {
        marginLeft: 20,
        width: windowWidth / 2,
        height: windowWidth / 20,
    },
    triAngleImg: {
        width: windowWidth * 3 / 4,
        height: windowWidth * 9 / 40
    }
})
