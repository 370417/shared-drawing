import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { baseUrl } from '../firebase-init';
import { signInSetup } from '../db';

const db = firebase.firestore();

const targetInput = document.getElementById('target-email') as HTMLInputElement;
const userInput = document.getElementById('user-email') as HTMLInputElement;

const submitButton = document.getElementById('button') as HTMLButtonElement;
const signOutButton = document.getElementById('signout') as HTMLButtonElement;

const successMsg = document.getElementById('success') as HTMLDivElement;
const invalidMsg = document.getElementById('invalid') as HTMLDivElement;

if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    completeSignIn().catch(function(error) {
        console.error(error);
        hideLoadingAnimation();
    });
} else {
    hideLoadingAnimation();
}

export function getTarget(): Promise<string> {
    const encodedTarget = new URLSearchParams(window.location.search).get('target');
    if (encodedTarget) {
        return Promise.resolve(decodeURIComponent(encodedTarget));
    } else {
        return Promise.reject('Target not found');
    }
}

async function completeSignIn(): Promise<void> {
    const email = window.localStorage.getItem('emailForSignIn')
        || window.prompt('Please provide your email for confirmation') || '';
    const credential = await firebase.auth().signInWithEmailLink(email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
    const targetEmail = await getTarget();
    if (!credential.user) {
        throw new Error('User is undefined.');
    }
    await signInSetup(db, credential.user, targetEmail);
    const encodedEmail = encodeURIComponent(targetEmail);
    window.location.href = `${baseUrl}/?target=${encodedEmail}`;
}

function hideLoadingAnimation(): void {
    const loadingBox = document.getElementById('loading-box') as HTMLDivElement;
    const signinDiv = document.getElementById('signin') as HTMLDivElement;
    loadingBox.style.display = 'none';
    signinDiv.style.display = 'block';
}

interface Emails {
    targetEmail: string,
    userEmail: string,
}

function getValidEmails(): Promise<Emails> {
    if (targetInput.validity.valid && userInput.validity.valid) {
        return Promise.resolve({
            targetEmail: targetInput.value,
            userEmail: userInput.value,
        });
    } else {
        invalidMsg.style.display = 'block';
        submitButton.disabled = true;
        return Promise.reject('Invalid email');
    }
}

function sendSignInLink({ targetEmail, userEmail }: Emails): void {
    submitButton.disabled = true;
    firebase.auth().sendSignInLinkToEmail(userEmail, {
        url: `${baseUrl}/signin/?target=${encodeURIComponent(targetEmail)}`,
        handleCodeInApp: true,
    }).then(() => {
        window.localStorage.setItem('emailForSignIn', userEmail);
        successMsg.style.display = 'block';
    }).catch(console.error);
}

async function navigateToRoom(targetEmail: string, user: firebase.User): Promise<void> {
    submitButton.disabled = true;
    await signInSetup(db, user, targetEmail);
    const encodedEmail = encodeURIComponent(targetEmail);
    window.location.href = `${baseUrl}/?target=${encodedEmail}`;
}

// Wait until signed in status is known before binding button callback
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // user signed in
        userInput.value = user.email || '';
        userInput.disabled = true;
        submitButton.onclick = function() {
            getValidEmails().then(function({ targetEmail }) {
                return navigateToRoom(targetEmail, user);
            }).catch(console.error);
        };
        signOutButton.style.display = 'block';
    } else {
        // user not signed in
        submitButton.onclick = function() {
            getValidEmails().then(sendSignInLink).catch(console.error);
        };
    }   
});

// sign out button
signOutButton.onclick = function() {
    signOutButton.disabled = true;
    firebase.auth().signOut().then(function() {
        signOutButton.style.display = 'none';
        signOutButton.disabled = false;
        userInput.disabled = false;
    }).catch(console.error);
}

// Hide invalid email message when email is edited
const hideInvalidMsg = () => {
    invalidMsg.style.display = 'none';
    submitButton.disabled = false;
};
targetInput.onfocus = hideInvalidMsg;
userInput.onfocus = hideInvalidMsg;
