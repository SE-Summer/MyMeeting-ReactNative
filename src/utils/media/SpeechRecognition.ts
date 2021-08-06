import { Recognizer } from "react-native-speech-iflytek";
import {NativeEventEmitter} from "react-native";
import {iflytekAPPID} from "../../ServiceConfig";
import {SpeechText} from "../Types";
import * as moment from "moment";

Recognizer.init(iflytekAPPID);

export class SpeechRecognition
{
    private recognizerEventEmitter = new NativeEventEmitter(Recognizer);
    private working: boolean = null;
    private sentenceEnded: boolean = null;
    private recognizedCallbacks: Map<string, (result: SpeechText) => void> = null;

    constructor()
    {
        this.recognizedCallbacks = new Map<string, (result: SpeechText) => void>();
        this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
        this.recognizerEventEmitter.addListener('onRecognizerError', (err) => {console.error(err)});
        this.working = false;
        this.sentenceEnded = true;
    }

    public registerRecognizedListener(key: string, recognizedCallback: (text: SpeechText) => void)
    {
        this.recognizedCallbacks.set(key, recognizedCallback);
    }

    public deleteRecognizedListener(key: string)
    {
        this.recognizedCallbacks.delete(key);
    }

    private onRecognizerResult = (result) => {
        const text = result.text.trim();
        if (result.isLast) {
            console.log(`[Recognizer]  Recognized speech: ${text}`);
            console.log('[Recognizer]  Sentence ended');
            let speechText: SpeechText = {
                fromMyself: true,
                sentenceEnded: false,
                text: text,
                timestamp: this.sentenceEnded ? moment() : null,
            }
            this.sentenceEnded = true;
            this.recognizedCallbacks.forEach((callback) => {
                callback(speechText);
            });
            if (this.working) {
                Recognizer.start();
            }
        } else if (text == '') {
            return;
        } else {
            console.log(`[Recognizer]  Recognized speech: ${text}`);
            let speechText: SpeechText = {
                fromMyself: true,
                sentenceEnded: false,
                text: text,
                timestamp: this.sentenceEnded ? moment() : null,
            }
            this.recognizedCallbacks.forEach((callback) => {
                callback(speechText);
            });
            this.sentenceEnded = false;
        }
    }

    private sendSpeechText(text: SpeechText)
    {

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
