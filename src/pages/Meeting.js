import {
    TouchableOpacity,
    View,
    StyleSheet,
    Text,
    TouchableHighlight,
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
import moment from "moment";
import GestureRecognizer from 'react-native-swipe-gestures';
import {MyStreamWindow, PeerWindow} from "../components/MeetingWindows";
import {UserLabel} from "../components/UserLabel";

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
        this.mediaService = new MediaService(this.updatePeerDetails.bind(this), this.recvMessagae.bind(this));
        this.state = {
            view: 'portrait',
            peerDetails: null,
            portraitIndex: 0,
            myCameraStream: null,
            myDisplayStream: null,
            myMicrophoneStream: null,
            width: 300,
            height: 600,
        };
    }

    backAction = () => {
        Alert.alert(
            "是否要退出会议",
            null,
            [
                {
                    text: "确定",
                    onPress: () => this.exit(),
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
        const {cameraStatus, microphoneStatus} = this.props.route.params;
        this.handleBack();

        this.userName = config_key.username;
        await this.mediaService.joinMeeting(this.props.route.params.roomInf.token, config_key.token,
            this.userName, `${this.userName}'s mobile device`);

        await this.mediaStreamFactory.waitForUpdate();
        if (cameraStatus) {
            this.openCamera();
        }
        if (microphoneStatus) {
            this.openMicrophone();
        }
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
        if (this.state.myMicrophoneStream.getAudioTracks().length === 0)
            return;
        await this.mediaService.closeTrack(this.state.myMicrophoneStream.getAudioTracks()[0]);
        closeMediaStream(this.state.myMicrophoneStream);
        this.setState({
            myMicrophoneStream: null,
        });
    }

    openCamera = async () => {
        const camStream = await this.mediaStreamFactory.getCamFrontStream(this.state.width, this.state.height * 3 / 4, 30);

        if (camStream.getVideoTracks().length === 0) {
            return Promise.reject("Fail to get local camera media.");
        }

        this.setState({
            myCameraStream: camStream,
        });

        await this.mediaService.sendMediaStream(camStream);
    }

    closeCamera = async () => {
        if (this.state.myCameraStream.getVideoTracks().length === 0)
            return;
        await this.mediaService.closeTrack(this.state.myCameraStream.getVideoTracks()[0]);
        closeMediaStream(this.state.myCameraStream);
        this.setState({
            myCameraStream: null,
        });
    }

    updatePeerDetails() {
        this.setState({
            peerDetails: this.mediaService.getPeerDetails().length === 0 ? null : this.mediaService.getPeerDetails(),
        }, () => {
            console.log('[React]  state.peerDetails of Meeting updated');
            console.log(this.state.peerDetails);
        })
    }

    recvMessagae(message) {

    }

    onLayout = event => {
        let {width,height} = event.nativeEvent.layout;
        this.setState({
            width: width,
            height: height,
        })
    }

    exit = async () => {
        if (this.state.myCameraStream) {
            await this.closeCamera();
        }
        if (this.state.myMicrophoneStream) {
            await this.closeMicrophone();
        }
        if (this.mediaService) {
            await this.mediaService.leaveMeeting();
        }
        this.props.navigation.pop();
    }

    swapCam = () => {

    }

    openChatRoom = () => {

    }

    onSwipeLeft(gestureState) {
        if (this.state.peerDetails) {
            if (this.state.portraitIndex < this.state.peerDetails.length - 1) {
                this.setState({
                    portraitIndex: ++this.state.portraitIndex,
                }, )
            }
        }
    }

    onSwipeRight(gestureState) {
        if (this.state.peerDetails) {
            if (this.state.portraitIndex > 0) {
                this.setState({
                    portraitIndex: --this.state.portraitIndex,
                })
            }
        }
    }

    turnGridToPortrait = (index) => {
        this.setState({
            portraitIndex: index,
            view: 'portrait',
        })
    }

    render() {
        const {roomInf, cameraStatus, microphoneStatus} = this.props.route.params;
        const {width, height, myCameraStream} = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: '#111111', flexDirection: 'column'}}>
                <Header style={screenStyle.header} roomInf={roomInf} exit={this.backAction}/>
                <View style={{flex: 1}} onLayout={this.onLayout}>

                    <GestureRecognizer
                        onSwipeLeft={(state) => this.onSwipeLeft(state)}
                        onSwipeRight={(state) => this.onSwipeRight(state)}
                        config={{
                            velocityThreshold: 0.3,
                            directionalOffsetThreshold: 80
                        }}
                        style={{
                            flex: 1,
                            zIndex: 10,
                        }}
                    >
                        {
                            this.state.view === 'grid' ?
                                <GridView
                                    width={width}
                                    height={height}
                                    myStream={myCameraStream}
                                    peerDetails={this.state.peerDetails}
                                    turnPortrait={this.turnGridToPortrait}
                                />
                                :
                                <PortraitView
                                    width={width}
                                    height={height}
                                    myStream={myCameraStream}
                                    peerToShow={this.state.peerDetails ? this.state.peerDetails[this.state.portraitIndex] : null}
                                />
                        }
                    </GestureRecognizer>
                </View>
                <Footer
                    openCamera={this.openCamera}
                    closeCamera={this.closeCamera}
                    openMicro={this.openMicrophone}
                    closeMicro={this.closeMicrophone}
                    openChatRoom={this.openChatRoom}
                    swapCam={this.swapCam}
                    init={{camera: cameraStatus, microphone: microphoneStatus}}
                    style={screenStyle.footer}
                    view={this.state.view}
                    setView={(type) => { this.setState({ view: type, }); }}
                />
            </View>
        );
    }
}

