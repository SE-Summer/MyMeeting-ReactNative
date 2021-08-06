import { Recognizer } from "react-native-speech-iflytek";
import {NativeEventEmitter} from "react-native";
import {iflytekAPPID} from "../../ServiceConfig";

Recognizer.init(iflytekAPPID);

export class SpeechRecognition
{
    private recognizerEventEmitter = new NativeEventEmitter(Recognizer);
    private working: boolean = null;
    private recognizedCallbacks: Map<string, (result) => void> = null;

    constructor()
    {
        this.recognizedCallbacks = new Map<string, (result) => void>();
        this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
        this.recognizerEventEmitter.addListener('onRecognizerError', (err) => {console.error(err)});
        this.working = false;
    }

    private onRecognizerResult = (result) => {
        if (result.isLast && this.working) {
            Recognizer.start();
            console.log('[Recognizer]  Sentence ended')
        }

        console.log('[Recognizer]  Word recognized: ' + result.text);

        this.recognizedCallbacks.forEach((callback) => {
            callback(result);
        });
    }

    public start()
    {
        this.working = true;
        Recognizer.start();
        console.log('[Recognizer]  Started');
    }

    public stop()
    {
        this.working = false;
        Recognizer.stop();
        console.log('[Recognizer]  Stopped');
    }
}
