export class MediaService
{
    async getLocalCamera()
    {
        const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    }
}
