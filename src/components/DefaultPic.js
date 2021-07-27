import * as React from 'react';
import {Image, View} from "react-native";

export const DefaultPic = ({style}) => {
    const imgScale = style.width < style.height ? style.width : style.height;
    return (
        <View style={[style, {alignItems: 'center', justifyContent: 'center', backgroundColor: '#171717', borderWidth: 1, borderColor: '#f1f3f5'}]}>
            <Image source={require('../../assets/image/greylogoTrans.png')} style={{width: imgScale / 3, height: imgScale / 3}}/>
        </View>
    )
}
