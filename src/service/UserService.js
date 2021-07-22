import {removeFromStorage, setInStorage} from "../utils/StorageUtils";
import {config, config_key} from "../utils/Constants";
import {postRequest} from "../utils/Utils";

export const loginService = async (email, password) => {
    const url = '/login';
    const user = {};
    user.email = email;
    user.password = password;
    const response = await postRequest(url, user);

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
    }

    return false;
}

export const logout = async () => {
    await removeFromStorage(config.usernameIndex);
    await removeFromStorage(config.userIdIndex);
    await removeFromStorage(config.tokenIndex);
}

export const registerService = () => {

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

export const changeUsername = async (value) => {
    await setInStorage(config.usernameIndex, value);
    config_key.username = value;
}

export const changeNickname = async (value) => {
    await setInStorage(config.nicknameIndex, value);
    config_key.nickname = value;
}
