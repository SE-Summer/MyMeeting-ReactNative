// @ts-ignore
import Voice from '@react-native-voice/voice';
import {Component} from 'react';

export class SpeechRecognition extends Component
{
    constructor(props) {
        super(props);
        Voice.onSpeechPartialResults = this.sendSpeechText.bind(this);
        Voice.onSpeechStart = () => {console.log('start')}
        Voice.onSpeechEnd = () => {console.log('end')};
        Voice.onSpeechResults = (text) => {console.log('text')};
    }

    private sendSpeechText(text)
    {
        console.log(text);
    }

    public async start()
    {
        console.log(await Voice.isAvailable());
        await Voice.start('zh');
        console.log(await Voice.isAvailable());
    }

    public async stop()
    {
        await Voice.stop();
    }
}
