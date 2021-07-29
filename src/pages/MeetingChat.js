import {
    View,
    StyleSheet,
    TextInput,
    FlatList,
    Text,
    Dimensions,
    TouchableOpacity,
    Animated, Keyboard,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as React from 'react';
import {Component} from "react";
import {ChatBubble} from "../components/ChatBubble";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
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
        this.sendButtonWidth = new Animated.Value(0);
        this.addButtonWidth = new Animated.Value(50);
        this.state = {
            text: null,
            toolsBarFlex: new Animated.Value(0),
            toolBar: false,
        }
    }

    componentDidMount () {
        Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
    }

    componentWillUnmount() {
        Keyboard.removeAllListeners('keyboardDidShow');
    }

    keyboardWillShow = () => {
        if (this.state.toolBar) {
            this.hideToolBar();
        }
    }

    onChangeText = value => {
        if (value != null && value.length !== 0) {
            this.hideAddButton();
            this.showSendButton();
        } else {
            this.showAddButton();
            this.hideSendButton();
        }
        this.setState({
            text: value,
            toolBar: false,
        })
    }

    showToolBar = () => {
        this.setState({
            toolBar: true,
        })
        Animated.timing(
            this.state.toolsBarFlex,
            {
                toValue: 0.12,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    hideToolBar = () => {
        this.setState({
            toolBar: false,
        })
        Animated.timing(
            this.state.toolsBarFlex,
            {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    showSendButton = () => {
        Animated.timing(
            this.sendButtonWidth,
            {
                toValue: 75,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    hideSendButton = () => {
        Animated.timing(
            this.sendButtonWidth,
            {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    showAddButton = () => {
        Animated.timing(
            this.addButtonWidth,
            {
                toValue: 50,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    hideAddButton = () => {
        Animated.timing(
            this.addButtonWidth,
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
                    <TouchableOpacity
                        style={style.listContainer}
                        activeOpacity={1}
                        onPress={() => {
                            if (toolBar) {
                                this.hideToolBar();
                            }
                        }}
                        disabled={!toolBar}
                    >
                        <FlatList
                            data={testData}
                            renderItem={this.renderItem}
                            keyExtractor={(item, index) => {return index}}

                        />
                    </TouchableOpacity>
                    <View style={style.sendBar}>
                        <TextInput
                            style={style.textInput}
                            textAlignVertical={'center'}
                            multiline={true}
                            onChangeText={this.onChangeText}
                            onFocus={() => {
                                this.hideToolBar();
                            }}
                        />
                        <Animated.View style={{width: this.addButtonWidth}}>
                            <TouchableOpacity style={[style.toolButton]} onPress={() => {
                                if (!toolBar)
                                    this.showToolBar();
                                else
                                    this.hideToolBar()
                            }}>
                                <Ionicons name={'add-circle-outline'} size={37} color={toolBar ? '#44CE55' : '#171717'}/>
                            </TouchableOpacity>
                        </Animated.View>
                        <Animated.View style={{width: this.sendButtonWidth, height: 44, justifyContent: 'center'}}>
                            <TouchableOpacity style={style.sendButton}>
                                <Text style={style.sendText}>发送</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
                <Animated.View style={{flex: toolsBarFlex}}>
                    <View style={style.toolContainer}>
                        <TouchableOpacity style={style.iconContainer}>
                            <Ionicons name={'folder-outline'} size={40}/>
                        </TouchableOpacity>
                    </View>
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
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 5,
        margin: 7,
        paddingBottom: 5,
        borderRadius: 3,
    },
    sendText: {
        color: 'white',
    },
    toolButton: {
        alignItems: 'center',
    },
    iconContainer: {
        paddingLeft: 7,
        paddingRight: 5,
        paddingTop: 3,
        paddingBottom: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        margin: 10,
    },
    toolContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: windowWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
