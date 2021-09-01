import {Text, TouchableOpacity, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import UserInf from "../components/UserInf";
import {StyleSheet} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {config, config_key} from "../Constants";
import {getAvatar} from "../service/UserService";

const Item = ({icon, text, func}) => {
    return(
        <TouchableOpacity onPress={func} style={{flexDirection: "row", padding: 15}}>
            <Ionicons name={icon} size={23} color={"#058451"} style={{}}/>
            <Text style={{fontSize:15, textAlign: "left", marginLeft: 20}}>{text}</Text>
            <View style={{alignItems: "flex-end", flex: 1}}>
                <Ionicons name={"ios-chevron-forward"} size={23}/>
            </View>
        </TouchableOpacity>
    )
}

export default class UserScreen extends Component{
    constructor() {
        super();
        this.state = {
            avatarUri: config_key.avatarUri,
            username: config_key.username,
        }
    }

    async componentDidMount() {
        const {navigation} = this.props;
        const response = await getAvatar();
        if (response == null ||response.status !== 200) {
            // toast.show('获取头像失败', {type: 'warning', duration: 1300, placement: 'top'})
        } else {
            config_key.avatarUri = config.baseURL + response.data.path;
            this.setState({
                avatarUri: config_key.avatarUri,
                username: config_key.username,
            })
        }
        navigation.addListener('focus', () => {
            this.setState({
                avatarUri: config_key.avatarUri,
                username: config_key.username,
            })
        })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <UserInf avatarUri={this.state.avatarUri} username={this.state.username} style={userScreenStyles.inf}/>
                <View style={{height: 20}}/>
                <View style={userScreenStyles.optionsContainer}>
                    <Item icon={"videocam-outline"} text={"会议设置"} func={() => {
                        this.props.navigation.navigate('MeetingSetting');
                    }}/>
                </View>
                <View style={userScreenStyles.optionsContainer}>
                    <Item icon={"person-circle-outline"} text={"个人信息"} func={() => {
                        this.props.navigation.navigate('UserSetting');
                    }} />
                </View>
                <View style={userScreenStyles.optionsContainer}>
                    <Item icon={"settings-outline"} text={"通用"} func={() => {
                        this.props.navigation.navigate('NormalSetting');
                    }} />
                </View>
            </View>
        );
    }
}

const userScreenStyles = StyleSheet.create({
    inf: {
        backgroundColor: 'white',
        borderRadius: 10,
        margin: 10,
    },
    optionsContainer: {
        marginRight: 13,
        marginLeft: 13,
        marginTop: 10,
        backgroundColor:"white",
        borderRadius: 10
    }
})