const GridView = ({width, height, myStream, peerDetails, turnPortrait}) => {
    const gridStyle = StyleSheet.create({
        rtcView: {
            width: width / 3,
            height: height / 6,
        }
    })

    let streamData = [];
    let myS = false, peer = false;
    if (myStream) {
        streamData.push(myStream);
        myS = true;
    }
    if (peerDetails) {
        streamData.push(...peerDetails);
        peer = true
    }


    const renderItem = ({item, index}) => {
        return (
            <TouchableOpacity style={{flex: 1}} onPress={() => {
                if (myS && index === 0) {
                    turnPortrait(0);
                } else {
                    turnPortrait(index - 1);
                }
            }}>
                <UserLabel text={myS && index === 0 ? config_key.username : item.peerInfo.displayName}/>
                <RTCView
                    zOrder={0}
                    mirror={myS && index === 0}
                    style={gridStyle.rtcView}
                    streamURL={myS && index === 0 ? item.toURL() : (new MediaStream(item.getTracks())).toURL()}
                />
            </TouchableOpacity>
        )
    }

    return (
        <View style={{flex: 1}}>
            <FlatList
                data={streamData}
                renderItem={renderItem}
                numColumns={3}
                keyExtractor={((item, index) => index)}
            />
        </View>
    )
}

const PortraitView = ({width, height, peerToShow, myStream}) => {
    const portraitStyle = StyleSheet.create({
        smallWindow: {
            position: 'absolute',
            left: width * 2 / 3 - 10,
            top: height * 2 / 3 - 10,
            width: width / 3,
            height: height / 3,
        },
        bigWindow: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: width,
            height: height,
        },
    })

    const [peerBig, setPeerBig] = useState(true);

    if (peerToShow) {
        return (
            <View style={{flex: 1}}>
                {
                    peerBig ?
                        <PeerWindow rtcViewStyle={portraitStyle.bigWindow} peerToShow={peerToShow} zOrder={0}/>
                        :
                        <MyStreamWindow rtcViewStyle={portraitStyle.bigWindow} myStream={myStream} zOrder={0} />
                }
                <TouchableOpacity style={portraitStyle.smallWindow} onPress={() => {setPeerBig(!peerBig)}}>
                    {
                        peerBig ?
                            <MyStreamWindow rtcViewStyle={{width: width/3, height: height/3}} myStream={myStream} zOrder={1} />
                            :
                            <PeerWindow rtcViewStyle={{width: width/3, height: height/3}} peerToShow={peerToShow} zOrder={1}/>
                    }
                </TouchableOpacity>
            </View>
        )
    } else {
        return (
            <MyStreamWindow rtcViewStyle={portraitStyle.bigWindow} myStream={myStream} zOrder={0} />
        )
    }
}

const Footer = ({style, view, setView, swapCam, openChatRoom, openCamera, closeCamera, openMicro, closeMicro, init}) => {
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

    const [microphone, setMicrophone] = useState(init.microphone);
    const [camera, setCamera] = useState(init.camera);
    const [shareScreen, setShareScreen] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [beauty, setBeauty] = useState(false);

    return (
        <View style={style}>
            <View style={[footerStyle.wholeContainer]}>
                <IconWithLabel
                    text={microphone ? '开启静音' : '解除静音'}
                    iconName={microphone ? 'mic' : 'mic-outline'}
                    pressEvent={() => {
                        if (microphone) {
                            closeMicro();
                        } else {
                            openMicro();
                        }
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
                                iconName={view === 'grid' ? 'tablet-portrait' : 'grid'}
                                color={'black'}
                                text={view === 'grid' ? '人像视图' : '网格视图'}
                                pressEvent={() => {
                                    if (view === 'grid') {
                                        setView('portrait');
                                    }
                                    else if (view === 'portrait') {
                                        setView('grid');
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
                            <Text style={infStyle.infText}>会议主题：{roomInf.topic}</Text>
                            <Text style={infStyle.infText}>会议号：{roomInf.id}</Text>
                            <Text style={infStyle.infText}>会议时间：{moment(roomInf.start_time).format('MM-DD HH:mm')} ~ {moment(roomInf.end_time).format('MM-DD HH:mm')}</Text>
                        </View>
                        <TouchableOpacity style={{flex: 1}} onPress={() => {setShowInf(false)}}/>
                    </View>
                </Modal>
            </View>
        </View>
    )
}
