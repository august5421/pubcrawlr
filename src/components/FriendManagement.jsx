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
} from '@mui/material';
import { db } from '../config/Firebase.jsx';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { stringAvatar } from '../functions/functions.jsx';
import Avatar2 from 'boring-avatars';
import { useDispatch, useSelector } from 'react-redux';
import Font from './Font.jsx';
import { setAlert, setChangeInData, setIsLoading, setUnseenRequests } from '../actions/actions.jsx';
import { Badge } from '@mui/material';
import { haversineDistance } from '../functions/functions.jsx';

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
    const usersRef = collection(db, 'Users');
    const q = query(usersRef, orderBy('UserFirstName'), limit(50));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };
  useEffect(() => {
  const loadResults = async () => {
    setLoading(true);
    try {
      const allUsers = await fetchUsers();
      const filteredUsers = allUsers.filter((user) => user.id !== activeUser.UserId);
      const usersThatAreFriends = activeUser.Friends[0].filter((friend) => friend.Type === 'friends');
      
      if (searchTerm.trim() === '') {
        
        if (activeUser.userLocation) {
          const usersWithDistance = filteredUsers.map((user) => {
            const distance = haversineDistance(
              activeUser.userLocation.latitude,
              activeUser.userLocation.longitude,
              user.location?.latitude,
              user.location?.longitude
            );
            return { ...user, distance };
          });
          const sortedUsers = usersWithDistance
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 6);
          const filteredResults = sortedUsers.filter(
            (user) => !usersThatAreFriends.some((friend) => friend.friendId === user.id)
          );
          setResults(filteredResults);
        } else {
          const randomUsers = filteredUsers.sort(() => Math.random() - 0.5).slice(0, 6);
          const filteredResults = randomUsers.filter(
            (user) => !usersThatAreFriends.some((friend) => friend.friendId === user.id)
          );
          setResults(filteredResults);
        }
        
      } else {
        const matches = filteredUsers.filter((user) =>
          user.UserFirstName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (matches.length > 0) {
          const matchedUsersWithDistance = matches.map((user) => {
            if (activeUser.userLocation) {
              const distance = haversineDistance(
                activeUser.userLocation.latitude,
                activeUser.userLocation.longitude,
                user.location.latitude,
                user.location.longitude
              );
              return { ...user, distance };
            }
            return user;
          });

          const sortedMatches = activeUser.userLocation
            ? matchedUsersWithDistance.sort((a, b) => a.distance - b.distance)
            : matches;

          setResults(sortedMatches.slice(0, 6));
        } else {
          setResults([]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const debounceTimeout = setTimeout(loadResults, 300);
  return () => clearTimeout(debounceTimeout);
}, [searchTerm, activeUser.UserId]);


  const handleAddFriend = async (user) => {
    if (!activeUser.UserId) return;
    dispatch(setIsLoading(true))
    try {
      const friendsRef = doc(db, 'Friends', activeUser.UserId);
      const docSnap = await getDoc(friendsRef);
  
      const friendRequest = {
        Name: `${user.UserFirstName} ${user.UserLastName}`,
        friendId: user.id,
        RequestedBy: activeUser.UserId,
        RequestedOn: Timestamp.now(),
        Type: 'request',
        Seen: false,
        FriendAva: user.UserAvatarType
      };
  
      if (docSnap.exists()) {
        await updateDoc(friendsRef, {
          Friends: arrayUnion(friendRequest),
        });
      } else {
        await setDoc(friendsRef, {
          Friends: [friendRequest],
          UserId: activeUser.UserId,
        });
      }
  
      const friendRef = doc(db, 'Friends', user.id);
      const friendDocSnap = await getDoc(friendRef);
  
      const reciprocalRequest = {
        Name: `${activeUser.Name}`,
        friendId: activeUser.UserId,
        RequestedBy: activeUser.UserId,
        RequestedOn: Timestamp.now(),
        Type: 'pending',
        Seen: false,
        FriendAva: activeUser.UserAvatarType
      };
  
      if (friendDocSnap.exists()) {
        await updateDoc(friendRef, {
          Friends: arrayUnion(reciprocalRequest),
        });
      } else {
        await setDoc(friendRef, {
          Friends: [reciprocalRequest],
          UserId: user.id,
        });
      }

      dispatch(setChangeInData(changeInData + 1));
      dispatch(setAlert({ open: true, severity: 'success', message: 'Friend request sent successfully!' }));
      dispatch(setIsLoading(false))
    } catch (error) {
      console.error('Error adding friend:', error);
      dispatch(setAlert({ open: true, severity: 'error', message: 'Failed to send friend request.' }));
      dispatch(setIsLoading(false))
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = async (event, newValue) => {
    setActiveTab(newValue);
  
    if (newValue === 1) {
      try {
        const friendsRef = doc(db, 'Friends', activeUser.UserId);
        const docSnap = await getDoc(friendsRef);
  
        if (docSnap.exists()) {
          const friends = docSnap.data().Friends || [];
          const unseen = friends.filter(
            (friend) => !friend.Seen && friend.RequestedBy !== activeUser.UserId
          );
  
          if (unseen.length > 0) {
            const updatedFriends = friends.map((friend) =>
              unseen.some((u) => u.friendId === friend.friendId)
                ? { ...friend, Seen: true }
                : friend
            );
  
            try {
              await updateDoc(friendsRef, { Friends: updatedFriends });
  
              for (const unseenFriend of unseen) {
                const friendDocRef = doc(db, 'Friends', unseenFriend.friendId);
                const friendDocSnap = await getDoc(friendDocRef);
  
                if (friendDocSnap.exists()) {
                  const friendData = friendDocSnap.data().Friends || [];
                  const updatedFriendData = friendData.map((entry) =>
                    entry.friendId === activeUser.UserId
                      ? { ...entry, Seen: true }
                      : entry
                  );
  
                  try {
                    await updateDoc(friendDocRef, { Friends: updatedFriendData });
                  } catch (error) {
                    console.error(
                      `Error updating Seen status for friend document of ${unseenFriend.friendId}:`,
                      error
                    );
                  }
                }
              }
            } catch (error) {
              console.error('Error updating request seen status:', error);
            } finally {
              dispatch(setChangeInData(changeInData + 1));
              dispatch(setUnseenRequests(unseen.length));
            }
          }
        }
      } catch (error) {
        console.error('Error updating request seen status:', error);
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

  const handleRemoveFriendRequest = async (friend, action) => {
    dispatch(setIsLoading(true))
    try {
      const userFriendsRef = doc(db, 'Friends', activeUser.UserId);
      const userDoc = await getDoc(userFriendsRef);
      if (userDoc.exists()) {
        const updatedFriends = userDoc
          .data()
          .Friends.filter((f) => f.friendId !== friend.friendId);
        await updateDoc(userFriendsRef, { Friends: updatedFriends });
      }
  
      const friendFriendsRef = doc(db, 'Friends', friend.friendId);
      const friendDoc = await getDoc(friendFriendsRef);
      if (friendDoc.exists()) {
        const updatedFriends = friendDoc
          .data()
          .Friends.filter((f) => f.friendId !== activeUser.UserId);
        await updateDoc(friendFriendsRef, { Friends: updatedFriends });
      }
  
      dispatch(setChangeInData(changeInData + 1));
      dispatch(
        setAlert({
          open: true,
          severity: 'success',
          message: `Friend request ${action.toLowerCase()}ed successfully!`,
        })
      );
      dispatch(setIsLoading(false))
    } catch (error) {
      console.error(`Error handling ${action.toLowerCase()} action:`, error);
      dispatch(
        setAlert({
          open: true,
          severity: 'error',
          message: `Failed to ${action.toLowerCase()} friend request.`,
        })
      );
      dispatch(setIsLoading(false))
    }
  };

  const handleAcceptFriendRequest = async (friend) => {
    dispatch(setIsLoading(true))
    try {
      const userFriendsRef = doc(db, 'Friends', activeUser.UserId);
      const userDoc = await getDoc(userFriendsRef);
      if (userDoc.exists()) {
        const updatedFriends = userDoc
          .data()
          .Friends.map((f) =>
            f.friendId === friend.friendId ? { ...f, Type: 'friends' } : f
          );
        await updateDoc(userFriendsRef, { Friends: updatedFriends });
      }
  
      const friendFriendsRef = doc(db, 'Friends', friend.friendId);
      const friendDoc = await getDoc(friendFriendsRef);
      if (friendDoc.exists()) {
        const updatedFriends = friendDoc
          .data()
          .Friends.map((f) =>
            f.friendId === activeUser.UserId ? { ...f, Type: 'friends' } : f
          );
        await updateDoc(friendFriendsRef, { Friends: updatedFriends });
      }
  
      dispatch(setChangeInData(changeInData + 1));
      dispatch(
        setAlert({
          open: true,
          severity: 'success',
          message: 'Friend request accepted successfully!',
        })
      );
      dispatch(setIsLoading(false))
    } catch (error) {
      console.error('Error accepting friend request:', error);
      dispatch(
        setAlert({
          open: true,
          severity: 'error',
          message: 'Failed to accept friend request.',
        })
      );
      dispatch(setIsLoading(false))
    }
  };

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
        <CircularProgress size={24} style={{ display: 'block', margin: '10px auto' }} />
      ) : results.length === 0 && searchTerm.trim() !== '' ? (
        <Typography type="caption" sx={{ textAlign: 'center', marginTop: '20px' }}>
          No results found
        </Typography>
      ) : (
        <List>
          {results.map((user) => (
            <ListItem key={user.id}>
              {user.UserAvatarType !== 'text' ? (
                <Avatar2 size={75} name={user.id} variant={user.UserAvatarType} />
              ) : (
                <Avatar
                  sx={{
                    backgroundColor: theme.primary,
                    fontSize: '30px',
                    color: 'white',
                    width: 75,
                    height: 75,
                  }}
                >
                  {stringAvatar(user.UserFirstName + ' ' + user.UserLastName)}
                </Avatar>
              )}
              <ListItemText
                sx={{ marginLeft: '10px' }}
                primary={`${user.UserFirstName} ${user.UserLastName}`}
                secondary={getAcceptedFriendStatus(user.id) ? 'Friend' : user.UserEmail}
              />
              {getAcceptedFriendStatus(user.id) ? null : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAddFriend(user)}
                  disabled={getFriendStatus(user.id) ? true : false}
                  sx={{
                    borderRadius: "50px",
                    backgroundColor: theme.primary,
                    color: "white",
                    padding: "5px 10px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#444849",
                    },
                  }}
                  
                >
                  {getFriendStatus(user.id) ? 'Pending' : (!isLoading ? 'Add' : <CircularProgress size="25px" sx={{ color: theme.white }} />)}
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </>
  );

  const renderRequestsTab = () => {
    const filteredRequests = activeUser.Friends[0]?.filter(
      (friend) => friend.Type !== 'friends'
    );
  
    return (
    <>
      {filteredRequests?.length > 0 ? (
        <List>
          {filteredRequests?.map((friend, index) => (
            <ListItem key={friend.friendId} alignItems="center">
              {friend.FriendAva !== 'text' ? (
                <Avatar2 style={{marginRight: '10px'}} size={75} name={friend.friendId} variant={friend.FriendAva} />
              ) : (
                <Avatar
                  sx={{
                    backgroundColor: theme.primary,
                    fontSize: '30px',
                    color: 'white',
                    width: 75,
                    height: 75,
                    marginRight: '10px'
                  }}
                >
                  {stringAvatar(friend.Name)}
                </Avatar>
              )}
              <ListItemText
                primary={friend.Name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Requested On: {new Date(friend.RequestedOn.seconds * 1000).toLocaleString()}
                    </Typography>
                    <br />
                    {friend.Seen ? (
                      <Typography component="span" variant="body2" color="green">
                        Seen
                      </Typography>
                    ) : (
                      <Typography component="span" variant="body2" color="red">
                        Not Seen
                      </Typography>
                    )}
                  </>
                }
              />
              {friend.RequestedBy === activeUser.UserId ? (
                <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={true}
                    sx={{
                      borderRadius: "50px",
                      backgroundColor: theme.primary,
                      color: "white",
                      padding: "5px 10px",
                      minWidth: '75px',
                      marginRight: '10px',
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#444849",
                      },
                    }}
                    
                  >
                    Pending
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRemoveFriendRequest(friend, 'Rescind')}
                    sx={{
                      borderRadius: "50px",
                      backgroundColor: theme.primary,
                      color: "white",
                      minWidth: '75px',
                      padding: "5px 10px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#444849",
                      },
                    }}
                    
                  >
                    {!isLoading ? 'Rescind' : <CircularProgress size="25px" sx={{ color: theme.white }} />}
                  </Button>
                </Box>
                
              ) : (
                <Box style={{display: 'flex', flexDirection: 'row'}}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRemoveFriendRequest(friend, 'Decline')}
                    sx={{
                      borderRadius: "50px",
                      backgroundColor: "white",
                      color: theme.primary,
                      padding: "5px 10px",
                      marginRight: '10px',
                      minWidth: '75px',
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    
                  >
                    {!isLoading ? 'Decline' : <CircularProgress size="25px" sx={{ color: theme.primary }} />}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAcceptFriendRequest(friend)}
                    sx={{
                      borderRadius: "50px",
                      backgroundColor: theme.primary,
                      color: "white",
                      padding: "5px 10px",
                      minWidth: '75px',
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#444849",
                      },
                    }}
                    
                  >
                    {!isLoading ? 'Accept' : <CircularProgress size="25px" sx={{ color: theme.white }} />}
                  </Button>
                </Box>
                
              )}
            </ListItem>
          ))}
        </List>
      ) : (
        <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
          <Typography variant="caption">
            You don't currently have any pending friend requests
          </Typography>
        </Box>
      )}
    </>
  )};
  
  const renderFriendsTab = () => {
    const friendsList = activeUser.Friends[0]?.filter(
      (friend) => friend.Type === 'friends'
    );
  
    return (
      <>
        {friendsList?.length > 0 ? (
          <List>
            {friendsList?.map((friend, index) => (
              <ListItem key={friend.friendId}>
                {friend.UserAvatarType !== 'text' ? (
                  <Avatar2 style={{marginRight: '10px'}} size={75} name={friend.friendId} variant={friend.FriendAva} />
                ) : (
                  <Avatar
                    sx={{
                      backgroundColor: theme.primary,
                      fontSize: '30px',
                      color: 'white',
                      width: 75,
                      height: 75,
                      marginRight: '10px'
                    }}
                  >
                    {stringAvatar(friend.Name)}
                  </Avatar>
                )}
                <Box style={{display: 'flex', flexDirection: 'row', flex: 1, width: '100%', justifyContent: 'space-between'}}>
                  <ListItemText primary={friend.Name} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRemoveFriendRequest(friend, 'Rescind')}
                    sx={{
                      borderRadius: "50px",
                      backgroundColor: theme.primary,
                      color: "white",
                      minWidth: '75px',
                      padding: "5px 10px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#444849",
                      },
                    }}
                    
                  >
                    {!isLoading ? 'Unfriend' : <CircularProgress size="25px" sx={{ color: theme.white }} />}
                  </Button>
                </Box>
                
              </ListItem>
            ))}
          </List>
        ) : (
          <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
            <Typography variant="caption">
              You don't currently have any friends
            </Typography>
          </Box>
          
        )}
      </>
    );
  };

  return (
    <div>
      <Font
        text="Friends"
        color={theme.primary}
        variant="h5"
        weight="bold"
        fontFamily="PrimaryOrig"
      />
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ marginTop: '10px' }}>
        <Tab label="Search" />
        <Tab
          label={
            <Badge
              badgeContent={unseenRequests}
              color="error"
              
              invisible={unseenRequests === 0}
            >
              Requests{unseenRequests === 0 ? null : <>&nbsp;&nbsp;&nbsp;</>}
            </Badge>
          }
        />
        <Tab label="Friends" />
      </Tabs>
      <Divider sx={{ margin: '10px 0' }} />
      <Box>
        {activeTab === 0 && renderSearchTab()}
        {activeTab === 1 && renderRequestsTab()}
        {activeTab === 2 && renderFriendsTab()}
      </Box>
    </div>
  );
};

export default FriendManagement;
