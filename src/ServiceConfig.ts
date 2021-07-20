const config = {
    serverIp: '172.20.10.10',
    serverPort: 4443,
    serverUseWss: false,
}

export const SIMULCASTENCODING: RTCRtpEncodingParameters[] = [
    {maxBitrate: 100000},
    {maxBitrate: 300000},
    {maxBitrate: 900000}
];

const _serverWsURL = (config.serverUseWss ? 'wss://' : 'ws://') + config.serverIp + ':' + config.serverPort;

export const serviceConfig = {
    requestTimeout: 10000,
    connectTimeout: 20000,
    serverIp: config.serverIp,
    serverPort: config.serverPort,
    serverWsURL: _serverWsURL,
}

export enum RequestMethod {
    getRouterRtpCapabilitiesRequest = 'getRouterRtpCapabilities',
    join = 'join',
    createTransportRequest = 'createTransport',
    connectTransportRequest = 'connectTransport',
    produceRequest = 'produce',
    consumeRequest = 'consume',
    closeProducer = 'closeProducer',
    pauseProducer = 'pauseProducer',
    resumeProducer = 'resumeProducer',
    pauseConsumer = 'pauseConsumer',
    resumeConsumer = 'resumeConsumer'
}
