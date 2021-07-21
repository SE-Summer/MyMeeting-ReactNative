import {postRequest} from "../utils/Utils";
import moment from "moment";
import {config_key} from "../utils/Constants";

export const create = async (roomname, password) => {
    const inf = {
        start_time: moment(),
        end_time: moment().add(1, 'd'),
        topic: roomname,
        password: password,
        host: config_key.userId,
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
