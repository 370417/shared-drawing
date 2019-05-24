import { sendSignal } from './db';

export function createPeerConnection(
    db: firebase.firestore.Firestore,
    targetId: string,
    userId: string,
    track: MediaStreamTrack,
    stream: MediaStream,
    onAddTrack: (event: RTCTrackEvent) => any,
): RTCPeerConnection {
    const connection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.stunprotocol.org:3478' },
            { urls: 'stun:stun.l.google.com:19302' },
        ]
    });
    connection.ontrack = onAddTrack;
    connection.onnegotiationneeded = onNegotioationNeeded;
    connection.onicecandidate = onIceCandidate;
    connection.oniceconnectionstatechange = onIceConnectionStateChange;

    connection.addTrack(track, stream);

    function onNegotioationNeeded() {
        connection.createOffer().then(function(offer) {
            return connection.setLocalDescription(offer);
        }).then(function() {
            if (!connection.localDescription) {
                throw 'localDescription is null';
            }
            const content = JSON.stringify(connection.localDescription);
            sendSignal(db, targetId, userId, 'offer', content);
        }).catch(console.error);
    }

    function onIceCandidate(event: RTCPeerConnectionIceEvent) {
        if (event.candidate) {
            sendSignal(db, targetId, userId, 'ice', JSON.stringify(event.candidate));
        }
    }

    function onIceConnectionStateChange(event: Event) {
        switch (connection.iceConnectionState) {
            case 'closed':
            case 'disconnected':
            case 'failed':
                // stop the stream
                break;
        }
    }

    return connection;
}
