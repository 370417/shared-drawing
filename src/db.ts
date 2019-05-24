/**
 * Informal Schema
 * 
 * - users collection
 *   document id: user id
 *   - email
 *   - rooms subcollection
 *     document id: other person's uid
 *     - imageUrl (for storage)
 *     - signal map: (represents signal sent from user id to peer uid)
 *       - type: 'offer' | 'answer' | 'ice'
 *       - content: stringified JSON of either sdp (RTCSessionDescription) or ice 
 *         (RTCIceCandidate)
 */

export function sendSignal(
    db: firebase.firestore.Firestore,
    targetId: string,
    userId: string,
    type: 'offer' | 'answer' | 'ice',
    content: string,
) {
    const userRef = db.collection('users').doc(userId);
    const signalRef = userRef.collection('rooms').doc(targetId);
    signalRef.update({
        signal: {
            type,
            content,
        },
    });
}

export const TARGET_NOT_FOUND = 'Target user not found in database';

/**
 * Add a user & related info to the db on signup if necessary.
 */
export async function signInSetup(
    db: firebase.firestore.Firestore,
    user: firebase.User,
    targetEmail: string
): Promise<string> {
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        await userRef.set({ email: user.email });
    }
    const targetSnapshot = await db.collection('users').where('email', '==', targetEmail).get();
    if (targetSnapshot.empty) {
        throw new Error(TARGET_NOT_FOUND);
    }
    const roomDoc = await targetSnapshot.docs[0].ref.get();
    if (!roomDoc.exists) {
        await roomDoc.ref.set({ imageUrl: createImageUrl(roomDoc.id, targetEmail, user) });
    }
    return targetSnapshot.docs[0].id;
}

/**
 * Determines the path of the images in storage.
 * 
 * This function will be called by both users in a room. To ensure the function
 * returns the same result regardless of which user's perspective we take, we
 * put uids in order based on email lexicographic order.
 */
function createImageUrl(targetUid: string, targetEmail: string, user: firebase.User) {
    if ((user.email || '') < targetEmail) {
        return `${user.uid}/${targetUid}.png`;
    } else {
        return `${targetUid}/${user.uid}.png`;
    }
}
