import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../Types";
import {config} from "../../Constants.js"

const defaultPeerInfo: types.PeerInfo = {
    id: 'defaultUser_defaultUser',
    avatar: config.unKnownUri,
    displayName: 'defaultUser',
    device: 'defaultDevice'
}

class PeerDetail
{
    private _hasAudio: boolean = null;
    private _hasVideo: boolean = null;
    private peerInfo: types.PeerInfo = null;
    // consumerId ==> ConsumeDetail
    private consumerDetails: Map<string, types.ConsumerDetail> = null;
    private readonly createConsumer: (consumerInfo: types.ConsumerInfo) => Promise<mediasoupTypes.Consumer> = null;

    constructor(createConsumer: (consumerInfo: types.ConsumerInfo) => Promise<mediasoupTypes.Consumer>)
    {
        this._hasAudio = false;
        this._hasVideo = false;
        this.consumerDetails = new Map<string, types.ConsumerDetail>();
        this.createConsumer = createConsumer;
    }

    public setPeerInfo(peerInfo: types.PeerInfo)
    {
        this.peerInfo = peerInfo;
    }

    public addConsumerInfo(consumerInfo: types.ConsumerInfo)
    {
        this.consumerDetails.set(consumerInfo.consumerId, { consumerInfo });

        if (consumerInfo.kind === 'audio')
            this._hasAudio = true;
        else if (consumerInfo.kind === 'video')
            this._hasVideo = true;
    }

    public deleteConsumer(consumerId: string)
    {
        if (this.consumerDetails.has(consumerId)) {
            if (!this.consumerDetails.get(consumerId).consumer.closed) {
                this.consumerDetails.get(consumerId).consumer.close();
            }
            this.consumerDetails.delete(consumerId);
        }
        this.updateMediaStatus();
    }

    public getConsumerIds()
    {
        let consumerIds: string[] = [];
        this.consumerDetails.forEach((consumerDetail, consumerId) => {
            consumerIds.push(consumerId);
        })
        return consumerIds;
    }

    public getPeerInfo()
    {
        if (this.peerInfo)
            return this.peerInfo;
        else
            return defaultPeerInfo;
    }

    public async getTracks()
    {
        let tracks: MediaStreamTrack[] = [];

        // @ts-ignore
        for (let consumerDetail of this.consumerDetails.values()) {
            console.log('[Consumer]  Creating consumer kind = ' + consumerDetail.consumerInfo.kind);
            const consumer = await this.createConsumer(consumerDetail.consumerInfo);
            const { track } = consumer;
            console.log('[Consumer]  Received track', track);
            tracks.push(track);
            consumerDetail.track = track;
            console.log(`[Signaling]  Add trackId = ${track.id} sent from peerId = ${consumerDetail.consumerInfo.producerPeerId}`);
            consumerDetail.consumer = consumer;
        }
        return tracks;
    }

    public hasVideo()
    {
        return this._hasVideo;
    }

    public hasAudio()
    {
        return this._hasAudio;
    }

    public closeConsumers()
    {
        this.consumers.forEach((consumer) => {
            if (!consumer.closed) {
                consumer.close();
            }
        })
    }

    private updateMediaStatus()
    {
        this._hasAudio = false;
        this._hasVideo = false;
        this.tracks.forEach((track) => {
            if (track.kind === 'video')
                this._hasVideo = true;
            else if (track.kind === 'audio')
                this._hasAudio = true;
        });
    }
}

export class PeerMedia
{
    // peerId ==> PeerDetail
    private peerId2Details: Map<string, PeerDetail> = null;
    private consumerId2Details: Map<string, PeerDetail> = null;
    private readonly createConsumer: (consumerInfo: types.ConsumerInfo) => Promise<mediasoupTypes.Consumer> = null;

    constructor(createConsumer: (consumerInfo: types.ConsumerInfo) => Promise<mediasoupTypes.Consumer>)
    {
        this.createConsumer = createConsumer;
        this.peerId2Details = new Map<string, PeerDetail>();
        this.consumerId2Details = new Map<string, PeerDetail>();
    }

    public addPeerInfo(peerInfo: types.PeerInfo): void
    {
        const peerId = peerInfo.id;
        if (!this.peerId2Details.has(peerId)) {
            const peerDetail = new PeerDetail(this.createConsumer);
            peerDetail.setPeerInfo(peerInfo);
            this.peerId2Details.set(peerId, peerDetail);
        } else {
            this.peerId2Details.get(peerId).setPeerInfo(peerInfo);
        }
    }

    public addConsumerInfo(peerId: string, consumer: mediasoupTypes.Consumer, track: MediaStreamTrack): void
    {
        if (this.consumerId2Details.has(consumer.id))
            return;

        if (!this.peerId2Details.has(peerId)) {
            const peerDetail = new PeerDetail(this.createConsumer);
            peerDetail.addConsumerInfo(consumer, track);
            this.peerId2Details.set(peerId, peerDetail);
            this.consumerId2Details.set(consumer.id, peerDetail);
        } else {
            const peerDetail = this.peerId2Details.get(peerId);
            peerDetail.addConsumerInfo(consumer, track);
            this.consumerId2Details.set(consumer.id, peerDetail);
        }
    }

    public deleteConsumerAndTrack(consumerId: string)
    {
        if (!this.consumerId2Details.has(consumerId))
            return;

        this.consumerId2Details.get(consumerId).deleteConsumer(consumerId);
    }

    public deletePeer(peerId: string)
    {
        if (!this.peerId2Details.has(peerId))
            return;

        const peerDetail = this.peerId2Details.get(peerId);

        const consumerIds = peerDetail.getConsumerIds();
        consumerIds.forEach((consumerId) => {
            this.consumerId2Details.delete(consumerId);
        });

        peerDetail.closeConsumers();
        peerDetail.closeConsumers();
        this.peerId2Details.delete(peerId);
    }

    public getPeerDetails(): PeerDetail[]
    {
        let peerDetails = [];
        this.peerId2Details.forEach((peerDetail) => {
            peerDetails.push(peerDetail);
        })
        return peerDetails;
    }

    public clear()
    {
        this.peerId2Details.forEach((peerDetail) => {
            peerDetail.closeConsumers();
        });
        this.peerId2Details.clear();
        this.consumerId2Details.clear();
    }

    public getPeerDetailByPeerId(peerId: string)
    {
        return this.peerId2Details.get(peerId);
    }
}
