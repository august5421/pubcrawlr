import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Divider,
  Typography,
  SpeedDial,
  SpeedDialIcon,
  Drawer,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function FinishedBarList({ selectedBarCrawl }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const isLarge = useSelector((state) => state.isLarge);
  const selectedBars = useSelector((state) => state.selectedBars);

  const [drawerOpen, setDrawerOpen] = useState(false);

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
            {selectedBarCrawl.barCrawlInfo.map((bar, index) => (
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
            ))}
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
              top: 50,
              zIndex: 100,
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
            PaperProps={{ style: { width: isMobile ? '75%' : '50%' } }}
          >
            <Box sx={{ padding: "10px"}}>

                {selectedBarCrawl.barCrawlInfo.map((bar, index) => (
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
                ))}
            </Box>
          </Drawer>
        </>
      )}
      
    </>
  );
}

export default FinishedBarList;
