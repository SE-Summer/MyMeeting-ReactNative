import axios from "axios";

export const validateEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const instance = axios.create({
    baseURL: 'https://some-domain.com/api/',
    timeout: 1000,
});

export const postRequest = async (url, data) => {
    try {
        return await instance.post(url, data);
    } catch (e) {
        return null;
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
