import { useEffect, useState } from 'react';
import { Box, TextField, Button, Avatar, Typography, Snackbar, Alert, IconButton, InputAdornment, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { darkenColor } from '../functions/functions.jsx';
import { stringAvatar } from '../functions/functions.jsx';
import Font from '../components/Font.jsx';
import { setActiveUser, setAlert, setIsLoading } from '../actions/actions.jsx';
import Avatar2 from 'boring-avatars';
import FriendManagement from '../components/FriendManagement.jsx';
import { updateUser, updatePasswordForUser } from '../services/AuthenticationService.jsx';

function AccountPage() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const activeUser = useSelector((state) => state.activeUser);
  const isLoading = useSelector((state) => state.isLoading);

  const [avaRoto, setAvaRoto] = useState(activeUser.UserAvatarType);
  const [formState, setFormState] = useState({
    firstName: activeUser.Name.split(' ')[0],
    lastName: activeUser.Name.split(' ')[1] || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    passwordAccordionExpanded: false,
  });

  const avaTypes = ['text', 'marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus']

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    dispatch(setIsLoading(true))
    try {
      await updateUser(activeUser.UserId, formState.firstName, formState.lastName, avaRoto);
      if (formState.passwordAccordionExpanded) {
        const success = await updatePasswordForUser(formState.oldPassword, formState.newPassword);
        if (success) {
          setAlert({
            open: true,
            severity: 'success',
            message: 'Password updated successfully!',
          });
        }
      }
      dispatch(setActiveUser({ key: 'Name', value: `${formState.firstName} ${formState.lastName}` }));
      dispatch(setActiveUser({ key: 'UserAvatarType', value: avaRoto }));
      dispatch(setAlert({ open: true, severity: 'success', message: 'User information updated successfully!' }))
      dispatch(setIsLoading(false))
    } catch (error) {
      dispatch(setAlert({ open: true, severity: 'error', message: 'Failed to update profile. Please try again.' }))
      dispatch(setIsLoading(false))
    }
  };

  const validateFields = () => {
    let missingFields = [];

    if (!formState.firstName) missingFields.push('First Name');
    if (formState.passwordAccordionExpanded && !formState.oldPassword) missingFields.push('Old Password');
    if (formState.passwordAccordionExpanded && !formState.newPassword) missingFields.push('New Password');
    if (formState.passwordAccordionExpanded && !formState.confirmPassword) missingFields.push('Password Confirmation');

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

    if (formState.newPassword !== formState.confirmPassword) {
      dispatch(setAlert({ open: true, severity: 'error', message: 'The passwords do not match' }))
      return false;
    }

    return true;
  };

  const handleChange = (key, value) => {
    setFormState(prevState => ({
      ...prevState,
      [key]: value,
    }));
  };

  const nextAvatarType = () => {
    const currentIndex = avaTypes.indexOf(avaRoto);
    const nextIndex = (currentIndex + 1) % avaTypes.length;
    setAvaRoto(avaTypes[nextIndex]);
  };

  const prevAvatarType = () => {
    const currentIndex = avaTypes.indexOf(avaRoto);
    const prevIndex = (currentIndex - 1 + avaTypes.length) % avaTypes.length;
    setAvaRoto(avaTypes[prevIndex]);
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(100vh - 50px)',
        padding: isMobile || isTablet ? '0px' : '0px 10px',
        backgroundColor: theme.white,
        width: 'calc(100vw - 20px)%',
      }}
    >
      <Box
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          backgroundColor: theme.white,
          height: '140px',
          width: '100%',
          zIndex: 40,
          padding: '15px 15px 0px 15px',
        }}
      >
        <Font
          text='Personal Information'
          color={theme.primary}
          variant="h5"
          weight="bold"
          fontFamily="PrimaryOrig"
        />
        <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
          <Box style={{ display: 'flex', flexDirection: 'column', marginRight: '15px' }}>
            <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Box sx={{ cursor: 'pointer', margin: '0px 10px' }} onClick={prevAvatarType} aria-label="Previous Avatar Type">
                <ArrowBackIcon />
              </Box>
              {avaRoto !== 'text' ? (
                <Avatar2 size={75} name={activeUser.UserId} variant={avaRoto} />
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
                  {stringAvatar(activeUser.Name)}
                </Avatar>
              )}
              <Box sx={{ cursor: 'pointer', margin: '0px 10px' }} onClick={nextAvatarType} aria-label="Next Avatar Type">
                <ArrowForwardIcon />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box style={{ marginTop: '10px', textAlign: 'center' }}>
          <TextField
            fullWidth
            label="First Name"
            size="small"
            value={formState.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            size="small"
            value={formState.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            margin="normal"
          />
          <Accordion
            expanded={formState.passwordAccordionExpanded}
            onChange={() => handleChange('passwordAccordionExpanded', !formState.passwordAccordionExpanded)}
            sx={{
              border: 'none',
              boxShadow: 'none',
              '&::before': {
                height: '0px',
                opacity: 0,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="change-pw"
              id="change-pw"
              sx={{ padding: '0px 0px 0px 4px' }}
            >
              <Typography variant="subtitle1">Change Password</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '0px' }}>
              <TextField
                fullWidth
                label="Old Password"
                size="small"
                type={formState.showOldPassword ? 'text' : 'password'}
                value={formState.oldPassword}
                onChange={(e) => handleChange('oldPassword', e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleChange('showOldPassword', !formState.showOldPassword)}>
                        {formState.showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                size="small"
                type={formState.showNewPassword ? 'text' : 'password'}
                value={formState.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleChange('showNewPassword', !formState.showNewPassword)}>
                        {formState.showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                size="small"
                type={formState.showConfirmPassword ? 'text' : 'password'}
                value={formState.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleChange('showConfirmPassword', !formState.showConfirmPassword)}>
                        {formState.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </AccordionDetails>
          </Accordion>
          <Button
            type="submit"
            variant="contained"
            style={{
              borderRadius: '50px',
              backgroundColor: theme.primary,
              color: 'white',
              minWidth: '100px',
              width: '100%',
              border: `1px solid transparent`,
              padding: '5px 20px',
              textTransform: 'none',
              margin: '10px 0px',
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))
            }
            onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
            onClick={handleUpdate}
          >
            {!isLoading ? ('Update Profile') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
          </Button>
        </Box>
      </Box>
      <Box
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          backgroundColor: theme.white,
          height: '140px',
          width: '100%',
          zIndex: 40,
          padding: '15px 15px 0px 15px',
        }}
      >
        <FriendManagement />
      </Box>
    </Box>
  );
}

export default AccountPage;
