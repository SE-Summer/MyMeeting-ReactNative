import {StyleSheet, ImageBackground, Text, TouchableOpacity} from "react-native";
import * as React from "react";

export const MyButton = ({text, pressEvent}) => {
    return (
        <TouchableOpacity
            onPress={pressEvent}
            style={buttonStyle.button}
        >
            <ImageBackground source={require('../assets/myButton.png')} style={buttonStyle.img}>
                <Text style={buttonStyle.text}>{text}</Text>
            </ImageBackground>
        </TouchableOpacity>
    );
}

export const MyButtonOutLined = ({text, pressEvent}) => {
    return (
        <TouchableOpacity
            onPress={pressEvent}
            style={buttonStyle.button}
        >
            <ImageBackground source={require('../assets/myButton_Outlined.png')} style={buttonStyle.img}>
                <Text style={buttonStyle.outlineText}>{text}</Text>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const buttonStyle = StyleSheet.create({
    button: {

    },
    img: {
        width:130,
        height: 50,
        justifyContent: "center",
    },
    text: {
        textAlign: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    outlineText: {
        textAlign: "center",
        color: "black",
        fontWeight: "bold",
        fontSize: 16,
    }
})
