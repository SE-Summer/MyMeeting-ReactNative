import {printError} from "../PrintError";
import {mediaDevices} from "react-native-webrtc";
import {serviceConfig} from "../../ServiceConfig";
import * as events from "events"


export class MediaStreamFactory
{
    private camEnvDeviceId: string = null;
    private camFrontDeviceId: string = null;
    private micDeviceId: string = null;
    private speakerDeviceId: string = null;

    private updated: boolean = null;
    private eventEmitter: events.EventEmitter = null;

    constructor()
    {
        this.updated = false;
        this.eventEmitter = new events.EventEmitter();
        this.updateLocalDeviceInfos();
        mediaDevices.ondevicechange = (event) => {
            this.updateLocalDeviceInfos();
        }
    }

    private timeoutCallback(callback, timeout: number)
    {
        let called = false;

        const interval = setTimeout(() => {
            if (called) {
                return;
            }
            called = true;
            callback(new Error('Update device timeout.'), null);
        }, timeout);

        return (...args) => {
            if (called) {
                return;
            }
            called = true;
            clearTimeout(interval);

            callback(...args);
        };
    }

    public waitForUpdate()
    {
        return new Promise<void>((resolve, reject) => {
            console.log('Waiting for MediaStreamFactory to update device info...');
            this.eventEmitter.on('localDeviceUpdated', this.timeoutCallback(() => {
                if (this.updated)
                    resolve();
                else
                    reject('Device info update failed');
            }, serviceConfig.mediaTimeout));
        });
    }

    private async updateLocalDeviceInfos()
    {
        try {
            this.camEnvDeviceId = null;
            this.camFrontDeviceId = null;
            this.micDeviceId = null;
            const devices = await mediaDevices.enumerateDevices();
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
            this.updated = true;
            this.eventEmitter.emit('localDeviceUpdated');
        } catch (err) {
            printError(err);
        }
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

    public async getCamEnvStream(_width: number, _height: number, _frameRate: number): Promise<MediaStream>
    {
        const constraints = {
            audio: false,
            video: {
                width: _width,
                height: _height,
                frameRate: _frameRate,
                aspectRatio: _width/_height,
                deviceId: this.camEnvDeviceId,
            },
        };

        try {
            return await mediaDevices.getUserMedia(constraints)
        } catch (err) {
            printError(err);
            return Promise.reject("Fail to get camera env stream.");
        }
    }

    public async getCamFrontStream(_width: number, _height: number, _frameRate: number): Promise<MediaStream>
    {
        const constraints = {
            audio: false,
            video: {
                width: _width,
                height: _height,
                frameRate: _frameRate,
                aspectRatio: _width/_height,
                deviceId: this.camFrontDeviceId,
            },
        };

        try {
            return await mediaDevices.getUserMedia(constraints);
        } catch (err) {
            printError(err);
            return Promise.reject("Fail to get camera front stream.");
        }
    }

    public async getMicStream(): Promise<MediaStream>
    {
        const constraints = {
            audio: {
                deviceId: this.micDeviceId,
                autoGainControl: true,
                echoCancellation: true,
                noiseSuppression: true,
            },
            video: false,
        };

        try {
            return await mediaDevices.getUserMedia(constraints)
        } catch (err) {
            printError(err);
            return Promise.reject("Fail to get camera front stream.");
        }
    }

    public async getDisplayStream(_width: number, _height: number, _frameRate: number): Promise<MediaStream>
    {
        const constraints = {
            audio: true,
            video: {
                width: _width,
                height: _height,
                frameRate: _frameRate,
                aspectRatio: _width/_height,
            }
        };
        try {
            return await mediaDevices.getDisplayMedia(constraints);
        } catch (err) {
            printError(err);
            return Promise.reject("Fail to get display stream.");
        }
    }
}
