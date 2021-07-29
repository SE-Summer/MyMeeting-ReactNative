import {View, StyleSheet, TextInput, FlatList} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as React from 'react';
import {Component} from "react";
import {ChatBubble} from "../components/ChatBubble";
import moment from "moment";

const testData = [
    {text: '222221', myS: false},
    {text: '12222222', myS: false},
    {text: '1222222222222222222', myS: true},
    {text: '122', myS: false},
    {text: '243432423423s', myS: false},
    {text: '222221', myS: false},
    {text: '12222222', myS: false},
    {text: '1222222222222222222', myS: true},
    {text: '243432423423s', myS: false},
    {text: '222221', myS: false},
    {text: '12222222', myS: false},
    {text: '1222222222222222222', myS: true},

]

export default class MeetingChat extends Component {
    renderItem = ({item}) => {
        return (
            <View style={[style.listItem]}>
                <ChatBubble maxWidth={300} myInf={item.myS} text={item.text} time={moment()} />
            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <View style={style.listContainer}>
                    <FlatList
                        data={testData}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => {return index}}
                    />
                </View>
                <View style={style.footContainer}>
                    <View style={style.sendBar}>
                        <TextInput
                            style={style.textInput}
                        />

                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const style = StyleSheet.create({
    sendBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'green',
        height: 54,
    },
    textInput: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 10,
        margin: 7,
    },
    footContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    listContainer: {
        flex: 1,
    },
    listItem: {
        flex: 1,
    }
})
