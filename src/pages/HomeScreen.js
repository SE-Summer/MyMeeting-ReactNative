import * as React from 'react';
import {Text, View, StyleSheet, TouchableHighlight, Image} from 'react-native';
import { Avatar } from "react-native-elements";
import { config } from "../utils/Constants";
import { Component } from "react";

export default class HomeScreen extends Component{
    render() {
        return (
            <View>
                <View
                    style={styles.rowContainer}
                >
                    <Avatar
                        rounded
                        size={70}
                        source={{
                            uri: config.unKnownUri
                        }}
                        onPress={() => {
                            this.props.navigation.navigate('User');
                        }}
                    />
                    <Text style={styles.titleText}>用户名</Text>
                </View>
                <View style={styles.cardContainer}>
                    <View>
                        <TouchableHighlight
                            activeOpacity={0.6}
                            underlayColor="#DDDDDD"
                            onPress={() => {this.props.navigation.navigate('CreateMeeting')}}
                            style={styles.card}
                        >
                            <Image source={require('../assets/add.png')} style={styles.cardImg}/>
                        </TouchableHighlight>
                        <Text style={styles.cardText}>创建会议</Text>
                    </View>
                    <View>
                        <TouchableHighlight
                            activeOpacity={0.6}
                            underlayColor="#DDDDDD"
                            onPress={() => {this.props.navigation.navigate('Meeting')}}
                            style={styles.card}
                        >
                            <Image source={require('../assets/add.png')} style={styles.cardImg}/>
                        </TouchableHighlight>
                        <Text style={styles.cardText}>加入会议</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    rowContainer: {
        margin: 15,
        flexDirection: "row"
    },
    titleText: {
        marginLeft: 15,
        textAlignVertical: "center"
    },
    cardContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    card:  {

        height: 100,
        elevation: 5,
        shadowOffset: { // 设置阴影偏移量
            width: 3,
            height: 4
        },
        shadowRadius: 4, // 设置阴影模糊半径
        shadowOpacity: 0.13, // 设置阴影的不透明度
        borderRadius: 10, // 设置圆角
        shadowColor: 'rgba(96,96,96,1)' // 设置阴影色
    },
    cardImg: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    cardText: {
        alignItems: "center",
    }
});
