import AsyncStorage from '@react-native-async-storage/async-storage';
import {ToastAndroid} from "react-native";

const getFromStorage = async (name) => {
    try {
        return await AsyncStorage.getItem(name);
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

const removeFromStorage = async (name) => {
    try {
        await AsyncStorage.removeItem(name);
    } catch (e) {
        ToastAndroid.showWithGravityAndOffset(
            "Remove storage error",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
            0,
            300,
        )
    }
}

export {removeFromStorage, getFromStorage, setInStorage};

