import * as React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const styles = StyleSheet.create({
    container:{
        alignItems: 'center',
        justifyContent: 'center'
    },
    fontStyle: {
        color: 'white',
        fontSize: 10,
    }
})

export const IconWithLabel = ({text, iconName, pressEvent}) => {
    return(
        <TouchableOpacity onPress={pressEvent}>
            <View style={styles.container}>
                <Ionicons name={iconName} color={'white'} size={25}/>
                <Text style={styles.fontStyle}>{text}</Text>
            </View>
        </TouchableOpacity>
    )
}
