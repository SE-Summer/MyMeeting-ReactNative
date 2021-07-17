import {StyleSheet, ImageBackground, Text, TouchableOpacity, View} from "react-native";
import * as React from "react";
import {config} from "../utils/Constants";
import Ionicons from "react-native-vector-icons/Ionicons";

export const TextButton = ({text, pressEvent, containerStyle = null}) => {
    return (
        <TouchableOpacity
            onPress={pressEvent}
            style={containerStyle}
        >
            <View style={buttonStyle.normalButtonView}>
                <Text style={buttonStyle.normalText}>{text}</Text>
            </View>
        </TouchableOpacity>
    )
}

export const RoundButton = ({title = null,iconText, pressEvent, theStyle = {backgroundColor: config.qGreen}, iconSize = 30}) => {
    return (
        <View>
            <TouchableOpacity
                onPress={pressEvent}
                style={Object.assign({
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    justifyContent: "center",
                    alignItems: "center",
                }, theStyle)}
            >
                <Ionicons name={iconText} size={iconSize} color={"white"} style={{transform: [{ scaleX: 2 }, { scaleY: 2 }]}}/>
            </TouchableOpacity>
            <Text style={{textAlign: "center", fontSize: 15, marginTop: 5, color: "#777777"}}>{title}</Text>
        </View>
    )
}

export const MyButton = ({text, pressEvent}) => {
    return (
        <TouchableOpacity
            onPress={pressEvent}
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
        >
            <ImageBackground source={require('../assets/myButton_Outlined.png')} style={buttonStyle.img}>
                <Text style={buttonStyle.outlineText}>{text}</Text>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const buttonStyle = StyleSheet.create({
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
    },
    normalButtonView: {
        backgroundColor: null,
        width: 70,
        height: 30,
        justifyContent: "center"
    },
    normalText: {
        textAlign: "center",
        color: config.qGreen,
        fontSize: 17,
    },
})
