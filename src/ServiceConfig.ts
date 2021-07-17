const config = {
    serverIp: '192.168.0.101',
    serverHttpPort: 4443,
    serverUseHttps: false,
    getRouterRtpCapabilitiesRequest: '/getRouterRtpCapabilities',
    createProducerTransportRequest: '/createProducerTransport',
    connectTransportRequest: '/connectTransport',
    createProducerRequest: '/createProducer',
}

const serverHttpURL = (config.serverUseHttps ? 'https://' : 'http://') + config.serverIp + ':' + config.serverHttpPort;

export const serviceConfig = {
    serverIp: config.serverIp,
    serverHttpPort: config.serverHttpPort,
    serverHttpURL: serverHttpURL,
    getRouterRtpCapabilitiesURL: serverHttpURL + config.getRouterRtpCapabilitiesRequest,
    createProducerTransportURL: serverHttpURL + config.createProducerRequest,
    connectTransportURL: serverHttpURL + config.connectTransportRequest,
    createProducerURL: serverHttpURL + config.createProducerRequest,
}
