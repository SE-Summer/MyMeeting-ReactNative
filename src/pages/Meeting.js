import {
    TouchableOpacity,
    View,
    StyleSheet,
    Text,
    TouchableHighlight,
    Dimensions,
    Modal,
    FlatList, BackHandler, Alert,
} from "react-native";
import * as React from "react";
import {Component, useState} from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config, config_key} from "../utils/Constants";
import {IconWithLabel} from "../components/IconWithLabel";
import {MediaService} from "../service/MediaService";
import {MediaStreamFactory} from "../utils/media/MediaStreamFactory";
import {closeMediaStream} from "../utils/media/MediaUtils";
import {RTCView} from "react-native-webrtc";

const windowWidth = Dimensions.get('window').width;

const testData = [{id: 1}, {id: 2},{id: 3},{id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}];

const screenStyle = StyleSheet.create({
    header: {
        backgroundColor: '#202020',
        flexDirection: 'row',
    },
    footer: {
        backgroundColor: '#202020',
        flexDirection: 'row',
        alignSelf: 'flex-end',
    }
})

export default class Meeting extends Component
{
    constructor(props) {
        super(props);
        this.mediaStreamFactory = new MediaStreamFactory();
        this.mediaService = new MediaService(this.updateStream.bind(this));
        this.state = {
            view: 'portrait',
            peerDetails: null,
            myCameraStream: null,
            myDisplayStream: null,
            myMicrophoneStream: null,
            width: 0,
            height: 0,
        };
    }

    backAction = () => {
        Alert.alert(
            "是否要退出会议",
            null,
            [
                {
                    text: "确定",
                    onPress: () => this.props.navigation.pop(),
                    style: 'default',
                },
            ],
            {
                cancelable: true,
            }
        );
        return true;
    }

    handleBack = () => {
        const {navigation} = this.props;
        navigation.addListener('focus', () => {
            BackHandler.addEventListener('hardwareBackPress', this.backAction)
        });
        navigation.addListener('blur', () => {
            BackHandler.removeEventListener('hardwareBackPress', this.backAction)
        });
    }

    async componentDidMount() {
        this.handleBack();
        await this.mediaStreamFactory.waitForUpdate();
        this.userName = config_key.username;
        await this.mediaService.joinMeeting(this.props.route.params.token, config_key.token,
            this.userName, `${this.userName}'s mobile device`);
    }

    openMicrophone = async () => {
        const micStream = await this.mediaStreamFactory.getMicStream();

        if (micStream.getAudioTracks().length === 0) {
            return Promise.reject("Fail to get local microphone media.");
        }

        this.setState({
            myMicrophoneStream: micStream,
        });

        await this.mediaService.sendMediaStream(micStream);
    }

    closeMicrophone = async () => {
        closeMediaStream(this.state.myMicrophoneStream);
        this.setState({
            myMicrophoneStream: null,
        });
    }

    openCamera = async () => {
        const camStream = await this.mediaStreamFactory.getCamFrontStream();

        if (camStream.getVideoTracks().length === 0) {
            return Promise.reject("Fail to get local camera media.");
        }

        this.setState({
            myCameraStream: camStream,
        });

        await this.mediaService.sendMediaStream(camStream);
    }

    closeCamera = async () => {
        closeMediaStream(this.state.myCameraStream);
        this.setState({
            myCameraStream: null,
        });
    }

    updateStream() {
        this.setState({
            peerDetails: this.mediaService.getPeerDetails().length === 0 ? null : this.mediaService.getPeerDetails(),
        })
    }

    onLayout = event => {
        let {width,height} = event.nativeEvent.layout;
        this.setState({
            width: width,
            height: height,
        })
    }

    exit = async () => {
        closeMediaStream(this.state.myStream);
        await this.mediaService.leaveMeeting();
        this.backAction();
    }

    swapCam = () => {

    }

    openChatRoom = () => {
        this.props.navigation.navigate('MeetingChat');
    }

    render() {
        const roomInf = this.props.route.params;
        const {width, height} = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: '#111111', flexDirection: 'column'}}>
                <Header style={screenStyle.header} roomInf={roomInf} exit={this.exit}/>
                <View style={{flex: 1}} onLayout={this.onLayout}>
                    {
                        this.state.view === 'grid' ?
                            <GridView width={width} height={height}/>
                            :
                            <PortraitView width={width} height={height} myStream={this.state.myStream} peerMedia={this.state.peerDetails}/>
                    }
                </View>
                <Footer
                    openCamera={this.openCamera}
                    closeCamera={this.closeCamera}
                    openChatRoom={this.openChatRoom}
                    swapCam={this.swapCam}
                    style={screenStyle.footer}
                    setView={(type) => { this.setState({ view: type, }); }}
                />
            </View>
        );
    }
}

const GridView = ({width, height}) => {

    const renderItem = ({item}) => {
        return (
            <View>
            </View>
        )
    }

    return (
        <View style={{flex: 1}}>
            <FlatList
                data={testData}
                renderItem={renderItem}
                numColumns={3}
                keyExtractor={(item => item.id)}
            />
        </View>
    )
}

const PortraitView = ({width, height, peerMedia, myStream}) => {
    if (peerMedia) {
        return (
            <RTCView  style={{width: width, height: height}}  streamURL={(new MediaStream(peerMedia[0].getTracks())).toURL()} >
                <RTCView style={{width: width / 3, height: height /3}} streamURL={myStream}/>
            </RTCView>
        )
    } else if (myStream) {
        return (
            <RTCView style={{width: width, height: height}} streamURL={myStream.toURL()}/>
        )
    } else {
        return (
            <View>

            </View>
        )
    }
}

