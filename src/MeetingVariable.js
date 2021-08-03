import {config_key} from "./Constants";
import {FileService} from "./service/FileService";

export const fileService = new FileService();

export const MeetingVariable = {
    mediaService: null,
    messages: [],
    myName: config_key.username,
}
