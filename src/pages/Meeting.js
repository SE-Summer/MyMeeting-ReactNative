import {
    TouchableOpacity,
    View,
    StyleSheet,
    Text,
    TouchableHighlight,
    Modal,
    FlatList
} from "react-native";
import * as React from "react";
import {Component, useState} from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config, config_key} from "../Constants";
import {IconWithLabel} from "../components/IconWithLabel";
import {closeMediaStream} from "../utils/media/MediaUtils";
import {RTCView} from "react-native-webrtc";
import moment from "moment";
import GestureRecognizer from 'react-native-swipe-gestures';
import {MyStreamWindow, PeerWindow} from "../components/MeetingWindows";
import {UserLabel} from "../components/UserLabel";
import {preventDoubleClick} from "../utils/Utils";
import {MeetingVariable} from "../MeetingVariable";
import VIForegroundService from "@voximplant/react-native-foreground-service";
import {TextButton} from "../components/MyButton";
import {MyAlert} from "../components/MyAlert";
import CheckBox from '@react-native-community/checkbox';
import {ParticipantsMenu} from "../components/ParticipantsMenu";
import {PanResponderSubtitle} from "../components/PanResponderSubtitle";

const microInf = {
    isCalled: false,
    timer: null,
}, camInf = {
    isCalled: false,
    timer: null
}, shareScreenInf = {
    isCalled: false,
    timer: null,
}

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
        MeetingVariable.mediaService.registerPeerUpdateListener('peer', this.updatePeerDetails.bind(this));
        MeetingVariable.mediaService.registerNewMessageListener('messagesInMeetingPage', this.recvMessage.bind(this));
        MeetingVariable.mediaService.registerMeetingEndListener('meetingEnd', this.recvEndSignal.bind(this));
        MeetingVariable.mediaService.registerBeMutedListener('muted', this.mutedByHost.bind(this));
        this.state = {
            view: 'portrait',
            peerDetails: null,
            portraitIndex: 0,
            myCameraStream: null,
            myDisplayStream: null,
            myMicrophoneStream: null,
            width: 300,
            height: 600,
            frontCam: true,
            shareScreen: false,
            microStat: 'off',
            camStat: 'off',
            newMessage: false,
            modalVisible: false,
            alertError: false,
            leaveAndClose: false,
            subtitle: false,
        };
    }

    backAction = () => {
        this.setState({
            modalVisible: true,
        })
        return true;
    }

    handleBack = () => {
        const {navigation} = this.props;
        navigation.addListener('beforeRemove', e => {
            if (e.data.action.type === 'GO_BACK') {
                e.preventDefault();
                this.backAction();
            }
        })
    }

    async componentDidMount() {
        const {cameraStatus, microphoneStatus} = this.props.route.params;
        this.handleBack();

        try {
            await MeetingVariable.mediaService.joinMeeting(this.props.route.params.roomInf.token, config_key.token, config_key.token, // config_key.userId.toString(),
                MeetingVariable.myName, `${MeetingVariable.myName}'s mobile device`, config_key.avatarUri);

            await MeetingVariable.mediaStreamFactory.waitForUpdate();
            if (cameraStatus) {
                await this.openCamera();
            }
            if (microphoneStatus) {
                await this.openMicrophone();
            }
        } catch (e) {
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    openMicrophone = async () => {
        MeetingVariable.speechRecognition.start();
        this.setState({
            microStat: 'loading',
        })
        try {
            const micStream = await MeetingVariable.mediaStreamFactory.getMicStream();

            if (micStream.getAudioTracks().length === 0) {
                return Promise.reject("Fail to get local microphone media.");
            }

            this.setState({
                myMicrophoneStream: micStream,
                microStat: 'on',
            }, () => {
                this.forceUpdate();
            });

            await MeetingVariable.mediaService.sendMediaStream(micStream);
        } catch (e) {
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    closeMicrophone = async () => {
        MeetingVariable.speechRecognition.stop();
        this.setState({
            microStat: 'loading',
        })
        try {
            if (this.state.myMicrophoneStream.getAudioTracks().length === 0)
                return;
            await MeetingVariable.mediaService.closeTrack(this.state.myMicrophoneStream.getAudioTracks()[0]);
            closeMediaStream(this.state.myMicrophoneStream);
            this.setState({
                myMicrophoneStream: null,
                microStat: 'off'
            },() => {
                this.forceUpdate();
            });
        } catch (e) {
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    openCamera = async () => {
        if (this.state.shareScreen) {
            await this.closeScreenShare();
            this.setState({
                shareScreen: false,
            })
        }

        this.setState({
            camStat: 'loading',
        })
        try {
            await this.startForegroundService('camera');
            if (this.state.frontCam) {
                await this.openFrontCamera();
            } else {
                await this.openEnvCamera();
            }
        } catch (e) {
            await VIForegroundService.stopService();
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    openFrontCamera = async () => {
        const camStream = await MeetingVariable.mediaStreamFactory.getCamFrontStream(this.state.width * 2, this.state.height * 3 / 2, 30);

        if (camStream.getVideoTracks().length === 0) {
            return Promise.reject("Fail to get local camera media.");
        }

        this.setState({
            myCameraStream: camStream,
            camStat: 'on',
        });

        await MeetingVariable.mediaService.sendMediaStream(camStream);
    }

    openEnvCamera = async () => {
        const camStream = await MeetingVariable.mediaStreamFactory.getCamEnvStream(this.state.width * 2, this.state.height * 3 / 2, 30);

        if (camStream.getVideoTracks().length === 0) {
            return Promise.reject("Fail to get local camera media.");
        }

        this.setState({
            myCameraStream: camStream,
            camStat: 'on',
        });

        await MeetingVariable.mediaService.sendMediaStream(camStream);
    }

    closeCamera = async () => {
        this.setState({
            camStat: 'loading',
        })
        try {
            await VIForegroundService.stopService();
            if (this.state.myCameraStream.getVideoTracks().length === 0)
                return;
            await MeetingVariable.mediaService.closeTrack(this.state.myCameraStream.getVideoTracks()[0]);
            closeMediaStream(this.state.myCameraStream);
            this.setState({
                myCameraStream: null,
                camStat: 'off',
            });
        } catch (e) {
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    swapCam = async () => {
        if (this.state.camStat === 'on') {
            this.setState({
                frontCam: !this.state.frontCam,
            },() => {
                this.state.myCameraStream.getTracks()[0]._switchCamera();
            })
        } else {
            this.setState({
                frontCam: !this.state.frontCam,
            })
        }
    }

    openScreenShare = async () => {
        if (this.state.camStat === 'on') {
            await this.closeCamera();
            this.setState({
                camStat: 'off',
            })
        }
        try {
            await this.startForegroundService('screen');

            const screenStream = await MeetingVariable.mediaStreamFactory.getDisplayStream(this.state.width * 2, this.state.height * 2, 30);

            if (screenStream.getVideoTracks().length === 0) {
                return Promise.reject("Fail to get local camera media.");
            }

            this.setState({
                myDisplayStream: screenStream,
                shareScreen: true,
            });

            await MeetingVariable.mediaService.sendMediaStream(screenStream);
        }  catch (e) {
            await VIForegroundService.stopService();
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    closeScreenShare = async () => {
        try {
            await VIForegroundService.stopService();
            if (this.state.myDisplayStream.getVideoTracks().length === 0)
                return;
            await MeetingVariable.mediaService.closeTrack(this.state.myDisplayStream.getVideoTracks()[0]);
            closeMediaStream(this.state.myDisplayStream);
            this.setState({
                myDisplayStream: null,
                shareScreen: false,
            });
        } catch (e) {
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    updatePeerDetails() {
        this.setState({
            peerDetails: MeetingVariable.mediaService.getPeerDetails().length === 0 ? null : MeetingVariable.mediaService.getPeerDetails(),
        }, () => {
            this.forceUpdate();
            console.log('[React]  state.peerDetails of Meeting updated : ' + JSON.stringify(this.state.peerDetails));
        })
    }

    async mutedByHost() {
        if (this.state.microStat !== 'off')
            await this.closeMicrophone();
    }

    recvMessage(message) {
        message.peerInfo = MeetingVariable.mediaService.getPeerDetailsByPeerId(message.fromPeerId).getPeerInfo();
        message.fromMyself = false;
        MeetingVariable.messages.push(message);
        this.setState({
            newMessage: true,
        })
    }

    recvEndSignal(message) {
        this.setState({
            alertError: true,
            modalVisible: true,
            error: message,
        })
    }

    openChatRoom = () => {
        this.setState({
            newMessage: false,
        })
        this.props.navigation.navigate('MeetingChat');
    }

    onLayout = event => {
        let {width,height} = event.nativeEvent.layout;
        this.setState({
            width: width,
            height: height,
        })
    }

    exit = async () => {
        try {
            if (this.state.myCameraStream) {
                await this.closeCamera();
            }
            if (this.state.myMicrophoneStream) {
                await this.closeMicrophone();
            }
            if (this.state.myDisplayStream) {
                await this.closeScreenShare();
            }
            if (MeetingVariable.mediaService) {
                if (this.state.leaveAndClose) {
                    await MeetingVariable.mediaService.closeRoom();
                } else {
                    await MeetingVariable.mediaService.leaveMeeting();
                }
            }
            MeetingVariable.messages = [];
            MeetingVariable.room = [];
            this.props.navigation.navigate('Tab');
        } catch (e) {
            toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
            MeetingVariable.messages = [];
            this.props.navigation.navigate('Tab');
        }
    }

    onSwipeLeft() {
        if (this.state.view === 'portrait' && this.state.peerDetails) {
            if (this.state.portraitIndex < this.state.peerDetails.length - 1) {
                this.setState({
                    portraitIndex: ++this.state.portraitIndex,
                }, )
            }
        }
    }

    onSwipeRight() {
        if (this.state.view === 'portrait' && this.state.peerDetails) {
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

    async startForegroundService(option) {
        const notificationConfig = {
            channelId: 'defaultChannel',
            id: 3456,
            title: '会议：' + this.props.route.params.roomInf.topic,
            text: option === 'screen' ? '正在进行屏幕共享' : '正在使用摄像头',
            icon: 'ic_launcher_round'
        };
        try {
            await VIForegroundService.startService(notificationConfig);
        } catch (e) {
            console.error(e);
        }
    }

    render() {
        const {roomInf} = this.props.route.params;
        const {width, height, myCameraStream, myDisplayStream,
            camStat, microStat, newMessage, frontCam,
            shareScreen, alertError, leaveAndClose,
            subtitle} = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: '#111111', flexDirection: 'column'}}>
                <MyAlert
                    title={alertError ? '入会失败' : '是否要退出会议？'}
                    okButton={
                        <TextButton
                            text={'确定'}
                            pressEvent={ async () => {
                                await this.exit();
                            }}
                            containerStyle={{borderColor: 'green', borderWidth: 1, borderRadius: 5}}
                            fontStyle={{fontSize: 14, color: 'green'}}
                        />
                    }
                    content={alertError ? this.state.error : null}
                    cancelButton={
                        alertError ? null
                            :
                        <TextButton
                            text={'取消'}
                            pressEvent={() => {
                                this.setState({
                                    modalVisible: false,
                                })
                            }}
                            containerStyle={{borderColor: 'green', borderWidth: 1, backgroundColor: 'green', borderRadius: 5}}
                            fontStyle={{fontSize: 14, color: 'white'}}
                        />
                    }
                    visible={this.state.modalVisible}
                    setVisible={(value) => {this.setState({modalVisible: value})}}
                    otherComponent={
                        alertError || roomInf.host !== parseInt(config_key.userId) ? null
                            :
                        <View style={{alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
                            <Text>离开并结束会议</Text>
                            <CheckBox value={leaveAndClose} tintColors={{true: 'green'}} onValueChange={(value => {this.setState({leaveAndClose: value})})}/>
                        </View>
                    }
                    backEvent={
                        alertError ?
                        async () => {
                            await this.exit();
                        } : () => {
                            this.setState({
                                modalVisible: false,
                            })
                        }
                    }
                />
                <Header style={screenStyle.header} roomInf={roomInf} exit={this.backAction}/>
                <View style={{flex: 1}} onLayout={this.onLayout}>
                    {
                        subtitle &&
                        <PanResponderSubtitle maxWidth={width} maxHeight={height}/>
                    }
                    <GestureRecognizer
                        onSwipeLeft={() => this.onSwipeLeft()}
                        onSwipeRight={() => this.onSwipeRight()}
                        config={{
                            velocityThreshold: 0.3,
                            directionalOffsetThreshold: 80
                        }}
                        style={{flex: 1, zIndex: 10,}}
                    >
                        {
                            this.state.view === 'grid' ?
                                <GridView
                                    width={width}
                                    height={height}
                                    myStream={shareScreen ? myDisplayStream : myCameraStream}
                                    myFrontCam={frontCam}
                                    shareScreen={shareScreen}
                                    peerDetails={this.state.peerDetails}
                                    turnPortrait={this.turnGridToPortrait}
                                />
                                :
                                <PortraitView
                                    width={width}
                                    height={height}
                                    myStream={shareScreen ? myDisplayStream : myCameraStream}
                                    myFrontCam={frontCam}
                                    shareScreen={shareScreen}
                                    microStat={microStat}
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
                    openScreenShare={this.openScreenShare}
                    closeScreenShare={this.closeScreenShare}
                    openChatRoom={this.openChatRoom}
                    frontCam={frontCam}
                    shareScreen={shareScreen}
                    swapCam={this.swapCam}
                    microStat={microStat}
                    camStat={camStat}
                    style={screenStyle.footer}
                    view={this.state.view}
                    newMessage={newMessage}
                    setView={(type) => { this.setState({ view: type, }); }}
                    subtitle={subtitle}
                    setSubtitle={(value) => {this.setState({subtitle: value})}}
                />
            </View>
        );
    }
}

const GridView = ({width, height, myStream, peerDetails, turnPortrait, myFrontCam, shareScreen}) => {
    const gridStyle = StyleSheet.create({
        rtcView: {
            width: width / 3,
            height: height / 6,
        }
    })

    let streamData = [];
    if (myStream) {
        streamData.push(myStream);
    } else {
        streamData.push('emptyInf of me');
    }
    if (peerDetails) {
        streamData.push(...peerDetails);
    }


    const renderItem = ({item, index}) => {
        return (
            <TouchableOpacity style={{borderWidth: 1, borderColor: '#aaaaaa'}} onPress={() => {
                if (index === 0) {
                    turnPortrait(0);
                } else {
                    turnPortrait(index - 1);
                }
            }}>
                <UserLabel text={index === 0 ? MeetingVariable.myName : item.getPeerInfo().displayName}/>
                <RTCView
                    zOrder={0}
                    mirror={index === 0 && myFrontCam && !shareScreen}
                    style={gridStyle.rtcView}
                    streamURL={index === 0 ? (myStream ? item.toURL() : null) : (new MediaStream(item.getTracks())).toURL()}
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

const PortraitView = ({width, height, peerToShow, myStream, microStat, myFrontCam, shareScreen}) => {
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
            width: width - 3,
            height: height - 3,
        },
    })

    const [peerBig, setPeerBig] = useState(true);

    if (peerToShow) {
        return (
            <View style={{flex: 1}}>
                {
                    peerBig ?
                        <PeerWindow
                            rtcViewStyle={portraitStyle.bigWindow}
                            peerToShow={peerToShow}
                            zOrder={0}
                        />
                        :
                        <MyStreamWindow
                            rtcViewStyle={portraitStyle.bigWindow}
                            myStream={myStream}
                            zOrder={0}
                            microStat={microStat}
                            frontCam={myFrontCam}
                            shareScreen={shareScreen}
                        />
                }
                <TouchableOpacity style={portraitStyle.smallWindow} onPress={() => {setPeerBig(!peerBig)}}>
                    {
                        peerBig ?
                            <MyStreamWindow
                                rtcViewStyle={{width: width/3 - 3, height: height/3 - 3, backgroundColor: 'black'}}
                                myStream={myStream}
                                zOrder={1}
                                microStat={microStat}
                                frontCam={myFrontCam}
                                shareScreen={shareScreen}
                            />
                            :
                            <PeerWindow
                                rtcViewStyle={{width: width/3 - 3, height: height/3 - 3, backgroundColor: 'black'}}
                                peerToShow={peerToShow}
                                zOrder={1}
                            />
                    }
                </TouchableOpacity>
            </View>
        )
    } else {
        return (
            <MyStreamWindow
                rtcViewStyle={portraitStyle.bigWindow}
                myStream={myStream}
                zOrder={0}
                microStat={microStat}
                frontCam={myFrontCam}
                shareScreen={shareScreen}
            />
        )
    }
}

const Footer = ({style, view, setView, swapCam, openChatRoom, shareScreen,
                    openCamera, closeCamera, openMicro, closeMicro, frontCam,
                    camStat, microStat, newMessage, openScreenShare , closeScreenShare,
                    subtitle, setSubtitle}) => {
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
        progress: {
            margin: 5,
        }
    })

    const microEvent = () => {
        if (microStat === 'loading') {
            return;
        }

        if (microStat === 'on') {
            closeMicro();
        } else {
            openMicro();
        }
    }

    const camEvent = () => {
        if (camStat === 'loading') {
            return;
        }

        if (camStat === 'on') {
            closeCamera();
        } else {
            openCamera();
        }
    }

    const shareScreenEvent = () => {
        if (shareScreen) {
            closeScreenShare();
        } else {
            openScreenShare();
        }
    }

    const [settingsVisible, setSettingsVisible] = useState(false);
    const [participantsVisible, setParticipantsVisible] = useState(false);

    return (
        <View style={style}>
            <View style={[footerStyle.wholeContainer]}>
                <IconWithLabel
                    text={microStat === 'on' ? '开启静音' : '解除静音'}
                    iconName={microStat === 'on' ? 'mic' : 'mic-outline'}
                    pressEvent={() => {preventDoubleClick(microEvent, microInf)}}
                    color={microStat === 'on' ? '#9be3b1' : 'white'}
                />
                <IconWithLabel
                    text={camStat === 'on' ? '关闭视频' : '开启视频'}
                    iconName={camStat === 'on' ? 'videocam' : 'videocam-outline'}
                    pressEvent={() => {preventDoubleClick(camEvent, camInf)}}
                    color={camStat === 'on' ? '#9be3b1' : 'white'}
                />
                <IconWithLabel
                    text={shareScreen ? '停止共享' : '共享屏幕'}
                    iconName={shareScreen ? 'tv' : 'tv-outline'}
                    pressEvent={() => {preventDoubleClick(shareScreenEvent, shareScreenInf)}}
                    color={shareScreen ? '#9be3b1' : 'white'}
                />
                <IconWithLabel
                    text={'会议聊天'}
                    iconName={newMessage ? 'chatbubbles' : 'chatbubbles-outline'}
                    pressEvent={openChatRoom}
                    color={newMessage ? '#9be3b1': 'white'}
                />
                <IconWithLabel
                    text={'通用设置'}
                    iconName={settingsVisible ? 'settings':'settings-outline'}
                    pressEvent={() => {
                        setSettingsVisible(true);
                    }}
                />
                <Modal
                    animationType={'slide'}
                    visible={participantsVisible}
                    transparent={true}
                    onRequestClose={() => {setParticipantsVisible(false)}}
                >
                    <View style={{flex: 1}}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => {setParticipantsVisible(false)}}/>
                        <ParticipantsMenu myCamStat={camStat === 'on'} myMicStat={microStat === 'on'}/>
                    </View>
                </Modal>
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
                                iconName={'text'}
                                color={'black'}
                                text={subtitle ? '关闭字幕' : '开启字幕'}
                                pressEvent={() => {setSubtitle(!subtitle);}}
                            />
                            <IconWithLabel
                                text={'参会人员'}
                                iconName={'people'}
                                pressEvent={() => {setParticipantsVisible(true);}}
                                color={'black'}
                            />
                            <IconWithLabel
                                iconName={frontCam ? 'camera-reverse' : 'camera-reverse-outline'}
                                color={'black'}
                                text={frontCam ? '切换后置' : '切换前置'}
                                pressEvent={swapCam}
                            />
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
