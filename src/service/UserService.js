import {getFromStorage, removeFromStorage, setInStorage} from "../utils/StorageUtils";
import {config, config_key} from "../utils/Constants";
import {getRequest, postFormData, postRequest} from "../utils/Utils";

export const loginService = async (email, password) => {
    const url = '/login';
    const user = {};
    user.email = email;
    user.password = password;
    const response = await postRequest(url, user);
    if (response == null) {
        return false;
    }

    if (response.status === 200) {
        const user = response.data.user;
        await setInStorage(config.usernameIndex, user.nickname);
        await setInStorage(config.emailIndex, user.email);
        await setInStorage(config.userIdIndex, JSON.stringify(user.id));
        await setInStorage(config.tokenIndex, user.token);
        config_key.username = user.nickname;
        config_key.nickname = user.nickname;
        config_key.userId = user.id;
        config_key.email = user.email;
        return true;
    } else {
        return false;
    }
}

export const autoLogin = async () => {
    const url = '/autoLogin';
    const token = await getFromStorage(config.tokenIndex);
    return await postRequest(url, {"token": token});
}

export const logout = async () => {
    await removeFromStorage(config.usernameIndex);
    await removeFromStorage(config.userIdIndex);
    await removeFromStorage(config.tokenIndex);
}

export const registerService = async (userInf) => {
    const url = '/register';
    return await postRequest(url, userInf);
}

export const emailCheck = async (email) => {
    const url = '/email';
    const data = {email: email};
    await postRequest(url, data);
}

export const verifyCode = async (email, code) => {
    const url = '/verify';
    const data = {
        email: email,
        verify: code,
    }
    return await postRequest(url, data);
}

export const uploadAvatar = async (image) => {
    const url = './portrait?token=' + await getFromStorage(config.tokenIndex);
    let data = new FormData();
    data.append('file', {
        uri: image.path,
        name: config_key.username + 'avatar' + image.modificationDate,
        type: image.mime,
    });
    const postConfig = {
        headers: {"Content-Type": "multipart/form-data"}
    };
    return await postFormData(url, data, postConfig);
}

export const getAvatar = async () => {
    const token = await getFromStorage(config.tokenIndex);
    const url = '/portrait?token=' + token;
    return await getRequest(url);
}

export const changeUsername = async (value) => {
    await setInStorage(config.usernameIndex, value);
    config_key.username = value;
}

export const changeNickname = async (value) => {
    await setInStorage(config.nicknameIndex, value);
    config_key.nickname = value;
}


