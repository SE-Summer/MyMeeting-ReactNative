import {postRequest} from "../utils/Utils";

export function create(roomname, password, callback) {
    //todo: create a room
    join(1, password, callback);
}

export function join(roomId, password, callback) {
    callback();
}

export const reserve = async (meetingInf) => {
    const url = '/reserve';
    const response = await postRequest(url, meetingInf);
    if (response == null) {
        return null;
    }

    if (response.status === 200) {
        return response.data;
    }
}
