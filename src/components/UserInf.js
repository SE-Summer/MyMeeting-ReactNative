import {Component} from "react";
import {Avatar} from "react-native-elements";
import {ImageBackground, Text, View} from "react-native";
import * as React from "react";
import {StyleSheet} from "react-native";
import PropTypes from "prop-types";

export default class UserInf extends Component {
    static propTypes = {
        avatarUri: PropTypes.string,
        username: PropTypes.string,
    }

    render() {
        return (
            <View style={[this.props.style]}>
                <ImageBackground source={require('../resources/image/headerBg.png')} style={styles.rowContainer}>
                    <Avatar
                        rounded
                        size={70}
                        source={{
                            uri: this.props.avatarUri
                        }}
                    />
                    <Text style={styles.titleText}>{this.props.username}</Text>
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
