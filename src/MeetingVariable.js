import {config_key} from "./Constants";
import {FileService} from "./service/FileService";
import {MediaService} from "./service/MediaService";
import {MediaStreamFactory} from "./utils/media/MediaStreamFactory";

export const fileService = new FileService();

export const MeetingVariable = {
    mediaService: new MediaService(),
    mediaStreamFactory: new MediaStreamFactory(),
    messages: [],
    myName: config_key.username,
}
