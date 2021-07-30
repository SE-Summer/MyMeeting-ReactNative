import * as React from 'react';
import {StyleSheet, Text, View} from "react-native";
import moment from "moment";

const bubbleStyle = StyleSheet.create({
    myBubble: {
        backgroundColor: '#24b23b',
        alignSelf: 'flex-end',
        padding: 10,
        borderRadius: 20,
    },
    otherBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        padding: 10,
        borderRadius: 20,
    },
    timeFont: {
        fontSize: 10,
        color: '#aaaaaa',
        marginTop: 2,
        marginLeft: 10,
        marginRight: 10,
    }
})

export const ChatBubble = ({text, myInf = false, time, maxWidth}) => {
    return (
        <View style={{alignSelf: 'flex-start', maxWidth: maxWidth}}>
            <View style={myInf ? bubbleStyle.myBubble : bubbleStyle.otherBubble}>
                <Text style={myInf ? {color: 'white'} : {color: 'black'}}>{text}</Text>
            </View>
            <Text style={[bubbleStyle.timeFont, myInf ? {alignSelf: 'flex-end'} : null]}>{moment(time).format('HH:mm:ss')}</Text>
        </View>

    )
}

