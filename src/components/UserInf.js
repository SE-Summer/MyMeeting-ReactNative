import {Component} from "react";
import {Avatar} from "react-native-elements";
import {config} from "../utils/Constants";
import {ImageBackground, Text, View} from "react-native";
import * as React from "react";
import {StyleSheet} from "react-native";

export default class UserInf extends Component {
    render() {
        return (
            <View style={this.props.style}>
                <ImageBackground source={require('../assets/headerBg.png')} style={styles.rowContainer}>
                    <Avatar
                        rounded
                        size={70}
                        source={{
                            uri: config.unKnownUri
                        }}
                    />
                    <Text style={styles.titleText}>用户名</Text>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    rowContainer: {
        padding: 15,
        flexDirection: "row",
    },
    titleText: {
        marginLeft: 15,
        textAlignVertical: "center",
        fontSize: 17,
        fontWeight: "bold",
    },
})
