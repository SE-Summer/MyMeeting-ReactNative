import { Recognizer } from "react-native-speech-iflytek";
import {NativeEventEmitter} from "react-native";
import {iflytekAPPID} from "../ServiceConfig";
import {SpeechText} from "./Types";
import {config_key} from "../Constants";
import {MeetingVariable} from "../MeetingVariable"
// @ts-ignore
import moment from "moment";

Recognizer.init(iflytekAPPID);

const me = '我';

export class SpeechRecognition
{
    private recognizerEventEmitter = new NativeEventEmitter(Recognizer);
    private working: boolean = null;
    private sentenceEnded: boolean = null;
    private currentSpeechTimestamp: moment = null;
    private speechCallbacks: Map<string, (text: string) => void> = null;
    private speechTextStorage: SpeechText[] = null;
    // fromPeerId ==> SpeechText
    private displaySpeechTexts: Map<string, SpeechText> = null;

    constructor()
    {
        this.speechCallbacks = new Map<string, (text: string) => void>();
        this.speechTextStorage = [];
        this.displaySpeechTexts = new Map<string, SpeechText>();
        this.recognizerEventEmitter.addListener('onRecognizerResult', this.onRecognizerResult);
        this.recognizerEventEmitter.addListener('onRecognizerError', (err) => {console.error(err)});
        this.working = false;
        this.sentenceEnded = true;
    }

    public registerSpeechListener(key: string, recognizedCallback: (text: string) => void)
    {
        this.speechCallbacks.set(key, recognizedCallback);
    }

    public deleteSpeechListener(key: string)
    {
        this.speechCallbacks.delete(key);
    }

    private onRecognizerResult = (recognized) => {
        const pendingText = recognized.text.trim();
        if (recognized.isLast) {
            console.log(`[Recognizer]  Recognized speech: ${pendingText}`);
            console.log('[Recognizer]  Sentence ended');
            if (this.sentenceEnded) {
                this.currentSpeechTimestamp = moment();
            }
            const speechText: SpeechText = {
                fromPeerId: config_key.userId.toString(),
                displayName: MeetingVariable.myName,
                fromMyself: true,
                newSentence: this.sentenceEnded,
                sentenceEnded: true,
                text: recognized.result,
                timestamp: this.currentSpeechTimestamp,
            }
            this.sentenceEnded = true;

            SpeechRecognition.sendSpeechText(speechText);
            this.newSpeechText(speechText);

            if (this.working) {
                Recognizer.start();
            }
        } else if (pendingText == '') {
            return;
        } else {
            console.log(`[Recognizer]  Recognized speech: ${pendingText}`);
            if (this.sentenceEnded) {
                this.currentSpeechTimestamp = moment();
            }
            let speechText: SpeechText = {
                fromPeerId: config_key.userId.toString(),
                displayName: MeetingVariable.myName,
                fromMyself: true,
                newSentence: this.sentenceEnded,
                sentenceEnded: false,
                text: recognized.result,
                timestamp: this.currentSpeechTimestamp,
            }
            this.sentenceEnded = false;

            SpeechRecognition.sendSpeechText(speechText);
            this.newSpeechText(speechText);
        }
    }

    private static sendSpeechText(text: SpeechText)
    {
        MeetingVariable.mediaService.sendSpeechText(text);
    }

    public recvPeerSpeech(speechText: SpeechText)
    {
        if (speechText.fromPeerId !== config_key.userId.toString()) {
            speechText.fromMyself = false;
            this.newSpeechText(speechText);
        }
    }

    private newSpeechText(speechText: SpeechText)
    {
        if (speechText.newSentence) {
            if (this.displaySpeechTexts.has(speechText.fromPeerId)) {
                const previous = this.displaySpeechTexts.get(speechText.fromPeerId);
                this.speechTextStorage.push(previous);
            }
        }
        this.displaySpeechTexts.set(speechText.fromPeerId, speechText);
        if (speechText.sentenceEnded) {
            setTimeout(() => {
                if (this.displaySpeechTexts.has(speechText.fromPeerId)
                    && this.displaySpeechTexts.get(speechText.fromPeerId).timestamp === speechText.timestamp) {
                    const previous = this.displaySpeechTexts.get(speechText.fromPeerId);
                    this.speechTextStorage.push(previous);
                    this.displaySpeechTexts.delete(speechText.fromPeerId);

                    const displayText = this.generateDisplayText();
                    this.speechCallbacks.forEach((callback) => {
                        callback(displayText);
                    });
                }
            }, 2000);
        }

        const displayText = this.generateDisplayText();
        this.speechCallbacks.forEach((callback) => {
            callback(displayText);
        });
    }

    private generateDisplayText()
    {
        let displayText = '';
        this.displaySpeechTexts.forEach((speechText) => {
            displayText += `${speechText.fromMyself ? me : speechText.displayName}: ${speechText.text}\n`;
        });
        return displayText;
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
