import {io, Socket} from 'socket.io-client';
import {serviceConfig, SignalMethod, SignalType} from "../ServiceConfig";
import {timeoutCallback} from "../utils/media/MediaUtils";

export class SignalingService
{
    private readonly URL: string = null;
    private readonly socket: Socket = null;
    private callbackMap: Map<SignalType ,Map<SignalMethod, object>> = null;
    private readonly disconnectCallback: () => Promise<void> = null;

    constructor(URL: string, opts, onDisconnect: () => Promise<void>)
    {
        this.URL = URL;
        this.socket = io(URL, opts);
        this.disconnectCallback = onDisconnect;
        console.log('[Socket]  Start to connect');

        this.callbackMap = new Map<SignalType ,Map<SignalMethod, (data) => void>>();
        this.callbackMap.set(SignalType.request, new Map<SignalMethod, (data) => void>());
        this.callbackMap.set(SignalType.notify, new Map<SignalMethod, (data) => void>());

        this.socket.on(SignalType.request, ({ method, data }) => {
            this.handleSignal(SignalType.request, method, data);
        });

        this.socket.on(SignalType.notify, ({ method, data }) => {
            this.handleSignal(SignalType.notify, method, data);
        });

        this.socket.on('disconnect', this.disconnectCallback);
    }

    private handleSignal(type: SignalType, method: SignalMethod, data)
    {
        console.log(`[Socket]  Received signal (${type} , ${method})`);
        let callback = this.callbackMap.get(type).get(method) as (data) => void;
        if (callback == undefined) {
            console.warn(`[Socket]  Undefined signal (${type} , ${method})`);
        } else {
            callback(data);
            console.log(`[Socket]  Signal handled (${type} , ${method})`);
        }
    }

    public registerListener(type: SignalType, method: SignalMethod, callback: (data) => void)
    {
        this.callbackMap.get(type).set(method, callback);
    }

    public removeAllListeners()
    {
        this.socket.off('disconnect', this.disconnectCallback);
        this.callbackMap.get(SignalType.notify).clear();
        this.callbackMap.get(SignalType.request).clear();
    }

    public waitForConnection()
    {
        this.socket.connect();
        return new Promise<void>((resolve, reject) => {
            console.log('[Socket]  Waiting for connection to ' + this.URL + '...');
            let returned: boolean = false;
            this.socket.once('connect', timeoutCallback(() => {
                if (returned)
                    return;

                returned = true;
                if (this.socket && this.socket.connected) {
                    console.log('[Socket]  Connected');
                    resolve();
                }
                else {
                    reject('Socket connection failed');
                }
            }, serviceConfig.connectTimeout));

            if (!returned && this.socket && this.socket.connected) {
                returned = true;
                console.log('[Socket]  Connected');
                resolve();
            }
            // this.socket.on('connect_error', this.timeoutCallback(() => {
            //     console.log('Socket connection failed!!!')
            //     reject();
            //     }, serviceConfig.connectTimeout));
        });
    }

    public waitForReconnection()
    {
        return new Promise<void>((resolve, reject) => {
            console.log('[Socket]  Waiting for reconnection to ' + this.URL + '...');
            let returned: boolean = false;
            this.socket.once('connect', timeoutCallback(() => {
                if (returned)
                    return;

                returned = true;
                if (this.socket && this.socket.connected) {
                    console.log('[Socket]  Reconnected');
                    resolve();
                }
                else {
                    reject('Socket reconnection failed');
                }
            }, serviceConfig.reconnectTimeout));

            if (!returned && this.socket && this.socket.connected) {
                returned = true;
                console.log('[Socket]  Reconnected');
                resolve();
            }
        })
    }

    public disconnect()
    {
        this.socket.disconnect();
    }

    public sendRequest(method: SignalMethod, data = null)
    {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject('No socket connection.');
            } else {
                this.socket.emit(SignalType.request, { method, data },
                    timeoutCallback((err, response) => {
                        if (err) {
                            console.error('[Socket]  sendRequest ' + method + ' error!', err);
                            reject(err);
                        } else {
                            resolve(response);
                        }
                    }, serviceConfig.requestTimeout)
                );
            }
        });
    }

    public sendNotify(method: SignalMethod, data = null)
    {
        this.socket.emit(SignalType.notify, { method, data });
    }

    public connected()
    {
        return (this.socket && this.socket.connected);
    }
}
