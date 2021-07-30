
export const closeMediaStream: (MediaStream) => void = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
    })
}

export const timeoutCallback = (callback, timeout: number) => {
    let called = false;

    const interval = setTimeout(() => {
        if (called) {
            return;
        }
        called = true;
        callback(new Error('Waiting timeout'), null);
    }, timeout);

    return (...args) => {
        if (called) {
            return;
        }
        called = true;
        clearTimeout(interval);

        callback(...args);
    };
};
