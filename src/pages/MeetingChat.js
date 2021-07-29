import {
    View,
    StyleSheet,
    TextInput,
    FlatList,
    Image,
    Text,
    Dimensions,
    TouchableOpacity,
    Animated,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as React from 'react';
import {Component} from "react";
import {ChatBubble} from "../components/ChatBubble";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import Easing from "react-native/Libraries/Animated/Easing";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const testData = [
    {text: '222221', myS: false},
    {text: '12222222', myS: false},
    {text: '1222222222222222222', myS: true},
    {text: '122', myS: false},
    {text: '243432423423s', myS: false},
    {text: '222221', myS: false},
    {text: '12222222', myS: false},
    {text: '12222222222222222265576576567576552', myS: true},
    {text: '243432423423s', myS: false},
    {text: '222221', myS: false},
    {text: '12222222', myS: false},
    {text: '1222222222222222222', myS: true},

]

export default class MeetingChat extends Component {
    constructor() {
        super();
        this.state = {
            text: null,
            toolsBarFlex: new Animated.Value(0),
        }
    }

    onChangeText = value => {
        this.setState({
            text: value,
            toolBar: false,
        })
    }

    showToolBar = () => {
        Animated.timing(
            this.state.toolsBarFlex,
            {
                toValue: 0.3,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    hideToolBar = () => {
        Animated.timing(
            this.state.toolsBarFlex,
            {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    renderItem = ({item}) => {
        return (
            <View style={[style.listItem, {justifyContent: item.myS ? 'flex-end' : 'flex-start'}]}>
                {
                    !item.myS &&
                    <View style={style.avatarContainer}>
                        <Text>User</Text>
                    </View>
                }
                <ChatBubble maxWidth={windowWidth * 0.8} myInf={item.myS} text={item.text} time={moment()} />
                {
                    item.myS &&
                    <View style={style.avatarContainer}>
                        <Text>User</Text>
                    </View>
                }
            </View>
        )
    }

    render() {
        const {text, toolBar, toolsBarFlex} = this.state;
        return (
            <SafeAreaView style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <View
                        style={style.listContainer}
                    >
                        <FlatList
                            data={testData}
                            renderItem={this.renderItem}
                            keyExtractor={(item, index) => {return index}}

                        />
                    </View>
                    <View style={style.sendBar}>
                        <TextInput
                            style={style.textInput}
                            multiline={true}
                            onChangeText={this.onChangeText}
                        />
                        {
                            !(text != null && text.length !== 0) &&
                            <TouchableOpacity style={style.toolButton} onPress={() => {
                                if (!toolBar)
                                    this.showToolBar();
                                else
                                    this.hideToolBar()
                                this.setState({
                                    toolBar: !toolBar,
                                })
                            }}>
                                <Ionicons name={'add-circle-outline'} size={37} color={toolBar ? '#44CE55' : '#171717'}/>
                            </TouchableOpacity>
                        }
                        {
                            text != null && text.length !== 0 &&
                            <TouchableOpacity style={style.sendButton}>
                                <Text style={style.sendText}>发送</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <Animated.View style={{flex: toolsBarFlex}}>
                    <View style={{position: 'absolute', top: 0, left: 0, width: windowWidth, height: 200, backgroundColor: 'black'}}/>
                </Animated.View>
            </SafeAreaView>
        );
    }
}

const style = StyleSheet.create({
    sendBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        justifyContent: 'flex-end',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f1f3f5',
        borderRadius: 10,
        margin: 6,
        textAlignVertical: 'top'
    },
    listContainer: {
        flex: 1,
    },
    listItem: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 3,
    },
    avatarContainer: {
        backgroundColor: 'skyblue',
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5
    },
    sendButton: {
        backgroundColor: '#44CE55',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 5,
        paddingBottom: 5,
        margin: 8,
        borderRadius: 3,
    },
    sendText: {
        color: 'white',
    },
    toolButton: {
        marginRight: 5,
    },
})
