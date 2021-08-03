import {StyleSheet, ImageBackground, Text, TouchableOpacity, View, TouchableHighlight} from "react-native";
import * as React from "react";
import {config} from "../Constants";
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

export const RoundButton = ({title = null,iconText, pressEvent, theStyle = {backgroundColor: config.qGreen}, iconSize = 56, iconStyle = {}}) => {
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
                <Ionicons name={iconText} size={iconSize} color={"white"} style={iconStyle}/>
            </TouchableOpacity>
            <Text style={{textAlign: "center", fontSize: 15, marginTop: 5, color: "#777777"}}>{title}</Text>
        </View>
    )
}

export const MyButton = ({text, pressEvent}) => {
    return (
        <TouchableOpacity
            onPress={pressEvent}
            activeOpacity={0.4}
        >
            <ImageBackground source={require('../../assets/image/myButton.png')} style={buttonStyle.img}>
                <Text style={buttonStyle.text}>{text}</Text>
            </ImageBackground>
        </TouchableOpacity>
    );
}

export const FlashButton = ({pressEvent}) => {
    return (
        <TouchableHighlight
            underlayColor={'#04482f'}
            onPress={pressEvent}
            style={buttonStyle.flashButton}
        >
            <Ionicons name={'flash'} color={'white'} size={40}/>
        </TouchableHighlight>
    )
}

const buttonStyle = StyleSheet.create({
    img: {
        width:130,
        height: 40,
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
    flashButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "green",
        justifyContent: "center",
        alignItems: "center",
    }
})
