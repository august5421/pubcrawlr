import { useState, useEffect, useRef } from 'react';
import { getWalkingTime } from '../functions/functions';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import FinishedBarList from '../components/FinishedBarList';
import CrawlCrudButtons from '../components/CrawlCrudButtons';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function MyCrawlsPage({ userBarCrawls }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isLarge = useSelector((state) => state.isLarge);


  const mapRef = useRef(null); 
  const mapInstance = useRef(null);
  const [expanded, setExpanded] = useState(null);
  const [selectedBarCrawl, setSelectedBarCrawl] = useState(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // init
  useEffect(() => {
    if (!mapLoaded && !selectedBarCrawl) {
      setSelectedBarCrawl(userBarCrawls[0]);
    }
  }, [userBarCrawls]);

  // render map
  useEffect(() => {
    if (selectedBarCrawl) {
      setExpanded(selectedBarCrawl.id);
      const newMap = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/openstreetmap/style.json?key=uyov68efNrdYsMZCjhLO`,
        center: [selectedBarCrawl.barCrawlInfo[0].barLng, selectedBarCrawl.barCrawlInfo[0].barLat],
        zoom: 12
      });

      newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      let bounds = new maplibregl.LngLatBounds();

      selectedBarCrawl.barCrawlInfo.forEach(x => {
        bounds.extend([x.barLng, x.barLat]);

        const marker = new maplibregl.Marker({
          color: '#36b8f5',
          className: 'marker'
        }).setLngLat([x.barLng, x.barLat])
        .setPopup(new maplibregl.Popup().setHTML(`<div style="display: flex; flex-direction: column; align-items: left;">
                                                    ${x.imageUrl ? `<img src="${x.imageUrl}" alt="${x.name}" style="width: 200px; padding: 0px; height: 150px; object-fit: cover;" />` : ""}
                                                    <div style="font-weight: bold; font-size: 16px; margin: 8px;">
                                                      ${x.name.length > 38 ? `${x.name.slice(0, 20)}...` : x.name}
                                                    </div>
                                                    <div style="font-size: 14px; margin-left: 8px;">Rating: ${x.rating || "N/A"}</div>
                                                    <div style="font-size: 14px; margin-left: 8px;">Price: ${x.price_level ? "$".repeat(x.price_level) : "N/A"}</div>
                                                  </div>`))
        .addTo(newMap);

        marker.getElement().addEventListener('click', () => {
          newMap.flyTo({
            center: [x.geometry.location.lng(), x.geometry.location.lat()],
            speed: 0.3
          });
        });

        marker.getElement().setAttribute('data-placeid', x.place_id);
      });

      // zoom to fit results
      newMap.fitBounds(bounds, {
        padding: {top: 65, bottom:65, left: 25, right: 25}
      });

      setMap(newMap);
      setMapLoaded(true);
    }
  }, [selectedBarCrawl]);

  const handleAccordionChange = (id, barCrawl) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : null);
    if (isExpanded) {
      //handleBarCrawlClick(barCrawl);
      setSelectedBarCrawl(barCrawl)
    }
  };

  // const handleBarCrawlClick = async (barCrawl) => {
  //   if (!mapInstance.current) return;
  
  //   const directionsService = new google.maps.DirectionsService();
  //   const directionsRenderer = new google.maps.DirectionsRenderer({
  //     map: mapInstance.current,
  //     suppressMarkers: true,
  //   });
    
  //   mapInstance.current.directionsRenderer = directionsRenderer;
  
  //   const locations = barCrawl.barCrawlInfo.map((bar) =>
  //     convertToLatLngLiteral({
  //       latitude: bar.barLat,
  //       longitude: bar.barLng,
  //     })
  //   );
  
  //   const origin = locations[0];
  //   const destination = locations[locations.length - 1];
  //   const waypoints = locations.slice(1, -1).map((location) => ({
  //     location,
  //     stopover: true,
  //   }));
  
  //   let travelMode = google.maps.TravelMode.WALKING;
  
  //   const checkTravelTimes = async () => {
  //     for (let i = 0; i < locations.length - 1; i++) {
  //       const segmentOrigin = locations[i];
  //       const segmentDestination = locations[i + 1];
  
  //       try {
  //         const walkingTime = await getWalkingTime(segmentOrigin, segmentDestination);
  //         const durationMinutes = walkingTime / 60;
  
  //         if (durationMinutes > 15) {
  //           travelMode = google.maps.TravelMode.DRIVING;
  //           break;
  //         }
  //       } catch (error) {
  //         console.error("Error calculating walking time:", error);
  //       }
  //     }
  //   };

  //   const getPolylineOptions = (mode) => {
  //     if (mode === google.maps.TravelMode.WALKING) {
  //       const lineSymbol = {
  //         path: "M 0,-1 0,1",
  //         strokeOpacity: 1,
  //         scale: 4,
  //       };
  
  //       return {
  //         strokeOpacity: 0,
  //         strokeWeight: 0,
  //         icons: [
  //           {
  //             icon: lineSymbol,
  //             offset: "0",
  //             repeat: "20px",
  //           },
  //         ],
  //       };
  //     } else {
  //       return {
  //         strokeColor: theme.primary,
  //         strokeOpacity: 1.0,
  //         strokeWeight: 5,
  //         strokeDasharray: "",
  //       };
  //     }
  //   };
  
  //   try {
  //     await checkTravelTimes();
  
  //     directionsService.route(
  //       {
  //         origin,
  //         destination,
  //         waypoints,
  //         travelMode,
  //       },
  //       (result, status) => {
  //         if (status === google.maps.DirectionsStatus.OK) {
  //           directionsRenderer.setOptions({
  //             polylineOptions: getPolylineOptions(travelMode),
  //           });
  //           directionsRenderer.setDirections(result);
  //         } else {
  //           console.error("Directions request failed due to " + status);
  //         }
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Error checking travel times: ", error);
  //   }
  
  //   mapInstance.current.markers?.forEach((marker) => marker.setMap(null));
  //   mapInstance.current.markers = [];
  
  //   barCrawl.barCrawlInfo.forEach((bar) => {
  //     const marker = new window.google.maps.Marker({
  //       position: convertToLatLngLiteral({
  //         latitude: bar.barLat,
  //         longitude: bar.barLng,
  //       }),
  //       map: mapInstance.current,
  //       title: bar.name,
  //       icon: {
  //         url: selectedMapPin,
  //         scaledSize: new window.google.maps.Size(50, 50),
  //       },
  //     });
  
  //     marker.addListener("click", () => {
  //       new google.maps.InfoWindow({
  //         content: `<strong>${bar.name}</strong><br>Rating: ${bar.rating || "N/A"}`,
  //       }).open(mapInstance.current, marker);
  //     });
  
  //     mapInstance.current.markers.push(marker);
  //   });
  // };


  return (
    <Box
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row", 
        height: "calc(100vh - 50px)",
        backgroundColor: theme.white,
        width: "100%",
      }}
      >
      {isMobile && (
        <Box
          ref={mapRef}
          style={{
            width: "100%",
            flex: isMobile ? "none" : isLarge ? 3 : 5,
            height: isMobile ? "65%" : "calc(100vh - 50px)", 
            zIndex: isMobile ? 50 : 40, 
          }}
        />
      )}

      <Box
        style={{
          display: "flex",
          flex: isMobile ? "none" : isLarge ? 1 : 3,
          flexDirection: "column",
          backgroundColor: theme.white,
          height: isMobile ? "35%" : "calc(100vh - 50px)", 
          padding: "15px 10px 0px 0px",
          overflowY: "scroll",
          zIndex: 40, 
        }}
      >
        {userBarCrawls.map((crawl) => (
          <Accordion
            key={crawl.id}
            expanded={expanded === crawl.id}
            onChange={handleAccordionChange(crawl.id, crawl)}
            sx={{
              border: "none",
              boxShadow: "none",
              "&::before": {
                height: "0px",
                opacity: 0,
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{crawl.barcrawlName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CrawlCrudButtons crawl={crawl} mapInstance={mapInstance} setExpanded={setExpanded} setSelectedBarCrawl={setSelectedBarCrawl} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      {!isMobile && (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flex: isLarge ? 3 : 5,
          }}
        >
          <Box id="map" style={{ width: "100%", height: "calc(100vh - 50px)" }} />
        </Box>
      )}
      {expanded !== null && <FinishedBarList selectedBarCrawl={selectedBarCrawl} />}
      </Box>

  );
}

export default MyCrawlsPage;
