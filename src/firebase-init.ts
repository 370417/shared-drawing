import firebase from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyBs6iq-5fY4Wauz38-n8_v3jr5PQ8DsGMA",
    authDomain: "signal-diary.firebaseapp.com",
    databaseURL: "https://signal-diary.firebaseio.com",
    projectId: "signal-diary",
    storageBucket: "signal-diary.appspot.com",
    messagingSenderId: "714564832332",
    appId: "1:714564832332:web:44eab73ad6e2d827"
};
firebase.initializeApp(firebaseConfig);

// export const baseUrl = 'https://as-f.github.io/shared-drawing';
export const baseUrl = 'http://localhost:1234'
