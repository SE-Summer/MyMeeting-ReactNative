import {MediaStream, MediaStreamTrack, registerGlobals} from 'react-native-webrtc';
import * as mediasoupClient from "mediasoup-client";
import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../utils/Types";
import {
    MeetingEndReason,
    meetingURL,
    serviceConfig,
    SignalMethod,
    SignalType,
    SIMULCASTENCODING,
    socketConnectionOptions,
    TransportType
} from "../ServiceConfig";
import {SignalingService} from "./SignalingService";
import {PeerMedia} from "../utils/media/PeerMedia";
import {timeoutCallback} from "../utils/media/MediaUtils";
import * as events from "events"
import {Moment} from "moment";
import {MeetingVariable} from "../MeetingVariable"

export class MediaService
{
    private roomToken: string = null;
    private userToken: string = null;
    private meetingURL: string = null;
    private myId: number = null;
    private displayName: string = null;
    private deviceName: string = null;
    private avatar: string = null;

    private signaling: SignalingService = null;
    private device: mediasoupTypes.Device = null;
    private eventEmitter: events.EventEmitter = null;

    private sendTransport: mediasoupTypes.Transport = null;
    private recvTransport: mediasoupTypes.Transport = null;

    // track.id ==> MediaStreamTrack
    private readonly sendingTracks: Map<string, MediaStreamTrack> = null;
    // track.id ==> producer
    private readonly producers: Map<string, mediasoupTypes.Producer> = null;
    private readonly peerMedia: PeerMedia = null;

    private hostPeerId: number = null;

    private sendTransportOpt: mediasoupTypes.TransportOptions = null;
    private joined: boolean = null;
    private permissionUpdated: boolean = null;
    private allowed: boolean = null;

    private updatePeerCallbacks: Map<string, () => void> = null;
    private newMessageCallbacks: Map<string, (message: types.Message) => void> = null;
    private meetingEndCallbacks: Map<string, (reason: MeetingEndReason) => void> = null;
    private beMutedCallbacks: Map<string, () => void> = null;

    constructor()
    {
        try {
            registerGlobals();
            this.device = new mediasoupClient.Device();

            this.sendingTracks = new Map<string, MediaStreamTrack>();
            this.producers = new Map<string, mediasoupTypes.Producer>();
            this.peerMedia = new PeerMedia();

            this.eventEmitter = new events.EventEmitter();

            this.joined = false;
            this.permissionUpdated = false;
            this.allowed = false;

            this.updatePeerCallbacks = new Map<string, () => void>();
            this.newMessageCallbacks = new Map<string, (message: types.Message) => void>();
            this.meetingEndCallbacks = new Map<string, (reason: MeetingEndReason) => void>();
            this.beMutedCallbacks = new Map<string, () => void>();

        } catch (err) {
            console.error('[Error]  Fail to construct MediaService instance', err);
        }
    }

    public registerPeerUpdateListener(key: string, updatePeerCallback: () => void)
    {
        this.updatePeerCallbacks.set(key, updatePeerCallback);
    }

    public deletePeerUpdateListener(key: string)
    {
        this.updatePeerCallbacks.delete(key);
    }

    public registerNewMessageListener(key: string, newMessageCallback: (message: types.Message) => void)
    {
        this.newMessageCallbacks.set(key, newMessageCallback);
    }

    public deleteNewMessageListener(key: string)
    {
        this.newMessageCallbacks.delete(key);
    }

    public registerMeetingEndListener(key: string, meetingEndCallback: (reason: MeetingEndReason) => void)
    {
        this.meetingEndCallbacks.set(key, meetingEndCallback);
    }

    public deleteMeetingEndListener(key: string)
    {
        this.meetingEndCallbacks.delete(key);
    }

    public registerBeMutedListener(key: string, beMutedCallback: () => void)
    {
        this.beMutedCallbacks.set(key, beMutedCallback);
    }

    public deleteBeMutedListener(key: string)
    {
        this.beMutedCallbacks.delete(key);
    }

    public getPeerDetails()
    {
        return this.peerMedia.getPeerDetails();
    }

    public getPeerDetailByPeerId(peerId: number)
    {
        return this.peerMedia.getPeerDetailByPeerId(peerId);
    }

    public getHostPeerId()
    {
        return this.hostPeerId;
    }

