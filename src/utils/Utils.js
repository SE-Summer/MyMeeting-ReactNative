import axios from "axios";
import {config} from "../Constants";

export const validateEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const preventDoubleClick = (func, inf, interval = 500) => {
    if (!inf.isCalled) {
        console.log('called')
        inf.isCalled = true
        setTimeout(() => {
            inf.isCalled = false
        }, interval)
        return func();
    }
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
            toast.show('Network Error', {type: 'danger', duration: 1300, placement: 'top'})
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
            toast.show('Network Error', {type: 'danger', duration: 1300, placement: 'top'});
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
            toast.show('Network Error', {type: 'danger', duration: 1300, placement: 'top'});
            return null;
        }
    }
}
