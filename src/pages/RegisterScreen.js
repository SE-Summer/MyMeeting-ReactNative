import * as React from "react";
import {Component} from "react";
import {TextInput, View, StyleSheet, ToastAndroid, SafeAreaView} from "react-native";
import {Tip} from "../components/Tip";
import {TextButton} from "../components/MyButton";
import {registerService} from "../service/UserService";
import * as Progress from "react-native-progress";

const styles = StyleSheet.create({
    input: {
        fontSize: 18,
        paddingTop: 7,
        paddingBottom: 7,
        marginLeft: 30,
        marginRight: 30,
    },
    inputContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        marginLeft: 10,
        marginRight: 10,
    },
    processContainer: {
        width: 50,
    }
})

export default class RegisterScreen extends Component {
    constructor() {
        super();
        this.state = {
            username: null,
            password: null,
            confirmPassword: null,
            nameTip: null,
            passwordTip: null,
            confirmTip: null,
            confirmWarning: false,
            nameFilled: false,
            passwordFilled: true,
            confirmFilled: true,
            loading: false,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.setOptions({
            headerRight: () => {
                if (this.state.loading) {
                    return (
                        <Progress.CircleSnail spinDuration={4000} duration={800} color={['#9be3b1', '#06b45f', '#05783d']} style={{marginRight: 7}}/>
                    )
                }

                return (
                    <TextButton text={"完成"} pressEvent={this.onOk} />
                )
            },
        })
    }

    onOk = async () => {
        const {username, password, confirmPassword, nameFilled, passwordFilled, confirmFilled, confirmWarning} = this.state;
        this.usernameChange(username);
        this.passwordChange(password);
        this.confirmPasswordChange(confirmPassword);

        if (nameFilled && passwordFilled && confirmFilled && !confirmWarning) {
            this.setState({
                loading: true,
            }, async () => {
                if (await this.checkResult()) {
                    this.setState({
                        username: null,
                        password: null,
                        confirmPassword: null,
                        loading: false,
                    });
                    this.props.navigation.navigate('Login');
                    ToastAndroid.show('注册成功', ToastAndroid.SHORT);
                } else {
                    this.setState({
                        username: null,
                        password: null,
                        confirmPassword: null,
                        loading: false,
                    });
                    ToastAndroid.show('出错了', ToastAndroid.SHORT);
                }
            })

        }
    }

    checkResult = async () => {
        const token = this.props.route.params.token;
        const userInf = {
            nickname: this.state.username,
            password: this.state.password,
            token: token,
        }

        const response = await registerService(userInf);
        return response.status === 200;

    }

    usernameChange = (value) => {
        const unfilled = value == null || value.length === 0;
        this.setState({
            username: value,
            nameTip: unfilled ? '输入用户名' : null,
            nameFilled: !unfilled,
        })
    }

    passwordChange = (value) => {
        const unfilled = value == null || value.length === 0;
        this.setState({
            password: value,
            passwordTip: unfilled ? '输入密码' : null,
            passwordFilled: !unfilled,
        })
    }

    confirmPasswordChange = (value) => {
        const unfilled = value == null || value.length === 0;
        const different = value !== this.state.password;
        this.setState({
            confirmPassword: value,
            confirmTip: unfilled ? '再次输入密码' : (different ? '输入密码不同' : null),
            confirmWarning: !unfilled && different,
            confirmFilled: !unfilled,
        })
    }

    render() {
        const {username, password, confirmPassword, nameTip, passwordTip, confirmTip, confirmWarning} = this.state;
        return (
            <SafeAreaView style={{flex: 1}}>
                <Tip text={nameTip}/>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={username}
                        style={styles.input}
                        placeholder={"用户名"}
                        maxLength={15}
                        multiline={false}
                        onChangeText={this.usernameChange}
                    />
                </View>
                <Tip text={passwordTip}/>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={password}
                        style={styles.input}
                        placeholder={"密码"}
                        numberOfLines={1}
                        maxLength={20}
                        secureTextEntry={true}
                        onChangeText={this.passwordChange}
                    />
                </View>
                <Tip text={confirmTip} warning={confirmWarning}/>
                <View style={styles.inputContainer}>
                    <TextInput
                        value={confirmPassword}
                        style={styles.input}
                        placeholder={"确认密码"}
                        numberOfLines={1}
                        maxLength={20}
                        secureTextEntry={true}
                        onChangeText={this.confirmPasswordChange}
                    />
                </View>
            </SafeAreaView>
        );
    }
}
