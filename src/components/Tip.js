import {Text, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from "react";

export const Tip = ({text, warning = false}) => {
    if (text != null) {
        if (warning) {
            return (
                <View style={{height: 20, justifyContent: "flex-start", alignItems: "center", marginLeft: 10, flexDirection: "row"}}>
                    <Ionicons name={'alert-circle-outline'} color={'orange'} size={20}/>
                    <Text style={{color: 'orange', fontSize: 12}}>{text}</Text>
                </View>
            )
        } else {
            return (
                <View style={{height: 20, justifyContent: "flex-start", alignItems: "center", marginLeft: 10, flexDirection: "row"}}>
                    <Ionicons name={'close-circle-outline'} color={'red'} size={20}/>
                    <Text style={{color: 'red', fontSize: 12}}>{text}</Text>
                </View>
            )
        }

    } else {
        return (
            <View style={{height: 20, justifyContent: "flex-start", alignItems: "center", marginLeft: 10}}>
                {/*<Ionicons name={'checkmark-circle-outline'} color={'green'} size={20}/>*/}
            </View>
        )
    }
}
