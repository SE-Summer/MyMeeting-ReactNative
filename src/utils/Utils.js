import axios from "axios";

export const validateEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const instance = axios.create({
    baseURL: 'http://192.168.0.101:4446',
    timeout: 1000,
});

export const postRequest = async (url, data) => {
    try {
        return await instance.post(url, data);
    } catch (e) {
        console.log(e.response)
        return e.response;
    }
}

export const getRequest = async (url, params) => {
    try {
        return await instance.get(url, {
            params: params
        });
    } catch (e) {
        return null;
    }
}
