import {types as mediasoupTypes} from "mediasoup-client";
import {MediaKind, TransportType} from "../ServiceConfig";

export declare type JoinRequest = {
    displayName: string,
    joined: boolean,
    device: string,
    rtpCapabilities: mediasoupTypes.RtpCapabilities,
};

export declare type CreateTransportRequest = {
    transportType: TransportType,
    sctpCapabilities: mediasoupTypes.SctpCapabilities,
};

export declare type ConnectTransportRequest = {
    transportId: string,
    dtlsParameters: mediasoupTypes.DtlsParameters
};

export declare type PeerInfo = {
    id: string,
    displayName: string,
    device: string,
};

export declare type ConsumerInfo = {
    producerPeerId: string,
    consumerId: string,
    producerId: string,
    kind: MediaKind,
    rtpParameters : mediasoupTypes.RtpParameters
}

