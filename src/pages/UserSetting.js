import * as React from 'react';
import {Component} from "react";
import {Image, View, StyleSheet, Text, ToastAndroid} from "react-native";
import {TouchableItem} from "../components/Item";
import {config, config_key} from "../utils/Constants";
import {Divider} from "react-native-elements/dist/divider/Divider";
import ImagePicker from 'react-native-image-crop-picker';
import {getAvatar, uploadAvatar} from "../service/UserService";

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: "white",
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        borderRadius: 10,
    },
    divider: {
        marginLeft: 5,
        marginRight: 5,
    }
})

export default class UserSettingScreen extends Component {
    constructor() {
        super();
        this.state = {
            avatarUri: config_key.avatarUri,
            username: null,
            nickname: null,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.addListener('focus', () => {
            this.setState({
                username: config_key.username,
                nickname: config_key.nickname,
                avatarUri: config_key.avatarUri,
            })
        })
    }

    avatarSettings = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
            cropperCircleOverlay: true,
            cropperActiveWidgetColor: '#059677',
        }).then(async image => {
            const response = await uploadAvatar(image);
            if (response == null || response.status !== 200) {
                ToastAndroid.show('上传失败', 1000);
            } else {
                await this.refreshAvatar();
            }
        }).catch(e => {
            console.log(e)
        });
    }

    refreshAvatar = async () => {
        const response = await getAvatar();
        if (response.status === 200) {
            config_key.avatarUri = config.baseURL + response.data.path;
            this.setState({
                avatarUri: config_key.avatarUri,
            })
        }
    }

    usernameSettings = (type) => {
        this.props.navigation.navigate('EditProfile', {type: type})
    }

    render() {
        return (
            <View>
                <View style={styles.itemContainer}>
                    <TouchableItem text={'头像'} pressEvent={this.avatarSettings} rightComponent={
                        <Image source={{uri: this.state.avatarUri}} style={{width: 60, height: 60, borderRadius: 10}}/>
                    }/>
                </View>
                <View style={{height: 30}}/>
                <View style={styles.itemContainer}>
                    <TouchableItem text={'用户名'} pressEvent={() => {this.usernameSettings('name')}} rightComponent={
                        <Text>{this.state.username}</Text>
                    }/>
                    <Divider style={styles.divider}/>
                    <TouchableItem text={'入会名称'} pressEvent={() => {this.usernameSettings('nickname')}} rightComponent={
                        <Text>{this.state.nickname}</Text>
                    }/>
                </View>
                <View style={{height: 30}}/>
                <View style={styles.itemContainer}>
                    <TouchableItem text={'修改密码'} pressEvent={() => {}} />
                </View>
            </View>
        );
    }
}
