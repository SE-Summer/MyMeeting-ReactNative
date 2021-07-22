import axios from "axios";
import {ToastAndroid} from "react-native";
import {config} from "./Constants";

export const validateEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const instance = axios.create({
    baseURL: config.baseURL,
    timeout: 1000,
});

export const postRequest = async (url, data) => {
    try {
        return await instance.post(url, data);
    } catch (e) {
        if (e.response)
            return e.response;
        else {
            console.log(e)
            ToastAndroid.show('Network Error', 1000);
            return null;
        }
    }
}

export const postFormData = async (url, data, config) => {
    try {
        return await instance.post(url, data, config);
    } catch (e) {
        if (e.response)
            return e.response;
        else {
            console.log(e)
            ToastAndroid.show('Network Error', 1000);
            return null;
        }
    }
}

export const getRequest = async (url) => {
    try {
        return await instance.get(url);
    } catch (e) {
        if (e.response)
            return e.response;
        else {
            console.log(e)
            ToastAndroid.show('Network Error', 1000);
            return null;
        }
    }
}
