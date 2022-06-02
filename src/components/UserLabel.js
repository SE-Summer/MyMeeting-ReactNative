import {Text, View} from "react-native";
import * as React from 'react';

export const UserLabel = ({text}) => {
    return (
        <View
            style={{
                borderTopRightRadius: 10 ,
                position: 'absolute',
                left: 0,
                bottom: 0,
                paddingLeft: 10,
                paddingRight:10,
                paddingTop: 1,
                paddingBottom: 1,
                backgroundColor: '#aaaaaa55',
                zIndex: 10
            }}>
            <Text style={{fontSize: 12, color: 'white'}} numberOfLines={1}>{text}</Text>
        </View>
    )
}
