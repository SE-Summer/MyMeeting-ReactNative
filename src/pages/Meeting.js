import {
    TouchableOpacity,
    View,
    StyleSheet,
    Text,
    TouchableHighlight,
    Modal,
    FlatList, Animated, Pressable,
} from "react-native";
import * as React from "react";
import {Component, memo, useEffect, useRef, useState} from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config, config_key} from "../Constants";
import {IconWithLabel} from "../components/IconWithLabel";
import {closeMediaStream} from "../utils/media/MediaUtils";
import moment from "moment";
import GestureRecognizer from 'react-native-swipe-gestures';
import {GridMyWindow, GridPeerWindow, MyStreamWindow, PeerWindow} from "../components/MeetingWindows";
import {preventDoubleClick, windowHeight, windowWidth} from "../utils/Utils";
import {MeetingVariable} from "../MeetingVariable";
import VIForegroundService from "@voximplant/react-native-foreground-service";
import {TextButton} from "../components/MyButton";
import {MyAlert} from "../components/MyAlert";
import CheckBox from '@react-native-community/checkbox';
import {HostMenu, ParticipantsMenu} from "../components/ParticipantsMenu";
import {PanResponderSubtitle} from "../components/PanResponderSubtitle";
import Orientation, {useOrientationChange} from "react-native-orientation-locker";
import RNSwitchAudioOutput from 'react-native-switch-audio-output';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {clearMeetingVariable} from "../service/MeetingService";

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
        position: 'absolute',
        backgroundColor: '#27272766',
        flexDirection: 'row',
        height: 60,
        left: 0,
        zIndex: 20,
    },
    footer: {
        position: 'absolute',
        height: 60,
        backgroundColor: '#27272766',
        flexDirection: 'row',
        alignSelf: 'flex-end',
        left: 0,
        zIndex: 20,
    }
})

export default class Meeting extends Component
{
    constructor(props) {
        super(props);
        MeetingVariable.mediaService.registerPeerUpdateListener('peer', this.updatePeerDetails.bind(this));
        MeetingVariable.mediaService.registerMeetingEndListener('meetingEnd', this.recvEndSignal.bind(this));
        MeetingVariable.mediaService.registerBeMutedListener('muted', this.mutedByHost.bind(this));
        this.barHeight = new Animated.Value(0);
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
            modalVisible: false,
            alertError: false,
            leaveAndClose: false,
            showSubtitle: false,
            hideHeadAndFoot: false,
            audioRoute: 'Speaker',
            subtitleContents: null,
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
        Orientation.unlockAllOrientations();
        RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);

        try {
            await MeetingVariable.mediaService.joinMeeting(this.props.route.params.roomInf.token, config_key.token, config_key.userId, // config_key.userId.toString(),
                MeetingVariable.myName, `${MeetingVariable.myName}'s mobile device`, config_key.avatarUri);

            await MeetingVariable.mediaStreamFactory.waitForUpdate();
            if (cameraStatus) {
                await this.openCamera();
            }
            if (microphoneStatus) {
                await this.openMicrophone();
            }
        } catch (e) {
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    componentWillUnmount() {
        Orientation.lockToPortrait();
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
            });

