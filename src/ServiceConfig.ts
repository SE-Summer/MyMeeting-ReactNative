const config = {
    serverIp: 'se.imoments.com.cn',
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
    serverIp: config.serverIp,
    serverPort: config.serverPort,
    serverWsURL: _serverURL,
}

export enum SignalType {
    request = 'request',
    notify = 'notify'
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
    newPeer = 'newPeer',
}
