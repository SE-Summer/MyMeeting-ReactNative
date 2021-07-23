import {printError} from "../PrintError";
import {mediaDevices} from "react-native-webrtc";


export class MediaStreamFactory
{
    private camEnvDeviceId: string = null;
    private camFrontDeviceId: string = null;
    private micDeviceId: string = null;
    private speakerDeviceId: string = null;

    constructor()
    {
        this.updateLocalDeviceInfos();
        mediaDevices.ondevicechange = (event) => {
            this.updateLocalDeviceInfos();
        }
    }

    private updateLocalDeviceInfos()
    {
        this.camEnvDeviceId = null;
        this.camFrontDeviceId = null;
        this.micDeviceId = null;
        mediaDevices.enumerateDevices()
            .then((devices) => {
                devices.forEach((device) => {
                    let deviceId = device.deviceId;
                    switch (device.kind) {
                        case "videoinput":
                            if (device.facing === 'environment' && this.camEnvDeviceId == null) {
                                this.camEnvDeviceId = deviceId;
                            } else if (this.camFrontDeviceId == null) {
                                this.camFrontDeviceId = deviceId;
                            }
                            break;
                        case "audioinput":
                            if (this.micDeviceId == null) {
                                this.micDeviceId = deviceId
                            }
                            break;
                        case "audiooutput":
                            if (this.speakerDeviceId == null) {
                                this.speakerDeviceId = deviceId
                            }
                            break;
                    }
                });
            })
            .catch(printError);
    }

    public getCamEnvDeviceId()
    {
        return this.camEnvDeviceId;
    }

    public getCamFrontDeviceId()
    {
        return this.camFrontDeviceId;
    }

    public getMicDeviceId()
    {
        return this.micDeviceId;
    }

    public getSpeakerDeviceId()
    {
        return this.speakerDeviceId;
    }

    public async getCamEnvStream(_width: number, _height: number, _frameRate: number)
    {
        let stream = null;
        let constraints = {
            audio: false,
            video: {
                deviceId: this.camEnvDeviceId,
                frameRate: {ideal: _frameRate},
                width: _width,
                height: _height,
            },
        };

        try {
            stream = await mediaDevices.getUserMedia(constraints)
        } catch (err) {
            printError(err);
        }
        return stream;
    }

    public async getCamFrontStream(_width: number, _height: number, _frameRate: number)
    {
        let stream: MediaStream = null;
        let constraints = {
            audio: false,
            video: {
                deviceId: this.camFrontDeviceId,
                frameRate: {ideal: _frameRate},
                width: _width,
                height: _height,
            },
        };

        try {
            stream = await mediaDevices.getUserMedia(constraints);
        } catch (err) {
            printError(err);
        }
        return stream;
    }

    public async getMicStream()
    {
        let stream = null;
        let constraints = {
            audio: {
                deviceId: this.micDeviceId,
                autoGainControl: true,
                echoCancellation: true,
                noiseSuppression: true,
            },
            video: false,
        };

        try {
            stream = await mediaDevices.getUserMedia(constraints)
        } catch (err) {
            printError(err);
        }

        return stream;
    }

    public async getDisplayStream(_width: number, _height: number, _frameRate: number)
    {
        let stream = null;
        let constraints = {
            audio: true,
            video: {
                frameRate: {ideal: _frameRate},
                width: _width,
                height: _height,
            },
        };
        try {
            stream = await mediaDevices.getDisplayMedia(constraints);
        } catch (err) {
            printError(err);
        }

        return stream;
    }
}
