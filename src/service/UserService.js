import {getFromStorage, removeFromStorage, setInStorage} from "../utils/StorageUtils";
import {config, config_key} from "../Constants";
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
        //后端用户名保存叫nickname
        await setInStorage(config.usernameIndex, user.nickname);
        await setInStorage(config.emailIndex, user.email);
        await setInStorage(config.userIdIndex, JSON.stringify(user.id));
        await setInStorage(config.tokenIndex, user.token);
        config_key.username = user.nickname;
        config_key.userId = user.id;
        config_key.email = user.email;
        config_key.token = user.token;

        const avatarResponse = await getAvatar();
        if (avatarResponse == null || avatarResponse.status !== 200) {
            // toast.show('获取头像失败', {type: 'warning', duration: 1300, placement: 'top'})
            console.log('获取头像失败');
        } else {
            config_key.avatarUri = config.baseURL + avatarResponse.data.path;
        }

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
    config_key.token = null;
    config_key.username = null;
    config_key.userId = null;
    config_key.avatarUri = null;
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


