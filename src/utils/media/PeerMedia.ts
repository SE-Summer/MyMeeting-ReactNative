import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../Types";
import {config} from "../../Constants.js"

const defaultPeerInfo: types.PeerInfo = {
    id: 0,
    avatar: config.unKnownUri,
    displayName: 'defaultUser',
    device: 'defaultDevice'
}

class PeerDetail
{
    private _hasAudio: boolean = null;
    private _hasVideo: boolean = null;
    private readonly peerId: number = null;
    private peerInfo: types.PeerInfo = null;
    // consumerId ==> Consumer
    private consumers: Map<string, mediasoupTypes.Consumer> = null;
    constructor(peerId: number)
    {
        this.peerId = peerId;
        this._hasAudio = false;
        this._hasVideo = false;
        this.consumers = new Map<string, mediasoupTypes.Consumer>();
    }

    public setPeerInfo(peerInfo: types.PeerInfo)
    {
        this.peerInfo = peerInfo;
    }

    public addConsumer(consumer: mediasoupTypes.Consumer)
    {
        this.consumers.set(consumer.id, consumer);

        if (consumer.kind === 'audio')
            this._hasAudio = true;
        else if (consumer.kind === 'video')
            this._hasVideo = true;
    }

    public deleteConsumer(consumerId: string)
    {
        if (this.consumers.has(consumerId)) {
            if (!this.consumers.get(consumerId).closed) {
                this.consumers.get(consumerId).close();
            }
            this.consumers.delete(consumerId);
        }

        this.updateMediaStatus();
    }

    public getConsumerIds()
    {
        const consumerIds: string[] = [];
        this.consumers.forEach((consumer, consumerId) => {
            consumerIds.push(consumerId);
        })
        return consumerIds;
    }

    public getPeerInfo()
    {
        if (this.peerInfo)
            return this.peerInfo;
        else {
            const peerInfo = defaultPeerInfo;
            peerInfo.id = this.peerId;
            return peerInfo;
        }
    }

    public getTracks()
    {
        const tracks: MediaStreamTrack[] = [];
        this.consumers.forEach((consumer) => {
            if (consumer.paused) {
                consumer.emit('resume');
                consumer.resume();
            }
            tracks.push(consumer.track);
        });
        return tracks;
    }

    public getVideoTracks()
    {
        const tracks: MediaStreamTrack[] = [];
        this.consumers.forEach((consumer) => {
            if (consumer.kind === 'video') {
                if (consumer.paused) {
                    consumer.emit('resume');
                    consumer.resume();
                }
                tracks.push(consumer.track);
            }
        });
        return tracks;
    }

    public getAudioTracks()
    {

        const tracks: MediaStreamTrack[] = [];
        this.consumers.forEach((consumer) => {
            if (consumer.kind === 'audio') {
                if (consumer.paused) {
                    consumer.emit('resume');
                    consumer.resume();
                }
                tracks.push(consumer.track);
            }
        });
        return tracks;
    }

    public subscribe()
    {
        this.consumers.forEach((consumer) => {
            if (consumer.paused) {
                consumer.emit('resume');
                consumer.resume();
            }
        });
    }

    public unsubscribeVideo()
    {
        this.consumers.forEach((consumer) => {
            if (consumer.kind === 'video') {
                if (!consumer.paused) {
                    consumer.emit('pause');
                    consumer.pause();
                }
            }
        });
    }

    public hasVideo()
    {
        return this._hasVideo;
    }

    public hasAudio()
    {
        return this._hasAudio;
    }

    public clearConsumers()
    {
        this.consumers.forEach((consumer) => {
            if (!consumer.closed) {
                consumer.close();
            }
        });
        this.consumers.clear();
    }

    private updateMediaStatus()
    {
        this._hasAudio = false;
        this._hasVideo = false;
        this.consumers.forEach((consumer) => {
            if (consumer.kind === 'video')
                this._hasVideo = true;
            else if (consumer.kind === 'audio')
                this._hasAudio = true;
        });
    }
}

export class PeerMedia
{
    // peerId ==> PeerDetail
    private peerId2Details: Map<number, PeerDetail> = null;
    private consumerId2Details: Map<string, PeerDetail> = null;

    constructor()
    {
        this.peerId2Details = new Map<number, PeerDetail>();
        this.consumerId2Details = new Map<string, PeerDetail>();
    }

    public addPeerInfo(peerInfo: types.PeerInfo): void
    {
        const peerId = peerInfo.id;
        if (this.peerId2Details.has(peerId)) {
            this.peerId2Details.get(peerId).setPeerInfo(peerInfo);
        } else {
            const peerDetail = new PeerDetail(peerId);
            peerDetail.setPeerInfo(peerInfo);
            this.peerId2Details.set(peerId, peerDetail);
        }
    }

    public addConsumer(peerId: number, consumer: mediasoupTypes.Consumer): void
    {
        if (this.consumerId2Details.has(consumer.id))
            return;

        if (this.peerId2Details.has(peerId)) {
            const peerDetail = this.peerId2Details.get(peerId);
            peerDetail.addConsumer(consumer);
            this.consumerId2Details.set(consumer.id, peerDetail);
        } else {
            const peerDetail = new PeerDetail(peerId);
            peerDetail.addConsumer(consumer);
            this.peerId2Details.set(peerId, peerDetail);
            this.consumerId2Details.set(consumer.id, peerDetail);
        }
    }

    public deleteConsumer(consumerId: string)
    {
        if (this.consumerId2Details.has(consumerId)) {
            this.consumerId2Details.get(consumerId).deleteConsumer(consumerId);
        }
    }

    public deletePeer(peerId: number)
    {
        if (!this.peerId2Details.has(peerId))
            return;

        const peerDetail = this.peerId2Details.get(peerId);

        const consumerIds = peerDetail.getConsumerIds();
        consumerIds.forEach((consumerId) => {
            this.consumerId2Details.delete(consumerId);
        });

        peerDetail.clearConsumers();
        this.peerId2Details.delete(peerId);
    }

    public getPeerDetails(): PeerDetail[]
    {
        const peerDetails = [];
        this.peerId2Details.forEach((peerDetail) => {
            peerDetails.push(peerDetail);
        })
        return peerDetails;
    }

    public clear()
    {
        this.peerId2Details.forEach((peerDetail) => {
            peerDetail.clearConsumers();
        });
        this.peerId2Details.clear();
        this.consumerId2Details.clear();
    }

    public getPeerDetailByPeerId(peerId: number)
    {
        return this.peerId2Details.get(peerId);
    }
}
