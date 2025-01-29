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
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PublicIcon from '@mui/icons-material/Public';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { darkenColor } from "../functions/functions";
import AddIcon from "@mui/icons-material/Add";
import Font from "./Font";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

function BarCrawlOrganizerMobile({crawl, mode, handleDelete, handleDragEnd, handleBarCrawlNameChange, handleLike, handleDislike, handleAttend, handleNotAttend, handleSaveCrawl, handleIntamacyLevelChange, barCrawlName, drawerOpen, setDrawerOpen, startDate, endDate, intamacyLevel, handleStartDateChange, handleEndDateChange}) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isLoading = useSelector((state) => state.isLoading);
  const selectedBars = useSelector((state) => state.selectedBars);
  const isAdmin = useSelector((state) => state.isAdmin);
  
  return (
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
            <Box style={{display: 'flex', flexDirection: 'row'}}>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <CalendarMonthIcon />
                </Box>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 9}}>
                <Typography variant="subtitle1">
                    {new Date(crawl.startDate.seconds * 1000).toLocaleString()}
                </Typography>
                </Box>
            </Box>
            <Box style={{display: 'flex', flexDirection: 'row'}}>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                {crawl.intamacyLevel === 'Public' && <PublicIcon />}
                {crawl.intamacyLevel === 'Private' && <LockPersonIcon />}
                {crawl.intamacyLevel === 'Friends' && <GroupsIcon />}
                </Box>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 9}}>
                <Typography variant="subtitle1">
                    {crawl.intamacyLevel}
                </Typography>
                </Box>
            </Box>
            <Box style={{display: 'flex', flexDirection: 'row'}}>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <GroupIcon />
                </Box>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 9}}>
                <Typography variant="subtitle1">
                    {(crawl.invitees.filter(item => item.attendance === true).length > 1) || (crawl.invitees.filter(item => item.attendance === true).length === 0) ? `${crawl.invitees.filter(item => item.attendance === true).length} People Attending` : `${crawl.invitees.filter(item => item.attendance === true).length} Person Attending`}
                </Typography>
                </Box>
            </Box>
            <Box style={{display: 'flex', flexDirection: 'row'}}>
                <Box style={{display: 'flex', flexDirection: 'column', flex: 1}} />
                <Box style={{display: 'flex', flexDirection: 'column', flex: 9}}>
                <Typography variant="caption" color={crawl.invitees.filter(item => item.attendance === true && item.UserID === activeUser.UserID) ? 'primary' : 'error'}>
                    {crawl.invitees.filter(item => item.attendance === true && item.UserID === activeUser.UserID) ? '(You are attending)' : '(You are not attending)' }
                </Typography>
                </Box>
            </Box>
            
            <Divider sx={{margin: '10px 0px'}} />
            </Box>
        ) : (
            <>
            <Font
                text="Crawl Details"
                color={theme.primary}
                variant="h6"
                weight="bold"
                fontFamily="PrimaryOrig"
            />
            
            <TextField
                label="Name Your Crawl"
                variant="outlined"
                size="small"
                value={barCrawlName}
                onChange={handleBarCrawlNameChange}
                sx={{ width: "100%", margin: "10px 0px" }}
            />
            <FormControl size="small" fullWidth>
                <InputLabel sx={{backgroundColor: theme.white}}>Who has access &nbsp;</InputLabel>
                <Select
                value={intamacyLevel}
                onChange={handleIntamacyLevelChange}
                label="Privacy"
                fullWidth
                sx={{ 
                    width: "100%", 
                }}
                inputProps={{
                    sx: { display: 'flex', alignItems: 'center'}
                }}
                >
                <MenuItem value="Public" sx={{display: 'flex', flexDirection: 'row', padding: '6px'}}>
                    <Box style={{display: 'flex', flexDirection: 'column'}}><PublicIcon sx={{ marginRight: 1 }} /></Box>
                    <Box style={{display: 'flex', flexDirection: 'column'}}>
                    Public
                    <Typography variant="caption">
                        Everyone will have access
                    </Typography>
                    </Box>
                </MenuItem>
                <MenuItem value="Friends" sx={{display: 'flex', flexDirection: 'row', padding: '6px'}}>
                    <Box style={{display: 'flex', flexDirection: 'column'}}><GroupsIcon sx={{ marginRight: 1 }} /></Box>
                    <Box style={{display: 'flex', flexDirection: 'column'}}>
                    Friends
                    <Typography variant="caption">
                        Only your friends will have access
                    </Typography>
                    </Box>
                </MenuItem>
                <MenuItem value="Private" sx={{display: 'flex', flexDirection: 'row', padding: '6px'}}>
                    <Box style={{display: 'flex', flexDirection: 'column'}}><LockPersonIcon sx={{ marginRight: 1 }} /></Box>
                    <Box style={{display: 'flex', flexDirection: 'column'}}>
                    Private
                    <Typography variant="caption">
                        Only invited individuals will have access
                    </Typography>
                    </Box>
                </MenuItem>
                </Select>
            </FormControl>
            <Box style={{ width: '100%', display: 'flex', flexDirection: 'row', margin: '10px 0px' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                    label="Start Date & Time"
                    sx={{ marginRight: '10px', display: 'flex', flex: 1 }}
                    slotProps={{ textField: { size: 'small' } }}
                    value={startDate}
                    onChange={handleStartDateChange}
                    renderInput={(params) => <TextField {...params} variant="outlined" />}
                />
                <DateTimePicker
                    label="End Date & Time"
                    sx={{ display: 'flex', flex: 1 }}
                    slotProps={{ textField: { size: 'small' } }}
                    value={endDate}
                    onChange={handleEndDateChange}
                    renderInput={(params) => <TextField {...params} variant="outlined" />}
                />
                </LocalizationProvider>
            </Box>
            </>
        )}
        <Font
            text="Bars"
            color={theme.primary}
            variant="h6"
            weight="bold"
            fontFamily="PrimaryOrig"
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
  );
}

export default BarCrawlOrganizerMobile;
