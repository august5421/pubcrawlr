import { auth, db } from '../config/Firebase.jsx';
import { setDoc, getDoc, doc } from 'firebase/firestore';
import { setAlert } from '../actions/actions.jsx';

export async function signIn(email, password) {
	try {
		const userCredential = await auth.signInWithEmailAndPassword(email, password);
		return userCredential.user;
	} catch (e) {
		console.error('Error authenticating user: ', e);
		dispatch(setAlert({ open: true, message: 'Error authenticating user', severity: 'error' }));
	}
}

export async function getUser(userId) {
	try {
		const userDocRef = doc(db, 'Users', userId);
		const response = await getDoc(userDocRef);
		return response.data();
	} catch (e) {
		console.error('Error fetching user: ', e);
		dispatch(setAlert({ open: true, message: 'Error fetching user', severity: 'error' }));
	}
}

export async function getFriendsForUser(userId) {
	try {
		const friendsDocRef = doc(db, 'Friends', userId);
		const friendsDoc = await getDoc(friendsDocRef);
		if (friendsDoc.exists()) {
			return friendsDoc.data().Friends || [];
		}
		return [];
	} catch (e) {
		console.error('Error fetching friends for user: ', e);
		dispatch(setAlert({ open: true, message: 'Error fetching friends for user', severity: 'error' }));
	}
}

export async function createUser(email, password) {
	try {
		const userCredential = await auth.createUserWithEmailAndPassword(email, password);
		const user = userCredential.user;

		await setDoc(doc(db, 'Users', user.uid), {
			UserEmail: email,
			UserFirstName: fName,
			UserLastName: lName,
			UserAvatarType: 'text',
			CreateDate: new Date(),
			userLocation: location ? location : null
		});

		await setDoc(doc(db, 'Friends', user.uid), {
			UserId: user.uid,
		});

		return user;
	} catch (e) {
		console.error('Error creating user: ', e);
		dispatch(setAlert({ open: true, message: 'Error creating user', severity: 'error' }));
	}
}

export async function sendPasswordReset(email) {
	try {
		await auth.sendPasswordResetEmail(email);
	} catch (e) {
		console.error('Error sending email: ', e);
		dispatch(setAlert({ open: true, message: 'Error sending password reset email. Please try again.', severity: 'error' }));
	}
}