import {
    View,
    StyleSheet,
    TextInput,
    FlatList,
    Text,
    TouchableOpacity,
    Animated, Keyboard, Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as React from 'react';
import {Component} from "react";
import {ChatBubble, FileBubble} from "../components/ChatBubble";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config_key} from "../Constants";
import {TextButton} from "../components/MyButton";
import {Avatar} from "react-native-elements";
import {MeetingVariable} from "../MeetingVariable";
import {FileJobStatus, FileJobType, MessageType} from "../utils/Types";
import DocumentPicker from "react-native-document-picker";
import {windowWidth} from "../utils/Utils";

export default class MeetingChat extends Component {
    constructor(props) {
        super(props);
        MeetingVariable.mediaService.registerNewMessageListener('messagesInMeetingChatPage', this.recvNewMessage);
        this.sendButtonWidth = new Animated.Value(0);
        this.addButtonWidth = new Animated.Value(50);
        this.listRef = React.createRef();
        this.state = {
            text: null,
            toolsBarFlex: new Animated.Value(0),
            toolBar: false,
            oneToOne: 0,
            visible: false,
            selected: null,
            selectedName: null,
            messages: MeetingVariable.messages,
        }
    }

    componentDidMount () {
        const {navigation} = this.props;
        navigation.setOptions({
            headerLeft: () => {return (<TextButton text={'返回'} pressEvent={() => {navigation.pop();}}/>)},
        })
        Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
        this.listRef.current.scrollToEnd();
    }

    componentWillUnmount() {
        MeetingVariable.mediaService.deleteNewMessageListener('messagesInMeetingChatPage');
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

    sendMessage = () => {
        const {selected, text} = this.state;
        const peerId = selected ? selected : null;

        const message = {
            type: MessageType.text,
            fromMyself: true,
            text: text,
            timestamp: moment(),
            broadcast: selected == null,
            toPeerId: selected,
        };
        try {
            MeetingVariable.mediaService.sendText(peerId, text, message.timestamp);

            if (!message.broadcast && message.toPeerInfo == null) {
                message.toPeerInfo = MeetingVariable.mediaService.getPeerDetailByPeerId(message.toPeerId).getPeerInfo();
            }

            MeetingVariable.messages.push(message);
            this.setState({
                text: null,
                messages: MeetingVariable.messages,
            }, () => {
                this.hideSendButton();
                this.showAddButton();
                this.listRef.current.scrollToEnd();
            })
        } catch (e) {
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    recvNewMessage = () => {
        this.setState({
            messages: MeetingVariable.messages,
        }, ()  => {
            this.listRef.current.scrollToEnd();
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

    uploadFile = async () => {
        if (this.state.selected) {
            return;
        }

        let file = null;

        try {
            file = await MeetingVariable.fileService.pickFile();
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.warn('[File]  User cancelled file picker');
                return;
            } else {
                console.error('[Error]  Fail to upload file', err);
                return;
            }
        }

        let message = {
            type: MessageType.file,
            timestamp: moment(),
            fromMyself: true,
            fileJobType: FileJobType.upload,
            fileURL: null,
            filename: file.name,
            fileType: file.type,
            fileJobStatus: FileJobStatus.progressing,
            totalBytes: file.size,
            bytesSent: 0,
            filePath: file.path,
        }

        try {
            MeetingVariable.messages.push(message);
            this.setState({
                messages: MeetingVariable.messages
            });

            const fileURL = await MeetingVariable.fileService.uploadFile(file, (bytesSent, totalBytes) => {
                message.bytesSent = bytesSent;
                message.totalBytes = totalBytes;
                this.setState({
                    messages: MeetingVariable.messages,
                });
            });
            message.fileURL = fileURL;
            message.fileJobStatus = FileJobStatus.completed;
            this.setState({
                messages: MeetingVariable.messages,
            })
            this.listRef.current.scrollToEnd();
            await MeetingVariable.mediaService.sendFile(fileURL, message.timestamp, message.filename, message.fileType);
        } catch (err) {
            message.fileJobStatus = FileJobStatus.failed;
            this.setState({
                messages: MeetingVariable.messages,
            });
            console.error('[Error]  Fail to upload file', err);
        }
    }

    // @Param message: reference of a message in MeetingVariable.messages
    downloadFile = async (message) => {
        try {
            const filePath = `${MeetingVariable.fileService.getBundlePath()}/${message.filename}`;
            await MeetingVariable.fileService.download(message.fileURL, filePath,
                (bytesSent, totalBytes) => {
                    message.bytesSent = bytesSent;
                    message.totalBytes = totalBytes;
                    this.setState({
                        messages: MeetingVariable.messages,
                    });
                },
                (status) => {
                    message.fileJobStatus = status;
                    this.setState({
                        messages: MeetingVariable.messages,
                    });
                });
            message.filePath = filePath;
            this.setState({
                messages: MeetingVariable.messages,
            })
        } catch (err) {
            message.fileJobStatus = FileJobStatus.failed;
            this.setState({
                messages: MeetingVariable.messages,
            });
            console.error('[Error]  Fail to download file', JSON.stringify(err));
        }
    }

    renderTextItem = ({item}) => {
        return (
            <View style={[style.listItem, {justifyContent: item.fromMyself ? 'flex-end' : 'flex-start'}]}>
                {
                    item.fromMyself && !item.broadcast &&
                    <View style={[style.privateTip, {marginRight: 3}]}>
                        <Text style={style.tipFont} numberOfLines={1}>仅{item.toPeerInfo.displayName}可见</Text>
                    </View>
                }
                {
                    !item.fromMyself &&
                    <View style={style.avatarContainer}>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: item.peerInfo.avatar
                            }}
                        />
                        <Text style={style.listUsername} numberOfLines={1}>{item.peerInfo.displayName}</Text>
                    </View>
                }
                <ChatBubble maxWidth={windowWidth * 0.7} myInf={item.fromMyself} text={item.text} time={item.timestamp}/>
                {
                    item.fromMyself &&
                    <View style={style.avatarContainer}>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: config_key.avatarUri
                            }}
                        />
                        <Text style={style.listUsername} numberOfLines={1}>{MeetingVariable.myName}</Text>
                    </View>
                }
                {
                    !item.fromMyself && !item.broadcast &&
                    <View style={[style.privateTip, {marginLeft: 3}]}>
                        <Text style={style.tipFont} numberOfLines={1}>仅您可见</Text>
                    </View>
                }
            </View>
        )
    }

    renderFileItem = ({item}) => {
        if (!item.fromMyself && item.peerInfo == null) {
            item.peerInfo = MeetingVariable.mediaService.getPeerDetailByPeerId(item.fromPeerId).getPeerInfo();
        }

        return (
            <View style={[style.listItem, {justifyContent: item.fromMyself ? 'flex-end' : 'flex-start'}]}>
                {
                    !item.fromMyself &&
                    <View style={style.avatarContainer}>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: item.peerInfo.avatar
                            }}
                        />
                        <Text style={style.listUsername} numberOfLines={1}>{item.peerInfo.displayName}</Text>
                    </View>
                }
                <FileBubble file={item} maxWidth={windowWidth * 0.7} downloadFile={this.downloadFile}/>
                {
                    item.fromMyself &&
                    <View style={style.avatarContainer}>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: config_key.avatarUri
                            }}
                        />
                        <Text style={style.listUsername} numberOfLines={1}>{MeetingVariable.myName}</Text>
                    </View>
                }
            </View>
        );
    }

    renderItem = ({item}) => {
        if (item.type === MessageType.text) {
            return this.renderTextItem({item});
        } else {
            return this.renderFileItem({item});
        }
    }

    render() {
        const {text, toolBar, toolsBarFlex, visible, selected, selectedName, messages} = this.state;
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
                            data={messages}
                            renderItem={this.renderItem}
                            keyExtractor={(item, index) => {return index}}
                            ref={this.listRef}
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
                            value={text}
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
                                Keyboard.dismiss();
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
                        <TouchableOpacity style={[style.iconContainer]} onPress={this.uploadFile} disabled={this.state.selected}>
                            <Ionicons name={'folder-outline'} size={40} color={this.state.selected ? '#aaaaaa' : 'black'}/>
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
                    <MemberSelector
                        selected={selected}
                        setSelected={(value) => {this.setState({selected: value})}}
                        name = {selectedName}
                        setName = {(value) => {this.setState({selectedName: value})}}
                        closeModal = {() => {this.setState({visible: false,})}}
                    />
                </Modal>
            </SafeAreaView>
        );
    }
}

