import * as React from 'react';
import {View} from "react-native";
import {UserLabel} from "./UserLabel";
import {RTCView} from "react-native-webrtc";
import {DefaultPic} from "./DefaultPic";
import {config_key} from "../utils/Constants";

export const PeerWindow = ({rtcViewStyle, peerToShow, zOrder}) => {
    return (
        <View style={{flex: 1}}>
            <UserLabel text={peerToShow.peerInfo.displayName}/>
            {
                peerToShow.hasVideo() ?
                    <RTCView
                        zOrder={zOrder}
                        style={rtcViewStyle}
                        streamURL={(new MediaStream(peerToShow.getTracks())).toURL()}
                    /> :
                    <DefaultPic style={rtcViewStyle}/>
            }
        </View>
    )
}

export const MyStreamWindow = ({rtcViewStyle, myStream, zOrder}) => {
    return (
        <View style={{flex: 1}}>
            <UserLabel text={config_key.username} />
            {
                myStream ?
                    <RTCView
                        mirror={true}
                        zOrder={zOrder}
                        style={rtcViewStyle}
                        streamURL={myStream.toURL()}
                    /> :
                    <DefaultPic style={rtcViewStyle}/>
            }
        </View>
    )
}
