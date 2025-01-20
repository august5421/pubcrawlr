import React, { useState, useEffect } from 'react';
import {
  TextField,
  List,
  ListItem,
  Avatar,
  ListItemText,
  CircularProgress,
  Button,
  Divider,
  Typography,
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
import { setAlert, setChangeInData } from '../actions/actions.jsx';

const FriendManagement = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const activeUser = useSelector((state) => state.activeUser);
  const changeInData = useSelector((state) => state.changeInData); 
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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

        if (searchTerm.trim() === '') {
          const randomUsers = filteredUsers.sort(() => Math.random() - 0.5).slice(0, 6);
          setResults(randomUsers);
        } else {
          const matches = filteredUsers.filter((user) =>
            user.UserFirstName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          if (matches.length > 0) {
            setResults(matches.slice(0, 6)); 
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
    
    try {
      const friendsRef = doc(db, 'Friends', activeUser.UserId);
      const docSnap = await getDoc(friendsRef);
  
      const friendRequest = {
        Name: `${user.UserFirstName} ${user.UserLastName}`,
        friendId: user.id,
        RequestedBy: activeUser.UserId,
        RequestedOn: Timestamp.now(),
        Type: 'request',
        Seen: true,
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
  
    } catch (error) {
      console.error('Error adding friend:', error);
      dispatch(setAlert({ open: true, severity: 'error', message: 'Failed to send friend request.' }));
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getFriendStatus = (x) => {
    const friendExists = activeUser.Friends[0].some(friend => friend.friendId === x);
    return friendExists;
  }  

  return (
    <div>
      <Font
        text="Friends"
        color={theme.primary}
        variant="h5"
        weight="bold"
        fontFamily="PrimaryOrig"
      />
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
        <Typography type='caption' sx={{ textAlign: 'center', marginTop: '20px' }}>No results found </Typography>
      ) : (
        <List>
          {results.map((user) => (
            <ListItem key={user.id} button>
              {user.UserAvatarType !== 'text' ? (
                <Avatar2 size={75} name={user.UserId} variant={user.UserAvatarType} />
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
                secondary={user.UserEmail}
              />
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
                {getFriendStatus(user.id) ? 'Pending' : 'Add'}
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default FriendManagement;
