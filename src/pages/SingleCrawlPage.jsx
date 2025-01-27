import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import FinishedBarList from '../components/FinishedBarList';
import { useParams } from "react-router-dom";
import { getBarCrawl } from '../services/BarCrawlService';
import { getMarkerHTML } from '../functions/functions';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLibreGlDirections, { LoadingIndicatorControl } from "@maplibre/maplibre-gl-directions";

function SingleCrawlPage() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isLarge = useSelector((state) => state.isLarge);
  const location = useSelector((state) => state.location);

  const [crawl, setCrawl] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [crawlLoaded, setCrawlLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const { slug } = useParams();

  // load crawl by id
  useEffect(() => {
    getBarCrawl(slug).then((response) => {
      setCrawl(response);
      setCrawlLoaded(true);
    });
  }, [slug]);

  // render map
  useEffect(() => {
    if (!mapLoaded && crawlLoaded) {
      if (map) return;

      const centerPoint = crawl.barCrawlInfo[0];
      const centerLngLat = [centerPoint.barLng, centerPoint.barLat];
      const newMap = new maplibregl.Map({
        container: 'map',
        style: `https://api.maptiler.com/maps/openstreetmap/style.json?key=uyov68efNrdYsMZCjhLO`,
        center: centerLngLat,
        zoom: 12
      });
      newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      let bounds = new maplibregl.LngLatBounds();

      crawl.barCrawlInfo.forEach(x => {
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
        padding: { top: 65, bottom: 65, left: 25, right: 25 }
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
  }, [crawlLoaded, mapLoaded]);

  useEffect(() => {
    if (mapLoaded && directions) {
      directions.setWaypoints([
        ...crawl.barCrawlInfo.map(x => {
          return [x.barLng, x.barLat];
        })
      ]);
    }
  }, [directions, mapLoaded]);

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
      {crawlLoaded && <FinishedBarList selectedBarCrawl={crawl} />}
    </Box>

  );
}

export default SingleCrawlPage;