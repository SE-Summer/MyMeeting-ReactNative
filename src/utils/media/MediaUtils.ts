
export const closeMediaStream: (MediaStream) => void = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
    })
}
