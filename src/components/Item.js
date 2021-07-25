import {Switch, Text, TouchableOpacity, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from "react";

export const TouchableItem = ({text, pressEvent, rightComponent = null}) => {
    return (
        <TouchableOpacity onPress={pressEvent} style={{flexDirection: "row", padding: 15, alignItems: "center"}}>
            <Text style={{fontSize:16, textAlign: "left", marginLeft: 10}}>{text}</Text>
            <View style={{alignItems: 'flex-end', flex: 1}}>
                {rightComponent}
            </View>
            <View style={{alignItems: "flex-end", justifyContent: "center", paddingLeft: 20}}>
                <Ionicons name={"ios-chevron-forward"} size={23}/>
            </View>
        </TouchableOpacity>
    )
}

export const SwitchItem = ({text, status, switchEvent}) => {
    return (
        <View style={{flexDirection: "row", padding: 15}}>
            <Text style={{fontSize:16, textAlign: "left", marginLeft: 10}}>{text}</Text>
            <View style={{alignItems: "flex-end", flex: 1}}>
                <Switch
                    trackColor={{ false: "#767577", true: "green" }}
                    thumbColor={"white"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={switchEvent}
                    value={status}
                    style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                />
            </View>
        </View>
    )
}
