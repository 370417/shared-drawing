import 'webrtc-adapter';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import './firebase-init';
import { setupCanvas } from './draw';
import { createPeerConnection } from './rtc';

const db = firebase.firestore();

const canvas = document.getElementById('canvas');
const video = document.getElementById('video');

// The query string can't change without page reload or the history API, which we don't use.
const targetEmail = new URLSearchParams(window.location.search).get('target');

firebase.auth().onAuthStateChanged(function(user) {
    if (user && targetEmail) {
        // User is signed in and targetEmail is known.
        if (user.email && canvas instanceof HTMLCanvasElement) {
            setupCanvas(canvas);
            // @ts-ignore (captureStream is not stable yet)
            const stream: MediaStream = canvas.captureStream(10);
            const track = stream.getTracks()[0];
            createPeerConnection(db, targetEmail, user.email, track, stream, function(event) {
                if (video instanceof HTMLVideoElement) {
                    video.srcObject = event.streams[0];
                }
            });
        }
    } else {
        // User is signed out and/or targetEmail is not set.
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
