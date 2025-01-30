import React, { useState, useEffect } from 'react';
import {
  TextField,
  List,
  Box,
  ListItem,
  Avatar,
  ListItemText,
  CircularProgress,
  Button,
  Divider,
  Typography,
  Tabs,
  Tab,
  ListItemButton,
} from '@mui/material';
import { stringAvatar } from '../functions/functions.jsx';
import Avatar2 from 'boring-avatars';
import { useDispatch, useSelector } from 'react-redux';
import Font from './Font.jsx';
import { setAlert, setChangeInData, setIsLoading, setModal, setUnseenRequests } from '../actions/actions.jsx';
import { Badge } from '@mui/material';
import { addFriend, removeFriendRequest, acceptFriendRequest, updateFriendRequestsSeen, fetchUsersFromFirestore } from '../services/FriendsService';

const FriendManagement = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const activeUser = useSelector((state) => state.activeUser);
  const changeInData = useSelector((state) => state.changeInData); 
  const unseenRequests = useSelector((state) => state.unseenRequests);
  const isLoading = useSelector((state) => state.isLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const fetchUsers = async () => {
    try {
      const users = await fetchUsersFromFirestore();
      return users || []; 
    } catch (error) {
      console.error('Error fetching users:', error);
      return []; 
    }
  };

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        const allUsers = await fetchUsers();
        
        if (!Array.isArray(allUsers)) {
          throw new Error('Fetched users are not an array');
        }
  
        const filteredUsers = allUsers.filter((user) => user.id !== activeUser.UserId);
  
        if (searchTerm.trim() === '') {
          const randomUsers = filteredUsers.sort(() => Math.random() - 0.5).slice(0, 6);
          setResults(randomUsers);
        } else {
          const filteredResults = filteredUsers.filter(
            (user) =>
              user.UserFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.UserLastName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setResults(filteredResults.slice(0, 6)); 
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        dispatch(setAlert({ open: true, severity: 'error', message: 'Failed to fetch users.' }));
      } finally {
        setLoading(false);
      }
    };
  
    loadResults();
  }, [searchTerm, activeUser.UserId]);
  

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = async (event, newValue) => {
    setActiveTab(newValue);
  
    if (newValue === 1) {
      dispatch(setIsLoading("Load", true));
      dispatch(setIsLoading("Name", 'Updating Requests'));
  
      try {
        const unseenCount = await updateFriendRequestsSeen(activeUser.UserId);
  
        if (unseenCount > 0) {
          dispatch(setChangeInData(changeInData + 1));
          dispatch(setUnseenRequests(unseenCount));
        }
      } catch (error) {
        dispatch(setAlert({
          open: true,
          severity: 'error',
          message: 'Failed to update friend request status.',
        }));
      } finally {
        dispatch(setIsLoading("Load", false));
        dispatch(setIsLoading("Name", ''));
      }
    }
  };
  
  const getFriendStatus = (x) => {
    const friendExists = activeUser.Friends[0]?.some(friend => friend.friendId === x);
    return friendExists;
  }  

  const getAcceptedFriendStatus = (x) => {
    const friendExists = activeUser.Friends[0]?.some(friend => friend.friendId === x && friend.Type === 'friends');
    return friendExists;
  }  


  const handleAddFriend = async (user) => {
    if (!activeUser.UserId) return;
    dispatch(setIsLoading("Load", true));
    dispatch(setIsLoading("Name", 'Add'));
    try {
      await addFriend(activeUser, user);
      dispatch(setChangeInData(changeInData + 1));
      dispatch(setAlert({ open: true, severity: 'success', message: 'Friend request sent successfully!' }));
    } catch (error) {
      console.error('Error adding friend:', error);
      dispatch(setAlert({ open: true, severity: 'error', message: 'Failed to send friend request.' }));
    } finally {
      dispatch(setIsLoading("Load", false));
      dispatch(setIsLoading("Name", ''));
    }
  };

  const handleRemoveFriendRequest = async (friend, action) => {
    dispatch(setIsLoading("Load", true));
    dispatch(setIsLoading("Name", action));
    try {
      await removeFriendRequest(activeUser, friend, action);
      dispatch(setChangeInData(changeInData + 1));
      dispatch(setAlert({ open: true, severity: 'success', message: `Friend request ${action.toLowerCase()}ed successfully!` }));
    } catch (error) {
      console.error(`Error handling ${action.toLowerCase()} action:`, error);
      dispatch(setAlert({ open: true, severity: 'error', message: `Failed to ${action.toLowerCase()} friend request.` }));
    } finally {
      dispatch(setIsLoading("Load", false));
      dispatch(setIsLoading("Name", ''));
    }
  };

  const handleAcceptFriendRequest = async (friend) => {
    dispatch(setIsLoading("Load", true));
    dispatch(setIsLoading("Name", 'Accept'));
    try {
      await acceptFriendRequest(activeUser, friend);
      dispatch(setChangeInData(changeInData + 1));
      dispatch(setAlert({ open: true, severity: 'success', message: 'Friend request accepted successfully!' }));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      dispatch(setAlert({ open: true, severity: 'error', message: 'Failed to accept friend request.' }));
    } finally {
      dispatch(setIsLoading("Load", false));
      dispatch(setIsLoading("Name", ''));
    }
  };

  const openModal = (content) => {
    dispatch(setModal(true,
      content
    ))
  }

  const renderAvatar = (user) => (
    user.UserAvatarType !== 'text' ? (
      <Avatar2 size="50px" name={user.id} variant={user.UserAvatarType} />
    ) : (
      <Avatar sx={{
        backgroundColor: theme.primary,
        fontSize: '20px',
        color: 'white',
        width: 50,
        height: 50,
      }}>
        {stringAvatar(user.UserFirstName + ' ' + user.UserLastName)}
      </Avatar>
    )
  );

  const renderButton = (user, actionType) => (
    <Button
      variant="contained"
      color="primary"
      onClick={() => {
        if (actionType === 'Accept') {
          dispatch(setModal(false, null))
          handleAcceptFriendRequest(user);
        } else {
          dispatch(setModal(false, null))
          actionType === 'add' 
            ? handleAddFriend(user) 
            : handleRemoveFriendRequest(user, actionType);
        }
      }}      
      disabled={getFriendStatus(user.id) ? true : false}
      sx={{
        borderRadius: "50px",
        backgroundColor: actionType === 'Decline' ? theme.white : theme.primary,
        color: actionType === 'Decline' ? theme.primary : theme.white,
        padding: "5px 10px",
        textTransform: "none",
        marginRight: '5px',
        "&:hover": { backgroundColor: "#444849" },
      }}
    >
      {isLoading.Name === actionType && isLoading.Load
        ? <CircularProgress size="25px" sx={{ color: theme.white }} />
        : actionType === 'add' ? (getFriendStatus(user.id) ? 'Pending' : 'Request')
          : actionType === 'Rescind' ? 'Rescind'
          : actionType === 'Accept' ? 'Accept'
          : 'Decline'
      }
    </Button>
  );

  const renderSearchTab = () => (
    <>
      <TextField
        label="Search Friends"
        variant="outlined"
        fullWidth
        size="small"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder="Type a name..."
        sx={{ marginTop: '10px' }}
      />
      {loading ? (
        <CircularProgress size={24} sx={{ display: 'block', margin: '10px auto' }} />
      ) : results.length === 0 && searchTerm.trim() !== '' ? (
        <Typography type="caption" sx={{ textAlign: 'center', marginTop: '20px' }}>
          No results found
        </Typography>
      ) : (
        <List>
          {results.map((user) => (
            <ListItemButton 
              onClick={() => {openModal(
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
                  }}
                >
                  <Font text={`${user.UserFirstName} ${user.UserLastName}`} color={theme.primary} variant="h6" weight="bold" fontFamily="PrimaryOrig" />
                  {getAcceptedFriendStatus(user.id) ? 'Friend' : user.UserEmail}
                  <Divider sx={{margin: '10px 0px'}} />
                  {!getAcceptedFriendStatus(user.id) && renderButton(user, 'add')}
              </Box>
              )}}
              disableGutters 
              key={user.id}
            >
              
              {renderAvatar(user)}
              <ListItemText
                sx={{ marginLeft: '10px' }}
                primary={`${user.UserFirstName} ${user.UserLastName}`}
                secondary={getAcceptedFriendStatus(user.id) ? 'Friend' : user.UserEmail}
              />
              
              
            </ListItemButton>
          ))}
        </List>
      )}
    </>
  );

  const renderRequestsTab = () => {
    const filteredRequests = activeUser.Friends[0]?.filter(friend => friend.Type !== 'friends');
    return (
      <>
        {filteredRequests?.length > 0 ? (
          <List>
            {filteredRequests.map((friend) => (
              <ListItemButton 
              onClick={() => {openModal(
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
                  }}
                >
                  <Font text={friend.Name} color={theme.primary} variant="h6" weight="bold" fontFamily="PrimaryOrig" />
                  <Typography component="span" variant="body2" color="text.primary">
                    Requested On: {new Date(friend.RequestedOn.seconds * 1000).toLocaleString()}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color={friend.Seen ? 'green' : 'red'}>
                    {friend.Seen ? 'Seen' : 'Not Seen'}
                  </Typography>
                  <Divider sx={{margin: '10px 0px'}} />
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    {friend.RequestedBy === activeUser.UserId ? (
                      <>
                        {renderButton(friend, 'Rescind')}
                      </>
                    ) : (
                      <>
                        {renderButton(friend, 'Decline')}
                        {renderButton(friend, 'Accept')}
                      </>
                    )}
                  </Box>
                </Box>
              )}}
              disableGutters 
              key={friend.friendId} 
              alignItems="center">
                {renderAvatar(friend)}
                <ListItemText
                  primary={<Box style={{marginLeft: '10px'}}>{friend.Name}</Box>}
                  secondary={
                    <Box style={{marginLeft: '10px'}}>
                      <Typography component="span" variant="body2" color="text.primary">
                        Requested On: {new Date(friend.RequestedOn.seconds * 1000).toLocaleString()}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color={friend.Seen ? 'green' : 'red'}>
                        {friend.Seen ? 'Seen' : 'Not Seen'}
                      </Typography>
                    </Box>
                  }
                />
                
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="caption">You don't currently have any pending friend requests</Typography>
          </Box>
        )}
      </>
    );
  };

  const renderFriendsTab = () => {
    const friendsList = activeUser.Friends[0]?.filter(friend => friend.Type === 'friends');
    return (
      <>
        {friendsList?.length > 0 ? (
          <List>
            {friendsList.map((friend) => (
              <ListItemButton onClick={() => {openModal(
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
                  }}
                >
                  <Font text={friend.Name} color={theme.primary} variant="h6" weight="bold" fontFamily="PrimaryOrig" />
                  <Typography component="span" variant="body2" color="text.primary">
                    Friends Since: {new Date(friend.RequestedOn.seconds * 1000).toLocaleString()}
                  </Typography>
                  <Divider sx={{margin: '10px 0px'}} />
                  {renderButton(friend, 'Rescind')}
              </Box>
              )}}
              disableGutters sx={{ p: 0 }} key={friend.friendId}>
                {renderAvatar(friend)}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                  <ListItemText primary={<Box style={{marginLeft: '10px'}}>{friend.Name}</Box>} />
                </Box>
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="caption">You don't currently have any friends</Typography>
          </Box>
        )}
      </>
    );
  };

  return (
    <Box sx={{
      backgroundColor: theme.cream,
      padding: '15px',
      margin: '15px 15px 15px 0px',
      borderRadius: '15px',
      height: '100%',
    }}>
      <Font text="My Friends" color={theme.primary} variant="h5" weight="bold" fontFamily="PrimaryOrig" />
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginTop: '10px' }}>
        <Tab label="Search" />
        <Tab label={<Badge badgeContent={unseenRequests} color="error" invisible={unseenRequests === 0}>Requests</Badge>} />
        <Tab label="Friends" />
      </Tabs>
      <Divider sx={{ margin: '10px 0' }} />
      <Box>
        {activeTab === 0 && renderSearchTab()}
        {activeTab === 1 && renderRequestsTab()}
        {activeTab === 2 && renderFriendsTab()}
      </Box>
    </Box>
  );
};

export default FriendManagement;
