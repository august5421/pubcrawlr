import { useState } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { setSelectedBars, setBarResults, setAlert, setIsLoading, setChangeInData, setModal } from "../actions/actions";
import { darkenColor } from "../functions/functions";
import { saveBarCrawl } from "../services/BarCrawlService";
import AddIcon from "@mui/icons-material/Add";
import Font from "./Font";
import { useNavigate } from 'react-router-dom';
import { NavLink } from "react-router-dom";

function BarCrawlOrganizer() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const isLarge = useSelector((state) => state.isLarge);
  const isLoading = useSelector((state) => state.isLoading);
  const selectedBars = useSelector((state) => state.selectedBars);
  const changeInData = useSelector((state) => state.changeInData);
  const activeUser = useSelector((state) => state.activeUser);

  const [barCrawlName, setBarCrawlName] = useState("");
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
            text="Great looking crawl!"
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
          <TextField
            label="Name Your Crawl"
            variant="outlined"
            size="small"
            value={barCrawlName}
            onChange={handleBarCrawlNameChange}
            sx={{ width: "calc(100% - 20px)", marginBottom: "10px" }}
          />
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
                      >
                        {(provided) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
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
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(bar.place_id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            <Typography variant="body2">
                              Rating: {bar.rating || "N/A"}
                            </Typography>
                            <Typography variant="body2">
                              Price: {bar.price_level ? ('$'.repeat(bar.price_level)) : ('N/A')}
                            </Typography>
                            <Divider
                              sx={{
                                marginTop: "10px",
                                marginBottom:
                                  selectedBars.length - 1 === index
                                    ? "10px"
                                    : null,
                              }}
                            />
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
              top: 200,
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
            sx={{
              width: "90vw",
              marginBottom: "16px",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          >
            <Box sx={{ padding: "10px" }}>
              <TextField
                label="Name Your Crawl"
                variant="outlined"
                size="small"
                value={barCrawlName}
                onChange={handleBarCrawlNameChange}
                sx={{ width: "calc(100% - 20px)", marginBottom: "10px" }}
              />

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
                          >
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
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
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDelete(bar.place_id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                                <Typography variant="body2">
                                  Rating: {bar.rating || "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                  Price: {bar.price_level ? ('$'.repeat(bar.price_level)) : ('N/A')}
                                </Typography>
                                <Divider
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom:
                                      selectedBars.length - 1 === index
                                        ? "10px"
                                        : null,
                                  }}
                                />
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
            </Box>
          </Drawer>
        </>
      )}

    </>
  );
}

export default BarCrawlOrganizer;