const MemberSelector = ({selected, setSelected, name, setName, closeModal}) => {
    const participants = MeetingVariable.mediaService.getPeerDetails();

    const renderItem = ({item}) => {
        const inf = item.getPeerInfo();
        const meSelected = selected && selected === inf.id;
        return (
            <TouchableOpacity
                style={[selectorStyle.listItem, {backgroundColor: meSelected ? '#87e0a8' : 'white'}]}
                onPress={() => {
                    if (meSelected) {
                        setName(null);
                        setSelected(null);
                    } else {
                        setName(inf.displayName);
                        setSelected(inf.id);
                    }
                }}
            >
                <View style={{marginLeft: 20}}>
                    <Avatar
                        rounded
                        size={40}
                        source={{
                            uri: inf.avatar
                        }}
                    />
                </View>
                <View style={{alignItems: "center", marginLeft: 20}}>
                    <Text style={{color: meSelected ? 'white' : 'black', fontSize: 16}}>{inf.displayName}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={style.memberListContainer}>
            <View style={selectorStyle.titleContainer}>
                <Text style={selectorStyle.title}>选择私聊对象</Text>
                <View style={selectorStyle.selectedUserContainer}>
                    { name &&
                    <Text style={selectorStyle.selectedUser}>
                        用户：{name}
                    </Text>
                    }
                </View>
                <TouchableOpacity onPress={() => {
                    if (selected) {
                        setSelected(null);
                        setName(null);
                    } else {
                        closeModal();
                    }
                }}>
                    <Ionicons name={'close-circle-outline'} color={'#aaaaaa'} size={20}
                              style={{marginLeft: 20, marginRight: 5}}
                    />
                </TouchableOpacity>

            </View>
            <FlatList
                data={participants}
                renderItem={renderItem}
                keyExtractor={(item, index) => {
                    return index;
                }}
                ListEmptyComponent={() => {
                    return (
                        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                            <Text style={{color: '#aaaaaa'}}>-没有其他成员-</Text>
                        </View>
                    )
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
        fontSize: 14,
    },
    selectedUserContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    list: {
    },
    listItem: {
        backgroundColor: "white",
        padding: 6,
        elevation: 1,
        flexDirection: 'row',
        alignItems:'center',
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
        textAlignVertical: 'top',
        color: 'black',
    },
    listContainer: {
        flex: 1,
        marginTop: 5,
        marginBottom: 5,
    },
    listItem: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 3,
    },
    listUsername: {
        fontSize: 10,
        color: '#555555'
    },
    avatarContainer: {
        flexDirection: 'column',
        width: 40,
        height: 60,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 5,
        marginRight: 5,
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
    },
    privateTip: {
        flex: 1,
        marginTop: 10,
    },
    tipFont: {
        color: '#aaaaaa',
        fontSize: 12,
    }
})
