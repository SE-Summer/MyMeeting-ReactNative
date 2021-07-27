import {io, Socket} from 'socket.io-client';
import {serviceConfig, SignalMethod, SignalType} from "../ServiceConfig";

export class SignalingService
{
    private readonly URL: string = null;
    private readonly socket: Socket = null;
    private callbackMap: Map<SignalType ,Map<SignalMethod, object>> = null;

    constructor(URL: string, opts, onDisconnect: () => Promise<void>)
    {
        this.URL = URL;
        this.socket = io(URL, opts);
        console.log('[Socket]  Socket start to connect');

        this.callbackMap = new Map<SignalType ,Map<SignalMethod, (data) => void>>();
        this.callbackMap.set(SignalType.request, new Map<SignalMethod, (data) => void>());
        this.callbackMap.set(SignalType.notify, new Map<SignalMethod, (data) => void>());

        this.socket.on(SignalType.request, ({ method, data }) => {
            this.handleSignal(SignalType.request, method, data);
        });

        this.socket.on(SignalType.notify, ({ method, data }) => {
            this.handleSignal(SignalType.notify, method, data);
        });

        this.socket.on('disconnect', async () => {
            console.log('[Socket]  Socket disconnected');
            this.socket.disconnect();
            await onDisconnect();
        })
    }

    private handleSignal(type: SignalType, method: SignalMethod, data)
    {
        let callback = this.callbackMap.get(type).get(method) as (data) => void;
        if (callback == undefined) {
            console.log(`[Socket]  Undefined signal (${type} , ${method})`);
        } else {
            callback(data);
            console.log(`[Socket]  Signal handled (${type} , ${method})`);
        }
    }

    public registerListener(type: SignalType, method: SignalMethod, callback: (data) => void)
    {
        this.callbackMap.get(type).set(method, callback);
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
            console.log('[Socket]  Waiting for connection to ' + this.URL + '...');
            this.socket.on('connect', this.timeoutCallback(() => {
                console.log('[Socket]  Socket connected');
                if (this.socket && this.socket.connected)
                    resolve();
                else
                    reject('Socket connection failed');
            }, serviceConfig.connectTimeout));
            // this.socket.on('connect_error', this.timeoutCallback(() => {
            //     console.log('Socket connection failed!!!')
            //     reject();
            //     }, serviceConfig.connectTimeout));
        });
    }

    public sendRequest(method: SignalMethod, data = null)
    {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject('No socket connection.');
            } else {
                this.socket.emit(SignalType.request, { method, data },
                    this.timeoutCallback((err, response) => {
                        if (err) {
                            console.log('[Socket]  sendRequest ' + method + ' error! socket: \n', method, this.socket);
                            reject(err);
                        } else {
                            resolve(response);
                        }
                    }, serviceConfig.requestTimeout)
                );
            }
        });
    }

    public isConnected()
    {
        return (this.socket && this.socket.connected);
    }
}
