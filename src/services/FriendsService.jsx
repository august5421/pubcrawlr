import { db } from '../config/Firebase.jsx';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp, collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export async function getFriendsData(userId) {
    try {
        const friendsQuery = db.collection('Friends').where('UserId', '==', userId);
        const friendsSnapshot = await friendsQuery.get();
        const friendsData = friendsSnapshot.docs.map(doc => doc.data().Friends);
        const unseenCount = friendsData[0]?.filter(friend => friend.Seen === false && friend.RequestedBy === friend.friendId);

        return {
            friendsData: friendsData,
            unseenCount: unseenCount
        };
    } catch (e) {
        console.error('Error fetching friends data:', e);
    }
};

export const fetchUsersFromFirestore = async () => {
    try {
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, orderBy('UserFirstName'), limit(50));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users.');
    }
};

export const updateFriendRequestsSeen = async (activeUserId) => {
    try {
      const friendsRef = doc(db, 'Friends', activeUserId);
      const docSnap = await getDoc(friendsRef);
  
      if (docSnap.exists()) {
        const friends = docSnap.data().Friends || [];
        const unseen = friends.filter(
          (friend) => !friend.Seen && friend.RequestedBy !== activeUserId
        );
  
        if (unseen.length > 0) {
          const updatedFriends = friends.map((friend) =>
            unseen.some((u) => u.friendId === friend.friendId)
              ? { ...friend, Seen: true }
              : friend
          );
  
          await updateDoc(friendsRef, { Friends: updatedFriends });
  
          for (const unseenFriend of unseen) {
            const friendDocRef = doc(db, 'Friends', unseenFriend.friendId);
            const friendDocSnap = await getDoc(friendDocRef);
  
            if (friendDocSnap.exists()) {
              const friendData = friendDocSnap.data().Friends || [];
              const updatedFriendData = friendData.map((entry) =>
                entry.friendId === activeUserId
                  ? { ...entry, Seen: true }
                  : entry
              );
  
              await updateDoc(friendDocRef, { Friends: updatedFriendData });
            }
          }
  
          return unseen.length;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error updating friend request Seen status:', error);
      throw new Error('Failed to update Seen status.');
    }
};

export const addFriend = async (activeUser, user) => {
    const friendsRef = doc(db, 'Friends', activeUser.UserId);
    const docSnap = await getDoc(friendsRef);
  
    const friendRequest = {
      Name: `${user.UserFirstName} ${user.UserLastName}`,
      friendId: user.id,
      RequestedBy: activeUser.UserId,
      RequestedOn: Timestamp.now(),
      Type: 'request',
      Seen: false,
      FriendAva: user.UserAvatarType,
    };
  
    if (docSnap.exists()) {
      await updateDoc(friendsRef, {
        Friends: arrayUnion(friendRequest),
      });
    } else {
      await setDoc(friendsRef, {
        Friends: [friendRequest],
        UserId: activeUser.UserId,
      });
    }
  
    const friendRef = doc(db, 'Friends', user.id);
    const friendDocSnap = await getDoc(friendRef);
  
    const reciprocalRequest = {
      Name: `${activeUser.Name}`,
      friendId: activeUser.UserId,
      RequestedBy: activeUser.UserId,
      RequestedOn: Timestamp.now(),
      Type: 'pending',
      Seen: false,
      FriendAva: activeUser.UserAvatarType,
    };
  
    if (friendDocSnap.exists()) {
      await updateDoc(friendRef, {
        Friends: arrayUnion(reciprocalRequest),
      });
    } else {
      await setDoc(friendRef, {
        Friends: [reciprocalRequest],
        UserId: user.id,
      });
    }
  };
  
  export const removeFriendRequest = async (activeUser, friend, action) => {
    const userFriendsRef = doc(db, 'Friends', activeUser.UserId);
    const userDoc = await getDoc(userFriendsRef);
    if (userDoc.exists()) {
      const updatedFriends = userDoc.data().Friends.filter((f) => f.friendId !== friend.friendId);
      await updateDoc(userFriendsRef, { Friends: updatedFriends });
    }
  
    const friendFriendsRef = doc(db, 'Friends', friend.friendId);
    const friendDoc = await getDoc(friendFriendsRef);
    if (friendDoc.exists()) {
      const updatedFriends = friendDoc.data().Friends.filter((f) => f.friendId !== activeUser.UserId);
      await updateDoc(friendFriendsRef, { Friends: updatedFriends });
    }
  };
  
  export const acceptFriendRequest = async (activeUser, friend) => {
    const userFriendsRef = doc(db, 'Friends', activeUser.UserId);
    const userDoc = await getDoc(userFriendsRef);
    if (userDoc.exists()) {
      const updatedFriends = userDoc.data().Friends.map((f) =>
        f.friendId === friend.friendId ? { ...f, Type: 'friends' } : f
      );
      await updateDoc(userFriendsRef, { Friends: updatedFriends });
    }
  
    const friendFriendsRef = doc(db, 'Friends', friend.friendId);
    const friendDoc = await getDoc(friendFriendsRef);
    if (friendDoc.exists()) {
      const updatedFriends = friendDoc.data().Friends.map((f) =>
        f.friendId === activeUser.UserId ? { ...f, Type: 'friends' } : f
      );
      await updateDoc(friendFriendsRef, { Friends: updatedFriends });
    }
  };