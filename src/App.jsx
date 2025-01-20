import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { db } from './config/Firebase';
import { Box } from '@mui/system';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import { Alert, Fade, Snackbar, Modal, Typography, Button } from '@mui/material';
import { setActiveUser, setAlert, setUserBarCrawls, setModal, setIsLoading } from './actions/actions';
import Cookies from 'js-cookie';
import AccountPage from './pages/AccountPage';
import CrawlPage from './pages/CrawlPage';
import Font from './components/Font';

function App() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const activeUser = useSelector((state) => state.activeUser);
  const activePage = useSelector((state) => state.activePage); 
  const alert = useSelector((state) => state.alert); 
  const changeInData = useSelector((state) => state.changeInData); 
  const modalState = useSelector((state) => state.modalState);
  
  const handleCloseMod = () => {
     dispatch(setModal(false, null))
     dispatch(setIsLoading(false))
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
    }
  }, []);

  useEffect(() => {
    const fetchUserBarCrawls = async () => {
      if (!activeUser?.UserId) return;
      try {
        const adminQuery = db.collection('BarCrawls').where('admins', 'array-contains', activeUser.UserId);
        const adminSnapshot = await adminQuery.get();
        const adminCrawls = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const inviteeQuery = db.collection('BarCrawls').where('invitees', 'array-contains', activeUser.UserId);
        const inviteeSnapshot = await inviteeQuery.get();
        const inviteeCrawls = inviteeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allCrawls = [...adminCrawls, ...inviteeCrawls.filter(crawl => !adminCrawls.some(admin => admin.id === crawl.id))];
        const friendsQuery = db.collection('Friends').where('UserId', '==', activeUser.UserId);
        const friendsSnapshot = await friendsQuery.get();
        const friendsData = friendsSnapshot.docs.map(doc => doc.data().Friends);
        dispatch(setActiveUser({ key: 'Friends', value: friendsData }));
        dispatch(setUserBarCrawls(allCrawls));
      } catch (error) {
        console.error('Error fetching user bar crawls:', error);
        dispatch(setAlert({ open: true, message: 'Failed to fetch bar crawls.', severity: 'error' }));
      }
    };
  
    fetchUserBarCrawls();
  }, [activeUser?.UserId, changeInData, dispatch]);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    dispatch(setAlert({ open: false }));
  };
  
  return (
    <Box style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', flexDirection: 'column', backgroundColor: theme.black, overflow: 'hidden'}}>
      <Navbar />
      <Box style={{display: 'flex', height: 'calc(100vh - 50px)', width: '100%'}}>
        <Fade in={activePage.In}>
          <Box style={{width: '100%'}}>
            {activePage.Name == 'App' && (<MainPage />)}
            {activePage.Name === 'Login' && <AuthPage mode="login" />}
            {activePage.Name === 'Signup' && <AuthPage mode="signup" />}
            {activePage.Name === 'Account' && <AccountPage />}
            {activePage.Name === 'Crawls' && <CrawlPage />}
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