    private waitForAllowed(): Promise<void>
    {
        return new Promise<void>((resolve, reject) => {
            console.log('[Log]  Waiting for server to allow the connection...');
            let returned: boolean = false;
            this.eventEmitter.once('permissionUpdated', timeoutCallback(() => {
                if (returned)
                    return;

                returned = true;
                if (this.allowed) {
                    console.log('[Log]  Server allowed the connection')
                    resolve();
                } else {
                    reject('[Error]  Server reject the connection');
                }
            }, serviceConfig.mediaTimeout));

            if (!returned && this.permissionUpdated) {
                returned = true;
                if (this.allowed) {
                    console.log('[Log]  Server allowed the connection')
                    resolve();
                } else {
                    reject('[Error]  Server reject the connection');
                }
            }
        })
    }


    public joinMeeting(roomToken: string, userToken: string, myUserId: number,
                       displayName: string, deviceName: string, avatar: string)
    {
        MeetingVariable.speechRecognition.clear();
        return this._joinMeeting(false, roomToken, userToken, myUserId, displayName, deviceName, avatar);
    }

    // steps for connection:
    // create a signaling client which has a socketio inside, then try to connect to server
    // wait until the connection is built
    // send request to get routerRtpCapabilities from server
    // load the routerRtpCapabilities into device
    //
    private async _joinMeeting(reenter: boolean, roomToken?: string, userToken?: string, myUserId?: number,
                               displayName?: string, deviceName?: string, avatar?: string): Promise<void>
    {
        if (this.joined) {
            console.warn('[Warning]  Already joined a meeting');
            return Promise.reject('Already joined a meeting');
        }

        if (!reenter) {
            this.roomToken = roomToken;
            this.userToken = userToken;
            this.myId = myUserId;
            this.meetingURL = meetingURL(this.roomToken, this.userToken, this.myId);
            this.displayName = displayName;
            this.deviceName = deviceName;
            this.avatar = avatar;
            console.log('[Log]  Try to join meeting with roomToken = ' + roomToken);

            try {
                this.signaling = new SignalingService(this.meetingURL, socketConnectionOptions, this.onSignalingDisconnect.bind(this));
                this.registerSignalingListeners();
                await this.signaling.waitForConnection();
                await this.waitForAllowed();

            } catch (err) {
                console.error('[Error]  Fail to connect socket or the server rejected', err);
                this.meetingEndCallbacks.forEach((callback) => {
                    callback(MeetingEndReason.notAllowed);
                });
                this.leaveMeeting();
                return Promise.reject('Fail to connect socket or the server rejected');
            }
        }

        try {
            const rtpCapabilities = await this.signaling.sendRequest(SignalMethod.getRouterRtpCapabilities);
            console.log('[Log]  Router RTP Capabilities received');

            if (!this.device.loaded) {
                await this.device.load({routerRtpCapabilities: rtpCapabilities});
            }

            await this.createSendTransport();
            await this.createRecvTransport();

        } catch (err) {
            console.error('[Error]  Fail to prepare device and transports', err);
            this.meetingEndCallbacks.forEach((callback) => {
                callback(MeetingEndReason.lostConnection);
            });
            this.leaveMeeting();
            return Promise.reject('Fail to prepare device and transports');
        }

        try {
            const { host, peerInfos } = await this.signaling.sendRequest(SignalMethod.join, {
                displayName: this.displayName,
                avatar: this.avatar,
                joined: this.joined,
                device: this.deviceName,
                rtpCapabilities: this.device.rtpCapabilities,
            } as types.JoinRequest) as { host: number, peerInfos: types.PeerInfo[] };

            this.hostPeerId = host;

            for (const info of peerInfos) {
                this.peerMedia.addPeerInfo(info);
            }

            this.updatePeerCallbacks.forEach((callback) => {
                callback();
            });

            this.joined = true;

        } catch (err) {
            console.error('[Error]  Fail to join the meeting', err);
            this.meetingEndCallbacks.forEach((callback) => {
                callback(MeetingEndReason.lostConnection);
            });
            this.leaveMeeting();
            return Promise.reject('Fail to join the meeting');
        }
    }

