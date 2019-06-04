/**
 * Informal Schema
 * 
 * - users collection
 *   document id: user id
 *   - email
 *   - rooms subcollection
 *     document id: other person's email
 *     - signal map: (represents signal sent from user id to peer uid)
 *       - type: 'offer' | 'answer' | 'ice'
 *       - content: stringified JSON of either sdp (RTCSessionDescription) or ice 
 *         (RTCIceCandidate)
 */

/**
 * Add a user & related info to the db on signup if necessary.
 */
export async function signInSetup(
    db: firebase.firestore.Firestore,
    user: firebase.User,
    targetEmail: string
): Promise<void> {
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        await userRef.set({ email: user.email });
    }
    const roomDoc = await userRef.collection('rooms').doc(targetEmail).get();
    if (!roomDoc.exists) {
        await roomDoc.ref.set({});
    }
}
