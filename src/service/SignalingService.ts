import {io, Socket} from 'socket.io-client';
import {RequestMethod, serviceConfig} from "../ServiceConfig";

export class SignalingService
{
    private readonly socket: Socket = null;

    constructor(URL: string, opts)
    {
        this.socket = io(URL, opts);
    }

    private timeoutCallback(callback, timeout: number)
    {
        let called = false;

        const interval = setTimeout(() => {
            if (called) {
                return;
            }
            called = true;
            callback(new Error('Request timeout.'), null);
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

    public waitForConnection()
    {
        return new Promise<void>((resolve, reject) => {
            console.log('Waiting for connection...');
            this.socket.on('connection', this.timeoutCallback(() => {resolve()}, serviceConfig.connectTimeout));
            this.socket.on('connect_error', this.timeoutCallback(() => {reject()}, serviceConfig.connectTimeout));
        });
    }

    public send(method: RequestMethod, data = null)
    {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject('No socket connection.');
            } else {
                this.socket.emit('request', { method, data },
                    this.timeoutCallback((err, response) => {
                        if (err) {
                            console.log('sendRequest %s timeout! socket: %o', method, this.socket);
                            reject(err);
                        } else {
                            resolve(response);
                        }
                    }, serviceConfig.requestTimeout)
                );
            }
        });
    }
}
