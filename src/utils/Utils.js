import axios from "axios";
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
    // const opts = {
    //     method: "POST",
    //     body: JSON.stringify(data),
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // };
    // try {
    //     const response = await fetch(url, opts);
    //     return response.json();
    // } catch (err) {
    //     logger(err);
    //     return null;
    // }

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
