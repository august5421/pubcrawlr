import { useState, useEffect } from 'react';
import { Box, Alert, AlertTitle, Button } from "@mui/material";
import { useDispatch, useSelector } from 'react-redux';
import FinishedBarList from '../components/FinishedBarList';
import { useNavigate, useParams } from "react-router-dom";
import { getBarCrawl } from '../services/BarCrawlService';
import { getMarkerHTML } from '../functions/functions';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLibreGlDirections, { LoadingIndicatorControl } from "@maplibre/maplibre-gl-directions";
import BarCrawlOrganizerRoot from '../components/BarCrawlOrganizerRoot';
import { setIsAdmin, setSelectedBars } from '../actions/actions';
import { getFriendsData } from '../services/FriendsService';

function SingleCrawlPage() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const isLarge = useSelector((state) => state.isLarge);
  const activeUser = useSelector((state) => state.activeUser);
  const isAdmin = useSelector((state) => state.isAdmin);
  const selectedBars = useSelector((state) => state.selectedBars);

  const [crawl, setCrawl] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [crawlLoaded, setCrawlLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [pubcrawlAccess, setPubcrawlAccess] = useState({access: true, reason: 'assume crawl is public'});
  const [friendsOfCrawlOwner, setFriendsOfCrawlOwner] = useState([]);
  const { slug } = useParams();
  const navigate = useNavigate();
  
  // load crawl by id
  useEffect(() => {
    const fetchCrawl = async () => {
      try {
        const response = await getBarCrawl(slug);
        setCrawl(response);
        setCrawlLoaded(true);
        dispatch(setSelectedBars(response.barCrawlInfo || []));
      } catch (error) {
        console.error("Error fetching bar crawl:", error);
  
        if (error.code === "permission-denied") {
          setPubcrawlAccess({ access: false, reason: "User not logged in" });
        } else {
          setPubcrawlAccess({ access: false, reason: "Bar crawl does not exist" });
        }
      }
    };
  
    fetchCrawl();
  }, [slug, dispatch]);
  
  
  // set isAdmin global state and local state for friends of the bar crawl owner
  useEffect(() => {
    if (crawl && crawl.admins) {
      const isUserAdmin = crawl.admins.includes(activeUser.UserId);
      dispatch(setIsAdmin(isUserAdmin));
    }

    if (crawl?.userID) {
      getFriendsData(crawl.userID).then((data) => {
        setFriendsOfCrawlOwner(data); 
      }).catch((error) => {
        console.error("Error fetching friends data:", error);
      });
    }
  }, [crawl, activeUser.UserId, dispatch]);

  useEffect(()=>{
    const isUserFriend = friendsOfCrawlOwner?.friendsData?.flat()?.some(
      friend => friend.friendId === activeUser.UserId && friend.Type === "friends"
    );    
    const isUserInvited = crawl?.invitees?.flat()?.some(
      friend => friend.UserID === activeUser.UserId
    );
    
    switch(crawl.intamacyLevel) {
      case 'Private':
        if (isUserInvited) {
          setPubcrawlAccess({access: true, reason: 'User is invited'})
        } else {
          if (!isAdmin) {
            setPubcrawlAccess({access: false, reason: 'User is not invited'})  
          } else {
            setPubcrawlAccess({access: true, reason: 'User is an admin'})
          }
        }
        break;
      case 'Friends':
        if (isUserFriend) {
          setPubcrawlAccess({access: true, reason: 'User is a friend'})
        } else {
          if (!isAdmin) {
            setPubcrawlAccess({access: false, reason: 'User is not a friend'})  
          } else {
            setPubcrawlAccess({access: true, reason: 'User is an admin'})
          }
        }
        break;
      case 'Public':
        setPubcrawlAccess({access: true, reason: 'Bar crawl is public'})
        break;
      default:
        setPubcrawlAccess({access: true, reason: 'Bar crawl is public'})
    }
  }, [friendsOfCrawlOwner])

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

  const handleReturnToHome = () => {
    dispatch(setSelectedBars([]));
    navigate('/');
  }

  const handleSecondaryButton = () => {
    switch(pubcrawlAccess.reason) {
      case 'User not logged in':
       navigate('/Login');
        break;
      case 'User is not invited':
      // code to request invite
          break;
      case 'User is not friends':
      //  code to request friendship
        break;
      default:
        navigate('/Account');
    }
  }

  return (
    <>  
      {pubcrawlAccess.access ? (
        <Box
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            height: "calc(100vh - 50px)",
            backgroundColor: theme.white,
            width: "100%",
          }}
        >
          {crawlLoaded && <BarCrawlOrganizerRoot crawl={crawl} mode="edit" slug={slug} setCrawl={setCrawl} />}
          {!isMobile && !isTablet ?  (
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                flex: isLarge ? 3 : 5,
              }}
            >
              <Box id="map" style={{ width: "100%", height: "calc(100vh - 50px)" }} />
            </Box>
          ) : (
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Box id="map" style={{ width: "100%", height: "calc(100vh - 50px)" }} />
            </Box>
          )}
          
        </Box>
      ) : (
        <Box
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 82px)",
            backgroundColor: theme.white,
            width: "calc(100vw - 32px)",
            padding: "16px",
          }}
        >
          <Alert
            severity={pubcrawlAccess.allowed ? "success" : "error"}
            sx={{
              width: "100%",
              maxWidth: isMobile ? "90%" : "600px",
              borderRadius: "8px",
              boxShadow: 3,
              padding: "16px",
              overflow: 'visible',
            }}
          >
            <AlertTitle>{pubcrawlAccess.reason === 'Bar crawl does not exist' ? "This Is Not the Crawl You're Looking For" : 'Who Do You Know Here?'}</AlertTitle>
            {
              pubcrawlAccess.reason === "User not logged in"
                ? "You need to be logged in to access other users bar crawls. Please login or sign up to continue, or you can build a crawl of your own to give the app a try before signing up."
                : pubcrawlAccess.reason === "User is not invited"
                ? "We're sorry but the owner of this bar crawl only wants to allow crawlers that they've invited and you do not appear in the guest list at this time."
                : pubcrawlAccess.reason === "User is not friends"
                ? "We're sorry but the owner of this bar crawl only wants to allow crawlers that they're friends with and you are not friends at this time."
                : "We're sorry, it looks like the bar crawl you are trying to load doesn't exist or has expired. Please try a different bar crawl or create one of your own!"
            }

            <Box style={{display: 'flex', flexDirection: 'row', margin: '30px 16px 0px 0px'}}>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "50px",
                  backgroundColor: "white",
                  color: theme.primary,
                  padding: "5px 0px",
                  width: "calc(100% - 20px)",
                  margin: '0px 10px 0px 0px',
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#444849",
                  },
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                onClick={() => {handleReturnToHome()}}
              >
                Create A Crawl
              </Button>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "50px",
                  backgroundColor: theme.primary,
                  color: "white",
                  padding: "5px 0px",
                  width: "calc(100% - 20px)",
                  margin: '0px 10px 0px 0px',
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#444849",
                  },
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
                onClick={() => {handleSecondaryButton()}}
              >
                {
                  pubcrawlAccess.reason === "User not logged in"
                    ? "Login"
                    : pubcrawlAccess.reason === "User is not invited"
                    ? "Request Invite"
                    : pubcrawlAccess.reason === "User is not friends"
                    ? "Request Friend"
                    : "Dashboard"
                }
              </Button>
            </Box>
          </Alert>
        </Box>
      )}
    </>
  );
}

export default SingleCrawlPage;