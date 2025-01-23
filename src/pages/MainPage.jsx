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
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
  const [nearbyLoaded, setNearbyLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [locationReq, setLocationReq] = useState(0);
  const [vibeSearch, setVibeSearch] = useState(
    "bar OR pub OR drinks OR cocktails"
  );
  const [map, setMap] = useState(null);
  
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

  //render map
  useEffect(() => {
    if (!mapLoaded && location) {
      if (map) return;

      const newMap = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/openstreetmap/style.json?key=uyov68efNrdYsMZCjhLO`,
        center: [location.longitude, location.latitude],
        zoom: 14
      });
      newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      newMap.on('load', async () => {
        newMap.loadImage(mapPin).then((image) => {
          newMap.addImage('custom-marker', image.data);
        });
      });

      setMap(newMap);
      initializeGoogleApi();
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
    if (mapLoaded && location && locationReq > 0) {
      const googleMap = new window.google.maps.Map(document.getElementById("gmap"));

      if (window.google && window.google.maps && window.google.maps.places) {
        const service = new window.google.maps.places.PlacesService(googleMap);
        const request = {
          location: { lat: location.latitude, lng: location.longitude },
          rankBy: google.maps.places.RankBy.DISTANCE,
          type: "bar",
          keyword: vibeSearch,
        };

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
            setNearbyLoaded(true);
          } else {
            console.error("PlacesService failed:", status);
          }
        });
      }
    }
  }, [mapLoaded, location, vibeSearch, locationReq]);

//  map pins out
  useEffect(() => {
    if (mapLoaded && location && nearbyLoaded) {
      const newMap = map;
      //add user marker
      new maplibregl.Marker({
        color: "#42f55a"
      }).setLngLat([location.longitude, location.latitude]).addTo(newMap);

      // add bar result markers
      barResults.forEach((x) => {
        const photoUrl = x.photos?.[0]?.getUrl({
          maxHeight: x.photos[0].height,
        }) || "";

        new maplibregl.Marker({
          color: '#3275a8'
        }).setLngLat([x.geometry.location.lng(), x.geometry.location.lat()])
        .setPopup(new maplibregl.Popup().setHTML(`<div style="display: flex; flex-direction: column; align-items: left;">
                                    ${photoUrl ? `<img src="${photoUrl}" alt="${x.name}" style="width: 200px; padding: 0px; height: 150px; object-fit: cover;" />` : ""}
                                    <div style="font-weight: bold; font-size: 16px; margin: 8px;">
                                      ${x.name.length > 38 ? `${x.name.slice(0, 20)}...` : x.name}
                                    </div>
                                    <div style="font-size: 14px; margin-left: 8px;">Rating: ${x.rating || "N/A"}</div>
                                    <div style="font-size: 14px; margin-left: 8px;">Price: ${x.price_level ? "$".repeat(x.price_level) : "N/A"}</div>
                                  </div>`))
        .addTo(newMap);
      });
      
      // WORK IN PROGRESS, TRYING TO GET THIS SHIT TO WORK
      // const markerGeojson = {
      //   'type': 'geojson',
      //   'data': {
      //     'type': 'FeatureCollection',
      //     'features': [
      //       barResults.map(x => {
      //         const photoUrl = x.photos?.[0]?.getUrl({
      //           maxHeight: x.photos[0].height,
      //         }) || "";
      //         return {
      //           'type': 'Feature',
      //           'properties': {
      //             'description': `<div style="display: flex; flex-direction: column; align-items: left;">
      //                               ${photoUrl ? `<img src="${photoUrl}" alt="${x.name}" style="width: 200px; padding: 0px; height: 150px; object-fit: cover;" />` : ""}
      //                               <div style="font-weight: bold; font-size: 16px; margin: 8px;">
      //                                 ${x.name.length > 38 ? `${x.name.slice(0, 20)}...` : x.name}
      //                               </div>
      //                               <div style="font-size: 14px; margin-left: 8px;">Rating: ${x.rating || "N/A"}</div>
      //                               <div style="font-size: 14px; margin-left: 8px;">Price: ${x.price_level ? "$".repeat(x.price_level) : "N/A"}</div>
      //                             </div>`,
      //             'placeId': x.place_id
      //           },
      //           'geometry': {
      //             'type': 'Point',
      //             'coordinates': [x.geometry.location.lng(), x.geometry.location.lat()]
      //           }
      //         }
      //       })
      //     ]
      //   }
      // };

      // WORK IN PROGRESS, TRYING TO GET THIS SHIT TO WORK
      // newMap.on('load', async () => {
      //   newMap.addSource('bars', markerGeojson);
      //   newMap.addLayer({
      //     'id': 'bars',
      //     'type': 'symbol',
      //     'source': 'bars',
      //     'layout': {
      //       'icon-overlap': 'always',
      //       'icon-image': 'custom-marker'
      //     }
      //   });
  
      //   const popup = new maplibregl.Popup({
      //     closeButton: false,
      //     closeOnClick: false
      //   });

      //   newMap.on('mouseenter', 'bars', (e) => {
      //     // Change the cursor style as a UI indicator.
      //     newMap.getCanvas().style.cursor = 'pointer';
  
      //     const coordinates = e.features[0].geometry.coordinates.slice();
      //     const description = e.features[0].properties.description;
  
      //     // Ensure that if the map is zoomed out such that multiple
      //     // copies of the feature are visible, the popup appears
      //     // over the copy being pointed to.
      //     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      //         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      //     }
  
      //     // Populate the popup and set its coordinates
      //     // based on the feature found.
      //     popup.setLngLat(coordinates).setHTML(description).addTo(newMap);
      //   });

      //   newMap.on('mouseleave', 'bars', () => {
      //     newMap.getCanvas().style.cursor = '';
      //     popup.remove();
      //   });
  
      //   newMap.on('click', 'bars', (e) => {
      //     const selectedPlace = e.features[0].properties.place_id;
      //     if (selectedBars.some(bar => bar.place_id === selectedPlace)) {
      //       const updatedBars = selectedBars.filter(x => x.place_id !== selectedPlace);
      //       dispatch(setSelectedBars(updatedBars));
      //     } else {
      //       const place = places.find(x => x.place_id === selectedPlace);
      //       dispatch(setSelectedBars([...selectedBars, place]));
      //     }
      //   });
      // });

      setMap(newMap);

      // TODO: click handling to add bars, install package for directions service, plot route



      // if (selectedBars.length > 0) {
      //   addMarkers(selectedBars, selectedMapPin);
  
      //   if (selectedBars.length > 1) {
      //     const directionsService = new window.google.maps.DirectionsService();
      //     const directionsRenderer = new window.google.maps.DirectionsRenderer({
      //       map,
      //       suppressMarkers: true,
      //       polylineOptions: {
      //         strokeColor: theme.primary,
      //         strokeWeight: 5,
      //         strokeOpacity: 1.0,
      //       },
      //     });
  
      //     const waypoints = selectedBars.slice(1, -1).map((place) => ({
      //       location: place.geometry.location,
      //       stopover: true,
      //     }));
  
      //     getWalkingTime(selectedBars[0].geometry.location, selectedBars[selectedBars.length - 1].geometry.location)
      //       .then((walkingTime) => {
      //         const travelMode =
      //           walkingTime > 900 
      //             ? window.google.maps.TravelMode.DRIVING
      //             : window.google.maps.TravelMode.WALKING;
  
      //         directionsService.route(
      //           {
      //             origin: selectedBars[0].geometry.location,
      //             destination: selectedBars[selectedBars.length - 1].geometry.location,
      //             waypoints: waypoints,
      //             travelMode: travelMode,
      //           },
      //           (result, status) => {
      //             if (status === "OK") {
      //               directionsRenderer.setDirections(result);
      //             } else {
      //               console.error("Error fetching directions: ", status);
      //             }
      //           }
      //         );
      //       })
      //       .catch((error) => {
      //         console.error(error);
      //       });
      //   }
      // }
    }
  }, [mapLoaded, location, nearbyLoaded, selectedBars]);
  
  
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

  const initializeGoogleApi = () => {
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
  }

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
        <Box id="gmap" style={{ display: "none"}}/>
      </Box>
      {selectedBars.length > 0 && (
          <BarCrawlOrganizer />
      )}
    </Box>
  );
}

export default MainPage;
