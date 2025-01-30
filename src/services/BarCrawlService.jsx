import { collection, addDoc, serverTimestamp, getDoc, setDoc, doc, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../config/Firebase.jsx';

export async function saveBarCrawl(userID, barCrawlInfo, crawlName, startDate, endDate, intamacyLevel, crawlID = null) {
  try {
    const simplifiedBars = barCrawlInfo.map(bar => {
      const barImageUrl = 
        bar.photos && bar.photos.length > 0 
          ? bar.photos[0].getUrl({ maxHeight: bar.photos[0].height }) 
          : bar.imageUrl;
      const barLat = bar.geometry ? bar.geometry.location.lat() : bar.barLat;
      const barLng = bar.geometry ? bar.geometry.location.lng() : bar.barLng;
      
      return {
        name: bar.name || 'N/A',
        place_id: bar.place_id || 'N/A',
        rating: bar.rating || 0,
        price_level: bar.price_level || 0,
        vicinity: bar.vicinity || 'N/A',
        imageUrl: barImageUrl,
        barLat: barLat,
        barLng: barLng,
        impressions: [],
      };
    });

    if (crawlID) {
      const docRef = doc(db, "BarCrawls", crawlID);
      await setDoc(docRef, {
        barcrawlName: crawlName,
        barCrawlInfo: simplifiedBars,
        startDate: startDate,
        endDate: endDate,
        intamacyLevel: intamacyLevel,
        updatedAt: serverTimestamp()
      }, { merge: true }); 

      return crawlID;
    } else {
      const docRef = await addDoc(collection(db, "BarCrawls"), {
        barcrawlName: crawlName,
        barCrawlInfo: simplifiedBars,
        userID: userID,
        createDate: serverTimestamp(),
        invitees: [],
        admins: [userID],
        startDate: startDate,
        endDate: endDate,
        intamacyLevel: intamacyLevel
      });

      return docRef.id;
    }
  } catch (e) {
    console.error("Error saving bar crawl: ", e);
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

    const inviteeQuery = db.collection('BarCrawls');
    const inviteeSnapshot = await inviteeQuery.get();
    const inviteeCrawls = inviteeSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(crawl => 
        crawl.invitees.some(invitee => 
          invitee.UserID === userId && invitee.attendance === true
        )
      );
      
    return [...adminCrawls, ...inviteeCrawls.filter(crawl => !adminCrawls.some(admin => admin.id === crawl.id))];
  } catch (e) {
    console.error('Error fetching user bar crawls:', e);
  }
}


export async function deleteBarCrawl(crawlId) {
  try {
    await deleteDoc(doc(db, 'BarCrawls', crawlId));
  } catch (e) {
    console.error('Error deleting bar crawl:', e);
  }
}

export async function addImpression(crawlId, placeId, impressionData) {
  try {
    const barCrawlRef = doc(db, 'BarCrawls', crawlId);
    const barCrawlSnapshot = await getDoc(barCrawlRef);

    if (barCrawlSnapshot.exists()) {
      const barCrawlData = barCrawlSnapshot.data();

      const updatedBars = barCrawlData.barCrawlInfo.map(bar => {
        if (bar.place_id === placeId) {
          const existingImpressions = bar.impressions || [];
          const updatedImpressions = existingImpressions.map(imp =>
            imp.UserID === impressionData.UserID ? impressionData : imp
          );

          const finalImpressions = existingImpressions.some(imp => imp.UserID === impressionData.UserID)
            ? updatedImpressions
            : [...updatedImpressions, impressionData];

          return {
            ...bar,
            impressions: finalImpressions,
          };
        }
        return bar;
      });

      await updateDoc(barCrawlRef, {
        barCrawlInfo: updatedBars,
      });
    } else {
      console.error('Bar crawl does not exist.');
    }
  } catch (e) {
    console.error('Error adding impression:', e);
  }
}


export async function addAttendance(crawlId, attendee) { 
  try {
    const barCrawlRef = doc(db, 'BarCrawls', crawlId);
    const barCrawlSnapshot = await getDoc(barCrawlRef);

    if (barCrawlSnapshot.exists()) {
      const barCrawlData = barCrawlSnapshot.data();
      
      const existingInviteeIndex = barCrawlData.invitees.findIndex(
        invitee => invitee.UserID === attendee.UserID
      );

      if (existingInviteeIndex === -1) {
        await updateDoc(barCrawlRef, {
          invitees: arrayUnion(attendee)
        });
      } else {
        const updatedInvitees = barCrawlData.invitees.map(invitee => 
          invitee.UserID === attendee.UserID ? { ...invitee, attendance: attendee.attendance } : invitee
        );
        await updateDoc(barCrawlRef, {
          invitees: updatedInvitees
        });
      }
      
      console.log('Attendance updated successfully.');
    } else {
      console.error('Bar crawl does not exist.');
    }
  } catch (e) {
    console.error('Error adding attendance:', e);
  }
}


