import {postRequest} from "../utils/Utils";
import moment from "moment";
import {config_key} from "../Constants";
import {MeetingVariable} from "../MeetingVariable";

export const create = async (roomname, password) => {
    const inf = {
        start_time: moment().format('YY-MM-DD HH:mm:ss'),
        end_time: moment().add(1, 'd').format('YY-MM-DD HH:mm:ss'),
        topic: roomname,
        password: password,
        token: config_key.token,
        max_num: 50,
    };

    return await reserve(inf);
}

export const clearMeetingVariable = () => {
    MeetingVariable.messages = [];
    MeetingVariable.room = [];
    MeetingVariable.notes = null;
    MeetingVariable.room = null;
    MeetingVariable.hostId = null;
}

export const join = async (roomId, password) => {
    const url = '/getRoom';
    const data = {
        id: roomId,
        token: config_key.token,
        password: password,
    }

    return await postRequest(url, data)
}

export const reserve = async (meetingInf) => {
    const url = '/reserve';
    return await postRequest(url, meetingInf);
}

export const reserveJoin = async (roomId, password, token) => {
    const url = '/reserveOther';
    const data = {
        token: token,
        roomId: roomId,
        password: password,
    }
    return await postRequest(url, data);
}

export const meetingsInf = async () => {
    const url = '/getReservations';
    const data = {
        token: config_key.token,
    };
    return await postRequest(url, data);
}

export const meetingHistory = async () => {
    const url = '/getHistory';
    const data = {
        token: config_key.token,
    };
    return await postRequest(url, data);
}
