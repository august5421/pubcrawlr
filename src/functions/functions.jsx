import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../config/Firebase.jsx';

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

    console.log("Bar crawl created with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};


export function darkenColor(color, amount) {
    const col = parseInt(color.slice(1), 16); 
    const r = Math.max(0, Math.min(255, (col >> 16) - amount * 255));
    const g = Math.max(0, Math.min(255, ((col >> 8) & 0x00ff) - amount * 255));
    const b = Math.max(0, Math.min(255, (col & 0x0000ff) - amount * 255));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export function stringAvatar(name) {
  const nameParts = name.trim().split(' ');  
  const initials = nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : nameParts[0] ? nameParts[0][0] : '';  
  return initials.toUpperCase();
}

export function getGreeting() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 4 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; 
  return distance; 
};

export function getWalkingTime(origin, destination) {
  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === "OK") {
          const walkingTime = result.routes[0].legs[0].duration.value; 
          resolve(walkingTime);
        } else {
          reject("Error calculating walking time");
        }
      }
    );
  });
};

export function convertToLatLngLiteral(loc) {
  return {
    lat: loc.latitude,
    lng: loc.longitude,
  };
}
