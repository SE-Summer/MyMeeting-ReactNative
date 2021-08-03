import * as React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const styles = StyleSheet.create({
    container:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    fontStyle: {
        fontSize: 10,
    }
})

export const IconWithLabel = ({text, iconName, pressEvent, color = 'white'}) => {
    return(
        <TouchableOpacity onPress={pressEvent}>
            <View style={styles.container}>
                <Ionicons name={iconName} color={color} size={25}/>
                <Text style={[styles.fontStyle, {color: color}]}>{text}</Text>
            </View>
        </TouchableOpacity>
    )
}
