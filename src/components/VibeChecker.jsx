import { useState } from "react";
import {
  Box,
  Typography,
  Collapse,
  Tooltip,
  IconButton,
} from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Vibes } from '../models/MainModels';
import { useDispatch, useSelector } from "react-redux";

function VibeChecker({ setVibeSearch }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const [moreOptions, setMoreOptions] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(null);

  const handleVibeCheck = (vibeName) => {
    if (selectedVibe === vibeName) {
      // Deselect the vibe
      setSelectedVibe(null);
      setVibeSearch("bar OR pub OR drinks OR cocktails");
    } else {
      // Select the vibe
      setSelectedVibe(vibeName);
      switch (vibeName) {
        case 'Serves Food':
          setVibeSearch('restaurant OR bar');
          break;
        case 'Night Clubs':
          setVibeSearch('night club OR dancing OR live music');
          break;
        case 'LGBTQ+':
          setVibeSearch('gay bar OR lgbtq friendly');
          break;
        case 'Winery':
          setVibeSearch('winery OR meadery OR wine');
          break;
        case 'Brewery':
          setVibeSearch('brewery OR taproom OR beer');
          break;
        case 'Distillery':
          setVibeSearch('distillery OR spirits');
          break;
        default:
          setVibeSearch("bar OR pub OR drinks OR cocktails");
      }
    }
  };

  const handleOpenFilters = () => {
    setMoreOptions(!moreOptions);
  };

  return (
    <Box>
      <Typography
        sx={{
          marginLeft: '3px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onClick={handleOpenFilters}
        variant="caption"
      >
        Vibes <ArrowDropDownIcon sx={{ marginBottom: '2px' }} />
      </Typography>
      <Collapse in={moreOptions}>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {Vibes.options.map((vibe) => (
            <Box
              key={vibe.Name}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Tooltip title={vibe.Name}>
                <IconButton
                  onClick={() => handleVibeCheck(vibe.Name)}
                  sx={{
                    backgroundColor:
                      selectedVibe === vibe.Name ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
                    border: selectedVibe === vibe.Name ? `2px solid ${theme.primary}` : 'none',
                  }}
                >
                  {vibe.Icon}
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export default VibeChecker;
