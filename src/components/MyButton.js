import {StyleSheet, ImageBackground, Text, TouchableOpacity, View, TouchableHighlight} from "react-native";
import * as React from "react";
import {config} from "../Constants";
import Ionicons from "react-native-vector-icons/Ionicons";

export const TextButton = ({text, pressEvent, containerStyle = null, fontStyle = buttonStyle.normalText}) => {
    return (
        <TouchableOpacity
            onPress={pressEvent}
            style={[containerStyle, {alignSelf: 'flex-start'}]}
        >
            <View style={buttonStyle.normalButtonView}>
                <Text style={[fontStyle, {textAlign: "center"}]}>{text}</Text>
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
            <ImageBackground source={require('../resources/image/myButton.png')} style={buttonStyle.img}>
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
        paddingLeft: 13,
        paddingRight: 13,
        paddingTop: 2,
        paddingBottom: 2,
        justifyContent: "center"
    },
    normalText: {
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
