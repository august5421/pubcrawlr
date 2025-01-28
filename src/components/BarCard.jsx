import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  ListItem,
  Button,
  Card,
  CardContent,
  CardMedia
} from "@mui/material";
import { setSelectedBars } from "../actions/actions";

function BarCard({ bar, index, mode, isActive }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const selectedBars = useSelector((state) => state.selectedBars);

  const addToCrawl = (bar) => {
    dispatch(setSelectedBars([...selectedBars, bar]));
  };   
  
  return (
    <>
      {isMobile || isTablet ? (
        <Card
          key={index}
          style={{
            minWidth: "200px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent sx={{ padding: '0px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {bar.imageUrl && (
              <Box style={{ display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  src={mode !== 'savedCrawls' ? (bar.photos[0].getUrl({ maxHeight: bar.photos[0].height })) : bar.imageUrl}
                  alt={bar.name}
                  style={{
                    width: mode === 'savedCrawls' ? "90px" :"100%",
                    height: mode === 'savedCrawls' ? "90px" :"100px",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}

            <Box style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0px 10px' }}>
              <Typography variant="h6">
                {bar.name?.length > 38 ? `${bar.name.slice(0, 35)}...` : bar.name}
              </Typography>
              <Typography variant="body2">
                Rating: {bar.rating || "N/A"}
              </Typography>
              <Typography variant="body2">
                Price: {bar.price_level ? ('$'.repeat(bar.price_level)) : ('N/A')}
              </Typography>
            </Box>

            <Box style={{ display: 'flex', padding: '10px' }}>
              <Button
                variant="contained"
                onClick={() => {addToCrawl(bar)}}
                disabled={Boolean(selectedBars.find(barInArr => barInArr.name === bar.name))}
                sx={{
                  borderRadius: "50px",
                  backgroundColor: theme.primary,
                  color: "white",
                  padding: "5px 0px",
                  width: '100%',
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#444849",
                  },
                }}
              >
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <ListItem
          key={index}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            paddingLeft: "0px",
            paddingRight: "0px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            backgroundColor: isActive ? "#36b8f5" : "inherit"
          }}
        >
          
            {bar.imageUrl && (
                <img
                alt={bar.name}
                src={mode !== 'savedCrawls' ? (bar.photos[0].getUrl({ maxHeight: bar.photos[0].height })) : bar.imageUrl}
                style={{
                    width: mode === 'savedCrawls' ? "90px" : "150px",
                    height: mode === 'savedCrawls' ? "90px" : "150px",
                    objectFit: "cover",
                }}
                />
            )}
          <Box style={{ display: 'flex', flexDirection: 'column', flex: 2, padding: '0px 10px', justifyContent: 'space-between', height: mode === 'savedCrawls' ? "90px" : '150px', position: 'relative' }}>
            
            <Box style={{ height: '150px' }}>
              <Typography 
              
                variant="subtitle1"
                sx={{ fontWeight: "bold" }}
              >
                {selectedBars?.length > 0 ? (bar.name?.length > 38 ? `${bar.name.slice(0, 15)}...` : bar.name) : (bar.name?.length > 38 ? `${bar.name.slice(0, 35)}...` : bar.name)}
              </Typography>
              <Typography variant="body2">
                Rating: {bar.rating || "N/A"}
              </Typography>
              <Typography variant="body2">
                Price: {bar.price_level ? ('$'.repeat(bar.price_level)) : ('N/A')}
              </Typography>
              {mode === 'savedCrawls' && (
                <Typography variant="body2">
                  Address: {bar.vicinity || "N/A"}
                </Typography>
              )}
            </Box>
            
            {mode !== 'savedCrawls' && (
              <Button
                variant="contained"
                onClick={() => {addToCrawl(bar)}}
                disabled={Boolean(selectedBars.find(barInArr => barInArr?.name === bar.name))}
                sx={{
                  borderRadius: "50px",
                  backgroundColor: theme.primary,
                  color: "white",
                  padding: "5px 0px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#444849",
                  },
                }}
              >
                Add
              </Button>
            )}
          </Box>
        </ListItem>
      )}
    </>
  );
}

export default BarCard;
