import * as React from 'react';
import {View} from "react-native";
import {UserLabel} from "./UserLabel";
import {RTCView} from "react-native-webrtc";
import {DefaultPic, DefaultWithAudioPic} from "./DefaultPic";
import {MeetingVariable} from "../MeetingVariable";
import {config_key} from "../Constants";

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

export const GridMyWindow = ({mirror, style, myStream}) => {
    if (myStream) {
        return (
            <View>
                <UserLabel text={MeetingVariable.myName}/>
                <RTCView
                    zOrder={0}
                    mirror={mirror}
                    style={style}
                    streamURL={myStream.toURL()}
                />
            </View>
        )
    } else {
        return (
            <View>
                <UserLabel text={MeetingVariable.myName}/>

            </View>
        )
    }
}

export const GridPeerWindow = ({item}) => {
    return (
        <View>
            <UserLabel text={index === 0 ? MeetingVariable.myName : item.getPeerInfo().displayName}/>
            <RTCView
                zOrder={0}
                mirror={index === 0 && myFrontCam && !shareScreen}
                style={gridStyle.rtcView}
                streamURL={index === 0 ? (myStream ? item.toURL() : null) : (new MediaStream(item.getTracks())).toURL()}
            />
        </View>
    )
}
