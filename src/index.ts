import 'webrtc-adapter';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import './firebase-init';
import { setupCanvas } from './draw';
import { Room } from './rtc';

const db = firebase.firestore();

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const video = document.getElementById('video') as HTMLVideoElement;

firebase.auth().onAuthStateChanged(function(user) {
    const encodedTargetUid = new URLSearchParams(window.location.search).get('target');
    if (user && encodedTargetUid) {
        const targetUid = decodeURIComponent(encodedTargetUid);
        // User is signed in and targetEmail is known.
        if (user.email) {
            setupCanvas(canvas);
            // @ts-ignore (captureStream is not stable yet)
            const stream: MediaStream = canvas.captureStream(10);
            const track = stream.getTracks()[0];
            new Room(
                db,
                targetUid,
                user.uid,
                track,
                stream,
                (event) => video.srcObject = event.streams[0],
            );
            // const connection = createPeerConnection(db, targetUid, user.uid, track, stream, function(event) {
            //     if (video instanceof HTMLVideoElement) {
            //         video.srcObject = event.streams[0];
            //     }
            // });
            // receiveSignals(db, targetUid, user.uid, connection);
        }
    } else {
        // User is signed out and/or targetEmail is not set.
        console.log(`${user} ${encodedTargetUid}`);
        window.location.href = `${window.location.origin}/signin/`;
    }
});

const storageRef = firebase.storage().ref();
const pngMetadata = {
    contentType: 'image/png',
};

function saveCanvas(path: string) {
    const canvas = document.getElementById('canvas');
    if (canvas instanceof HTMLCanvasElement) {
        canvas.toBlob((blob) => {
            storageRef.child(path).put(blob, pngMetadata);
        });
    }
}

function loadCanvas(path: string) {
    storageRef.child(path).getDownloadURL().then(function(url) {
        const img = new Image();
        img.onload = function() {

        };
        img.src = url;
    }).catch(console.error);
}