    public async onSignalingDisconnect()
    {
        console.warn('[Socket]  Disconnected');
        if (this.joined) {

            try {
                await this.signaling.waitForReconnection();
            } catch (err) {
                this.meetingEndCallbacks.forEach((callback) => {
                    callback(MeetingEndReason.lostConnection);
                });
                this.leaveMeeting();
                return;
            }

            try {
                await this.restartIce();
            } catch (err) {
                await this.reenter();
            }
        }
    }

    private async restartIce()
    {
        console.log('[Log]  Trying to restartIce...');
        if (this.sendTransport == null || this.recvTransport == null) {
            console.error('[Error]  Fail to restart Ice: sendTransport or recvTransport has not been created');
            return Promise.reject('Fail to restart Ice');
        }

        try {
            const sendParam = await this.signaling.sendRequest(SignalMethod.restartIce, { transportId: this.sendTransport.id }) as { iceParameters: mediasoupTypes.IceParameters };
            await this.sendTransport.restartIce({ iceParameters: sendParam.iceParameters });

            const recvParam = await this.signaling.sendRequest(SignalMethod.restartIce, { transportId: this.recvTransport.id }) as { iceParameters: mediasoupTypes.IceParameters };
            await this.recvTransport.restartIce({ iceParameters: recvParam.iceParameters });

            console.log('[Log]  Ice restarted');
        } catch (err) {
            console.error('[Error]  Fail to restart Ice', err);
            return Promise.reject('Fail to restart Ice');
        }
    }

    private async reenter()
    {
        try {
            console.log('[Log]  Trying to reenter the meeting...');
            this.joined = false;
            this.deleteProducers();
            this.deletePeers();
            this.deleteTransports();
            this.resetDevice();
            await this._joinMeeting(true);
        } catch (err) {
            console.error('[Error]  Fail to rejoin the meeting when reentering')
            return;
        }

        try {
            let tracks: MediaStreamTrack[] = [];
            this.sendingTracks.forEach((track) => {
                tracks.push(track);
            });
            await this.sendMediaStream(new MediaStream(tracks));
            console.log('[Log]  Reentered');
        } catch (err) {
            console.error('[Error]  Fail to resend tracks when reentering')
        }
    }

    public async sendMediaStream(stream: MediaStream): Promise<void>
    {
        try {
            const tracks = stream.getTracks();
            for (const track of tracks) {
                let source: string = null;
                let params: mediasoupTypes.ProducerOptions = null;
                if (track.kind === 'video') {
                    source = `Video_from_peer_${this.myId}_track_${track.id}`;
                    params = {
                        track,
                        appData: { source },
                        // encodings: SIMULCASTENCODING,
                        codecOptions: { videoGoogleStartBitrate : 1000 },
                        // codec: this.device.rtpCapabilities.codecs.find(codec => codec.mimeType === 'video/H264')
                    }
                } else {
                    source = `Audio_from_peer_${this.myId}_track_${track.id}`;
                    params = {
                        track,
                        appData: { source },
                    }
                }

                const producer = await this.sendTransport.produce(params);

                producer.on('transportclose', () => {
                    console.log(`[Producer event]  ${source}_transport_close`);
                    if (!producer.closed) {
                        producer.close();
                    }
                    this.producers.delete(track.id);
                });

                producer.on('trackended', () => {
                    console.log(`[Producer event]  ${source}_track_ended`);
                    this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
                    if (!producer.closed) {
                        producer.close();
                    }
                    this.producers.delete(track.id);
                });

                this.producers.set(track.id, producer);

                console.log(`[Log]  Producing ${source}`);
                this.sendingTracks.set(track.id, track);
            }
        } catch (err) {
            console.error('[Error]  Fail to send MediaStream', err);
            return Promise.reject('Fail to send MediaStream');
        }
    }

    // if _toPeerId == null, it means broadcast to everyone in the meetings
    public async sendText(_toPeerId: number, _text: string, _timestamp): Promise<void>
    {
        try {
            const sendText: types.SendText = {
                toPeerId: _toPeerId,
                text: _text,
                timestamp: _timestamp,
            };

            await this.signaling.sendRequest(SignalMethod.sendText, sendText);
            console.log('[Log]  Text sent');
        } catch (err) {
            console.error('[Error]  Fail to send text', err);
            return Promise.reject('Fail to send text');
        }
    }

