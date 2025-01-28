import { collection, addDoc, serverTimestamp, getDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from '../config/Firebase.jsx';

export async function saveBarCrawl(userID, barCrawlInfo, crawlName) {
  try {
    const simplifiedBars = barCrawlInfo.map(bar => {
      const barImageUrl = bar.photos[0].getUrl({ maxHeight: bar.photos[0].height })
      const barLat = bar.geometry.location.lat()
      const barLng = bar.geometry.location.lng()
      return {
        name: bar.name || 'N/A',
        place_id: bar.place_id || 'N/A',
        rating: bar.rating || 0,
        price_level: bar.price_level || 0,
        vicinity: bar.vicinity || 'N/A',
        imageUrl: barImageUrl,
        barLat: barLat,
        barLng: barLng,
      };
    });

    const docRef = await addDoc(collection(db, "BarCrawls"), {
      barcrawlName: crawlName,
      barCrawlInfo: simplifiedBars,
      userID: userID,
      createDate: serverTimestamp(),
      invitees: [],
      admins: [userID],
    });

    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export async function getBarCrawl(crawlId) {
  const response = await getDoc(doc(db, "BarCrawls", crawlId));
  if (response.exists()) {
    return response.data();
  } else {
    return Promise.reject(Error(`Error fetching document: ${coll}.${id}`))
  }
};

export async function getAllBarCrawlsForUser(userId) {
  try {
    const adminQuery = db.collection('BarCrawls').where('admins', 'array-contains', userId);
    const adminSnapshot = await adminQuery.get();
    const adminCrawls = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const inviteeQuery = db.collection('BarCrawls').where('invitees', 'array-contains', userId);
    const inviteeSnapshot = await inviteeQuery.get();
    const inviteeCrawls = inviteeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return [...adminCrawls, ...inviteeCrawls.filter(crawl => !adminCrawls.some(admin => admin.id === crawl.id))];
  } catch (e) {
    console.error('Error fetching user bar crawls:', e);
  }
};

export async function deleteBarCrawl(crawlId) {
  try {
    await deleteDoc(doc(db, 'BarCrawls', crawlId));
  } catch (e) {
    console.error('Error deleting bar crawl:', e);
  }
}