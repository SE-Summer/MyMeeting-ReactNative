import {printError} from "../printError";


export class MediaStreamFactory
{
    private localCamInfos: MediaDeviceInfo[];
    private localMicInfos: MediaDeviceInfo[];
    private localSpeakerInfos: MediaDeviceInfo[];
    private supportedConstraints: MediaTrackSupportedConstraints;

    constructor()
    {
        this.updateLocalDeviceInfos();
        navigator.mediaDevices.ondevicechange = (event) => {
            this.updateLocalDeviceInfos();
        }
        this.supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    }

    private updateLocalDeviceInfos()
    {
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
                this.localCamInfos.length = 0;
                this.localMicInfos.length = 0;
                this.localSpeakerInfos.length = 0;
                devices.forEach((device) => {
                    switch (device.kind) {
                        case "videoinput":
                            this.localCamInfos.push(device);
                            break;
                        case "audioinput":
                            this.localMicInfos.push(device);
                            break;
                        case "audiooutput":
                            this.localSpeakerInfos.push(device);
                            break;
                    }
                });
            })
            .catch(printError);
    }

    public async getCameraStream(_deviceId: string)
    {
        let stream = null;
        let constraint = {
            audio: false,
            video: {
                deviceId: _deviceId,
            },
        };

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraint)
        } catch (err) {
            printError(err);
        }

        return stream;
    }

    public async getMicrophoneStream(_deviceId: string)
    {
        let stream = null;
        let constraint = {
            audio: {
                deviceId: _deviceId
            },
            video: false,
        };

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraint)
        } catch (err) {
            printError(err);
        }

        return stream;
    }

    public async getCamAndMicStream(camDeviceId: string, micDeviceId: string)
    {
        let stream = null;
        let constraint = {
            audio: {
                deviceId: camDeviceId,
            },
            video: {
                deviceId: micDeviceId,
            },
        };

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraint)
        } catch (err) {
            printError(err);
        }

        return stream;
    }

    public async getDisplayStream()
    {
        let stream = null;
        let constraint = {
            audio: true,
            video: {
                displaySurface: 'monitor',
            },
        };
        try {
            const navi = navigator as any;
            stream = await navi.mediaDevices.getDisplayMedia(constraint);
        } catch (err) {
            printError(err);
        }

        return stream;
    }
}
