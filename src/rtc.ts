import { User } from 'firebase';

export class Room {
    db: firebase.firestore.Firestore;
    targetEmail: string;
    user: User;
    track: MediaStreamTrack;
    stream: MediaStream;
    onAddTrack: (event: RTCTrackEvent) => any;
    connection: RTCPeerConnection;

    constructor(
        db: firebase.firestore.Firestore,
        targetEmail: string,
        user: User,
        track: MediaStreamTrack,
        stream: MediaStream,
        onAddTrack: (event: RTCTrackEvent) => any,
    ) {
        this.db = db;
        this.targetEmail = targetEmail;
        this.user = user;
        this.track = track;
        this.stream = stream;
        this.onAddTrack = onAddTrack;
        this.connection = this.createPeerConnection();

        // begin listening for signals
        const targetUserQuery = db.collection('users').where('email', '==', targetEmail);
        const observer = this.createSignalObserver();
        let unsubscribe: () => void | undefined;
        targetUserQuery.onSnapshot(function (snapshot) {
            if (!snapshot.empty) {
                if (unsubscribe) {
                    unsubscribe();
                }
                const roomRef = snapshot.docs[0].ref.collection('rooms').doc(user.email || '');
                unsubscribe = roomRef.onSnapshot(observer);
            }
        }, console.error);
    }

    private createPeerConnection(): RTCPeerConnection {
        const connection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.stunprotocol.org:3478' },
                { urls: 'stun:stun.l.google.com:19302' },
            ]
        });

        connection.ontrack = this.onAddTrack;
        connection.onnegotiationneeded = this.onNegotiationNeeded.bind(this);
        connection.onicecandidate = this.onIceCandidate.bind(this);
        connection.oniceconnectionstatechange = this.onIceConnectionStateChange.bind(this);
    
        connection.addTrack(this.track, this.stream);

        return connection;
    }

    private closeCurrentConnection() {
        this.connection.ontrack = null;
        this.connection.onnegotiationneeded = null;
        this.connection.onicecandidate = null;
        this.connection.oniceconnectionstatechange = null;
        this.connection.close();
    }

    private sendSignal(
        type: 'offer' | 'answer' | 'ice',
        content: string,
    ) {
        console.log(`sending ${type}`);
        const userRef = this.db.collection('users').doc(this.user.uid);
        const roomRef = userRef.collection('rooms').doc(this.targetEmail);
        roomRef.update({
            signal: {
                type,
                content,
            },
        });
    }

    private onNegotiationNeeded() {
        this.connection.createOffer()
        .then((offer) => this.connection.setLocalDescription(offer))
        .then(() => {
            if (!this.connection.localDescription) {
                throw 'localDescription is null';
            }
            const content = JSON.stringify(this.connection.localDescription);
            this.sendSignal('offer', content);
        }).catch(console.error);
    }

    private onIceCandidate(event: RTCPeerConnectionIceEvent) {
        if (event.candidate) {
            this.sendSignal('ice', JSON.stringify(event.candidate));
        }
    }

    private onIceConnectionStateChange(event: Event) {
        switch (this.connection.iceConnectionState) {
            case 'closed':
            case 'disconnected':
            case 'failed':
                // stop the stream
                break;
        }
    }

    private createSignalObserver() {
        return {
            next: skipFirstCall((snapshot: firebase.firestore.DocumentSnapshot) => {
                const signal = snapshot.get('signal');
                if (!signal || !signal.type || !signal.content) {
                    return;
                }
                const content = JSON.parse(signal.content);
                switch (signal.type) {
                    case 'offer': {
                        console.log('offer detected')
                        this.handleOffer(content).catch(console.error);
                        break;
                    }
                    case 'answer': {
                        console.log('answer detected')
                        this.connection.setRemoteDescription(content).catch(console.error);
                        break;
                    }
                    case 'ice': {
                        console.log('ice detected')
                        this.connection.addIceCandidate(content);
                        break;
                    }
                }
            }),
            error: console.error,
        }
    }

    private async handleOffer(remoteSdp: any) {
        this.closeCurrentConnection();
        this.connection = this.createPeerConnection();
        await this.connection.setRemoteDescription(remoteSdp);
        const answer = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answer);
        const localSdp = JSON.stringify(this.connection.localDescription);
        return this.sendSignal('answer', localSdp);
    }
}

function skipFirstCall<T extends (...args: any[]) => any>(
    func: T
): (...funcArgs: Parameters<T>) => ReturnType<T> | undefined {
    let firstCall = true;
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
        if (firstCall) {
            firstCall = false;
            console.log('first call of function ignored');
            return undefined;
        }
        return func(...args);
    };
}
