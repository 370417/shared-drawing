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
    const targetUid = targetSnapshot.docs[0].id;
    // const targetUserDoc = await targetSnapshot.docs[0].ref.get();
    const roomDoc = await userRef.collection('rooms').doc(targetUid).get();
    if (!roomDoc.exists) {
        console.log('create room');
        await roomDoc.ref.set({ imageUrl: createImageUrl(roomDoc.id, targetEmail, user) });
    }
    console.log('room should exist')
    alert()
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
