const config = {
    // serverIp: 'se-summer.cn',
    serverIp: '192.168.0.106',
    serverPort: 4446,
    serverUseHttps: false,
}

export const SIMULCASTENCODING: RTCRtpEncodingParameters[] = [
    {maxBitrate: 100000},
    {maxBitrate: 300000},
    {maxBitrate: 900000}
];

const _serverURL = (config.serverUseHttps ? 'https://' : 'http://') + config.serverIp + ':' + config.serverPort + '/room';

export const serviceConfig = {
    requestTimeout: 10000,
    connectTimeout: 20000,
    reconnectTimeout: 30000,
    mediaTimeout: 10000,
    allowTimeout: 5000,
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
    consume = 'consume',
    closeProducer = 'closeProducer',
    pauseProducer = 'pauseProducer',
    resumeProducer = 'resumeProducer',
    pauseConsumer = 'pauseConsumer',
    resumeConsumer = 'resumeConsumer',
    newConsumer = 'newConsumer',
    newPeer = 'newPeer',
    consumerClosed = 'consumerClosed',
    peerClosed = 'peerClosed',
    close = 'close',
    sendMessage = 'sendMessage',
    newMessage = 'newMessage',
    hostChanged = 'hostChanged',
    connectMeeting = 'connectMeeting',
    allowed = 'allowed',
    mute = 'mute',
    restartIce = 'restartIce',
}

export const socketConnectionOptions = {
    // timeout: 3000,
    reconnection: true,
    autoConnect: false,
    reconnectionAttempts: Infinity,
    reconnectionDelayMax: 2000,

    // transports: ['websocket'],
}
