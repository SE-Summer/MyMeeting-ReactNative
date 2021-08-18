const config = {
    // serverIp: 'se-summer.cn',
    serverIp: '122.112.175.61',
    serverPort: 4446,
    serverUseHttps: false,
}

export const iflytekAPPID = '2d2edf67';

export const SIMULCASTENCODING: RTCRtpEncodingParameters[] = [
    {maxBitrate: 100000},
    {maxBitrate: 300000},
    {maxBitrate: 700000}
];

const _serverURL = (config.serverUseHttps ? 'https://' : 'http://') + config.serverIp + ':' + config.serverPort;

export const fileUploadURL = (userToken: string) => {
    return `${_serverURL}/file?token=${userToken}`;
}

export const meetingURL = (roomToken: string, userToken: string, myId) => {
    return `${serviceConfig.serverURL}/room?roomId=${roomToken}&peerId=${myId}&userToken=${userToken}`;
}

export const serviceConfig = {
    requestTimeout: 10000,
    connectTimeout: 20000,
    reconnectTimeout: 60000,
    mediaTimeout: 10000,
    allowTimeout: 10000,
    serverIp: config.serverIp,
    serverPort: config.serverPort,
    serverURL: _serverURL,
}

export enum SignalType {
    request = 'request',
    notify = 'notify'
}

export enum MediaKind {
    video = 'video',
    audio = 'audio'
}

export enum TransportType {
    producer = 'producer',
    consumer = 'consumer'
}

export enum SignalMethod {
    getRouterRtpCapabilities = 'getRouterRtpCapabilities',
    join = 'join',
    createTransport = 'createTransport',
    connectTransport = 'connectTransport',
    produce = 'produce',
    produceData = 'produceData',
    consume = 'consume',
    closeProducer = 'closeProducer',
    pauseProducer = 'pauseProducer',
    resumeProducer = 'resumeProducer',
    pauseConsumer = 'pauseConsumer',
    resumeConsumer = 'resumeConsumer',
    newConsumer = 'newConsumer',
    newDataConsumer = 'newDataConsumer',
    newPeer = 'newPeer',
    consumerClosed = 'consumerClosed',
    dataConsumerClosed = 'dataConsumerClosed',
    peerClosed = 'peerClosed',
    closeRoom = 'closeRoom',
    sendText = 'sendText',
    newText = 'newText',
    sendFile = 'sendFile',
    newFile = 'newFile',
    hostChanged = 'hostChanged',
    connectMeeting = 'connectMeeting',
    allowed = 'allowed',
    mute = 'mute',
    restartIce = 'restartIce',
    roomClosed = 'roomClosed',
    transferHost = 'transferHost',
    kick = 'kick',
    kicked = 'kicked',
    beMuted = 'beMuted',
    getStatus = 'getStat',
    sendSpeechText = 'sendSpeechText',
    newSpeechText = 'newSpeechText',
}

export enum MeetingEndReason {
    notAllowed = 'notAllowed',
    lostConnection = 'lostConnection',
    roomClosed = 'roomClosed',
    kicked = 'kicked',
}

export const socketConnectionOptions = {
    // timeout: 3000,
    reconnection: true,
    autoConnect: false,
    reconnectionAttempts: Infinity,
    reconnectionDelayMax: 2000,
    // transports: ['websocket'],
}