    public async sendFile(_fileURL: string, _timestamp: Moment, _filename: string, _fileType: string)
    {
        try {
            const sendFile: types.SendFile = {
                fileURL: _fileURL,
                timestamp: _timestamp,
                fileType: _fileType,
                filename: _filename,
            };

            await this.signaling.sendRequest(SignalMethod.sendFile, sendFile);
            console.log('[Log]  New file notice sent');
        } catch (err) {
            console.error('[Error]  Fail to send new file notice', err);
            return Promise.reject('Fail to send new file notice');
        }
    }

    public sendSpeechText(speechText: types.SpeechText)
    {
        if (this.signaling && this.signaling.connected()) {
            this.signaling.sendNotify(SignalMethod.sendSpeechText, { speechText });
        }
    }

    // tell server and clear all meeting-related variables
    public leaveMeeting()
    {
        this.joined = false;
        this.resetAllowedState();
        this.deleteSignaling();
        this.deleteProducers();
        this.deletePeers();
        this.deleteTransports();
        this.resetDevice();
        this.deleteSendingTracks();
    }

    private resetAllowedState()
    {
        this.permissionUpdated = false;
        this.allowed = false;
    }

    private resetDevice()
    {
        this.device = new mediasoupClient.Device();
    }

    private deleteProducers()
    {
        if (this.producers) {
            this.producers.forEach((producer) => {
                if (!producer.closed)
                    producer.close();
            });
            this.producers.clear();
        }
    }

    private deleteSignaling()
    {
        if (this.signaling) {
            this.signaling.removeAllListeners();
            if (this.signaling.connected()) {
                this.signaling.disconnect();
            }
            this.signaling = null;
        }
    }

    private deletePeers()
    {
        this.hostPeerId = null;

        if (this.peerMedia)
            this.peerMedia.clear();
    }

    private deleteTransports()
    {
        if (this.sendTransport && !this.sendTransport.closed) {
            this.sendTransport.close();
        }
        this.sendTransport = null;
        this.sendTransportOpt = null;

        if (this.recvTransport && !this.recvTransport.closed) {
            this.recvTransport.close();
        }
        this.recvTransport = null;
    }

    private deleteSendingTracks()
    {
        if (this.sendingTracks) {
            this.sendingTracks.clear();
        }
    }

    public async closeTrack(track: MediaStreamTrack)
    {
        if (!this.producers.has(track.id)) {
            console.warn('[Producer]  Already closed and deleted')
            return;
        }

        const producer = this.producers.get(track.id);
        console.log(`[Log]  Try to close track track.id = ${track.id}`);

        try {
            await this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
        } catch (err) {
            console.error('[Error]  Fail when sending closeProducer request', err);
            return Promise.reject('Fail when sending closeProducer request');
        }

        if (!this.producers.get(track.id).closed) {
            this.producers.get(track.id).close();
        }
        this.producers.delete(track.id);
        this.sendingTracks.delete(track.id);

        console.log(`[Log]  Track closed`);
    }

    // if peerId is not passed, (or = null), it means mute all peers in the room
    // return Promise.reject('Fail to mute peer') if you are not a host or an error occurs
    public async mutePeer(peerId: number = null)
    {
        if (this.hostPeerId && this.hostPeerId !== this.myId) {
            return Promise.reject('Fail to mute peer: Unauthorized');
        }
        try {
            await this.signaling.sendRequest(SignalMethod.mute, { mutePeerId: peerId });
        } catch (err) {
            console.error('[Error]  Fail to mute peer peerId = ' + peerId, err);
            return Promise.reject('Fail to mute peer');
        }
    }

    public async transferHost(toPeerId: number)
    {
        if (this.hostPeerId && this.hostPeerId !== this.myId) {
            return Promise.reject('Fail to transfer host: Unauthorized');
        }
        try {
            await this.signaling.sendRequest(SignalMethod.transferHost, { hostId: toPeerId });
            this.hostPeerId = toPeerId;
        } catch (err) {
            console.error('[Error]  Fail to transfer host to peer peerId = ' + toPeerId, err);
            return Promise.reject('Fail to transfer host');
        }
    }

    public async kickPeer(peerId: number)
    {
        if (this.hostPeerId && this.hostPeerId !== this.myId) {
            return Promise.reject('Fail to kick peer: Unauthorized');
        }
        try {
            await this.signaling.sendRequest(SignalMethod.kick, { kickedPeerId: peerId });
        } catch (err) {
            console.error('[Error]  Fail to kick peer peerId = ' + peerId, err);
            return Promise.reject('Fail to kick peer');
        }
    }

