import * as React from "react";
import {Component} from "react";
import {Text, TextInput, View, StyleSheet} from "react-native";
import {validateEmail, windowHeight, windowWidth} from "../utils/Utils";
import {Tip} from "../components/Tip";
import {TextButton} from "../components/MyButton";
import VerificationCodeInput from "../components/VerificationCodeInput";
import {emailCheck, verifyCode} from "../service/UserService";

const emailStyles = StyleSheet.create({
    title1: {
        fontSize: 27,
        textAlign: 'center'
    },
    title2: {
        fontSize: 20,
        textAlign: 'center'
    },
    title3: {
        fontSize: 18,
        textAlign: 'center'
    },
    input: {
        backgroundColor: 'white',
        fontSize: 16,
        color: 'black',
    },
    titleContainer: {
        height: windowHeight / 3,
        justifyContent: 'center'
    },
    inputContainer: {
        width: windowWidth
    },
})

export default class EmailCheck extends Component {
    constructor() {
        super();
        this.state = {
            userEmail: null,
            verified: true,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.setOptions({
            headerRight: () => {
                return (
                    <TextButton text={"继续"} pressEvent={this.onCommit} />
                )
            }
        })
    }

    onCommit = async () => {
        const {navigation} = this.props;
        const {userEmail} = this.state;
        this.onUserEmailChange(userEmail);
        if (await validateEmail(userEmail)) {
            await emailCheck(userEmail);
            navigation.navigate('Validate', {'email': userEmail})
        }
    }

    onUserEmailChange = (value) => {
        this.setState({
            userEmail: value,
            verified: validateEmail(value),
        })
    }

    render() {
        return (
            <View style={{flex: 1, alignItems: 'center'}}>
                <View style={emailStyles.titleContainer}>
                    <Text style={emailStyles.title1}>输入您的邮箱</Text>
                </View>
                <View style={emailStyles.inputContainer}>
                    <Tip text={this.state.verified ? null : '格式有误'}/>
                    <TextInput
                        value={this.state.userEmail}
                        style={emailStyles.input}
                        placeholder={"my@meeting.com"}
                        numberOfLines={1}
                        textAlign={'center'}
                        placeholderTextColor={'#aaaaaa'}
                        selectionColor={"green"}
                        keyboardType={"email-address"}
                        textContentType={'emailAddress'}
                        onChangeText={this.onUserEmailChange}
                    />
                </View>
            </View>
        );
    }
}

export class ValidatePage extends Component {
    constructor() {
        super();
        this.state = {
            verifyCode: null,
        }
    }

    checkCode = async (value) => {
        const {navigation, route} = this.props;
        const response = await verifyCode(route.params.email, value);
        if (response.status === 200) {
            toast.show('验证成功', {type: 'success', duration: 1000, placement: 'top'})
            navigation.navigate('Register', {'token': response.data.token});
        } else {
            toast.show('验证码错误', {type: 'danger', duration: 1000, placement: 'top'})
        }
    }

    render() {
        return (
            <View style={{flex: 1, alignItems: 'center'}}>
                <VerificationCodeInput
                    inputSize={6}
                    title={
                        <View style={emailStyles.titleContainer}>
                            <Text style={emailStyles.title2}>验证码已经发送到</Text>
                            <Text style={emailStyles.title3}>'{this.props.route.params.email}'</Text>
                        </View>
                    }
                    check={this.checkCode}
                />
            </View>
        );
    }
}
