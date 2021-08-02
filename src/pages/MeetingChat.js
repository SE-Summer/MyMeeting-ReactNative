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
import {Component, useState} from "react";
import {ChatBubble} from "../components/ChatBubble";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config_key} from "../Constants";
import {TextButton} from "../components/MyButton";
import {Avatar} from "react-native-elements";
import {MeetingVariable} from "../MeetingVariable";
import DocumentPicker from "react-native-document-picker";
import {serviceConfig} from "../ServiceConfig";
import {FileJobStatus} from "../utils/Types";

const windowWidth = Dimensions.get('window').width;
const RNFS = require('react-native-fs');

export default class MeetingChat extends Component {
    constructor() {
        super();
        this.message = [];
        this.sendButtonWidth = new Animated.Value(0);
        this.addButtonWidth = new Animated.Value(50);
        this.listRef = React.createRef();
        this.uploadFileJobs = new Map();
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

    sendMessage = () => {
        const {selected, text} = this.state;
        const peerId = selected ? selected : null;
        const message = {
            myInf: true,
            text: text,
            timestamp: moment(),
            broadcast: selected == null,
            toPeerId: selected,
        };
        try {
            MeetingVariable.mediaService.sendMessage(peerId, text);
            MeetingVariable.messages.push(message);
            this.setState({
                text: null,
            }, () => {
                this.hideSendButton();
                this.showAddButton();
                this.listRef.current.scrollToEnd();
            })
        } catch (e) {
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
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
        try {
            const file = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            console.log(`[Log]  File picked: URI: ${file.uri}, Type: ${file.type}, Name: ${file.name}, Size: ${file.size}`);

            const uploadFileItem = {
                name: file.name,       // Name of the file, if not defined then filename is used
                filename: file.name,   // Name of file
                filepath: file.uri,   // Path to file
                filetype: file.type,   // The mimetype of the file to be uploaded, if not defined it will get mimetype from `filepath` extension
            };

            const uploadFileOptions = {
                toUrl: serviceConfig.serverURL,         // URL to upload file to
                // binaryStreamOnly?: boolean           // Allow for binary data stream for file to be uploaded without extra headers, Default is 'false'
                files: [uploadFileItem],  // An array of objects with the file information to be uploaded.
                // headers?: Headers;        // An object of headers to be passed to the server
                // fields?: Fields;          // An object of fields to be passed to the server
                // method?: string;          // Default is 'POST', supports 'POST' and 'PUT'
                // begin?: (res: UploadBeginCallbackResult) => void;
                // progress?: (res: UploadProgressCallbackResult) => void;
                progress: (res) => {
                    if (this.uploadFileJobs.has(res.jobId)) {
                        let job = this.uploadFileJobs.get(res.jobId);
                        job.totalBytesExpectedToSend = res.totalBytesExpectedToSend;
                        job.totalBytesSent = res.totalBytesSent;
                    }
                },
            };

            const { jobId, promise } = RNFS.uploadFiles(uploadFileOptions);
            this.uploadFileJobs.set(jobId, {
                status: FileJobStatus.progressing,
                totalBytesExpectedToSend: file.size,
                totalBytesSent: 0,
            });
            const result = await promise;
            if (result.statusCode === 200) {
                this.uploadFileJobs.get(jobId).status = FileJobStatus.completed;
            } else {
                this.uploadFileJobs.get(jobId).status = FileJobStatus.failed;
                console.error('[Error]  Server rejected the upload');
                return Promise.reject('Fail to upload file');
            }


        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.warn('[File]  User cancelled file picker');
            } else {
                console.error('[Error]  Fail to upload file');
                return Promise.reject('Fail to upload file');
            }
        }
    }

    renderItem = ({item}) => {
        const peerInfo = item.myInf ? null : MeetingVariable.mediaService.getPeerDetailsByPeerId(item.fromPeerId).getPeerInfo();

        return (
            <View style={[style.listItem, {justifyContent: item.myInf ? 'flex-end' : 'flex-start'}]}>
                {
                    !item.myInf &&
                    <View style={style.avatarContainer}>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: peerInfo.avatar
                            }}
                        />
                        <Text style={style.listUsername}>{peerInfo.displayName}</Text>
                    </View>
                }
                <ChatBubble maxWidth={windowWidth * 0.8} myInf={item.myInf} text={item.text} time={item.timestamp} />
                {
                    item.myInf &&
                    <View style={style.avatarContainer}>
                        <Avatar
                            rounded
                            size={40}
                            source={{
                                uri: config_key.avatarUri
                            }}
                        />
                        <Text style={style.listUsername}>{config_key.username}</Text>
                    </View>
                }
            </View>
        )
    }

    render() {
        const {text, toolBar, toolsBarFlex, visible, selected} = this.state;
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
                            data={MeetingVariable.messages}
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
    const participants = MeetingVariable.mediaService.getPeerDetails();
    const [name, setName] = useState(null);

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
                <View style={{flex: 1, alignItems: "center"}}>
                    <Text style={{color: meSelected ? 'white' : 'black', fontSize: 17}}>{inf.displayName}</Text>
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
                    { name &&
                    <Text style={selectorStyle.selectedUser}>
                        用户：{name}
                    </Text>
                    }
                </View>
                <TouchableOpacity onPress={() => {
                    setSelected(null);
                    setName(null);
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
    listUsername: {
        position:'absolute',
        bottom: 0,
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
    }
})