    public async closeRoom()
    {
        if (this.hostPeerId && this.hostPeerId !== this.myId) {
            return Promise.reject('Fail to close meeting: Unauthorized');
        }
        try {
            this.signaling.removeAllListeners();
            await this.signaling.sendRequest(SignalMethod.closeRoom);
        } catch (err) {
            console.error('[Error]  Fail to close meeting', err);
        }
        this.leaveMeeting();
    }

    public getStatus()
    {
        return this.signaling.sendRequest(SignalMethod.getStatus);
    }

    private async createSendTransport()
    {
        try {
            this.sendTransportOpt = await this.signaling.sendRequest(SignalMethod.createTransport, {
                transportType: TransportType.producer,
                sctpCapabilities: this.device.sctpCapabilities,
            } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions;
        } catch (err) {
            console.error('[Error]  Fail when sending createTransport (send) request', err);
            return Promise.reject('Fail when sending createTransport (send) request');
        }

        console.log('[Signaling]  sendTransportOptions received');

        this.sendTransport = this.device.createSendTransport(this.sendTransportOpt);

        this.sendTransport.on('connect', async ({dtlsParameters}, done, errBack) => {
            console.log('[Transport event]  event: connect, handled by sendTransport');
            try {
                await this.signaling.sendRequest(
                    SignalMethod.connectTransport, {
                        transportId: this.sendTransport.id,
                        dtlsParameters,
                    } as types.ConnectTransportRequest);
                done();
            } catch (err) {
                errBack(err);
            }
        });

        this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errBack) => {
            console.log('[Transport event]  event: produce, handled by sendTransport');
            try {
                // producerId
                const {producerId} = await this.signaling.sendRequest(
                    SignalMethod.produce, {
                        transportId : this.sendTransport.id,
                        kind,
                        rtpParameters,
                        appData
                    }) as {producerId: string};
                callback({id: producerId});
            } catch (err) {
                errBack(err);
            }
        });
    }

    private async createRecvTransport()
    {
        try {
            const transportOptions = await this.signaling.sendRequest(SignalMethod.createTransport, {
                transportType: TransportType.consumer,
                sctpCapabilities: this.device.sctpCapabilities,
            } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions;


            this.recvTransport = this.device.createRecvTransport(transportOptions);
        } catch (err) {
            console.error('[Error]  Fail when sending createTransport (recv) request', err);
            return Promise.reject('Fail when sending createTransport (recv) request');
        }

        this.recvTransport.on('connect', async ({dtlsParameters}, done, errBack) => {
            console.log('[Transport event]  event: connect, handled by recvTransport');
            try {
                await this.signaling.sendRequest(
                    SignalMethod.connectTransport, {
                        transportId: this.recvTransport.id,
                        dtlsParameters,
                    } as types.ConnectTransportRequest);
                done();
            } catch (err) {
                errBack(err);
            }
        });
    }

    private registerSignalingListeners()
    {
        this.signaling.registerListener(SignalType.notify, SignalMethod.allowed, ({ allowed }) => {
            console.log(`[Signaling]  Handling allowed notification with allowed = ${allowed} ...`);
            this.permissionUpdated = true;
            this.allowed = allowed;
            this.eventEmitter.emit('permissionUpdated');
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newPeer, async (data: types.PeerInfo) => {
            console.log('[Signaling]  Handling newPeer notification...');
            this.peerMedia.addPeerInfo(data);
            console.log(`[Signaling]  Add peerId = ${data.id}`);

            this.updatePeerCallbacks.forEach((callback) => {
                callback();
            });
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newConsumer, async (data: types.ConsumerInfo) => {
            console.log('[Signaling]  Handling newConsumer notification...');
            console.log('[Signaling]  Creating consumer kind = ' + data.kind);
            const consumer = await this.recvTransport.consume({
                id            : data.consumerId,
                producerId    : data.producerId,
                kind          : data.kind,
                rtpParameters : data.rtpParameters
            });

            consumer.on('pause', async () => {
                console.log('[Consumer]  Pause consumer id = ' + consumer.id);
                await this.signaling.sendRequest(SignalMethod.pauseConsumer, {consumerId: consumer.id});
            });

            consumer.on('resume', async () => {
                console.log('[Consumer]  Resume consumer id = ' + consumer.id);
                await this.signaling.sendRequest(SignalMethod.resumeConsumer, {consumerId: consumer.id});
            });

            consumer.pause();

            this.peerMedia.addConsumer(data.producerPeerId, consumer);

            this.updatePeerCallbacks.forEach((callback) => {
                callback();
            });
        });


        this.signaling.registerListener(SignalType.notify, SignalMethod.consumerClosed, ({ consumerId }) => {
            console.log('[Signaling]  Handling consumerClosed notification...');
            console.log(`[Signaling]  Delete consumer id = ${consumerId}`);
            this.peerMedia.deleteConsumer(consumerId);

            this.updatePeerCallbacks.forEach((callback) => {
                callback();
            });
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.peerClosed, ({ peerId }) => {
            console.log('[Signaling]  Handling peerClosed notification...');
            console.log(`[Signaling]  Delete peer id = ${peerId}`);
            this.peerMedia.deletePeer(peerId);

            this.updatePeerCallbacks.forEach((callback) => {
                callback();
            });
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newText, (recvText: types.RecvText) => {
            console.log('[Signaling]  Handling newText notification...');
            console.log(`[Signaling]  Text (${recvText.text}) received from peer (peerId: ${recvText.fromPeerId})`);
            const message: types.Message = {
                type: types.MessageType.text,
                broadcast: recvText.broadcast,
                fromMyself: false,
                fromPeerId: recvText.fromPeerId,
                text: recvText.text,
                timestamp: recvText.timestamp,
            }

            this.newMessageCallbacks.forEach((callback) => {
                callback(message);
            });
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newSpeechText, ({ speechText }) => {
            console.log('[Signaling]  Handling newSpeechText notification...');
            MeetingVariable.speechRecognition.recvPeerSpeech(speechText);
        })

        this.signaling.registerListener(SignalType.notify, SignalMethod.newFile, (recvFile: types.RecvFile) => {
            console.log('[Signaling]  Handling newFile notification...');
            console.log(`[Signaling]  New File notification (URL: ${recvFile.fileURL}) received from peer (peerId: ${recvFile.fromPeerId})`);
            const message: types.Message = {
                type: types.MessageType.file,
                broadcast: true,
                fileJobType: types.FileJobType.download,
                fileURL: recvFile.fileURL,
                fromMyself: false,
                fromPeerId: recvFile.fromPeerId,
                timestamp: recvFile.timestamp,
                filename: recvFile.filename,
                fileType: recvFile.fileType,
                fileJobStatus: types.FileJobStatus.unDownloaded,
            }

            this.newMessageCallbacks.forEach((callback) => {
                callback(message);
            });
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.hostChanged, ({ newHostId }) => {
            console.log(`[Signaling]  Handling hostChanged notification...`);
            console.log(`[Signaling]  Host of the meeting changed from ${this.hostPeerId} to ${newHostId}`);
            this.hostPeerId = newHostId;

            this.updatePeerCallbacks.forEach((callback) => {
                callback();
            });
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.roomClosed, async () => {
            console.log('[Signaling]  Handling roomClosed notification...');
            this.meetingEndCallbacks.forEach((callback) => {
                callback(MeetingEndReason.roomClosed);
            });
            this.leaveMeeting();
            console.warn('[Signaling]  Room closed');
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.kicked, async () => {
            console.log('[Signaling]  Handling kicked notification...');
            this.meetingEndCallbacks.forEach((callback) => {
                callback(MeetingEndReason.kicked);
            });
            this.leaveMeeting();
            console.warn('[Signaling]  Kicked by host');
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.beMuted, ({producerId}) => {
            console.log('[Signaling]  Handling beMuted notification...');

            let trackId: string = null;
            this.producers.forEach((producer, key) => {
                if (producer.id === producerId) {
                    if (!producer.closed) {
                        producer.close();
                    }
                    trackId = key;
                }
            });
            if (trackId != null) {
                this.producers.delete(trackId);
                this.sendingTracks.delete(trackId);
                this.beMutedCallbacks.forEach((callback) => {
                    callback();
                });
            }
            console.warn('[Signaling]  Muted by host');
        });
    }
}
