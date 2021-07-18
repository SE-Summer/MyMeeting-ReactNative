import AsyncStorage from '@react-native-async-storage/async-storage';
import {ToastAndroid} from "react-native";

const getFromStorage = async (name) => {
    try {
        const value = await AsyncStorage.getItem(name);
        return value;
    } catch(e) {
        ToastAndroid.showWithGravityAndOffset(
            "Get storage error",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            0,
            300,
        )
    }
}

const setInStorage = async (name, value) => {
    try {
        await AsyncStorage.setItem(name, value);
    } catch (e) {
        ToastAndroid.showWithGravityAndOffset(
            "Set storage error",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            0,
            300,
        )
    }
}

