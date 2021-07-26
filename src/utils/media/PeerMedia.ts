import {types as mediasoupTypes} from "mediasoup-client";
import * as types from "../Types";

class PeerDetail
{
    private peerInfo: types.PeerInfo = null;
    // consumerId ==> Consumer
    private consumers: Map<string, mediasoupTypes.Consumer> = null;
    // consumerId ==> MediaStreamTrack
    private tracks: Map<string, MediaStreamTrack> = null;
    constructor()
    {
        this.consumers = new Map<string, mediasoupTypes.Consumer>();
        this.tracks = new Map<string, MediaStreamTrack>();
    }

    public setPeerInfo(peerInfo: types.PeerInfo)
    {
        this.peerInfo = peerInfo;
    }

    public addConsumerAndTrack(consumer: mediasoupTypes.Consumer, track: MediaStreamTrack)
    {
        this.consumers.set(consumer.id, consumer);
        this.tracks.set(consumer.id, track);
    }

    public deleteConsumerAndTrack(consumerId: string)
    {
        this.consumers.delete(consumerId);
        this.tracks.delete(consumerId);
    }

    public getConsumerIds()
    {
        let consumerIds: string[] = [];
        this.consumers.forEach((consumer, consumerId) => {
            consumerIds.push(consumerId);
        })
        return consumerIds;
    }

    public getPeerInfo()
    {
        return this.peerInfo;
    }

    public getTracks()
    {
        let tracks: MediaStreamTrack[] = [];
        this.tracks.forEach((track) => {
            tracks.push(track);
        });
        return tracks;
    }
}

export class PeerMedia
{
    // peerId ==> PeerDetail
    private peerId2Details: Map<string, PeerDetail> = null;
    private consumerId2Details: Map<string, PeerDetail> = null;

    constructor()
    {
        this.peerId2Details = new Map<string, PeerDetail>();
        this.consumerId2Details = new Map<string, PeerDetail>();
    }

    public addPeerInfo(peerInfo: types.PeerInfo): void
    {
        const peerId = peerInfo.id;
        if (!this.peerId2Details.has(peerId)) {
            const peerDetail = new PeerDetail();
            peerDetail.setPeerInfo(peerInfo);
            this.peerId2Details.set(peerId, peerDetail);
        } else {
            this.peerId2Details.get(peerId).setPeerInfo(peerInfo);
        }
    }

    public addConsumerAndTrack(peerId: string, consumer: mediasoupTypes.Consumer, track: MediaStreamTrack): void
    {
        if (this.consumerId2Details.has(consumer.id))
            return;

        if (!this.peerId2Details.has(peerId)) {
            const peerDetail = new PeerDetail();
            peerDetail.addConsumerAndTrack(consumer, track);
            this.peerId2Details.set(peerId, peerDetail);
            this.consumerId2Details.set(consumer.id, peerDetail);
        } else {
            const peerDetail = this.peerId2Details.get(peerId);
            peerDetail.addConsumerAndTrack(consumer, track);
        }
    }

    public deleteConsumerAndTrack(consumerId: string)
    {
        if (!this.consumerId2Details.has(consumerId))
            return;

        this.consumerId2Details.get(consumerId).deleteConsumerAndTrack(consumerId);
    }

    public deletePeer(peerId: string)
    {
        if (!this.peerId2Details.has(peerId))
            return;

        const consumerIds = this.peerId2Details.get(peerId).getConsumerIds();
        consumerIds.forEach((consumerId) => {
            this.consumerId2Details.delete(consumerId);
        });
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
        this.peerId2Details.clear();
        this.consumerId2Details.clear();
    }
}