            await MeetingVariable.mediaService.sendMediaStream(micStream);
        } catch (e) {
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
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
            });
        } catch (e) {
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
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
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
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
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
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
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
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
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
        }
    }

    switchAudioRoute = () => {
        if (this.state.audioRoute === 'Speaker') {
            this.setState({
                audioRoute: 'Headphone',
            }, () => {
                RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_HEADPHONE);
            })
        } else {
            this.setState({
                audioRoute: 'Speaker',
            }, () => {
                RNSwitchAudioOutput.selectAudioOutput(RNSwitchAudioOutput.AUDIO_SPEAKER);
            })
        }
    }

    updatePeerDetails() {
        MeetingVariable.hostId = MeetingVariable.mediaService.getHostPeerId();
        const newLength = MeetingVariable.mediaService.getPeerDetails().length;
        const newPortraitIndex = this.state.portraitIndex >= newLength ? 0 : this.state.portraitIndex;
        this.setState({
            peerDetails: newLength === 0 ? null : MeetingVariable.mediaService.getPeerDetails(),
            portraitIndex: newPortraitIndex,
        }, () => {
            this.forceUpdate();
            console.log('[React]  state.peerDetails of Meeting updated : ' + JSON.stringify(this.state.peerDetails));
        })
    }

    async mutedByHost() {
        toast.show('房主已将您静音', {type: 'warning', duration: 1000, placement: 'top'})
        if (this.state.microStat !== 'off')
            await this.closeMicrophone();
    }

    recvEndSignal(message) {
        this.setState({
            alertError: true,
            modalVisible: true,
            error: message,
        })
    }

    openChatRoom = () => {
        this.props.navigation.navigate('MeetingChat');
    }

    openDocuments = () => {
        this.props.navigation.navigate('MeetingDocument');
    }

    getMainContainerScale = event => {
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
                //delete all listeners
                MeetingVariable.mediaService.deletePeerUpdateListener('peer');
                MeetingVariable.mediaService.deleteNewMessageListener('messagesInMeetingPage');
                MeetingVariable.mediaService.deleteMeetingEndListener('meetingEnd');
                MeetingVariable.mediaService.deleteBeMutedListener('muted');

                if (this.state.leaveAndClose) {
                    await MeetingVariable.mediaService.closeRoom();
                } else {
                    await MeetingVariable.mediaService.leaveMeeting();
                }
            }
            clearMeetingVariable();
            this.props.navigation.navigate('Tab');
        } catch (e) {
            // toast.show(e, {type: 'danger', duration: 1300, placement: 'top'});
            MeetingVariable.messages = [];
            this.props.navigation.navigate('Tab');
        }
    }

    setHideBar = (value = null) => {
        if (value == null) {
            value = !this.state.hideHeadAndFoot;
        }

        if (!value) {
            Animated.timing(this.barHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(this.barHeight, {
                toValue: -60,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }

        this.setState({
            hideHeadAndFoot: value,
        })
    }

    onSwipeLeft() {
        if (this.state.view === 'portrait' && this.state.peerDetails) {
            if (this.state.portraitIndex < this.state.peerDetails.length - 1) {
                const oldIndex = this.state.portraitIndex;
                this.state.peerDetails[oldIndex + 1].subscribe();
                this.setState({
                    portraitIndex: oldIndex + 1,
                }, () => {
                    this.state.peerDetails[oldIndex].unsubscribeVideo();
                })
            }
        }
    }

    onSwipeRight() {
        if (this.state.view === 'portrait' && this.state.peerDetails) {
            if (this.state.portraitIndex > 0) {
                const oldIndex = this.state.portraitIndex;
                this.state.peerDetails[oldIndex - 1].subscribe();
                this.setState({
                    portraitIndex: oldIndex - 1,
                }, () => {
                    this.state.peerDetails[oldIndex].unsubscribeVideo();
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
            camStat, microStat, frontCam, peerDetails, portraitIndex,
            shareScreen, alertError, leaveAndClose,
            showSubtitle, audioRoute} = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: '#111111', flexDirection: 'column'}}>
                <MyAlert
                    title={alertError ? '已退出会议' : '是否要退出会议？'}
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
                        alertError || MeetingVariable.hostId !== config_key.userId ? null
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
                <Animated.View style={[screenStyle.header, {top: this.barHeight, width: width}]}>
                    <Header roomInf={roomInf} exit={this.backAction}/>
                </Animated.View>
                <View style={{flex: 1}} onLayout={this.getMainContainerScale}>
                    {
                        showSubtitle &&
                            <Subtitle maxHeight={height / 2} maxWidth={width * 0.7}/>
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
                                    myStream={shareScreen ? myDisplayStream : myCameraStream}
                                    myFrontCam={frontCam}
                                    shareScreen={shareScreen}
                                    peerDetails={this.state.peerDetails}
                                    turnPortrait={this.turnGridToPortrait}
                                    setHideBar={this.setHideBar}
                                />
                                :
                                <PortraitView
                                    width={width}
                                    height={height}
                                    myStream={shareScreen ? myDisplayStream : myCameraStream}
                                    myFrontCam={frontCam}
                                    shareScreen={shareScreen}
                                    peerToShow={peerDetails ? peerDetails[portraitIndex] : null}
                                    peerAudio={peerDetails ? peerDetails[portraitIndex].hasAudio() : false}
                                    peerVideo={peerDetails ? peerDetails[portraitIndex].hasVideo() : false}
                                    setHideBar={this.setHideBar}
                                />
                        }
                    </GestureRecognizer>
                </View>
                <Animated.View style={[screenStyle.footer, {bottom: this.barHeight, width: width}]}>
                    <Footer
                        openCamera={this.openCamera}
                        closeCamera={this.closeCamera}
                        openMicro={this.openMicrophone}
                        closeMicro={this.closeMicrophone}
                        openScreenShare={this.openScreenShare}
                        closeScreenShare={this.closeScreenShare}
                        openChatRoom={this.openChatRoom}
                        openDocuments={this.openDocuments}
                        frontCam={frontCam}
                        shareScreen={shareScreen}
                        swapCam={this.swapCam}
                        microStat={microStat}
                        camStat={camStat}
                        view={this.state.view}
                        setView={(type) => { this.setState({ view: type, }); }}
                        showSubtitle={showSubtitle}
                        setShowSubtitle={(value) => {this.setState({showSubtitle: value})}}
                        audioStatus={audioRoute}
                        switchAudioRoute={this.switchAudioRoute}
                    />
                </Animated.View>
            </View>
        );
    }
}

const GridView = memo(function ({myStream, peerDetails, turnPortrait, myFrontCam, shareScreen, setHideBar}) {
    const [gridWidth, setGridWidth] = useState(windowWidth / 3);
    const [gridHeight, setGridHeight] = useState(windowWidth * 4 / 9);
    const [column, setColumn] = useState(3);

    useOrientationChange((orientation) => {
        switch (orientation) {
            case 'LANDSCAPE-RIGHT': case 'LANDSCAPE-LEFT': setGridWidth(windowHeight / 5); setGridHeight(windowWidth / 3); setColumn(5); setHideBar(true); break;
            default: setGridWidth(windowWidth / 3 ); setGridHeight(windowWidth * 4 / 9); setColumn(3); break;
        }
    });

    const gridStyle = StyleSheet.create({
        rtcView: {
            width: gridWidth,
            height: gridHeight,
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
        if (index === 0) {
            return (
                <GridMyWindow
                    mirror={myFrontCam && !shareScreen}
                    rtcViewStyle={gridStyle.rtcView}
                    myStream={myStream}
                    pressEvent={() => {turnPortrait(0)}}
                />
            )
        } else {
            return (
                <GridPeerWindow
                    rtcViewStyle={gridStyle.rtcView}
                    peerToShow={item}
                    peerAudio={item.hasAudio()}
                    peerVideo={item.hasVideo()}
                    trackUrl={new MediaStream(item.getTracks()).toURL()}
                    pressEvent={() => {turnPortrait(index-1)}}
                />
            )
        }
    }

    return (
        <Pressable style={{flex: 1}} onPress={() => {setHideBar();}}>
            <FlatList
                data={streamData}
                renderItem={renderItem}
                numColumns={column}
                key={column === 3 ? 'v' : 'h'}
                keyExtractor={((item, index) => index)}
            />
        </Pressable>
    )
})

const PortraitView = memo(function ({width, height, peerToShow, myStream, myFrontCam, shareScreen, setHideBar, peerAudio, peerVideo}) {
    const [smallWindowWidth, setSmallWidth] = useState(windowWidth / 3);
    const [smallWindowHeight, setSmallHeight]= useState(windowWidth * 4 / 9);

    const changeScaleDueToOrientation = (orientation) => {
        switch (orientation) {
            case 'LANDSCAPE-RIGHT': case 'LANDSCAPE-LEFT': setSmallHeight(windowHeight * 4 / 15); setSmallWidth(windowHeight / 5); break;
            default: setSmallHeight(windowWidth * 4 / 9); setSmallWidth(windowWidth / 3); break;
        }
    }

    Orientation.getOrientation((orientation => changeScaleDueToOrientation(orientation)));

    useOrientationChange(orientation => changeScaleDueToOrientation(orientation));

    const portraitStyle = StyleSheet.create({
        smallWindow: {
            position: 'absolute',
            bottom: 80,
            right: 20,
            width: smallWindowWidth,
            height: smallWindowHeight,
            borderWidth: 1,
        },
        bigWindow: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: width - 3,
            height: height - 3,
        },
        cancelButton: {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 15,
        },
        showButton: {
            position: 'absolute',
            bottom: 60 + smallWindowHeight / 2,
            right: 0,
            width: 20,
            height: 40,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            alignItems: 'center',
            justifyContent: 'center'
        }
    })

    const [showSmall, setShowSmall] = useState('show');
    const [peerBig, setPeerBig] = useState(true);
    const animateWidth = useRef(new Animated.Value(smallWindowWidth)).current;
    const animateHeight = useRef(new Animated.Value(smallWindowHeight)).current;
    const animateBottom =  useRef(new Animated.Value(80)).current;
    const animateRight = useRef(new Animated.Value(20)).current;

    useEffect( () => {
        if (showSmall === 'toShow') {
            showSmallWindow();
        } else if (showSmall === 'toHide') {
            hideSmallWindow();
        }
    }, [showSmall])

    const showSmallWindow = () => {
        Animated.sequence(
            [
                Animated.parallel(
                    [
                        Animated.timing(animateWidth, {
                            toValue: smallWindowWidth,
                            useNativeDriver: false,
                            duration: 200,
                        }),
                        Animated.timing(animateRight,{
                            toValue: 20,
                            useNativeDriver: false,
                            duration: 200,
                        })
                    ]
                ),
                Animated.parallel(
                    [
                        Animated.timing(animateHeight, {
                            toValue: smallWindowHeight,
                            useNativeDriver: false,
                            duration: 200,
                        }),
                        Animated.timing(animateBottom, {
                            toValue: 80,
                            useNativeDriver: false,
                            duration: 200
                        })
                    ]
                ),
            ]
        ).start(() => {setShowSmall('show')});
    }

    const hideSmallWindow = () => {
        Animated.sequence(
            [
                Animated.parallel(
                    [
                        Animated.timing(animateHeight, {
                            toValue: 0,
                            useNativeDriver: false,
                            duration: 200,
                        }),
                        Animated.timing(animateBottom, {
                            toValue: 60 + smallWindowHeight / 2,
                            useNativeDriver: false,
                            duration: 200
                        })
                    ]
                ),
                Animated.parallel(
                    [
                        Animated.timing(animateWidth, {
                            toValue: 0,
                            useNativeDriver: false,
                            duration: 200,
                        }),
                        Animated.timing(animateRight,{
                            toValue: 0,
                            useNativeDriver: false,
                            duration: 200,
                        })
                    ]
                )
            ]
        ).start(() => {setShowSmall('hide')});
    }

    if (peerToShow) {
        const smallMic = !peerBig && peerAudio;
        const trackUrl = new MediaStream(peerToShow.getTracks()).toURL();

        return (
            <View style={{flex: 1}}>
                <Pressable style={{flex: 1}} onPress={() => {setHideBar();}}>
                    {
                        peerBig ?
                            <PeerWindow
                                peerToShow={peerToShow}
                                rtcViewStyle={portraitStyle.bigWindow}
                                peerInfo={peerToShow.getPeerInfo()}
                                trackUrl={trackUrl}
                                peerVideo={peerVideo}
                                peerAudio={peerAudio}
                                zOrder={0}
                            />
                            :
                            <MyStreamWindow
                                rtcViewStyle={portraitStyle.bigWindow}
                                myStream={myStream}
                                zOrder={0}
                                frontCam={myFrontCam}
                                shareScreen={shareScreen}
                            />
                    }
                </Pressable>
                {
                    showSmall === 'show' ?
                        <Pressable
                            style={[portraitStyle.smallWindow,
                                {
                                    borderColor: peerBig ? 'white' : (smallMic  ? '#44CE55' : '#f1f3f5')
                                }]}
                            onPress={() => {
                                setPeerBig(!peerBig);
                            }}
                        >
                            <View style={{flex: 1}}>
                                <Pressable style={portraitStyle.cancelButton} onPress={() => {setShowSmall('toHide');}}>
                                    <Ionicons name={'close-circle-outline'} color={'white'} size={20}/>
                                </Pressable>
                                {
                                    peerBig ?
                                        <MyStreamWindow
                                            rtcViewStyle={{width: smallWindowWidth - 3, height: smallWindowHeight - 3, backgroundColor: 'black'}}
                                            myStream={myStream}
                                            zOrder={1}
                                            frontCam={myFrontCam}
                                            shareScreen={shareScreen}
                                        />
                                        :
                                        <PeerWindow
                                            rtcViewStyle={{width: smallWindowWidth - 3, height: smallWindowHeight - 3, backgroundColor: 'black'}}
                                            peerToShow={peerToShow}
                                            peerInfo={peerToShow.getPeerInfo()}
                                            trackUrl={trackUrl}
                                            peerAudio={peerAudio}
                                            peerVideo={peerVideo}
                                            zOrder={1}
                                        />
                                }
                            </View>
                        </Pressable>
                        :
                        (
                            showSmall === 'hide' ?
                                <TouchableOpacity
                                    style={[portraitStyle.showButton, {
                                        backgroundColor: peerBig ? 'white' : (smallMic  ? '#44CE55' : '#f1f3f5')
                                    }]}
                                    onPress={() => {setShowSmall('toShow');}}
                                >
                                    <FontAwesome5 name={'window-maximize'} color={smallMic ? 'white' : 'black'} size={15} style={{transform: [{ rotate: "270deg" }]}}/>
                                </TouchableOpacity>
                            :
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        width: animateWidth,
                                        height: animateHeight,
                                        backgroundColor: 'black',
                                        bottom: animateBottom,
                                        right: animateRight,
                                        borderWidth: 1,
                                        borderColor: '#f1f3f5'
                                    }}
                                />
                        )
                }
            </View>
        )
    } else {
        return (
            <Pressable style={{flex: 1}} onPress={() => {setHideBar();}}>
                <MyStreamWindow
                    rtcViewStyle={portraitStyle.bigWindow}
                    myStream={myStream}
                    zOrder={0}
                    frontCam={myFrontCam}
                    shareScreen={shareScreen}
                />
            </Pressable>
        )
    }
})

const Footer = ({view, setView, swapCam, openChatRoom, shareScreen,
                    openCamera, openDocuments, closeCamera, openMicro, closeMicro, frontCam,
                    camStat, microStat, openScreenShare , closeScreenShare,
                    showSubtitle, setShowSubtitle, audioStatus, switchAudioRoute}) => {
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
            height: 60,
        },
        progress: {
            margin: 5,
        },
        outerContainer: {
            flexDirection: 'column',
        }
    })

    const [settingsVisible, setSettingsVisible] = useState(false);
    const [participantsVisible, setParticipantsVisible] = useState(false);
    const [hostVisible, setHostVisible] = useState(false);
    const [orientationLock, setOrientationLock] = useState(false);
    const [newMessage, setNewMessage] = useState(false);

    useEffect(() =>{
        MeetingVariable.mediaService.registerNewMessageListener('messagesInMeetingPage', recvNewMessage);
    }, [])

    const recvNewMessage = (message) => {
        message.peerInfo = MeetingVariable.mediaService.getPeerDetailByPeerId(message.fromPeerId).getPeerInfo();
        message.fromMyself = false;
        MeetingVariable.messages.push(message);
        setNewMessage(true);
    }

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

    return (
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
                pressEvent={() => {
                    setNewMessage(false);
                    openChatRoom();
                }}
                color={newMessage ? '#9be3b1': 'white'}
            />
            <IconWithLabel
                text={'更多选项'}
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
                animationType={'slide'}
                visible={hostVisible}
                transparent={true}
                onRequestClose={() => {setHostVisible(false)}}
            >
                <View style={{flex: 1}}>
                    <TouchableOpacity style={{flex: 1}} onPress={() => {setHostVisible(false)}}/>
                    <HostMenu />
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
                    <View style={menuStyle.outerContainer}>
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
                            {
                                MeetingVariable.hostId === config_key.userId &&
                                <IconWithLabel
                                    iconName={'build'}
                                    color={'black'}
                                    text={'管理成员'}
                                    pressEvent={() => {setHostVisible(true);}}
                                />
                            }
                            <IconWithLabel
                                text={'参会人员'}
                                iconName={'people'}
                                pressEvent={() => {setParticipantsVisible(true);}}
                                color={'black'}
                            />
                            <IconWithLabel
                                text={audioStatus === 'Speaker' ? '扬声器开' : '扬声器关'}
                                color={'black'}
                                iconName={audioStatus === 'Speaker' ? 'volume-high' : 'volume-mute'}
                                pressEvent={switchAudioRoute}
                            />
                        </View>
                        <View style={[menuStyle.container]}>
                            <IconWithLabel
                                iconName={'text'}
                                color={'black'}
                                text={showSubtitle ? '关闭字幕' : '开启字幕'}
                                pressEvent={() => {setShowSubtitle(!showSubtitle);}}
                            />
                            <IconWithLabel
                                iconName={'document-text'}
                                color={'black'}
                                text={'会议纪要'}
                                pressEvent={() => {setSettingsVisible(false); openDocuments();}}
                            />
                            <IconWithLabel
                                iconName={frontCam ? 'camera-reverse' : 'camera-reverse-outline'}
                                color={'black'}
                                text={frontCam ? '切换后置' : '切换前置'}
                                pressEvent={swapCam}
                            />
                            <IconWithLabel
                                text={orientationLock ? '自动旋转' : '禁用旋转'}
                                color={'black'}
                                iconName={orientationLock ? 'sync-circle-outline' : 'sync-circle'}
                                pressEvent={() => {
                                    if (orientationLock) {
                                        Orientation.unlockAllOrientations();
                                    } else {
                                        Orientation.getOrientation((orientation => {
                                            switch (orientation) {
                                                case 'LANDSCAPE-LEFT': Orientation.lockToLandscapeLeft(); break;
                                                case 'LANDSCAPE-RIGHT': Orientation.lockToLandscapeRight(); break;
                                                default: Orientation.lockToPortrait(); break;
                                            }
                                        }))
                                    }
                                    setOrientationLock(!orientationLock);
                                }}
                            />
                            <IconWithLabel iconName={'settings'} color={'black'} text={'关闭设置'} pressEvent={() => {
                                setSettingsVisible(false);
                            }}/>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const Header = ({roomInf, exit}) => {
    const headerStyle = StyleSheet.create({
        wholeContainer: {
            flex: 1,
            flexDirection: 'row',
        },
        headerIconContainer: {
            flex: 2,
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
        buttonContainer: {
            flex: 2,
            justifyContent: 'center',
            alignItems: 'center',
        },
        exitButton: {
            backgroundColor: '#e00000',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 9,
            paddingRight: 9,
        },
        exitText: {
            color: 'white',
        },
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
        <View style={headerStyle.wholeContainer}>
            <TouchableOpacity style={headerStyle.headerIconContainer} onPress={() => {setShowInf(true)}}>
                <Ionicons name={'information-circle-outline'} size={20} color={'#cccccc'}/>
            </TouchableOpacity>
            <View style={headerStyle.titleContainer}>
                <Text style={headerStyle.title}>MyMeeting</Text>
            </View>
            <View style={headerStyle.buttonContainer}>
                <TouchableHighlight style={headerStyle.exitButton} onPress={exit}>
                    <Text style={headerStyle.exitText}>离开</Text>
                </TouchableHighlight>
            </View>
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
    )
}

const Subtitle = ({maxWidth, maxHeight}) => {
    const [contents, setContents] = useState(null);

    useEffect(() => {
        MeetingVariable.speechRecognition.registerSpeechListener('speech', updateSubtitle);
        return () => {
            MeetingVariable.speechRecognition.deleteSpeechListener('speech');
        }
    }, [])

    const updateSubtitle = (string) => {
        setContents(string);
    }

    return (
        <PanResponderSubtitle maxWidth={maxWidth} maxHeight={maxHeight} text={contents}/>
    )
}
