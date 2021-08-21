import {config_key} from "./Constants";
import {FileService} from "./service/FileService";
import {MediaService} from "./service/MediaService";
import {MediaStreamFactory} from "./utils/media/MediaStreamFactory";
import {SpeechRecognition} from "./utils/SpeechRecognition";

export const MeetingVariable = {
    mediaService: new MediaService(),
    mediaStreamFactory: new MediaStreamFactory(),
    speechRecognition: new SpeechRecognition(),
    fileService: new FileService(),
    messages: [],
    myName: config_key.username,
    room: null,
    hostId: null,
    notes: null,
}
