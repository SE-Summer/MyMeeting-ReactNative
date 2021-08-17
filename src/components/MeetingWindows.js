import * as React from 'react';
import {TouchableHighlight, TouchableOpacity, View} from "react-native";
import {UserLabel} from "./UserLabel";
import {RTCView} from "react-native-webrtc";
import {DefaultPic, DefaultWithAudioPic} from "./DefaultPic";
import {MeetingVariable} from "../MeetingVariable";
import {config_key} from "../Constants";
import {useEffect} from "react";

export const PeerWindow = ({rtcViewStyle, peerToShow, zOrder}) => {
    useEffect(() => {
        peerToShow.subscribe();
        return () => {
            peerToShow.unsubscribeVideo();
        }
    }, [])

    return (
        <View style={{flex: 1, borderWidth: 1, borderColor: peerToShow.hasAudio() ? '#44CE55' : '#f1f3f5'}}>
            <UserLabel text={peerToShow.getPeerInfo().displayName}/>
            {
                peerToShow.hasVideo() ?
                    <RTCView
                        zOrder={zOrder}
                        style={[rtcViewStyle]}
                        streamURL={(new MediaStream(peerToShow.getTracks())).toURL()}
                    />
                     :
                    (
                        peerToShow.hasAudio() ?
                            <DefaultWithAudioPic style={rtcViewStyle} imgSrc={peerToShow.getPeerInfo().avatar}/>
                            :
                            <DefaultPic style={rtcViewStyle} imgSrc={peerToShow.getPeerInfo().avatar}/>
                    )
            }
        </View>
    )
}

export const MyStreamWindow = ({rtcViewStyle, myStream, zOrder, microStat, frontCam, shareScreen}) => {
    return (
        <View style={{flex: 1, borderWidth: 1, borderColor: microStat === 'on' ? '#44CE55' : '#f1f3f5'}}>
            <UserLabel text={MeetingVariable.myName} />
            {
                myStream ?
                    <RTCView
                        mirror={frontCam && !shareScreen}
                        zOrder={zOrder}
                        style={rtcViewStyle}
                        streamURL={myStream.toURL()}
                    /> :
                    (
                        microStat === 'on' ?
                            <DefaultWithAudioPic style={rtcViewStyle} imgSrc={config_key.avatarUri}/>
                            :
                            <DefaultPic style={rtcViewStyle} imgSrc={config_key.avatarUri}/>
                    )

            }
        </View>
    )
}

export const GridMyWindow = ({mirror, rtcViewStyle, myStream, microStat, pressEvent}) => {
    return (
        <TouchableHighlight
            style={{
                borderWidth: 1,
                borderColor: (microStat === 'on' ? '#44CE55' : '#f1f3f5')
            }}
            onPress={pressEvent}
        >
            <View>
                <UserLabel text={MeetingVariable.myName}/>
                {
                    myStream ?
                        <RTCView
                            zOrder={0}
                            mirror={mirror}
                            style={rtcViewStyle}
                            streamURL={myStream.toURL()}
                        />
                        :
                        microStat === 'on' ?
                            <DefaultWithAudioPic style={rtcViewStyle} imgSrc={config_key.avatarUri}/>
                            :
                            <DefaultPic style={rtcViewStyle} imgSrc={config_key.avatarUri}/>
                }
            </View>

        </TouchableHighlight>
    )
}

export const GridPeerWindow = ({rtcViewStyle, peerToShow, pressEvent}) => {
    useEffect(() => {
        peerToShow.subscribe();
        return () => {
            peerToShow.unsubscribeVideo();
        }
    }, [])

    const peerInfo = peerToShow.getPeerInfo();
    return (
        <TouchableOpacity
            style={{
                borderWidth: 1,
                borderColor: (peerToShow.hasAudio() ? '#44CE55' : '#f1f3f5'),
            }}
            onPress={pressEvent}
        >
            <View>
                <UserLabel text={peerInfo.displayName}/>
                {
                    peerToShow.hasVideo() ?
                        <RTCView
                            zOrder={0}
                            mirror={false}
                            style={rtcViewStyle}
                            streamURL={new MediaStream(peerToShow.getTracks()).toURL()}
                        />
                        :
                        peerToShow.hasAudio() ?
                            <DefaultWithAudioPic style={rtcViewStyle} imgSrc={peerInfo.avatar}/>
                            :
                            <DefaultPic style={rtcViewStyle} imgSrc={peerInfo.avatar}/>
                }
            </View>
        </TouchableOpacity>
    )
}
