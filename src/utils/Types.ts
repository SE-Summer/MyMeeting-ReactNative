import {types as mediasoupTypes} from "mediasoup-client";
import {MediaKind, TransportType} from "../ServiceConfig";
import {Moment} from "moment";
import {SctpStreamParameters} from "mediasoup-client/lib/SctpParameters";

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
    id: number,
    avatar: string,
    displayName: string,
    device: string,
};

export declare type ConsumerInfo = {
    producerPeerId: number,
    consumerId: string,
    producerId: string,
    kind: MediaKind,
    rtpParameters : mediasoupTypes.RtpParameters
}

export declare type ConsumerDetail = {
    consumerInfo: ConsumerInfo,
    consumer?: mediasoupTypes.Consumer,
    track?: MediaStreamTrack,
}

export declare type DataConsumerInfo = {
    producerPeerId: number,
    dataProducerId: string,
    dataConsumerId: string,
    sctpParameters: SctpStreamParameters,
    protocol: string,
    label: string
}

export declare type SendText = {
    toPeerId: number,
    text: string,
    timestamp: Moment,
}

export declare type RecvText = {
    fromPeerId: number,
    broadcast: boolean,
    text: string,
    timestamp: Moment,
}

export declare type SendFile = {
    fileURL: string,
    timestamp: Moment,
    filename: string,
    fileType: string,
}

export declare type RecvFile = {
    fromPeerId: number,
    fileURL: string,
    timestamp: Moment,
    filename: string,
    fileType: string,
}

export enum MessageType {
    file,
    text,
}

export enum FileJobType {
    upload,
    download,
}

export enum FileJobStatus {
    progressing,
    completed,
    failed,
    unDownloaded,
}

export declare type FileJob = {
    status: FileJobStatus,
    totalBytes: number,
    bytesSent: number,
    filePath: string,
}

export declare type FileInfo = {
    uri: string,
    path: string,
    name: string,
    type: string,
    size: number,
}

export declare type Message = {
    type: MessageType,
    timestamp: Moment,
    fromMyself: boolean,
    fromPeerId?: number,
    broadcast?: boolean,
    text?: string,
    fileJobType?: FileJobType,
    fileURL?: string,
    filename?: string,
    fileType?: string,
    fileJobStatus?: FileJobStatus,
    totalBytes?: number,
    bytesSent?: number,
    filePath?: string,
}

export declare type SpeechText = {
    newSentence: boolean,
    sentenceEnded: boolean,
    startTime: Moment,
    updateTime: Moment,
    fromMyself: boolean,
    fromPeerId: number,
    displayName: string,
    text: string,
}
