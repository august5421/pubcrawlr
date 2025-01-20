import { db } from '../config/Firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePage, setIsLoading, setModal, setChangeInData, setAlert } from '../actions/actions';
import Font from './Font';
import { convertToLatLngLiteral } from '../functions/functions';

function CrawlCrudButtons({ crawl, mapInstance, setSelectedBarCrawl, setExpanded }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isLoading = useSelector((state) => state.isLoading);
  const isLarge = useSelector((state) => state.isLarge);
  const location = useSelector((state) => state.location);
  const userBarCrawls = useSelector((state) => state.userBarCrawls);
  const changeInData = useSelector((state) => state.changeInData);

  const handleDeleteCrawl = (crawl) => {
    dispatch(setIsLoading(true))
    dispatch(
      setModal(
        true,
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: theme.white,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Font
            text="Are you sure?"
            color={theme.primary}
            variant="h6"
            weight="bold"
            fontFamily="PrimaryOrig"
          />
          <Typography id="auth-modal-description" sx={{ mb: 3 }}>
            Deleting this crawl will permanently remove it from your account and from those invited.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                try {
                  await deleteDoc(doc(db, "BarCrawls", crawl.id));
                  setExpanded(null);
                  if (mapInstance.current) {
                    mapInstance.current.markers?.forEach((marker) => marker.setMap(null));
                    mapInstance.current.markers = [];
                  }
              
                  if (mapInstance.current) {
                    mapInstance.current.setCenter(convertToLatLngLiteral(location));
                    mapInstance.current.setZoom(14); 
                  }
              
                  if (mapInstance.current.directionsRenderer) {
                    mapInstance.current.directionsRenderer.setMap(null);
                    mapInstance.current.directionsRenderer = null;
                  }

                  setSelectedBarCrawl([])
                  dispatch(setChangeInData(changeInData + 1));
                  dispatch(setModal(false, null));
                  dispatch(setAlert({ open: true, severity: 'success', message: 'Bar crawl deleted successfully!' }));
                  dispatch(setIsLoading(false));
                } catch (error) {
                  dispatch(setAlert({ open: true, severity: 'error', message: ("Error deleting bar crawl: " + error) }));
                } finally {
                    if (userBarCrawls.length === 1) {
                      dispatch(setActivePage("In", false));
                      setTimeout(() => {
                        dispatch(setActivePage("In", true));
                        dispatch(setActivePage("Name", "App"));
                      }, 375);
                    }
                }
              }}
              
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                dispatch(setIsLoading(false))
                dispatch(setModal(false, null))}}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )
    );
  };

  return (
    <Box style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
    <Box style={{ display: "flex", flexDirection: "column" }}>
        <Button variant="contained" color="primary">
        Start
        </Button>
    </Box>
    <Box style={{ display: "flex", flexDirection: "column" }}>
        <Button variant="contained" color="secondary">
        Edit
        </Button>
    </Box>
    <Box style={{ display: "flex", flexDirection: "column" }}>
        <Button variant="contained" color="error" onClick={() => handleDeleteCrawl(crawl)}>
        {!isLoading ? ('Delete') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
        </Button>
    </Box>
    </Box>  
  );
}

export default CrawlCrudButtons;