const Footer = ({style, setView, swapCam, openChatRoom, openCamera, closeCamera}) => {
    const footerStyle = StyleSheet.create({
        wholeContainer: {
            flex: 1,
            flexDirection: 'row',
            padding: 10,
            justifyContent: 'space-around',
        }
    })

    const menuStyle = StyleSheet.create({
        container: {
            backgroundColor: 'white',
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-around',
        },
    })

    const [microphone, setMicrophone] = useState(config_key.microphone);
    const [camera, setCamera] = useState(config_key.camera);
    const [shareScreen, setShareScreen] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [viewType, setViewType] = useState('portrait');
    const [beauty, setBeauty] = useState(false);

    return (
        <View style={style}>
            <View style={[footerStyle.wholeContainer]}>
                <IconWithLabel
                    text={microphone ? '开启静音' : '解除静音'}
                    iconName={microphone ? 'mic' : 'mic-outline'}
                    pressEvent={() => {
                        setMicrophone(!microphone);
                    }}
                />
                <IconWithLabel
                    text={camera ? '关闭视频' : '开启视频'}
                    iconName={camera ? 'videocam' : 'videocam-outline'}
                    pressEvent={() => {
                        if (camera) {
                            closeCamera();
                        } else {
                            openCamera();
                        }
                        setCamera(!camera);
                    }}
                />
                <IconWithLabel
                    text={shareScreen ? '停止共享' : '共享屏幕'}
                    iconName={shareScreen ? 'tv' : 'tv-outline'}
                    pressEvent={() => {
                        setShareScreen(!shareScreen)
                    }}
                />
                <IconWithLabel text={'会议聊天'} iconName={'chatbubbles-outline'} pressEvent={openChatRoom}/>
                <IconWithLabel
                    text={'通用设置'}
                    iconName={settingsVisible ? 'settings':'settings-outline'}
                    pressEvent={() => {
                        setSettingsVisible(true);
                    }}
                />
                <Modal
                    animationType={'fade'}
                    visible={settingsVisible}
                    transparent={true}
                    onRequestClose={() => {setSettingsVisible(false)}}
                >
                    <View style={{flex: 1, justifyContent: 'flex-end'}}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => {setSettingsVisible(false);}}/>
                        <View style={menuStyle.container}>
                            <IconWithLabel
                                iconName={viewType === 'grid' ? 'tablet-portrait' : 'grid'}
                                color={'black'}
                                text={viewType === 'grid' ? '人像视图' : '网格视图'}
                                pressEvent={() => {
                                    if (viewType === 'grid') {
                                        setView('portrait');
                                        setViewType('portrait');
                                    }
                                    else if (viewType === 'portrait') {
                                        setView('grid');
                                        setViewType('grid');
                                    }
                                }}
                            />
                            <IconWithLabel
                                iconName={beauty ? 'color-wand' : 'color-wand-outline'}
                                color={'black'}
                                text={beauty ? '关闭美颜' : '开启美颜'}
                                pressEvent={() => {
                                    setBeauty(!beauty);
                                }}
                            />
                            <IconWithLabel iconName={'image'} color={'black'} text={'虚拟背景'} />
                            <IconWithLabel iconName={'swap-horizontal'} color={'black'} text={'切换相机'} pressEvent={swapCam}/>
                            <IconWithLabel iconName={'settings'} color={'black'} text={'关闭设置'} pressEvent={() => {
                                setSettingsVisible(false);
                            }}/>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    )
}

const Header = ({style, roomInf, exit}) => {
    const headerStyle = StyleSheet.create({
        wholeContainer: {
            flex: 1,
            flexDirection: 'row',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 15,
            paddingBottom: 15,
        },
        headerIconContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        titleContainer: {
            flex: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: 18,
            color: config.qGreen,
        },
        exitButton: {
            flex: 1,
            backgroundColor: '#e00000',
            borderRadius: 10,
            padding: 3,
            alignItems: 'center',
            justifyContent: 'center',
        },
        exitText: {
            color: 'white',
        }
    })

    const infStyle = StyleSheet.create({
        infContainer: {
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: 10,
            alignItems: 'center',
            marginLeft: 30,
            marginRight: 30,
        },
        infText: {
            margin: 5,
        }
    })

    const [showInf, setShowInf] = useState(false);

    return (
        <View style={style}>
            <View style={headerStyle.wholeContainer}>
                <TouchableOpacity style={headerStyle.headerIconContainer} onPress={() => {setShowInf(true)}}>
                    <Ionicons name={'information-circle-outline'} size={20} color={'#cccccc'}/>
                </TouchableOpacity>
                <View style={headerStyle.titleContainer}>
                    <Text style={headerStyle.title}>MyMeeting</Text>
                </View>
                <TouchableHighlight style={headerStyle.exitButton} onPress={exit}>
                    <Text style={headerStyle.exitText}>离开</Text>
                </TouchableHighlight>
                <Modal
                    animationType={'slide'}
                    visible={showInf}
                    transparent={true}
                    onRequestClose={() => {setShowInf(false)}}
                >
                    <View style={{flex: 1,}}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => {setShowInf(false)}}/>
                        <View style={infStyle.infContainer}>
                            <Text style={infStyle.infText}>会议主题：</Text>
                            <Text style={infStyle.infText}>会议号：</Text>
                            <Text style={infStyle.infText}>会议时间：</Text>
                        </View>
                        <TouchableOpacity style={{flex: 1}} onPress={() => {setShowInf(false)}}/>
                    </View>
                </Modal>
            </View>
        </View>
    )
}
