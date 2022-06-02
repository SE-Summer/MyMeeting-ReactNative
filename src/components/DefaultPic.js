import * as React from 'react';
import {Image, ImageBackground, View} from "react-native";

export const DefaultPic = ({style, imgSrc = null}) => {
    const imgScale = style.width < style.height ? style.width : style.height;
    return (
        <View style={[style, {alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717'}]}>
            {
                imgSrc == null ?
                    <Image source={require('../resources/image/greylogoTrans.png')} style={{width: imgScale / 3, height: imgScale / 3}}/>
                    :
                    <Image source={{uri: imgSrc}} style={{width: imgScale / 3, height: imgScale / 3, borderRadius: imgScale / 6}}/>
            }
        </View>
    )
}

export const MyPic = ({style, imgSrc = null}) => {
    const imgScale = style.width < style.height ? style.width : style.height;
    return (
        <View style={[style, {alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717'}]}>
            <View style={{alignItems: 'center', justifyContent: 'center', width: imgScale * 0.5, height: imgScale * 0.5, borderRadius: imgScale * 0.25, borderWidth: 4, borderColor: '#44CE55'}}>
                {
                    imgSrc == null ?
                        <Image source={require('../resources/image/greylogoTrans.png')} style={{width: imgScale / 3, height: imgScale / 3}}/>
                        :
                        <Image source={{uri: imgSrc}} style={{width: imgScale / 3, height: imgScale / 3, borderRadius: imgScale / 6}}/>
                }
            </View>
        </View>
    )
}

export const DefaultWithAudioPic = ({style, imgSrc = null}) => {
    const imgScale = style.width < style.height ? style.width : style.height;
    return (
        <View style={[style, {alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717'}]}>
            <ImageBackground source={require('../resources/image/AudioBg.png')} style={{width: imgScale * 0.9, height: imgScale * 0.9, alignItems: 'center', justifyContent: 'center'}}>
                {
                    imgSrc == null ?
                        <Image source={require('../resources/image/logoTrans.png')} style={{width: imgScale / 3, height: imgScale / 3}}/>
                        :
                        <Image source={{uri: imgSrc}} style={{width: imgScale / 3, height: imgScale / 3, borderRadius: imgScale / 6}}/>
                }
            </ImageBackground>
        </View>
    )
}
