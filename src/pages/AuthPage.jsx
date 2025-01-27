import { useState } from 'react';
import { Box, TextField, Button, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Font from '../components/Font.jsx';
import { darkenColor } from '../functions/functions.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setShowAuth, setActiveUser, setAlert, setIsLoading } from '../actions/actions.jsx';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { signIn, getUser, getFriendsForUser, createUser, sendPasswordReset } from '../services/AuthenticationService.jsx';

function AuthPage({ mode }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isLoading = useSelector((state) => state.isLoading);
  const location = useSelector((state) => state.location);
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    fName: '',
    lName: '',
    email: '',
    password: '',
    confirmPassword: '',
    error: '',
    showPassword: false,
    showConfirmPassword: false
  });
  const [forgotPw, setForgotPw] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.target.value
    }));
  };

  const validateFields = () => {
    const { email, password, confirmPassword, fName, lName } = formState;
    let missingFields = [];

    if (!email) missingFields.push('Email');
    if (!password && !forgotPw) missingFields.push('Password');

    if (mode === 'signup') {
      if (!fName) missingFields.push('First Name');
      if (!lName) missingFields.push('Last Name');
      if (password !== confirmPassword) {
        dispatch(setAlert({ open: true, severity: 'error', message: 'Passwords do not match.' }))
        return false;
      }
      if (!confirmPassword) missingFields.push('Confirm Password');
    }

    if (missingFields.length > 0) {
      let message = 'The ';
      if (missingFields.length === 1) {
        message += `${missingFields[0]} field is required.`;
      } else {
        message += `${missingFields.slice(0, missingFields.length - 1).join(', ')} & ${missingFields[missingFields.length - 1]} fields are required.`;
      }
      dispatch(setAlert({ open: true, severity: 'error', message: message }))
      return false;
    }
    return true;
  };

  const updateUserState = (name, userId, email, avatarType, friendsArray, userLocation,) => {
    dispatch(setActiveUser({ key: 'Name', value: name }));
    dispatch(setActiveUser({ key: 'UserId', value: userId }));
    dispatch(setActiveUser({ key: 'Email', value: email }));
    dispatch(setActiveUser({ key: 'UserAvatarType', value: avatarType }));
    dispatch(setActiveUser({ key: 'Friends', value: friendsArray }));
    dispatch(setActiveUser({ key: 'userLocation', userLocation }));
    dispatch(setIsLoading(false));

    Cookies.set('user', JSON.stringify({
      userId: userId,
      userName: name,
      userEmail: email,
      UserAvatarType: avatarType,
      Friends: friendsArray,
      userLocation: userLocation ? userLocation : null
    }), { expires: 7 });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    dispatch(setIsLoading(true))
    if (!forgotPw) {
      try {
        const { email, password, confirmPassword, fName, lName } = formState;

        if (mode === 'login') {
          const user = await signIn(email, password);
          const userData = await getUser(user.uid);

          if (userData) {
            const friendsArray = await getFriendsForUser(user.uid);
            updateUserState(`${userData.UserFirstName} ${userData.UserLastName}`, user.uid, userData.email, userData.UserAvatarType, friendsArray, userData.userLocation);
          } else {
            console.log('No such user data found in Firestore!');
            dispatch(setIsLoading(false))
          }
        } else if (mode === 'signup') {
          if (password !== confirmPassword) {
            dispatch(setAlert({ open: true, severity: 'error', message: 'Passwords do not match.' }));
            dispatch(setIsLoading(false));
            return;
          }

          try {
            const user = await createUser(email, password);
            const friendsArray = await getFriendsForUser(user.uid)
            updateUserState(`${fName} ${lName}`, user.uid, email, 'text', friendsArray, location);
          } catch (error) {
            dispatch(setIsLoading(false));
          }
        }

        dispatch(setShowAuth(true));
        setTimeout(() => {
          navigate('/');
        }, 375);
      } catch (error) {
        dispatch(setAlert({ open: true, severity: 'error', message: 'Incorrect email or password' }))
        dispatch(setIsLoading(false))
      }
    } else {
      try {
        await sendPasswordReset(formState.email);
        dispatch(setAlert({ open: true, severity: 'success', message: 'Passwords reset email sent successfully. Please check your email for further instructions.' }))
        dispatch(setIsLoading(false))
      } catch (error) {
        dispatch(setIsLoading(false))
      }
    }
  };

  const togglePasswordVisibility = () => {
    setFormState((prevState) => ({
      ...prevState,
      showPassword: !prevState.showPassword
    }));
  };

  const toggleConfirmPasswordVisibility = () => {
    setFormState((prevState) => ({
      ...prevState,
      showConfirmPassword: !prevState.showConfirmPassword
    }));
  };

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 50px)', padding: '0px 10px', width: isMobile ? 'calc(100vw - 20px)' : '100%' }}>
      <form onSubmit={handleAuth} style={{ borderRadius: '25px', width: '500px', backgroundColor: 'white', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Font
          text={mode === 'login' ? (!forgotPw ? 'Login' : 'Forgot Password') : 'Sign Up'}
          color={theme.black}
          variant="h5"
          weight="bold"
          fontFamily="PrimaryOrig"
        />
        {mode === 'signup' && (
          <>
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formState.fName}
              size="small"

              onChange={handleInputChange('fName')}
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formState.lName}
              size="small"

              onChange={handleInputChange('lName')}
            />
          </>
        )}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formState.email}
          size="small"

          onChange={handleInputChange('email')}
        />
        {!forgotPw && (
          <TextField
            label="Password"
            type={formState.showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            size="small"

            value={formState.password}
            onChange={handleInputChange('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility}>
                    {formState.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        {mode === 'login' && !forgotPw && (
          <Box
            style={{
              color: theme.primary,
              marginTop: '15px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onClick={() => setForgotPw(true)}
          >
            <Font
              text="Forgot Password?"
              color={theme.primary}
              variant="caption"
              weight="bold"
              fontFamily="PrimaryOrig"
            />
          </Box>
        )}
        {mode === 'signup' && (
          <TextField
            label="Confirm Password"
            type={formState.showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            size="small"

            value={formState.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPasswordVisibility}>
                    {formState.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          style={{
            borderRadius: '50px',
            backgroundColor: theme.primary,
            color: 'white',
            minWidth: '100px',
            border: `1px solid transparent`,
            padding: '5px 20px',
            textTransform: 'none',
            marginTop: '20px',
          }}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))
          }
          onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
        >
          {!isLoading ? (mode === 'login' ? (!forgotPw ? 'Login' : 'Forgot Password') : 'Sign Up') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
        </Button>
        <Box onClick={() => { mode === 'login' ? navigate('/Signup') : navigate('/Login') }} style={{ color: theme.primary, marginTop: '15px', cursor: 'pointer' }}>
          <Font
            text={mode === 'login' ? 'Need an account? Sign Up!' : 'Already have an account? Login!'}
            color={theme.primary}
            variant="caption"
            weight="bold"
            fontFamily="PrimaryOrig"
          />
        </Box>
      </form>
    </Box>
  );
}

export default AuthPage;
