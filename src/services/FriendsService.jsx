import { db } from '../config/Firebase.jsx';

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