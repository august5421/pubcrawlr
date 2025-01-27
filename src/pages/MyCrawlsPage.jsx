import { useState, useEffect, useRef } from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import FinishedBarList from '../components/FinishedBarList';
import CrawlCrudButtons from '../components/CrawlCrudButtons';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLibreGlDirections, { LoadingIndicatorControl } from "@maplibre/maplibre-gl-directions";
import { getMarkerHTML } from '../functions/functions';

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
  const [directions, setDirections] = useState(null);

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
      setMapLoaded(false);
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
          .setPopup(new maplibregl.Popup().setHTML(getMarkerHTML(x.imageUrl, x.name, x.rating, x.price_level, x.place_id, false)))
          .addTo(newMap);

        marker.getElement().addEventListener('click', () => {
          newMap.flyTo({
            center: [x.barLng, x.barLat],
            speed: 0.3
          });
        });

        marker.getElement().setAttribute('data-placeid', x.place_id);
      });

      // zoom to fit results
      newMap.fitBounds(bounds, {
        padding: { top: 65, bottom: 65, left: 25, right: 25 },
        speed: 0.5
      });

      setMap(newMap);
      newMap.on('load', () => {
        const newDirections = new MapLibreGlDirections(newMap, {
          profile: 'foot'
        });
        newMap.addControl(new LoadingIndicatorControl(newDirections));
        setDirections(newDirections);
      });
      setMapLoaded(true);
    }
  }, [selectedBarCrawl]);

  useEffect(() => {
    if (mapLoaded && directions) {
      directions.setWaypoints([
        ...selectedBarCrawl.barCrawlInfo.map(x => {
          return [x.barLng, x.barLat];
        })
      ]);
    }
  }, [directions, mapLoaded]);

  const handleAccordionChange = (id, barCrawl) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : null);
    if (isExpanded) {
      setSelectedBarCrawl(barCrawl)
    }
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
          <Box id="map" style={{ width: "100%", height: "calc(100vh - 50px)" }} />
        </Box>
      )}
      {expanded !== null && <FinishedBarList selectedBarCrawl={selectedBarCrawl} />}
    </Box>

  );
}

export default MyCrawlsPage;
