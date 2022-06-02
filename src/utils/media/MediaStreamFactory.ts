import {
    MediaStream,
    mediaDevices,
} from 'react-native-webrtc';
import {serviceConfig} from "../../ServiceConfig";
import * as events from "events"
import {timeoutCallback} from "./MediaUtils";


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

    public waitForUpdate()
    {
        return new Promise<void>((resolve, reject) => {
            console.log('[Log]  Waiting for MediaStreamFactory to update device info...');
            let returned: boolean = false;
            this.eventEmitter.once('localDeviceUpdated', timeoutCallback(() => {
                if (returned)
                    return;

                returned = true;
                if (this.updated) {
                    console.log('[Log]  Device info updated');
                    resolve();
                } else {
                    reject('Device info update failed');
                }
            }, serviceConfig.mediaTimeout));

            if (!returned && this.updated) {
                returned = true;
                console.log('[Log]  Device info updated');
                resolve();
            }
        });
    }

    private async updateLocalDeviceInfos(): Promise<void>
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
            console.error(err);
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
            console.error(err);
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
            console.error(err);
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
            console.error(err);
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
            console.error(err);
            return Promise.reject("Fail to get display stream.");
        }
    }
}
