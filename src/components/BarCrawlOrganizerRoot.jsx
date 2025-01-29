import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
} from "@mui/material";
import { setSelectedBars, setBarResults, setAlert, setIsLoading, setChangeInData, setModal } from "../actions/actions";
import { darkenColor } from "../functions/functions";
import { saveBarCrawl, addImpression, getBarCrawl, addAttendance } from "../services/BarCrawlService";
import Font from "./Font";
import { useNavigate } from 'react-router-dom';
import { NavLink } from "react-router-dom";
import BarCrawlOrganizerDesktop from "./BarCrawlOrganizerDesktop";
import BarCrawlOrganizerMobile from "./BarCrawlOrganizerMobile";

function BarCrawlOrganizerRoot({ crawl, mode, slug, setCrawl }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const selectedBars = useSelector((state) => state.selectedBars);
  const changeInData = useSelector((state) => state.changeInData);
  const activeUser = useSelector((state) => state.activeUser);
  
  const [barCrawlName, setBarCrawlName] = useState(mode === 'edit' ? crawl.barcrawlName : "");
  const [drawerOpen, setDrawerOpen] = useState(false);  
  const [startDate, setStartDate] = useState(crawl ? (new Date(crawl.startDate.seconds * 1000)) : null);  
  const [endDate, setEndDate] = useState(crawl ? (new Date(crawl.endDate.seconds * 1000)) : null);  
  const [intamacyLevel, setIntamacyLevel] = useState(crawl ? crawl.intamacyLevel : 'Public');  

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

  const handleImpression = async (placeId, impressionType, existingImps) => {
    const existingImpression = existingImps.find(item => item.UserID === activeUser.UserId);
    let newImpression;
    if (existingImpression) {
      newImpression = {
        UserID: activeUser.UserId,
        placeId: placeId,
        impression: existingImpression.impression === "liked" ? "disliked" : "liked"
      };
    } else {
      newImpression = {
        UserID: activeUser.UserId,
        placeId: placeId,
        impression: impressionType
      };
    }
  
    try {
      await addImpression(slug, placeId, newImpression);
      getBarCrawl(slug).then((response) => {
        setCrawl(response);
        dispatch(setSelectedBars(response.barCrawlInfo || []));
      });
    } catch (error) {
      console.error(`Error updating impression:`, error);
    }
  };
  
  
  const handleToggleAttendance = async (x) => {
    dispatch(setIsLoading("Load", true));
    dispatch(setIsLoading("Name", x ? 'Attending' : 'Not Attending'));
    try {
      const attendeeConstructor = { UserID: activeUser.UserId, attendance: x };
      await addAttendance(slug, attendeeConstructor);  
      dispatch(setIsLoading("Load", false));
      dispatch(setIsLoading("Name", ''));
      getBarCrawl(slug).then((response) => {
        setCrawl(response);
        dispatch(setSelectedBars(response.barCrawlInfo || []));
      });
    } catch (error) {
      console.error(`Error updating impression:`, error);
      dispatch(setIsLoading("Load", false));
      dispatch(setIsLoading("Name", ''));
    }
  };
  

  const handleSaveCrawl = async () => {
    dispatch(setIsLoading("Load", true));
    dispatch(setIsLoading("Name", 'Save Crawl'));
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
        const createdId = await saveBarCrawl(activeUser.UserId, selectedBars, barCrawlName, startDate, endDate, intamacyLevel, slug);
        dispatch(setSelectedBars([]));
        dispatch(setBarResults([]));
        dispatch(setAlert({ open: true, severity: 'success', message: 'Bar crawl saved successfully!' }))
        dispatch(setIsLoading("Load", false));
        dispatch(setIsLoading("Name", ''));
        dispatch(setChangeInData(changeInData + 1))
        setTimeout(() => { navigate(`/Crawl/${createdId}`) }, 375);
      } catch (error) {
        dispatch(setAlert({ open: true, severity: 'error', message: 'There was a problem saving the bar crawl.' }))
        dispatch(setIsLoading("Load", false));
        dispatch(setIsLoading("Name", ''));
      }
    }
  };

  const handleIntamacyLevelChange = (event) => {
    setIntamacyLevel(event.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  //at some point I should probably refactor this to maintain states inside of the reducer but for now we will prop drill
  return (
    <>
      {!isMobile && !isTablet ? (
        <BarCrawlOrganizerDesktop 
          crawl={crawl} 
          mode={mode} 
          handleDelete={handleDelete}
          handleDragEnd={handleDragEnd}
          handleBarCrawlNameChange={handleBarCrawlNameChange}
          handleImpression={handleImpression}
          handleToggleAttendance={handleToggleAttendance}
          handleSaveCrawl={handleSaveCrawl}
          handleIntamacyLevelChange={handleIntamacyLevelChange}
          barCrawlName={barCrawlName} 
          startDate={startDate} 
          endDate={endDate} 
          intamacyLevel={intamacyLevel} 
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
        />
      ) : (
        <BarCrawlOrganizerMobile 
          crawl={crawl} 
          mode={mode} 
          handleDelete={handleDelete}
          handleDragEnd={handleDragEnd}
          handleBarCrawlNameChange={handleBarCrawlNameChange}
          handleImpression={handleImpression}
          handleToggleAttendance={handleToggleAttendance}
          handleSaveCrawl={handleSaveCrawl}
          handleIntamacyLevelChange={handleIntamacyLevelChange}
          barCrawlName={barCrawlName} 
          drawerOpen={drawerOpen} 
          setDrawerOpen={setDrawerOpen}
          startDate={startDate} 
          endDate={endDate} 
          intamacyLevel={intamacyLevel} 
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
        />
      )}

    </>
  );
}

export default BarCrawlOrganizerRoot;
