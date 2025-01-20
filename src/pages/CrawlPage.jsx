import { useState, useEffect, useRef } from 'react';
import { getWalkingTime } from '../functions/functions';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import selectedMapPin from "../../public/assets/images/noPersonSelectedPin.png";
import FinishedBarList from '../components/FinishedBarList';
import { convertToLatLngLiteral } from '../functions/functions';
import CrawlCrudButtons from '../components/CrawlCrudButtons';

function CrawlPage() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isLoading = useSelector((state) => state.isLoading);
  const isLarge = useSelector((state) => state.isLarge);
  const location = useSelector((state) => state.location);
  const userBarCrawls = useSelector((state) => state.userBarCrawls);
  const changeInData = useSelector((state) => state.changeInData);

  const mapRef = useRef(null); 
  const mapInstance = useRef(null);
  const [expanded, setExpanded] = useState(null);
  const [selectedBarCrawl, setSelectedBarCrawl] = useState({})

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: convertToLatLngLiteral(location), 
        zoom: 14, 
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
      });
    } else if (mapInstance.current) {
      mapInstance.current.setCenter(convertToLatLngLiteral(location));
    }
  }, [location]);

  const handleAccordionChange = (id, barCrawl) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : null);
    if (isExpanded) {
      handleBarCrawlClick(barCrawl);
      setSelectedBarCrawl(barCrawl)
    }
  };

  const handleBarCrawlClick = async (barCrawl) => {
    if (!mapInstance.current) return;
  
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: mapInstance.current,
      suppressMarkers: true,
    });
    
    mapInstance.current.directionsRenderer = directionsRenderer;
  
    const locations = barCrawl.barCrawlInfo.map((bar) =>
      convertToLatLngLiteral({
        latitude: bar.barLat,
        longitude: bar.barLng,
      })
    );
  
    const origin = locations[0];
    const destination = locations[locations.length - 1];
    const waypoints = locations.slice(1, -1).map((location) => ({
      location,
      stopover: true,
    }));
  
    let travelMode = google.maps.TravelMode.WALKING;
  
    const checkTravelTimes = async () => {
      for (let i = 0; i < locations.length - 1; i++) {
        const segmentOrigin = locations[i];
        const segmentDestination = locations[i + 1];
  
        try {
          const walkingTime = await getWalkingTime(segmentOrigin, segmentDestination);
          const durationMinutes = walkingTime / 60;
  
          if (durationMinutes > 15) {
            travelMode = google.maps.TravelMode.DRIVING;
            break;
          }
        } catch (error) {
          console.error("Error calculating walking time:", error);
        }
      }
    };

    const getPolylineOptions = (mode) => {
      if (mode === google.maps.TravelMode.WALKING) {
        const lineSymbol = {
          path: "M 0,-1 0,1",
          strokeOpacity: 1,
          scale: 4,
        };
  
        return {
          strokeOpacity: 0,
          strokeWeight: 0,
          icons: [
            {
              icon: lineSymbol,
              offset: "0",
              repeat: "20px",
            },
          ],
        };
      } else {
        return {
          strokeColor: theme.primary,
          strokeOpacity: 1.0,
          strokeWeight: 5,
          strokeDasharray: "",
        };
      }
    };
  
    try {
      await checkTravelTimes();
  
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setOptions({
              polylineOptions: getPolylineOptions(travelMode),
            });
            directionsRenderer.setDirections(result);
          } else {
            console.error("Directions request failed due to " + status);
          }
        }
      );
    } catch (error) {
      console.error("Error checking travel times: ", error);
    }
  
    mapInstance.current.markers?.forEach((marker) => marker.setMap(null));
    mapInstance.current.markers = [];
  
    barCrawl.barCrawlInfo.forEach((bar) => {
      const marker = new window.google.maps.Marker({
        position: convertToLatLngLiteral({
          latitude: bar.barLat,
          longitude: bar.barLng,
        }),
        map: mapInstance.current,
        title: bar.name,
        icon: {
          url: selectedMapPin,
          scaledSize: new window.google.maps.Size(50, 50),
        },
      });
  
      marker.addListener("click", () => {
        new google.maps.InfoWindow({
          content: `<strong>${bar.name}</strong><br>Rating: ${bar.rating || "N/A"}`,
        }).open(mapInstance.current, marker);
      });
  
      mapInstance.current.markers.push(marker);
    });
  };

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
          <Box ref={mapRef} style={{ width: "100%", height: "calc(100vh - 50px)" }} />
        </Box>
      )}
      {expanded !== null && <FinishedBarList selectedBarCrawl={selectedBarCrawl} />}
      </Box>

  );
}

export default CrawlPage;
