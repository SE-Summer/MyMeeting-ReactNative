import * as React from 'react';
import {Component} from "react";
import {TextInput, View} from "react-native";
import {config_key} from "../Constants";
import {TextButton} from "../components/MyButton";
import {Tip} from "../components/Tip";
import {changeUsername} from "../service/UserService";

const changeFunctions = [
    async (value) => {
        //todo: fulfill this
        await changeUsername(value);
        return true;
    },
    async (value) => {
        //todo: fulfill this, change password

        return true;
    },
]

export default class EditProfileScreen extends Component {
    constructor() {
        super();
        this.state = {
            contentsCount: 0,
            text: null,
            tip: null,
        }
    }

    componentDidMount() {
        const {navigation, route} = this.props;
        const type = route.params.type;
        const title = type === 'name' ? '修改用户名' : '修改密码';
        navigation.setOptions({
            title: title,
            headerLeft: () => {
                return (
                    <TextButton text={"取消"} pressEvent={() => {navigation.pop()}}/>
                )
            },
            headerRight: () => {
                return (
                    <TextButton text={"完成"} pressEvent={this.onCommit}/>
                )
            }
        })
        if (type === 'name') {
            this.setState({
                contentsCount: 0,
            })
        } else if (type === 'password') {
            this.setState({
                contentsCount: 1,
            })
        }
    }

    onCommit = async () => {
        const {text, contentsCount} = this.state;
        const filled = !(text == null || text.length === 0);
        if (!filled) {
            this.setState({
                tip: '不能为空',
            })
        } else {
            if (await changeFunctions[contentsCount](text)) {
                this.props.navigation.pop();
            } else {

            }
        }
    }

    autoCheck = (value) => {
        //todo: check username duplicated
    }

    textChange = (value) => {
        if (this.state.contentsCount === 0) {
            this.autoCheck(value);
        }

        const tip = value == null || value.length === 0 ? '不能为空' : null;
        this.setState({
            text: value,
            tip: tip
        })
    }

    render() {
        return (
            <View style={{margin: 10}}>
                <Tip text={this.state.tip} warning={true}/>
                <TextInput
                    placeholder={this.state.contentsCount === 1 ? null : config_key.username}
                    maxLength={15}
                    multiline={false}
                    onChangeText={this.textChange}
                    keyboardType={"default"}
                    style={{backgroundColor: "white", borderRadius: 10, fontSize: 16, color: 'black'}}
                />
            </View>
        );
    }
}
