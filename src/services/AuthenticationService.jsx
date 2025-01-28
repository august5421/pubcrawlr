import { auth, db } from '../config/Firebase.jsx';
import { setDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export async function signIn(email, password) {
	try {
		const userCredential = await auth.signInWithEmailAndPassword(email, password);
		return userCredential.user;
	} catch (e) {
		console.error('Error authenticating user: ', e);
	}
}

export async function getUser(userId) {
	try {
		const userDocRef = doc(db, 'Users', userId);
		const response = await getDoc(userDocRef);
		return response.data();
	} catch (e) {
		console.error('Error fetching user: ', e);
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
	}
}

export async function createUser(email, password, fName, lName, location) {
	try {
		const userCredential = await auth.createUserWithEmailAndPassword(email, password);
		const user = userCredential.user;

		await setDoc(doc(db, 'Users', user.uid), {
			UserEmail: email,
			UserFirstName: fName,
			UserLastName: lName ? lName : null,
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
	}
}

export async function updateUser(userId, firstName, lastName, avatarType) {
	try {
		const userRef = doc(db, 'Users', userId);
		const response = await updateDoc(userRef, {
			UserFirstName: firstName,
			UserLastName: lastName,
			UserAvatarType: avatarType
		});
		return response.data();
	} catch (e) {
		console.error('Error updating user: ', e);
	}
}

export async function sendPasswordReset(email) {
	try {
		await auth.sendPasswordResetEmail(email);
	} catch (e) {
		console.error('Error sending email: ', e);
	}
}

export async function updatePasswordForUser(oldPassword, newPassword) {
	try {
		const user = auth.currentUser;
		if (user) {
			const credential = EmailAuthProvider.credential(user.email, oldPassword);
			await reauthenticateWithCredential(user, credential);
			await updatePassword(user, newPassword);
			return true;
		}
	} catch (e) {
		console.error('Error updating password: ', e);
		return false;
	}
}