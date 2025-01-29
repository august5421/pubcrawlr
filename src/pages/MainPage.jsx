import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, List, Divider, TextField, Button, Collapse } from "@mui/material";
import { haversineDistance, getMarkerHTML, uniqBy } from "../functions/functions";
import { setBarResults, setBarResultsInBounds, setLocation, setSelectedBars, setLocationReq, setVibeDialog, setSelectedVibes } from "../actions/actions";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import BarCard from "../components/BarCard";
import BarCrawlOrganizerRoot from "../components/BarCrawlOrganizerRoot";
import VibeDialog from "../components/VibeDialog";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLibreGlDirections, { LoadingIndicatorControl } from "@maplibre/maplibre-gl-directions";
import { UpdateSearchControl, VibeSettingsControl } from '../utilities/CustomMapControls';
import { Vibes } from '../models/MainModels';

function MainPage() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const isLarge = useSelector((state) => state.isLarge);
  const location = useSelector((state) => state.location);
  const locationReq = useSelector((state) => state.locationReq);
  const selectedBars = useSelector((state) => state.selectedBars);
  const barResults = useSelector((state) => state.barResults);
  const barResultsInBounds = useSelector((state) => state.barResultsInBounds);
  const vibeDialogOpen = useSelector((state) => state.vibeDialogOpen);
  const selectedVibes = useSelector((state) => state.selectedVibes);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearbyLoaded, setNearbyLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hardRefresh, setHardRefresh] = useState(false);

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
      newMap.addControl(new UpdateSearchControl(), 'top-right');
      newMap.addControl(new VibeSettingsControl(), 'top-right');

      newMap.on('load', () => {
        const newDirections = new MapLibreGlDirections(newMap, {
          profile: 'foot'
        });
        newMap.addControl(new LoadingIndicatorControl(newDirections));
        setDirections(newDirections);
      });

      setMap(newMap);
      window.locationReq = locationReq;
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

          dispatch(setLocation(newLocation));
          setNearbyLoaded(false);
          updateLocationReq();
        }
      });

      setAutocomplete(autocomplete);
    }
  }, [mapLoaded]);

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
          keyword: selectedVibes.length > 0 ? Vibes.getKeyword(selectedVibes) : Vibes.defaultKeyword,
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

            if (hardRefresh) {
              dispatch(setBarResults(sortedBars));
              dispatch(setBarResultsInBounds(sortedBars));
            } else {
              const filtered = uniqBy([...sortedBars, ...barResults], x => x.place_id);
              dispatch(setBarResults(filtered));
              dispatch(setBarResultsInBounds(filtered));
            }

            setNearbyLoaded(true);
          } else {
            console.error(`PlacesService failed for keyword: ${selectedVibes.length > 0 ? Vibes.getKeyword(selectedVibes) : Vibes.defaultKeyword}`, status);
            setNearbyLoaded(true);
          }
        });
      }
    }
  }, [locationReq, hardRefresh]);

  //  map pins out
  useEffect(() => {
    if (mapLoaded && location && nearbyLoaded) {
      //add user marker
      if (userLocation) {
        new maplibregl.Marker({
          color: "#42f55a"
        }).setLngLat(userLocation).addTo(map);
      }

      if (hardRefresh) {
        clearExistingMarkers();
        setHardRefresh(false);
      }

      let bounds = new maplibregl.LngLatBounds();

      // add bar result markers
      barResults.forEach((x) => {
        const photoUrl = x.photos?.[0]?.getUrl({
          maxHeight: x.photos[0].height,
        }) || "";

        // extend map bounds
        bounds.extend([x.geometry.location.lng(), x.geometry.location.lat()]);

        const marker = new maplibregl.Marker({
          color: '#36b8f5',
          className: 'marker'
        }).setLngLat([x.geometry.location.lng(), x.geometry.location.lat()])
          .setPopup(new maplibregl.Popup().setHTML(getMarkerHTML(photoUrl, x.name, x.rating, x.price_level, x.place_id, true)))
          .addTo(map);

        // zoom to marker on click
        marker.getElement().addEventListener('click', () => {
          map.flyTo({
            center: [x.geometry.location.lng(), x.geometry.location.lat()],
            speed: 0.5
          });
        });

        marker.getElement().setAttribute('data-placeid', x.place_id);

        // on popup opened, set disabled class
        marker.getPopup().on('open', () => {
          let btn = document.getElementById(`pa-${x.place_id}`);
          if (btn) {
            if (!window.selectedBarIds.includes(x.place_id)) {
              btn.classList.remove('popup-btn-disabled');
            } else {
              btn.classList.add('popup-btn-disabled');
            }
          }
        });
      });

      // zoom to fit results
      if (isAutocomplete()) {
        map.flyTo({
          center: [location.longitude, location.latitude],
          speed: 0.5,
          zoom: 13
        });
      } else {
        map.fitBounds(bounds);
      }

      // on zoom, set bar results in map bounds
      map.on('moveend', () => {
        let mapContainer = map.getContainer();
        let markerElements = [...mapContainer.getElementsByClassName('marker')];
        let rect = mapContainer.getBoundingClientRect();

        let visiblePlaces = [];
        markerElements.forEach(x => {
          let elementRect = x.getBoundingClientRect();
          intersectRect(rect, elementRect) && visiblePlaces.push(barResults.find(result => result.place_id === x.getAttribute('data-placeid')));
        });
        dispatch(setBarResultsInBounds(visiblePlaces));
      });
    }
  }, [nearbyLoaded]);

  const clearExistingMarkers = () => {
    let markers = [...map.getContainer().getElementsByClassName('marker')];
    markers.forEach(x => {
      x.remove();
    });
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setLocation({ latitude, longitude }));
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
    updateLocationReq();
  };

  const initializeGoogleApi = () => {
    if (!mapLoaded && location) {
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => {
          setMapLoaded(true);
        };
        document.body.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    }
  };

  const intersectRect = (r1, r2) => {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
  };

  const updateLocationReq = () => {
    const newValue = window.locationReq + 1;
    window.locationReq = newValue;
    dispatch(setLocationReq(newValue));
  }

  const isAutocomplete = () => {
    if (!autocomplete || !autocomplete.getPlace()) return false;
    const autoLocation = autocomplete?.getPlace().geometry?.location;
    return location.latitude === autoLocation.lat() && location.longitude === autoLocation.lng();
  }

  const updateSelectedVibes = (selections) => {
    dispatch(setSelectedVibes(selections));
    dispatch(setSelectedBars([]));
    setHardRefresh(true);
    setNearbyLoaded(false);
    updateLocationReq();
  }

  // must be global for popup html
  window.addBar = (place_id) => {
    const selectedBar = barResults.find(x => x.place_id === place_id);
    dispatch(setSelectedBars([...selectedBars, selectedBar]));
  };

  window.updateSearchClicked = () => {
    let center = map.getCenter();

    dispatch(setLocation({ latitude: center.lat, longitude: center.lng }));
    setNearbyLoaded(false);
    updateLocationReq();
  };

  window.openVibeSettings = () => {
    dispatch(setVibeDialog(true));
  }

  // selectedBars listener
  useEffect(() => {
    const selectedBarIds = selectedBars.map(x => x.place_id);
    // set disabled for any open popups
    barResults.forEach(bar => {
      let btn = document.getElementById(`pa-${bar.place_id}`);
      if (btn) {
        if (!selectedBarIds.includes(bar.place_id)) {
          btn.classList.remove('popup-btn-disabled');
        } else {
          btn.classList.add('popup-btn-disabled');
        }
      }
    });

    // set global for popup event listeners
    window.selectedBarIds = selectedBarIds;

    // update waypoints
    if (selectedBarIds.length > 1) {
      directions.setWaypoints([
        ...selectedBars.map(x => {
          return [x.geometry.location.lng(), x.geometry.location.lat()];
        })
      ]);
    } else {
      if (directions) {
        directions.setWaypoints([]);
      }
    }

  }, [selectedBars]);

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
      <VibeDialog selectedVibes={selectedVibes} theme={theme} setSelections={updateSelectedVibes} />
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
            {barResultsInBounds.map((bar, index) => (
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
              {barResultsInBounds.map((bar, index) => (
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
        <Box id="gmap" style={{ display: "none" }} />
      </Box>
      <Collapse in={selectedBars.length > 0} orientation="horizontal">
        <BarCrawlOrganizerRoot />
      </Collapse>
    </Box>
  );
}

export default MainPage;
