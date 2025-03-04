import { useEffect, useState } from 'react';
import { Box, TextField, Button, Avatar, Typography, Accordion, AccordionSummary, AccordionDetails, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { ExpandMore, ArrowForward, ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import Avatar2 from 'boring-avatars';
import Font from '../components/Font.jsx';
import { setActiveUser, setAlert, setIsLoading } from '../actions/actions.jsx';
import { updateUser, updatePasswordForUser } from '../services/AuthenticationService.jsx';
import { darkenColor, stringAvatar } from '../functions/functions.jsx';

const avaTypes = ['text', 'marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus'];

function ProfileManagement() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const activeUser = useSelector((state) => state.activeUser);
  const isLoading = useSelector((state) => state.isLoading);
  const [avaRoto, setAvaRoto] = useState(null);
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    passwordAccordionExpanded: false,
  });

  useEffect(()=>{
    setAvaRoto(activeUser.UserAvatarType)
    setFormState({
      firstName: activeUser.Name.split(' ')[0],
      lastName: activeUser.Name.split(' ')[1] || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      passwordAccordionExpanded: false,
    })
  }, [activeUser])

  const handleChange = (key, value) => setFormState(prevState => ({ ...prevState, [key]: value }));

  const handleAvatarChange = (direction) => {
    const currentIndex = avaTypes.indexOf(avaRoto);
    const nextIndex = (currentIndex + direction + avaTypes.length) % avaTypes.length;
    setAvaRoto(avaTypes[nextIndex]);
  };

  const validateFields = () => {
    let missingFields = [];
    if (!formState.firstName) missingFields.push('First Name');
    if (formState.passwordAccordionExpanded) {
      if (!formState.oldPassword) missingFields.push('Old Password');
      if (!formState.newPassword) missingFields.push('New Password');
      if (!formState.confirmPassword) missingFields.push('Password Confirmation');
    }
    if (missingFields.length > 0) {
      dispatch(setAlert({ open: true, severity: 'error', message: `The ${missingFields.join(' & ')} field${missingFields.length > 1 ? 's' : ''} are required.` }));
      return false;
    }
    if (formState.newPassword !== formState.confirmPassword) {
      dispatch(setAlert({ open: true, severity: 'error', message: 'The passwords do not match' }));
      return false;
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    dispatch(setIsLoading("Load", true));
    dispatch(setIsLoading("Name", 'Update Profile'));

    try {
      await updateUser(activeUser.UserId, formState.firstName, formState.lastName, avaRoto);

      if (formState.passwordAccordionExpanded) {
        const success = await updatePasswordForUser(formState.oldPassword, formState.newPassword);
        if (success) {
          dispatch(setAlert({ open: true, severity: 'success', message: 'Password updated successfully!' }));
        }
      }

      dispatch(setActiveUser({ key: 'Name', value: `${formState.firstName} ${formState.lastName}` }));
      dispatch(setActiveUser({ key: 'UserAvatarType', value: avaRoto }));
      dispatch(setAlert({ open: true, severity: 'success', message: 'User information updated successfully!' }));
    } catch (error) {
      dispatch(setAlert({ open: true, severity: 'error', message: 'Failed to update profile. Please try again.' }));
    } finally {
      dispatch(setIsLoading("Load", false));
      dispatch(setIsLoading("Name", ''));
    }
  };

  return (
    <Box style={{
        backgroundColor: theme.cream,
        padding: '15px',
        margin: '15px 15px 15px 0px',
        borderRadius: '15px',
        height: '100%'
    }}>
      <Font text="My Profile" color={theme.primary} variant="h5" weight="bold" fontFamily="PrimaryOrig" />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => handleAvatarChange(-1)}><ArrowBack /></IconButton>
            {avaRoto !== 'text' ? (
              <Avatar2 size={75} name={activeUser.UserId} variant={avaRoto} />
            ) : (
              <Avatar sx={{ backgroundColor: theme.primary, fontSize: 30, color: 'white', width: 75, height: 75 }}>
                {stringAvatar(activeUser.Name)}
              </Avatar>
            )}
            <IconButton onClick={() => handleAvatarChange(1)}><ArrowForward /></IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ marginTop: 2, textAlign: 'center' }}>
        <TextField fullWidth label="First Name" size="small" value={formState.firstName} onChange={(e) => handleChange('firstName', e.target.value)} margin="normal" />
        <TextField fullWidth label="Last Name" size="small" value={formState.lastName} onChange={(e) => handleChange('lastName', e.target.value)} margin="normal" />

        <Accordion
            expanded={formState.passwordAccordionExpanded}
            onChange={() => handleChange('passwordAccordionExpanded', !formState.passwordAccordionExpanded)}
            sx={{
              border: 'none',
              backgroundColor: theme.cream,
              boxShadow: 'none',
              '&::before': {
                height: '0px',
                opacity: 0,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="change-pw"
              id="change-pw"
              sx={{ padding: '0px 0px 0px 4px' }}
            >
            <Typography variant="subtitle1">Change Password</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            {['Old Password', 'New Password', 'Confirm New Password'].map((label, idx) => (
              <TextField
                key={label}
                fullWidth
                label={label}
                size="small"
                type={formState[`show${label.replace(' ', '')}`] ? 'text' : 'password'}
                value={formState[label.toLowerCase().replace(' ', '')]}
                onChange={(e) => handleChange(label.toLowerCase().replace(' ', ''), e.target.value)}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleChange(`show${label.replace(' ', '')}`, !formState[`show${label.replace(' ', '')}`])}>
                        {formState[`show${label.replace(' ', '')}`] ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
          </AccordionDetails>
        </Accordion>

        <Button
          type="submit"
          variant="contained"
          sx={{
            borderRadius: '50px',
            backgroundColor: theme.primary,
            color: 'white',
            width: '100%',
            padding: '5px 20px',
            textTransform: 'none',
            marginTop: 2,
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = darkenColor(theme.primary, 0.1)}
          onMouseOut={(e) => e.target.style.backgroundColor = theme.primary}
          onClick={handleUpdate}
        >
          {isLoading.Name === 'Update Profile' && isLoading.Load ? <CircularProgress size={25} sx={{ color: theme.white }} /> : 'Update Profile'}
        </Button>
      </Box>
    </Box>
  );
}

export default ProfileManagement;
