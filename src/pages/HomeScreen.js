import * as React from 'react';
import {Text, View, StyleSheet, TouchableHighlight, Image} from 'react-native';
import {Avatar, Card} from "react-native-elements";
import { config } from "../utils/Constants";
import {Component} from "react";

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
                    <TouchableHighlight onPress={() => {this.props.navigation.navigate('CreateMeeting')}}>
                        <View style={styles.card}>
                            <Image source={require('../assets/add.png')} style={styles.cardImg}/>
                            <Text>创建会议</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => {this.props.navigation.navigate('Meeting')}}>
                    <View style={styles.card}>
                        <Image source={require('../assets/add.png')} style={styles.cardImg}/>
                        <Text>加入会议</Text>
                    </View>
                </TouchableHighlight>
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
    },
    cardImg: {
        width: 70,
        height: 70
    },
    cardText: {
        alignItems: "center",
    }
});
