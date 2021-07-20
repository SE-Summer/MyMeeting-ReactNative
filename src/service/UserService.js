import {setInStorage} from "../utils/StorageUtils";
import {config, config_key} from "../utils/Constants";

export const logService = () => {

}

export const registerService = () => {

}

export const emailCheck = () => {

}

export const changeUsername = async (value) => {
    await setInStorage(config.usernameIndex, value);
    config_key.username = value;
}

export const changeNickname = async (value) => {
    await setInStorage(config.nicknameIndex, value);
    config_key.nickname = value;
}
