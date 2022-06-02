import axios from "axios";
import {config, myFileType} from "../Constants";
import * as React from "react";
import {Dimensions} from "react-native";

const getWidth = Dimensions.get('window').width;
const getHeight = Dimensions.get('window').height;
export const windowWidth = getWidth < getHeight ? getWidth : getHeight;
export const windowHeight = getHeight > getWidth ? getHeight : getWidth;

export const validateEmail = (email) => {
    let re = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    return re.test(String(email).toLowerCase());
}

export const clearDupRoom = (roomArray) => {
    let hash = {};
    let array = [];
    const length = roomArray.length;
    let newLength = 0;

    for (let i = 0; i < length; i++) {
        const roomId = roomArray[i].id;
        if (hash[roomId] == null) {
            const joinTime = [roomArray[i].time];
            hash[roomId] = roomArray[i];
            hash[roomId].time = joinTime;
            newLength++;
            array.push(roomArray[i]);
        } else {
            hash[roomId].time.push(roomArray[i].time);
        }
    }

    let index = newLength - 1;
    for (let item in hash) {
        array[index--] = hash[item];
    }

    return array;
}

export const judgeFileType = (fileMIME, filename) => {
    if (fileMIME.indexOf('image') !== -1) {
        return myFileType.image;
    }

    if (filename.indexOf('.zip') !== -1) {
        return myFileType.zip;
    }

    if (fileMIME.indexOf('text/plain') !== -1) {
        return myFileType.text;
    }

    if (fileMIME.indexOf('application/pdf') !== -1) {
        return myFileType.pdf;
    }

    if (filename.indexOf('.ppt') !== -1) {
        return myFileType.ppt;
    }

    if (filename.indexOf('.doc') !== -1) {
        return myFileType.word;
    }

    if (filename.indexOf('.xls') !== -1) {
        return myFileType.excel;
    }

    if (filename.indexOf('.mp4') !== -1) {
        return myFileType.mp4;
    }
}

export const preventDoubleClick = (func, inf, interval = 500) => {
    if (!inf.isCalled) {
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
