import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    Typography,
} from "@mui/material";
import {
    CalendarMonth as CalendarMonthIcon,
    Public as PublicIcon,
    LockPerson as LockPersonIcon,
    Groups as GroupsIcon,
    Group as GroupIcon,
    ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";
import Font from "./Font";
import CrawlCrudButtons from "./CrawlCrudButtons.jsx";
import { setModal } from "../actions/actions.jsx";

const BarCrawlSection = ({ title, panel, expanded, handleExpand, content }) => {
    const theme = useSelector((state) => state.theme);

    return (
        <Box
            style={{
                backgroundColor: theme.cream,
                padding: '15px',
                margin: '15px 15px 15px 0px',
                borderRadius: '15px',
                display: 'flex',
                flexDirection: 'column',
                height: expanded === panel ? 'calc(100vh - 205px)' : '50px',
                transition: 'height 0.3s ease-in-out',
                justifyContent: expanded !== panel ? 'center' : null,
                overflow: 'scroll',
            }}
        >
            <Accordion
                expanded={expanded === panel}
                sx={{
                    border: 'none',
                    backgroundColor: theme.cream,
                    boxShadow: 'none',
                    '&::before': { height: '0px', opacity: 0 },
                }}
            >
                <AccordionSummary onClick={handleExpand(panel)} sx={{ margin: '0px', padding: '0px 0px 0px 4px', minHeight: 'unset' }}>
                    <Font text={title} color={theme.primary} variant="h5" weight="bold" fontFamily="PrimaryOrig" />
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '0px' }}>
                    {content}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

function BarcrawlManagement() {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme);
    const userBarCrawls = useSelector((state) => state.userBarCrawls);
    const isLarge = useSelector((state) => state.isLarge);
    const [expanded, setExpanded] = useState("myBarCrawls");

    const handleExpand = (panel) => () => {
        setExpanded(expanded === panel ? (panel === "myBarCrawls" ? "otherBarCrawls" : "myBarCrawls") : panel);
    };

    const handleCrawlOpen = (crawl) => {
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
              }}
            >
                <Font text={crawl.barcrawlName} color={theme.primary} variant="h6" weight="bold" fontFamily="PrimaryOrig" />
                {renderCrawlInfo(crawl, true)}
                <Divider sx={{margin: '10px 0px'}} />
                <CrawlCrudButtons crawl={crawl} />
             </Box>
          ))
    }

    const renderCrawlDetails = (crawl) => (
        <Box 
            onClick={() => {handleCrawlOpen(crawl)}} 
            key={crawl.id} 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                marginTop: '10px', 
                borderTop: '1px solid #d6d6d6', 
                paddingTop: '10px', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.03)', 
                }
            }}
        >
            <Box sx={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
                <Box sx={{ flex: 1 }}>
                    <Font text={crawl.barcrawlName} color={theme.primary} variant="h6" weight="bold" fontFamily="PrimaryOrig" />
                </Box>
            </Box>
            {renderCrawlInfo(crawl)}
        </Box>
    );
    

    const renderCrawlInfo = (crawl, modal) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: modal ? 'unset' : 'center', flexDirection: modal ? 'column' : 'row', gap: modal ? 'unset' : 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonthIcon />
                <Typography variant="subtitle1" sx={{ marginLeft: 1 }}>
                    {crawl.startDate ? (
                        `${new Date(crawl.startDate.seconds * 1000).toLocaleString(undefined, {
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                        })}${crawl.endDate ? ` - ${new Date(crawl.endDate.seconds * 1000).toLocaleString(undefined, {
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                        })}` : ''}`
                    ) : 'No Date'}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {crawl.intamacyLevel === 'Public' && <PublicIcon />}
                {crawl.intamacyLevel === 'Private' && <LockPersonIcon />}
                {crawl.intamacyLevel === 'Friends' && <GroupsIcon />}
                <Typography variant="subtitle1" sx={{ marginLeft: 1 }}>
                    {crawl.intamacyLevel}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon />
                <Typography variant="subtitle1" sx={{ marginLeft: 1 }}>
                    {crawl.invitees.filter(item => item.attendance).length} {crawl.invitees.filter(item => item.attendance).length === 1 ? 'Person Attending' : 'People Attending'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <div>
            <BarCrawlSection
                title="My Bar Crawls"
                panel="myBarCrawls"
                expanded={expanded}
                handleExpand={handleExpand}
                content={
                    userBarCrawls.length > 0 ? 
                        userBarCrawls.map(renderCrawlDetails) : 
                        <Typography variant="caption" >You haven't created any bar crawls yet</Typography>
                        
                }
            />
            <BarCrawlSection
                title="Other Bar Crawls"
                panel="otherBarCrawls"
                expanded={expanded}
                handleExpand={handleExpand}
                content={<Typography>Other Bar stuff here</Typography>}
            />
        </div>
    );
}

export default BarcrawlManagement;
