import {postRequest} from "../utils/Utils";
import moment from "moment";
import {config, config_key} from "../utils/Constants";
import {getFromStorage} from "../utils/StorageUtils";

export const create = async (roomname, password) => {
    const inf = {
        start_time: moment().format('YY-MM-DD HH:mm:ss'),
        end_time: moment().add(1, 'd').format('YY-MM-DD HH:mm:ss'),
        topic: roomname,
        password: password,
        token: await getFromStorage(config.tokenIndex),
        max_num: 50,
    };

    return await reserve(inf);
}

export const join = async (roomId, password) => {
    const url = '/getRoom';
    const data = {
        id: roomId,
        password: password,
    }

    return await postRequest(url, data)
}

export const reserve = async (meetingInf) => {
    const url = '/reserve';
    return await postRequest(url, meetingInf);
}
