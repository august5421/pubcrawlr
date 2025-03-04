import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@mui/system';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import { Alert, Fade, Snackbar, Modal, Typography } from '@mui/material';
import { setActiveUser, setAlert, setUserBarCrawls, setModal, setIsLoading, setUnseenRequests, setLocation, setLocalBarCrawls } from './actions/actions';
import Cookies from 'js-cookie';
import AccountPage from './pages/DashboardPage';
import MyCrawlsPage from './pages/MyCrawlsPage';
import SingleCrawlPage from './pages/SingleCrawlPage';
import { Routes, Route } from 'react-router-dom';
import { getAllBarCrawlsForUser, getAllLocalBarCrawls } from './services/BarCrawlService';
import { getFriendsData } from './services/FriendsService';

function App() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const activeUser = useSelector((state) => state.activeUser);
  const alert = useSelector((state) => state.alert);
  const changeInData = useSelector((state) => state.changeInData);
  const modalState = useSelector((state) => state.modalState);
  const unseenRequests = useSelector((state) => state.unseenRequests);
  const location = useSelector((state) => state.location);
  const userBarCrawls = useSelector((state) => state.userBarCrawls);

  useEffect(() => {
    if (navigator.geolocation && !location) {
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

  const handleCloseMod = () => {
    dispatch(setModal(false, null))
    dispatch(setIsLoading("Load", false));
    dispatch(setIsLoading("Name", ''));
  };

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      const user = JSON.parse(userCookie);
      dispatch(setActiveUser({ key: 'UserId', value: user.userId }));
      dispatch(setActiveUser({ key: 'Name', value: user.userName }));
      dispatch(setActiveUser({ key: 'Email', value: user.userEmail }));
      dispatch(setActiveUser({ key: 'UserAvatarType', value: user.UserAvatarType }));
      dispatch(setActiveUser({ key: 'Friends', value: user.Friends }));
      dispatch(setActiveUser({ key: 'userLocation', value: user.userLocation }));
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            dispatch(setLocation({ latitude, longitude }));
          },
          (error) => {
            console.error('Error getting location:', error);
            dispatch(setLocation(null));
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    }
  }, []);

  useEffect(() => {
    if (!activeUser?.UserId) return;

    getFriendsData(activeUser.UserId).then((response) => {
      dispatch(setUnseenRequests(response.unseenCount?.length))
      dispatch(setActiveUser({ key: 'Friends', value: response.friendsData }));
    });

    getAllBarCrawlsForUser(activeUser.UserId).then((response) => {
      dispatch(setUserBarCrawls(response));
    });
  }, [activeUser?.UserId, changeInData, dispatch]);

  useEffect(()=>{
    if (!activeUser?.UserId) return;
    getAllLocalBarCrawls(location, activeUser.UserId).then((response) => {
      dispatch(setLocalBarCrawls(response));
    });
  }, [location])

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    dispatch(setAlert({ open: false }));
  };

  return (
    <Box style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', backgroundColor: theme.black, overflow: 'hidden' }}>
      <Navbar />
      <Box style={{ display: 'flex', height: 'calc(100vh - 50px)', width: '100%' }}>
        <Fade in={true}>
          <Box style={{ width: '100%' }}>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/Login" element={<AuthPage mode="login" />} />
              <Route path="/Signup" element={<AuthPage mode="signup" />} />
              <Route path="/Dashboard" element={<AccountPage />} />
              <Route path="/Crawl/:slug" element={<SingleCrawlPage />} />
            </Routes>
          </Box>
        </Fade>
      </Box>
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      <Modal
        open={modalState.open}
        onClose={handleCloseMod}
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
      >
        {modalState.content || <Typography>No content available.</Typography>}
      </Modal>
    </Box>
  )
}

export default App
