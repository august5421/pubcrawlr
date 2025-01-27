import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Button, Fade, Avatar, Drawer, Typography, Divider, Badge } from "@mui/material";
import Font from "./Font";
import { setShowAuth, setActiveUser, setSelectedBars, setBarResults, setBarResultsInBounds } from "../actions/actions";
import Cookies from "js-cookie";
import { stringAvatar, darkenColor } from '../functions/functions';
import Avatar2 from "boring-avatars";
import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const showAuth = useSelector((state) => state.showAuth);
  const activeUser = useSelector((state) => state.activeUser);
  const userBarCrawls = useSelector((state) => state.userBarCrawls)
  const unseenRequests = useSelector((state) => state.unseenRequests)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("user");

    dispatch(setActiveUser({ key: "Name", value: "" }));
    dispatch(setActiveUser({ key: "UserId", value: "" }));
    dispatch(setActiveUser({ key: "Email", value: "" }));
    dispatch(setActiveUser({ key: "UserAvatarType", value: "" }));
    dispatch(setSelectedBars([]))
    dispatch(setBarResults([]))
    dispatch(setBarResultsInBounds([]))
    dispatch(setShowAuth(false));
    setDrawerOpen(false);
    navigate('/');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
        height: "50px",
        padding: "0px 10px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        backgroundColor: theme.white,
      }}
    >
      <NavLink style={{ cursor: "pointer" }} to="/">
        <Font text="Pubcrawlr" color={theme.primary} variant="h4" weight="bold" fontFamily="PrimaryOrig"/>
      </NavLink>
      <Fade in={showAuth}>
        <Box style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {activeUser.UserId === "" ? (
            <>
              <Button
                variant="outlined"
                style={{
                  borderRadius: "50px",
                  backgroundColor: "white",
                  color: theme.primary,
                  border: `1px solid transparent`,
                  padding: "5px 20px",
                  textTransform: "none",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
              >
                <NavLink to="/Login">Login</NavLink>
              </Button>

              <Button
                variant="contained"
                style={{
                  borderRadius: "50px",
                  backgroundColor: theme.primary,
                  color: "white",
                  padding: "5px 20px",
                  textTransform: "none",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))}
                onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
              >
                <NavLink to="/Signup">Sign Up</NavLink>
              </Button>
            </>
          ) : (
            <>
              <Box sx={{position: 'relative'}}>
                {activeUser.UserAvatarType !== 'text' ? (
                  <Avatar2 style={{cursor: "pointer"}} onClick={toggleDrawer(true)} size={40} name={activeUser.UserId} variant={activeUser.UserAvatarType} />
                ) : (
                  <Avatar
                    onClick={toggleDrawer(true)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: theme.primary,
                      color: "white",
                    }}
                  >
                    {stringAvatar(activeUser.Name)}
                    
                  </Avatar>
                )}
                <Badge
                  badgeContent={unseenRequests}
                  color="error"
                  invisible={unseenRequests === 0}
                  sx={{
                    position: 'absolute',
                    right: 1,
                    top: 6
                  }}
                />
              </Box>
              <Drawer sx={{width: isMobile ? '80%' : '400px'}} anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box
                  style={{
                    width: 250,
                    display: "flex",
                    flexDirection: "column",
                    height: "calc(100vh - 40px)",
                    padding: "20px",
                    justifyContent: "space-between",
                  }}
                >
                  <Box style={{display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="h6" style={{ marginBottom: "20px", textAlign: 'center', marginBottom: '20px' }}>
                        Welcome, {activeUser.Name || "User"}
                    </Typography>
                    <Divider />
                    <Typography variant="subtitle1"
                      sx={{cursor: 'pointer', marginTop: '15px'}}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                    >
                        <NavLink to="/">Create A Crawl</NavLink>
                    </Typography>
                    {userBarCrawls.length > 0 && (
                      <Typography variant="subtitle1"
                        sx={{cursor: 'pointer', marginTop: '15px'}}
                        onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                      >
                          <NavLink to="/Crawls">My Crawls</NavLink>
                      </Typography>
                    )}
                    <Typography variant="subtitle1"
                      sx={{cursor: 'pointer', marginTop: '15px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                    >
                        <NavLink to="/Account">Account & Friends</NavLink>
                        <Badge badgeContent={unseenRequests} color="error" invisible={unseenRequests === 0} />
                    </Typography>
                    
                  </Box>
                  
                  <Box>
                    <Divider />
                    <Button
                        variant="contained"
                        style={{
                            borderRadius: "50px",
                            width: '100%',
                            backgroundColor: theme.primary,
                            color: "white",
                            padding: "10px 20px",
                            textTransform: "none",
                            alignSelf: "flex-end",
                            marginTop: '20px',
                        }}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                  </Box>
                </Box>
              </Drawer>
            </>
          )}
        </Box>
      </Fade>
    </Box>
  );
}

export default Navbar;
