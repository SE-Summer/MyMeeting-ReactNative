const config = {
    serverIp: '172.20.10.10',
    serverHttpPort: 4443,
    serverUseHttps: false,
    getRouterRtpCapabilitiesRequest: '/getRouterRtpCapabilities',
    createProducerTransportRequest: '/createProducerTransport',
    connectTransportRequest: '/connectTransport',
    createProducerRequest: '/createProducer',
    produceRequest: '/produce',
}

export const SIMULCASTENCODING: RTCRtpEncodingParameters[] = [
    {maxBitrate: 100000},
    {maxBitrate: 300000},
    {maxBitrate: 900000}
];

const serverHttpURL = (config.serverUseHttps ? 'https://' : 'http://') + config.serverIp + ':' + config.serverHttpPort;

export const serviceConfig = {
    serverIp: config.serverIp,
    serverHttpPort: config.serverHttpPort,
    serverHttpURL: serverHttpURL,
    getRouterRtpCapabilitiesURL: serverHttpURL + config.getRouterRtpCapabilitiesRequest,
    createProducerTransportURL: serverHttpURL + config.createProducerTransportRequest,
    connectTransportURL: serverHttpURL + config.connectTransportRequest,
    createProducerURL: serverHttpURL + config.createProducerRequest,
    produceURL: serverHttpURL + config.produceRequest,
}
