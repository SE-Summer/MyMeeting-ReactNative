import {registerGlobals} from 'react-native-webrtc'
import * as mediasoupClient from "mediasoup-client";
import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../utils/Types";
import {logger} from "../utils/Logger";
import {serviceConfig, SignalMethod, SignalType, socketConnectionOptions, TransportType} from "../ServiceConfig";
import {SignalingService} from "./SignalingService";
import {PeerMedia} from "../utils/media/PeerMedia";
import {timeoutCallback} from "../utils/media/MediaUtils";
import * as events from "events"

export class MediaService
{
    private roomToken: string = null;
    private userToken: string = null;
    private serverURL: string = null;
    private displayName: string = null;
    private deviceName: string = null;

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

    private hostPeerId: string = null;

    private sendTransportOpt: mediasoupTypes.TransportOptions = null;
    private joined: boolean = null;
    private permissionUpdated: boolean = null;
    private allowed: boolean = null;

    private readonly updatePeerCallback: () => void = null;
    private readonly newMessageCallback: (message: types.RecvPeerMessage) => void = null;

    constructor(updatePeerCallback: () => void, newMessageCallback: (message: types.RecvPeerMessage) => void)
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
            this.updatePeerCallback = updatePeerCallback;
            this.newMessageCallback = newMessageCallback;

        } catch (err) {
            logger.error(err);
        }
    }

    public getPeerDetails()
    {
        return this.peerMedia.getPeerDetails();
    }

    public getHostPeerId()
    {
        return this.hostPeerId;
    }

    private waitForAllowed(): Promise<void>
    {
        return new Promise<void>((resolve, reject) => {
            if (this.permissionUpdated) {
                if (this.allowed) {
                    logger.info('Server allowed the connection')
                    resolve();
                } else
                    reject('[Error]  Server reject the connection');
            }
            logger.info('Waiting for server to allow the connection...');
            this.eventEmitter.on('permissionUpdated', timeoutCallback(() => {
                if (this.allowed) {
                    logger.info('[Log]  Server allowed the connection')
                    resolve();
                } else
                    reject('[Error]  Server reject the connection');
            }, serviceConfig.mediaTimeout));
        })
    }


    // steps for connection:
    // create a signaling client which has a socketio inside, then try to connect to server
    // wait until the connection is built
    // send request to get routerRtpCapabilities from server
    // load the routerRtpCapabilities into device
    //
    public async joinMeeting(roomToken: string, userToken: string, displayName: string, deviceName: string): Promise<void>
    {
        if (this.joined) {
            logger.warn('Already joined a meeting');
            return;
        }

        this.roomToken = roomToken;
        this.userToken = userToken;
        this.serverURL = `${serviceConfig.serverURL}?roomId=${this.roomToken}&peerId=${this.userToken}`;
        this.displayName = displayName;
        this.deviceName = deviceName;
        logger.info('Try to join meeting with roomToken = ' + roomToken);

        try {
            this.signaling = new SignalingService(this.serverURL, socketConnectionOptions, this.onSignalingDisconnect.bind(this));

            this.registerSignalingListeners();
            await this.signaling.waitForConnection();
            await this.waitForAllowed();

        } catch (err) {
            logger.error('Fail to connect socket or the server rejected', err);
            await this.signaling.disconnect();
            return Promise.reject('Fail to connect socket or the server rejected');
        }

        try {
            const rtpCapabilities = await this.signaling.sendRequest(SignalMethod.getRouterRtpCapabilities);
            logger.info('Router RTP Capabilities received');

            if (!this.device.loaded) {
                await this.device.load({routerRtpCapabilities: rtpCapabilities});
            }

            await this.createSendTransport();
            await this.createRecvTransport();

        } catch (err) {
            logger.error('Fail to prepare device and transports', err);
            await this.leaveMeeting();
            return Promise.reject('Fail to prepare device and transports');
        }

        try {
            const { host, peerInfos } = await this.signaling.sendRequest(SignalMethod.join, {
            // const peerInfos = await this.signaling.sendRequest(SignalMethod.join, {
                displayName: this.displayName,
                joined: this.joined,
                device: this.deviceName,
                rtpCapabilities: this.device.rtpCapabilities,
            } as types.JoinRequest) as { host: string, peerInfos: types.PeerInfo[] };
            // } as types.JoinRequest) as types.PeerInfo[];

            this.hostPeerId = host;

            for (const info of peerInfos) {
                this.peerMedia.addPeerInfo(info);
            }
            this.updatePeerCallback();

            this.joined = true;

        } catch (err) {
            logger.error('Fail to join the meeting', err);
            await this.leaveMeeting();
            return Promise.reject('Fail to join the meeting');
        }
    }

    public async onSignalingDisconnect()
    {
        logger.warn('Socket Disconnected');
        if (this.joined) {
            await this.reconnect();
        }
    }

    public async reconnect()
    {
        logger.info('Socket trying to reconnect...');
        await this.leaveMeeting(true);
        await this.joinMeeting(this.roomToken, this.userToken, this.displayName, this.deviceName);

        let tracks: MediaStreamTrack[] = [];
        this.sendingTracks.forEach((track) => {
            tracks.push(track);
        })
        await this.sendMediaStream(new MediaStream(tracks));
        logger.info('Socket reconnected');
    }


    public async sendMediaStream(stream: MediaStream): Promise<void>
    {
        try {
            const tracks = stream.getTracks();
            let videoTrackCount = 0;
            let audioTrackCount = 0;
            for (const track of tracks) {
                let source: string = null;
                let params: mediasoupTypes.ProducerOptions = null;
                if (track.kind === 'video') {
                    source = `Video_from_${this.userToken}_track${++videoTrackCount}`;
                    params = {
                        track,
                        appData: { source },
                        codec: this.device.rtpCapabilities.codecs.find(codec => codec.mimeType === 'video/H264')
                    }
                } else {
                    source = `Audio_from_${this.userToken}_track${++audioTrackCount}`;
                    params = {
                        track,
                        appData: { source },
                    }
                }

                const producer = await this.sendTransport.produce(params);

                producer.on('transportclose', () => {
                    logger.info(`[Producer event]  ${source}_transport_close`);
                    if (!producer.closed) {
                        producer.close();
                    }
                    this.producers.delete(track.id);
                });

                producer.on('trackended', () => {
                    logger.info(`[Producer event]  ${source}_track_ended`);
                    this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
                    if (!producer.closed) {
                        producer.close();
                    }
                    this.producers.delete(track.id);
                });

                this.producers.set(track.id, producer);

                logger.info(`Producing ${source}`);
                this.sendingTracks.set(track.id, track);
            }
        } catch (err) {
            logger.error('Fail to send MediaStream', err);
            return Promise.reject('Fail to send MediaStream');
        }
    }

    // if _toPeerId == null, it means broadcast to everyone in the meetings
    public async sendText(_toPeerId: string, _text: string): Promise<void>
    {
        try {
            const message: types.SendPeerMessage = {
                toPeerId: _toPeerId,
                text: _text,
            } as types.SendPeerMessage;

            await this.signaling.sendRequest(SignalMethod.sendMessage, message);

        } catch (err) {
            logger.error('Fail to send peer message');
            return Promise.reject('Fail to send peer message');
        }
    }

    public async leaveMeeting(reconnect: boolean = false)
    {
        this.joined = false;
        this.permissionUpdated = false;
        this.allowed = false;

        if (this.signaling && this.signaling.isConnected())
            await this.signaling.sendRequest(SignalMethod.close);

        if (this.producers)
            this.producers.clear();

        if (this.peerMedia)
            this.peerMedia.clear();

        this.sendTransportOpt = null;
        this.hostPeerId = null;
        this.device = new mediasoupClient.Device();

        if (this.sendTransport && !this.sendTransport.closed) {
            this.sendTransport.close();
        }
        this.sendTransport = null;

        if (this.recvTransport && !this.recvTransport.closed) {
            this.recvTransport.close();
        }
        this.recvTransport = null;

        if (this.sendingTracks && !reconnect) {
            this.sendingTracks.clear();
        }
        this.signaling.disconnect();
        this.signaling = null;
    }

    public async closeTrack(track: MediaStreamTrack)
    {
        const producer = this.producers.get(track.id);
        console.log(producer);
        await this.signaling.sendRequest(SignalMethod.closeProducer, {producerId: producer.id});
        if (!this.producers.get(track.id).closed) {
            this.producers.get(track.id).close();
        }
        this.producers.delete(track.id);
        this.sendingTracks.delete(track.id);
    }

    private async createSendTransport()
    {
        this.sendTransportOpt = await this.signaling.sendRequest(SignalMethod.createTransport, {
            transportType: TransportType.producer,
            sctpCapabilities: this.device.sctpCapabilities,
        } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions;

        logger.info('sendTransportOptions received');

        this.sendTransport = this.device.createSendTransport(this.sendTransportOpt);

        this.sendTransport.on('connect', async ({dtlsParameters}, done) => {
            logger.info('[Transport event]  event: connect, handled by sendTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport, {
                    transportId: this.sendTransport.id,
                    dtlsParameters,
                } as types.ConnectTransportRequest);
            done();
        });

        this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, done, errBack) => {
            logger.info('[Transport event]  event: produce, handled by sendTransport');
            try {
                // producerId
                const {producerId} = await this.signaling.sendRequest(
                    SignalMethod.produce, {
                        transportId : this.sendTransport.id,
                        kind,
                        rtpParameters,
                        appData
                    }) as {producerId: string};
                done({id: producerId});
            } catch (err) {
                errBack(err);
            }
        });
    }

    private async createRecvTransport()
    {
        this.recvTransport = this.device.createRecvTransport(
            await this.signaling.sendRequest(SignalMethod.createTransport, {
                transportType: TransportType.consumer,
                sctpCapabilities: this.device.sctpCapabilities,
            } as types.CreateTransportRequest) as mediasoupTypes.TransportOptions
        );

        this.recvTransport.on('connect', async ({dtlsParameters}, done) => {
            logger.info('[Transport event]  event: connect, handled by recvTransport');
            await this.signaling.sendRequest(
                SignalMethod.connectTransport, {
                    transportId: this.recvTransport.id,
                    dtlsParameters,
                } as types.ConnectTransportRequest);
            done();
        });
    }

    private registerSignalingListeners()
    {
        this.signaling.registerListener(SignalType.notify, SignalMethod.allowed, ({ allowed }) => {
            logger.info(`[Signaling]  Handling allowed notification with allowed = ${allowed} ...`);
            this.permissionUpdated = true;
            this.allowed = allowed;
            this.eventEmitter.emit('permissionUpdated');
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newPeer, async (data: types.PeerInfo) => {
            logger.info('[Signaling]  Handling newPeer notification...');
            this.peerMedia.addPeerInfo(data);
            logger.info(`[Signaling]  Add peerId = ${data.id}`);
            this.updatePeerCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newConsumer, async (data: types.ConsumerInfo) => {
            logger.info('[Signaling]  Handling newConsumer notification...');
            const consumer = await this.recvTransport.consume({
                id            : data.consumerId,
                producerId    : data.producerId,
                kind          : data.kind,
                rtpParameters : data.rtpParameters
            });
            logger.info('[Signaling]  Creating consumer kind = ' + data.kind);
            const { track } = consumer;
            console.log('Received track', track);
            logger.info(`[Signaling]  Add trackId = ${track.id} sent from peerId = ${data.producerPeerId}`);
            this.peerMedia.addConsumerAndTrack(data.producerPeerId, consumer, track);
            this.updatePeerCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.consumerClosed, ({ consumerId }) => {
            logger.info('[Signaling]  Handling consumerClosed notification...');
            logger.info(`[Signaling]  Delete consumer id = ${consumerId}`);
            this.peerMedia.deleteConsumerAndTrack(consumerId);
            this.updatePeerCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.peerClosed, ({ peerId }) => {
            logger.info('[Signaling]  Handling peerClosed notification...');
            logger.info(`[Signaling]  Delete peer id = ${peerId}`);
            this.peerMedia.deletePeer(peerId);
            this.updatePeerCallback();
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.newMessage, (message: types.RecvPeerMessage) => {
            logger.info('[Signaling]  Handling newMessage notification...');
            logger.info(`[Signaling]  Message received from peer peerId = ${message.fromPeerId}`);
            this.newMessageCallback(message);
        });

        this.signaling.registerListener(SignalType.notify, SignalMethod.hostChanged, ({ newHostId }) => {
            logger.info(`[Signaling]  Handling hostChanged notification...`);
            logger.info(`[Signaling]  Host of the meeting changed from ${this.hostPeerId} to ${newHostId}`);
            this.hostPeerId = newHostId;
            this.updatePeerCallback();
        });
    }
}
