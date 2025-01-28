import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Divider,
  Typography,
  IconButton,
  TextField,
  Button,
  SpeedDial,
  SpeedDialIcon,
  Drawer,
  CircularProgress,
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PublicIcon from '@mui/icons-material/Public';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { setSelectedBars, setBarResults, setAlert, setIsLoading, setChangeInData, setModal, setIsAdmin } from "../actions/actions";
import { darkenColor } from "../functions/functions";
import { saveBarCrawl, addImpression, getBarCrawl, addAttendance } from "../services/BarCrawlService";
import AddIcon from "@mui/icons-material/Add";
import Font from "./Font";
import { useNavigate } from 'react-router-dom';
import { NavLink } from "react-router-dom";
import { Timestamp } from 'firebase/firestore';

function BarCrawlOrganizer({ crawl, mode, slug, setCrawl }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const isLarge = useSelector((state) => state.isLarge);
  const isLoading = useSelector((state) => state.isLoading);
  const selectedBars = useSelector((state) => state.selectedBars);
  const changeInData = useSelector((state) => state.changeInData);
  const activeUser = useSelector((state) => state.activeUser);
  const isAdmin = useSelector((state) => state.isAdmin);
  
  const [barCrawlName, setBarCrawlName] = useState(mode === 'edit' ? crawl.barcrawlName : "");
  const [drawerOpen, setDrawerOpen] = useState(false);  

  const navigate = useNavigate();

  const handleDelete = (place_id) => {
    const updatedBars = selectedBars.filter((bar) => bar.place_id !== place_id);
    dispatch(setSelectedBars(updatedBars));
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;
    const updatedBars = Array.from(selectedBars);
    const [removed] = updatedBars.splice(source.index, 1);
    updatedBars.splice(destination.index, 0, removed);
    dispatch(setSelectedBars(updatedBars));
  };

  const handleBarCrawlNameChange = (event) => {
    setBarCrawlName(event.target.value);
  };

  const handleLike = async (placeId) => {
    const likeRefConstructor = { UserID: activeUser.UserId, placeId: placeId, impression: 'liked' };
    try {
      await addImpression(slug, placeId, likeRefConstructor);
       getBarCrawl(slug).then((response) => {
        setCrawl(response);
        dispatch(setSelectedBars(response.barCrawlInfo || []));
      });
    } catch (error) {
      console.error('Error liking the bar:', error);
    }
  };
  
  const handleDislike = async (placeId) => {
    const dislikeRefConstructor = { UserID: activeUser.UserId, placeId: placeId, impression: 'disliked' };
    try {
      await addImpression(slug, placeId, dislikeRefConstructor);
      getBarCrawl(slug).then((response) => {
       setCrawl(response);
       dispatch(setSelectedBars(response.barCrawlInfo || []));
     });
    } catch (error) {
      console.error('Error disliking the bar:', error);
    }
  };
  
  const handleAttend = async () => {
    const attendeeConstructor = { UserID: activeUser.UserId, attendance: true };
    console.log(attendeeConstructor);
    await addAttendance(slug, attendeeConstructor);  
  };
  
  const handleNotAttend = async () => {
    const nonAttendeeConstructor = { UserID: activeUser.UserId, attendance: false };
    console.log(nonAttendeeConstructor);
    await addAttendance(slug, nonAttendeeConstructor); 
  };

  const handleSaveCrawl = async () => {
    dispatch(setIsLoading(true))
    if (!activeUser.UserId) {
      dispatch(setModal(true,
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
            text={"Great looking crawl!"}
            color={theme.primary}
            variant="h6"
            weight="bold"
            fontFamily="PrimaryOrig"
          />
          <Typography id="auth-modal-description" sx={{ mb: 3 }}>
            Log into your account to save it and start inviting friends. Or alternatively, you can create an account and save it then!
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              style={{
                borderRadius: "50px",
                backgroundColor: "#d3d3d3",
                color: theme.primary,
                border: `1px solid transparent`,
                padding: "5px 20px",
                textTransform: "none",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#d3d3d3")}
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
          </Box>
        </Box>
      ))
    } else {
      try {
        const createdId = await saveBarCrawl(activeUser.UserId, selectedBars, barCrawlName);
        dispatch(setSelectedBars([]));
        dispatch(setBarResults([]));
        dispatch(setAlert({ open: true, severity: 'success', message: 'Bar crawl saved successfully!' }))
        dispatch(setIsLoading(false))
        dispatch(setChangeInData(changeInData + 1))
        setTimeout(() => { navigate(`/Crawl/${createdId}`) }, 375);
      } catch (error) {
        dispatch(setAlert({ open: true, severity: 'error', message: 'There was a problem saving the bar crawl.' }))
        dispatch(setIsLoading(false))
      }
    }
  };

  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
  
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options); 
  
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${(hours % 12) || 12}:${minutes < 10 ? `0${minutes}` : minutes} ${ampm}`;
  
      return `${formattedDate} at ${formattedTime}`;
    }
    return 'Invalid date';
  };

  return (
    <>
      {!isMobile && !isTablet ? (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flex: isLarge ? 1 : 3,
            paddingRight: "10px",
            maxHeight: "calc(100vh - 70px)",
            height: "100%",
            padding: "10px 0px 0px 10px",
          }}
        >
          {mode === 'edit' && !isAdmin ? (
            <Box style={{display: 'flex', flexDirection: 'column'}}>
              <Font
                text={crawl.barcrawlName}
                color={theme.primary}
                variant="h6"
                weight="bold"
                fontFamily="PrimaryOrig"
              />
              <Box style={{display: 'flex', flexDirection: 'row'}}>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <CalendarMonthIcon />
                </Box>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 9}}>
                  <Typography variant="subtitle1">
                    {formatDate(crawl.startDate)}
                  </Typography>
                </Box>
              </Box>
              <Box style={{display: 'flex', flexDirection: 'row'}}>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  {crawl.intamacyLevel === 'Public'}
                  {crawl.intamacyLevel === 'Private'}
                  {crawl.intamacyLevel === 'Friends'}
                </Box>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 9}}>
                  <Typography variant="subtitle1">
                    {crawl.intamacyLevel}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{margin: '10px 0px'}} />
            </Box>
          ) : (
            <TextField
              label="Name Your Crawl"
              variant="outlined"
              size="small"
              value={barCrawlName}
              onChange={handleBarCrawlNameChange}
              sx={{ width: "calc(100% - 10px)", marginBottom: "10px" }}
            />
          )}
          {selectedBars.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="bar-list">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      paddingRight: "10px",
                      overflowY: "scroll",
                    }}
                  >
                    {selectedBars.map((bar, index) => (
                      <Draggable
                        key={bar.place_id}
                        draggableId={bar.place_id}
                        index={index}
                        isDragDisabled={mode === 'edit' && !isAdmin}
                      >
                        {(provided) => (
                          <Box 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            display: 'flex', 
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #e8e8e8', 
                            padding: '5px 0px'
                          }}>
                            <Box
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  {bar.name.length > 38
                                    ? `${bar.name.slice(0, 35)}...`
                                    : bar.name}
                                </Typography>
                                
                              </Box>
                              <Typography variant="body2">
                                Rating: {bar.rating || "N/A"}
                              </Typography>
                              <Typography variant="body2">
                                Price: {bar.price_level ? ('$'.repeat(bar.price_level)) : ('N/A')}
                              </Typography>
                            </Box>
                            <Box style={{display: 'flex', flexDirection: 'column'}}>
                              <Box style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                {mode === 'edit' && (
                                  <Box style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                    <IconButton 
                                        sx={{visibility: isAdmin ? 'hidden' : 'visible'}} color="primary" onClick={() => {handleLike(bar.place_id)}}>
                                      <ThumbUpIcon />
                                    </IconButton>
                                    <Typography variant="caption">
                                      {isAdmin ? null : bar.impressions.filter(item => item.impression === "liked").length}
                                    </Typography>
                                    <Typography variant="caption">
                                      {isAdmin && bar.impressions.filter(item => item.impression === "liked").length}{(bar.impressions.filter(item => item.impression === "liked").length > 1) || (bar.impressions.filter(item => item.impression === "liked").length === 0) ? ' Likes' : ' Like'}
                                    </Typography>
                                  </Box>
                                )}
                                <Box style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                  {mode !== 'edit' && (
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDelete(bar.place_id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  )}
                                  {isAdmin && (
                                    <IconButton
                                      color="error"
                                      onClick={() => handleDelete(bar.place_id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  )}
                                  {mode === 'edit' && !isAdmin && (
                                      <IconButton color="error" onClick={() => {handleDislike(bar.place_id)}}>
                                        <ThumbDownIcon />
                                      </IconButton>
                                  )}
                                  {mode === 'edit' && (
                                    <>
                                      <Typography variant="caption">
                                        {isAdmin ? null : bar.impressions.filter(item => item.impression === "disliked").length}
                                      </Typography>
                                      <Typography variant="caption">
                                        {isAdmin && bar.impressions.filter(item => item.impression === "disliked").length}{(bar.impressions.filter(item => item.impression === "disliked").length > 1) || (bar.impressions.filter(item => item.impression === "disliked").length === 0) ? ' Dislikes' : ' Dislike'}
                                      </Typography>
                                    </>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {mode === 'edit' && !isAdmin ? (
            <Box style={{display: 'flex', flexDirection: 'row', marginTop: "auto",}}>
              <Button
                variant="contained"
                onClick={() => {handleNotAttend()}}
                sx={{
                  borderRadius: "50px",
                  backgroundColor: "white",
                  color: theme.primary,
                  padding: "5px 0px",
                  width: "calc(100% - 20px)",
                  margin: '0px 10px 0px 0px',
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#444849",
                  },
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
              >
                {!isLoading ? ('Not Attending') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
              </Button>
              <Button
                variant="contained"
                onClick={() => {handleAttend()}}
                sx={{
                  borderRadius: "50px",
                  backgroundColor: theme.primary,
                  color: "white",
                  padding: "5px 0px",
                  width: "calc(100% - 20px)",
                  margin: '0px 10px 0px 0px',
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#444849",
                  },
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
              >
                {!isLoading ? ('Attending') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
              </Button>
            </Box>
          ) : (
            <Button
              onClick={handleSaveCrawl}
              disabled={selectedBars.length < 0 || barCrawlName === ""}
              variant="contained"
              sx={{
                borderRadius: "50px",
                backgroundColor: theme.primary,
                color: "white",
                padding: "5px 0px",
                width: "calc(100% - 20px)",
                textTransform: "none",
                marginTop: "auto",
                "&:hover": {
                  backgroundColor: "#444849",
                },
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))
              }
              onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
            >
              {!isLoading ? ('Save Crawl') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
            </Button>
          )}
        </Box>
      ) : (
        <>
          <SpeedDial
            ariaLabel="SpeedDial"
            icon={<SpeedDialIcon icon={<AddIcon />} />}
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: "fixed",
              left: 10,
              top: mode === 'edit' ? 50 : 200,
              zIndex: 1,
              "& .MuiSpeedDial-fab": {
                backgroundColor: theme.primary,
              },
              "& .MuiSpeedDialIcon": {
                backgroundColor: theme.primary,
              },
            }}
          />

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: "90vw",
                height: '100vh'
              },
            }}
          >
            <Box sx={{ padding: "10px", height: 'calc(100vh - 20px)' }}>
              {mode === 'edit' && !isAdmin ? (
                <Box style={{display: 'flex', flexDirection: 'column'}}>
                  <Font
                    text={crawl.barcrawlName}
                    color={theme.primary}
                    variant="h6"
                    weight="bold"
                    fontFamily="PrimaryOrig"
                  />
                  <Divider sx={{margin: '10px 0px'}} />
                </Box>
              ) : (
                <TextField
                  label="Name Your Crawl"
                  variant="outlined"
                  fullWidth
                  value={barCrawlName}
                  onChange={handleBarCrawlNameChange}
                  sx={{ margin: "10px 0px" }}
                />
              )}

              {selectedBars.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="bar-list">
                    {(provided) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          overflowY: "scroll",
                        }}
                      >
                        {selectedBars.map((bar, index) => (
                          <Draggable
                            key={bar.place_id}
                            draggableId={bar.place_id}
                            isDragDisabled={mode === 'edit' && !isAdmin}
                            index={index}
                          >
                            {(provided) => (
                              <Box 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                display: 'flex', 
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid #e8e8e8', 
                                padding: '5px 0px'
                              }}>
                                <Box
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ fontWeight: "bold" }}
                                    >
                                      {bar.name.length > 38
                                        ? `${bar.name.slice(0, 35)}...`
                                        : bar.name}
                                    </Typography>
                                    
                                  </Box>
                                  <Typography variant="body2">
                                    Rating: {bar.rating || "N/A"}
                                  </Typography>
                                  <Typography variant="body2">
                                    Price: {bar.price_level ? ('$'.repeat(bar.price_level)) : ('N/A')}
                                  </Typography>
                                </Box>
                                <Box style={{display: 'flex', flexDirection: 'column'}}>
                                  <Box style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                    {mode === 'edit' && (
                                      <Box style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                        <IconButton 
                                            sx={{visibility: isAdmin ? 'hidden' : 'visible'}} color="primary" onClick={() => {handleLike(bar.place_id)}}>
                                          <ThumbUpIcon />
                                        </IconButton>
                                        <Typography variant="caption">
                                          {isAdmin ? null : bar.impressions.filter(item => item.impression === "liked").length}
                                        </Typography>
                                        <Typography variant="caption">
                                          {isAdmin && bar.impressions.filter(item => item.impression === "liked").length}{(bar.impressions.filter(item => item.impression === "liked").length > 1) || (bar.impressions.filter(item => item.impression === "liked").length === 0) ? ' Likes' : ' Like'}
                                        </Typography>
                                      </Box>
                                    )}
                                    <Box style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                                      {mode !== 'edit' && (
                                        <IconButton
                                          color="error"
                                          onClick={() => handleDelete(bar.place_id)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      )}
                                      {isAdmin && (
                                        <IconButton
                                          color="error"
                                          onClick={() => handleDelete(bar.place_id)}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      )}
                                      {mode === 'edit' && !isAdmin && (
                                          <IconButton color="error" onClick={() => {handleDislike(bar.place_id)}}>
                                            <ThumbDownIcon />
                                          </IconButton>
                                      )}
                                      {mode === 'edit' && (
                                        <>
                                          <Typography variant="caption">
                                            {isAdmin ? null : bar.impressions.filter(item => item.impression === "disliked").length}
                                          </Typography>
                                          <Typography variant="caption">
                                            {isAdmin && bar.impressions.filter(item => item.impression === "disliked").length}{(bar.impressions.filter(item => item.impression === "disliked").length > 1) || (bar.impressions.filter(item => item.impression === "disliked").length === 0) ? ' Dislikes' : ' Dislike'}
                                          </Typography>
                                        </>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
              {mode === 'edit' && !isAdmin ? (
                <Box style={{display: 'flex', flexDirection: 'row', marginTop: "auto", justifyContent: 'space-between'}}>
                  <Button
                    variant="contained"
                    onClick={() => {handleNotAttend()}}
                    sx={{
                      borderRadius: "50px",
                      backgroundColor: "white",
                      color: theme.primary,
                      padding: "5px 0px",
                      width: "calc(50% - 10px)",
                      margin: '20px 0px',
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#444849",
                      },
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                  >
                    {!isLoading ? ('Not Attending') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {handleAttend()}}
                    sx={{
                      borderRadius: "50px",
                      backgroundColor: theme.primary,
                      color: "white",
                      padding: "5px 0px",
                      width: "calc(50% - 10px)",
                      margin: '20px 0px',
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#444849",
                      },
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))
                    }
                    onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
                  >
                    {!isLoading ? ('Attending') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
                  </Button>
                </Box>
              ) : (
                <Button
                  onClick={handleSaveCrawl}
                  disabled={selectedBars.length < 0 || barCrawlName === ""}
                  variant="contained"
                  sx={{
                    borderRadius: "50px",
                    backgroundColor: theme.primary,
                    color: "white",
                    padding: "5px 0px",
                    width: "100%",
                    textTransform: "none",
                    marginTop: "20px",
                    "&:hover": {
                      backgroundColor: "#444849",
                    },
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = darkenColor(theme.primary, 0.1))
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = theme.primary)}
                >
                  {!isLoading ? ('Save Crawl') : (<CircularProgress size="25px" sx={{ color: theme.white }} />)}
                </Button>
              )}
            </Box>
          </Drawer>
        </>
      )}

    </>
  );
}

export default BarCrawlOrganizer;
