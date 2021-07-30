import {
    View,
    StyleSheet,
    TextInput,
    FlatList,
    Text,
    Dimensions,
    TouchableOpacity,
    Animated, Keyboard, Modal, Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as React from 'react';
import {Component} from "react";
import {ChatBubble} from "../components/ChatBubble";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config, config_key} from "../Constants";
import {TextButton} from "../components/MyButton";
import {Avatar} from "react-native-elements";

const windowWidth = Dimensions.get('window').width;

export default class MeetingChat extends Component {
    constructor() {
        super();
        this.message = [];
        this.sendButtonWidth = new Animated.Value(0);
        this.addButtonWidth = new Animated.Value(50);
        this.state = {
            text: null,
            toolsBarFlex: new Animated.Value(0),
            toolBar: false,
            oneToOne: 0,
            visible: false,
            selected: null,
        }
    }

    componentDidMount () {
        const {navigation} = this.props;
        navigation.setOptions({
            headerLeft: () => {return (<TextButton text={'返回'} pressEvent={() => {navigation.pop();}}/>)},
        })
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

    uploadFile = () => {
        if (this.state.selected) {
            return;
        }
        if (Platform.OS === 'android') {

        }
    }

    renderItem = ({item}) => {
        return (
            <View style={[style.listItem, {justifyContent: item.myInf ? 'flex-end' : 'flex-start'}]}>
                {
                    !item.myInf &&
                    <View style={style.avatarContainer}>
                        <Text>{item.fromPeerId}</Text>
                    </View>
                }
                <ChatBubble maxWidth={windowWidth * 0.8} myInf={item.myInf} text={item.text} time={moment()} />
                {
                    item.myInf &&
                    <View style={style.avatarContainer}>
                        <Text>{config_key.userId}</Text>
                    </View>
                }
            </View>
        )
    }

    render() {
        const {toolBar, toolsBarFlex, visible, selected} = this.state;
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
                            data={this.message}
                            renderItem={this.renderItem}
                            keyExtractor={(item, index) => {return index}}

                        />
                    </TouchableOpacity>
                    <View style={style.sendBar}>
                        <TouchableOpacity style={{marginLeft: 5}} onPress={() => {
                            this.setState({
                                visible: true,
                            })
                        }}>
                            <Ionicons name={selected ? 'person' : 'person-outline'} size={34} color={selected ? '#87e0a8' : 'black'}/>
                        </TouchableOpacity>
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
                                <Ionicons name={'add-circle-outline'} size={37} color={toolBar ? '#87e0a8' : '#171717'}/>
                            </TouchableOpacity>
                        </Animated.View>
                        <Animated.View style={{width: this.sendButtonWidth, height: 44, justifyContent: 'center'}}>
                            <TouchableOpacity style={style.sendButton} onPress={this.sendMessage}>
                                <Text style={style.sendText}>发送</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
                <Animated.View style={{flex: toolsBarFlex}}>
                    <View style={style.toolContainer}>
                        <TouchableOpacity style={style.iconContainer} onPress={this.uploadFile}>
                            <Ionicons name={'folder-outline'} size={40}/>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                <Modal
                    animationType="slide"
                    visible={visible}
                    transparent={true}
                    onRequestClose={() => {
                        this.setState({
                            visible: false,
                        })
                    }}
                >
                    <TouchableOpacity style={{flex: 1}} onPress={() => {this.setState({ visible: false, })}}/>
                    <MemberSelector selected={selected} setSelected={(value) => {this.setState({selected: value})}}/>
                </Modal>
            </SafeAreaView>
        );
    }
}

const MemberSelector = ({selected, setSelected}) => {

    const renderItem = ({item}) => {
        const meSelected = selected && selected === item.id;
        return (
            <TouchableOpacity
                style={[selectorStyle.listItem, {backgroundColor: meSelected ? '#87e0a8' : 'white'}]}
                onPress={() => {
                    if (meSelected) {
                        setSelected(null);
                    } else {
                        setSelected(item.id);
                    }
                }}
            >
                <View style={{marginLeft: 20}}>
                    <Avatar
                        rounded
                        size={50}
                        source={{
                            uri: config.unKnownUri
                        }}
                    />
                </View>
                <View style={{flex: 1, alignItems: "center"}}>
                    <Text style={{color: meSelected ? 'white' : 'black'}}>{item.id}</Text>
                </View>
                <View style={{flex: 1}}/>
            </TouchableOpacity>
        )
    }

    return (
        <View style={style.memberListContainer}>
            <View style={selectorStyle.titleContainer}>
                <Text style={selectorStyle.title}>选择私聊对象</Text>
                <View style={selectorStyle.selectedUserContainer}>
                    { selected &&
                    <Text style={selectorStyle.selectedUser}>
                        用户：{selected}
                    </Text>
                    }
                </View>
                <TouchableOpacity onPress={() => {setSelected(null);}}>
                    <Ionicons name={'close-circle-outline'} color={'#aaaaaa'} size={20}
                              style={{marginLeft: 20, marginRight: 5}}
                    />
                </TouchableOpacity>

            </View>
            <FlatList
                data={[{id: 1}, {id: 2},{id: 3}, {id: 4},{id: 5}, {id: 6},{id: 7}, {id: 8},{id: 9}, {id: 10},{id: 11}, {id: 12}]}
                renderItem={renderItem}
                keyExtractor={(item, index) => {
                    return index;
                }}
                style={selectorStyle.list}
                extraData={selected}
            />
        </View>
    )
}

const selectorStyle = StyleSheet.create({
    titleContainer: {
        alignItems: 'center',
        padding: 15,
        flexDirection: 'row',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    selectedUser: {
        fontSize: 16,
    },
    selectedUserContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    list: {
    },
    listItem: {
        backgroundColor: "white",
        padding: 8,
        elevation: 1,
        flexDirection: 'row',
        alignItems:'center'
    },
    itemText: {
        textAlign: 'center',
    }
})

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
    memberListContainer: {
        flex: 2,
        backgroundColor: 'white',
        elevation: 5,
    }
})
