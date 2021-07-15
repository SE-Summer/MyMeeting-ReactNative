import {Image, Text, TouchableHighlight, View, StyleSheet} from "react-native";
import * as React from "react";

export default function Card({text, imgSource, pressEvent}) {
    return (
        <TouchableHighlight onPress={pressEvent}>
            <View style={cardStyle.card}>
                <Image source={require(imgSource)} style={cardStyle.cardImg}/>
                <Text>{text}</Text>
            </View>
        </TouchableHighlight>
    );
}

const cardStyle = StyleSheet.create({
    card: {
        width: 100,
        height: 100,
        shadowOffset: { // 设置阴影偏移量
            width: 0,
            height: 4
        },
        shadowRadius: 4, // 设置阴影模糊半径
        shadowOpacity: 0.13, // 设置阴影的不透明度
        borderRadius: 10, // 设置圆角
        shadowColor: 'rgba(96,96,96,1)' // 设置阴影色
    },
    cardImg: {
        resizeMode: "cover",
    }
})
