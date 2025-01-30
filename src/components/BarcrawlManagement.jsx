import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
} from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PublicIcon from '@mui/icons-material/Public';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupIcon from '@mui/icons-material/Group';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Font from "./Font";
import CrawlCrudButtons from "./CrawlCrudButtons.jsx";

function BarcrawlManagement() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isLarge = useSelector((state) => state.isLarge);
  const activeUser = useSelector((state) => state.activeUser);
  const isLoading = useSelector((state) => state.isLoading);
  const userBarCrawls = useSelector((state) => state.userBarCrawls);

  const [expanded, setExpanded] = useState("myBarCrawls");

  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      {/* My Bar Crawls */}
      <Box
        style={{
            backgroundColor: theme.cream,
            padding: '15px',
            margin: '15px 15px 15px 0px',
            borderRadius: '15px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: expanded === "myBarCrawls" ? 'calc(100vh - 205px)' : '50px',
            minHeight: expanded === "myBarCrawls" ? 'calc(100vh - 205px)' : '50px',
            justifyContent: expanded !== "myBarCrawls" ? 'center' : null,
            overflow: 'scroll'
        }}
      >
        <Accordion
          expanded={expanded === "myBarCrawls"}
          onChange={handleAccordionChange("myBarCrawls")}
          sx={{
            border: 'none',
            backgroundColor: theme.cream,
            boxShadow: 'none',
            '&::before': { height: '0px', opacity: 0 },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ margin: '0px', padding: '0px 0px 0px 4px', minHeight: 'unset' }}>
            <Font
              text='My Bar Crawls'
              color={theme.primary}
              variant="h5"
              weight="bold"
              fontFamily="PrimaryOrig"
            />
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0px' }}>
            {userBarCrawls.map((crawl) => (
                <Box style={{display: 'flex', marginTop: '10px', flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #d6d6d6', padding: '10px 0px 0px 0px'}}>
                    <Box style={{display: 'flex', flexDirection: 'column', flex: 3}}>
                        <Box 
                            style={{
                                display: 'flex', 
                                flexDirection: isLarge ? 'row' : 'column', 
                                alignItems: isLarge && 'center', 
                                width: '100%',
                                margin: '10px 0px'
                            }}
                        >
                            <Box style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                                <Font
                                    text={crawl.barcrawlName}
                                    color={theme.primary}
                                    variant="h6"
                                    weight="bold"
                                    fontFamily="PrimaryOrig"
                                />
                            </Box>
                            <Box style={{display: 'flex', flexDirection: 'column', flex: 3}}>
                                <CrawlCrudButtons crawl={crawl} />
                            </Box>
                        </Box>
                        <Box 
                            style={{
                                display: 'flex', 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                width: '100%',
                                margin: '10px 0px',
                                flexWrap: 'wrap'
                            }}
                        >
                            <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginRight: '15px' }}>
                                <CalendarMonthIcon />
                                <Typography variant="subtitle1" style={{ marginLeft: '5px' }}>
                                {crawl.startDate ? (
                                    `${new Date(crawl?.startDate?.seconds * 1000).toLocaleString(undefined, {
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
                            <Box 
                                style={{ 
                                display: 'flex', 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                marginRight: '15px', 
                                }}
                            >
                                {crawl.intamacyLevel === 'Public' && <PublicIcon />}
                                {crawl.intamacyLevel === 'Private' && <LockPersonIcon />}
                                {crawl.intamacyLevel === 'Friends' && <GroupsIcon />}
                                <Typography variant="subtitle1" style={{ marginLeft: '5px' }}>
                                {crawl.intamacyLevel}
                                </Typography>
                            </Box>
                            <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <GroupIcon />
                                <Typography variant="subtitle1" style={{ marginLeft: '5px' }}>
                                {crawl.invitees.filter(item => item.attendance === true).length} {crawl.invitees.filter(item => item.attendance === true).length === 1 ? 'Person Attending' : 'People Attending'}
                                </Typography>
                            </Box>
                        </Box>
                        
                    </Box>
                </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Other Bar Crawls */}
      <Box
        style={{
            backgroundColor: theme.cream,
            padding: '15px',
            margin: '15px 15px 15px 0px',
            borderRadius: '15px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: expanded === "otherBarCrawls" ? 'calc(100vh - 205px)' : '50px',
            minHeight: expanded === "otherBarCrawls" ? 'calc(100vh - 205px)' : '50px',
            justifyContent: expanded !== "otherBarCrawls" ? 'center' : null,
            overflow: 'scroll'
        }}
      >
        <Accordion
          expanded={expanded === "otherBarCrawls"}
          onChange={handleAccordionChange("otherBarCrawls")}
          sx={{
            border: 'none',
            backgroundColor: theme.cream,
            boxShadow: 'none',
            '&::before': { height: '0px', opacity: 0 },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ margin: '0px', padding: '0px 0px 0px 4px', minHeight: 'unset' }}>
            <Font
              text='Other Bar Crawls'
              color={theme.primary}
              variant="h5"
              weight="bold"
              fontFamily="PrimaryOrig"
            />
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0px' }}>
            Other Bar stuff here
          </AccordionDetails>
        </Accordion>
      </Box>
    </div>
  );
}

export default BarcrawlManagement;
