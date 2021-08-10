import * as React from 'react';
import {Image, View} from "react-native";

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

export const DefaultWithAudioPic = ({style, imgSrc = null}) => {
    const imgScale = style.width < style.height ? style.width : style.height;
    return (
        <View style={[style, {alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717'}]}>
            {
                imgSrc == null ?
                    <Image source={require('../resources/image/logoTrans.png')} style={{width: imgScale / 3, height: imgScale / 3}}/>
                    :
                    <Image source={{uri: imgSrc}} style={{width: imgScale / 3, height: imgScale / 3, borderRadius: imgScale / 6}}/>
            }
        </View>
    )
}
