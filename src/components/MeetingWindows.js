import * as React from 'react';
import {View} from "react-native";
import {UserLabel} from "./UserLabel";
import {RTCView} from "react-native-webrtc";
import {DefaultPic, DefaultWithAudioPic} from "./DefaultPic";
import {MeetingVariable} from "../MeetingVariable";

export const PeerWindow = ({rtcViewStyle, peerToShow, zOrder}) => {
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
                            <DefaultWithAudioPic style={rtcViewStyle}/>
                            :
                            <DefaultPic style={rtcViewStyle}/>
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
                            <DefaultWithAudioPic style={rtcViewStyle}/>
                            :
                            <DefaultPic style={rtcViewStyle}/>
                    )

            }
        </View>
    )
}
