import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, List, Divider, TextField, Button } from "@mui/material";
import { haversineDistance, getWalkingTime } from "../functions/functions";
import { setBarResults, setLocation, setSelectedBars } from "../actions/actions";
import userPin from "../../public/assets/images/personPin.png";
import mapPin from "../../public/assets/images/noPersonPin.png";
import selectedMapPin from "../../public/assets/images/noPersonSelectedPin.png";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import BarCard from "../components/BarCard";
import BarCrawlOrganizer from "../components/BarCrawlOrganizer";
import VibeChecker from "../components/VibeChecker";

function MainPage() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const isLarge = useSelector((state) => state.isLarge);
  const location = useSelector((state) => state.location);
  const selectedBars = useSelector((state) => state.selectedBars);
  const barResults = useSelector((state) => state.barResults);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [locationReq, setLocationReq] = useState(0);
  const [vibeSearch, setVibeSearch] = useState(
    "bar OR pub OR drinks OR cocktails"
  );
  
  //get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setLocation({ latitude, longitude }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  //init API
  useEffect(() => {
    if (!mapLoaded && location) {
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBERPw7z0F-9OZAw8P2fBrKAGLtPEBWMLw&libraries=places`;
        script.async = true;
        script.onload = () => {
          setMapLoaded(true);
        };
        document.body.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    }
  }, [location, mapLoaded]);

  //init autocomplete
  useEffect(() => {
    if (mapLoaded && location) {
      const input = document.getElementById("autocomplete");
      const options = {
        types: ["geocode", "establishment"],
      };
      const autocomplete = new window.google.maps.places.Autocomplete(
        input,
        options
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const newLocation = {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };
          setLocationReq(locationReq + 1);
          setTimeout(() => {
            dispatch(setLocation(newLocation));
          }, 100)
        }
      });

      setAutocomplete(autocomplete);
    }
  }, [mapLoaded, location]);

  //get nearby bars
  useEffect(() => {
    if (mapLoaded && location) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      });

      const userIcon = {
        url: userPin,
        scaledSize: new window.google.maps.Size(50, 50),
      };

      new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        icon: userIcon,
        title: "You are here",
        zIndex: 1000,
      });

      if (window.google && window.google.maps && window.google.maps.places) {
        const service = new window.google.maps.places.PlacesService(map);

        const request = {
          location: { lat: location.latitude, lng: location.longitude },
          rankBy: google.maps.places.RankBy.DISTANCE,
          type: "bar",
          keyword: vibeSearch,
        };

        if (locationReq > 0) {
          service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              const barsWithDistance = results.map((place) => {
                const distance = haversineDistance(
                  location.latitude,
                  location.longitude,
                  place.geometry.location.lat(),
                  place.geometry.location.lng()
                );
                const imageUrl = place.photos
                  ? place.photos[0].getUrl({ maxWidth: 100, maxHeight: 100 })
                  : null;
                return { ...place, distance, imageUrl };
              });

              const sortedBars = barsWithDistance.sort(
                (a, b) => a.distance - b.distance
              );
              dispatch(setBarResults(sortedBars));
            } else {
              console.error("PlacesService failed:", status);
            }
          });
        }
      } else {
        console.error("Google Maps PlacesService is not available.");
      }
    }
  }, [mapLoaded, location, vibeSearch]);

  //map pins out
  useEffect(() => {
    if (mapLoaded && location) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      });
  
      const userIcon = {
        url: userPin,
        scaledSize: new window.google.maps.Size(50, 50),
      };
  
      new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        icon: userIcon,
        title: "You are here",
        zIndex: 1000,
      });
  
      const addMarkers = (places, iconUrl) => {
        places.forEach((place) => {
          if (place.geometry && place.geometry.location) {
            const photoUrl = place.photos?.[0]?.getUrl({
              maxHeight: place.photos[0].height,
            }) || "";
      
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map,
              icon: {
                url: iconUrl,
                scaledSize: new window.google.maps.Size(50, 50),
              },
              title: place.name,
            });
  
            const infoWindow = new window.google.maps.InfoWindow({
              disableAutoPan: true, 
            });
      
            google.maps.event.addListener(infoWindow, "domready", () => {
              const infoWindowElements = document.querySelectorAll(
                ".gm-style-iw-chr"
              );
              infoWindowElements.forEach((div) => div.style.display = "none");
              const infoWindowCont = document.querySelectorAll(
                ".gm-style-iw"
              );
              infoWindowCont.forEach((div) => div.style.padding = "0px");
            });

            marker.addListener("mouseover", () => {
              infoWindow.setContent(`
                <div style="display: flex; flex-direction: column; align-items: left;">
                  ${photoUrl ? `<img src="${photoUrl}" alt="${place.name}" style="width: 200px; padding: 0px; height: 150px; object-fit: cover;" />` : ""}
                  <div style="font-weight: bold; font-size: 16px; margin: 8px;">
                    ${place.name.length > 38 ? `${place.name.slice(0, 20)}...` : place.name}
                  </div>
                  <div style="font-size: 14px; margin-left: 8px;">Rating: ${place.rating || "N/A"}</div>
                  <div style="font-size: 14px; margin-left: 8px;">Price: ${place.price_level ? "$".repeat(place.price_level) : "N/A"}</div>
                </div>
              `);
              infoWindow.open(map, marker);
            });
      
            marker.addListener("mouseout", () => {
              infoWindow.close();
            });

            marker.addListener("click", () => {
              if (selectedBars.some(bar => bar.place_id === place.place_id)) {
                const updatedBars = selectedBars.filter((bar) => bar.place_id !== place.place_id);
                dispatch(setSelectedBars(updatedBars));
              } else {
                dispatch(setSelectedBars([...selectedBars, place]));
              }
              
            })
          }
        });
      };
  
      addMarkers(barResults, mapPin);
  
      if (selectedBars.length > 0) {
        addMarkers(selectedBars, selectedMapPin);
  
        if (selectedBars.length > 1) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: theme.primary,
              strokeWeight: 5,
              strokeOpacity: 1.0,
            },
          });
  
          const waypoints = selectedBars.slice(1, -1).map((place) => ({
            location: place.geometry.location,
            stopover: true,
          }));
  
          getWalkingTime(selectedBars[0].geometry.location, selectedBars[selectedBars.length - 1].geometry.location)
            .then((walkingTime) => {
              const travelMode =
                walkingTime > 900 
                  ? window.google.maps.TravelMode.DRIVING
                  : window.google.maps.TravelMode.WALKING;
  
              directionsService.route(
                {
                  origin: selectedBars[0].geometry.location,
                  destination: selectedBars[selectedBars.length - 1].geometry.location,
                  waypoints: waypoints,
                  travelMode: travelMode,
                },
                (result, status) => {
                  if (status === "OK") {
                    directionsRenderer.setDirections(result);
                  } else {
                    console.error("Error fetching directions: ", status);
                  }
                }
              );
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
    }
  }, [mapLoaded, location, barResults, selectedBars]);
  
  
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setLocation({ latitude, longitude }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
    setLocationReq(locationReq + 1);
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
        height: "calc(100vh - 50px)",
        padding: isMobile || isTablet ? "0px" : "0px 10px",
        backgroundColor: theme.white,
        width: "100%",
      }}
    >
      {(isMobile || isTablet) && (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.white,
            height: "140px",
            width: "100%",
            zIndex: 40,
            padding: "15px 15px 0px 15px",
          }}
        >
          <TextField
            id="autocomplete"
            label="So, Where To?"
            variant="outlined"
            fullWidth
            size="small"
            style={{ marginBottom: "10px" }}
          />
          <Button
            variant="outlined"
            style={{
              border: "1px solid transparent",
            }}
            sx={{
              backgroundColor: "white",
              color: theme.primary,
              padding: "5px 0px",
              textTransform: "none",
              marginBottom: "10px",
              justifyContent: "flex-start",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={handleUseLocation}
          >
            <MyLocationIcon sx={{ marginRight: "10px" }} /> Use my current
            location
          </Button>
          <VibeChecker vibeSearch={vibeSearch} setVibeSearch={setVibeSearch} />
        </Box>
      )}

      {isMobile || isTablet ? (
        <>
          <Box
            id="map"
            style={{
              width: "100%",
              height: "calc(100vh - 50px)",
              position: "absolute",
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              overflowX: "auto",
              display: "flex",
              gap: "10px",
              padding: "10px",
            }}
          >
            {barResults.map((bar, index) => (
              <BarCard bar={bar} index={index} key={index} mode='localBars' />
            ))}
          </Box>
        </>
      ) : (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flex: isLarge ? 1 : 3,
            paddingRight: "10px",
            maxHeight: "calc(100vh - 50px)",
            height: "100%",
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "10px",
            }}
          >
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                position: "sticky",
                top: "10px",
                zIndex: 4,
                backgroundColor: theme.white,
              }}
            >
              <TextField
                id="autocomplete"
                label="So, Where To?"
                variant="outlined"
                fullWidth
                size="small"
                style={{ marginBottom: "10px" }}
              />
            </Box>
            <Button
              variant="outlined"
              style={{
                border: "1px solid transparent",
              }}
              sx={{
                backgroundColor: "white",
                color: theme.primary,
                padding: "5px 0px",
                textTransform: "none",
                marginBottom: "10px",
                justifyContent: "flex-start",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
              onClick={handleUseLocation}
            >
              <MyLocationIcon sx={{ marginRight: "10px" }} /> Use my current
              location
            </Button>
            <VibeChecker
              vibeSearch={vibeSearch}
              setVibeSearch={setVibeSearch}
            />
          </Box>

          <Divider
            style={{
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              marginTop: '10px'
            }}
          />
          <Box
            style={{
              overflowY: "auto",
            }}
          >
            <List>
              {barResults.map((bar, index) => (
                <BarCard bar={bar} index={index} key={index} mode='localBars' />
              ))}
            </List>
          </Box>
        </Box>
      )}
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          flex: isLarge ? 3 : 5,
        }}
      >
        <Box id="map" style={{ width: "100%", height: "calc(100vh - 50px)" }} />
      </Box>
      {selectedBars.length > 0 && (
          <BarCrawlOrganizer />
      )}
    </Box>
  );
}

export default MainPage;
