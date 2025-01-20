import React from 'react';
import { Typography } from '@mui/material';

const Font = ({ 
  text, 
  color = 'black', 
  variant = 'body1', 
  weight = 'normal', 
  fontFamily = 'Arial', 
  hoverColor = '' 
}) => {
  return (
    <Typography
      sx={{
        color: color,
        fontWeight: weight,
        fontFamily: fontFamily,
        '&:hover': {
          color: hoverColor,
        },
      }}
      variant={variant}
    >
      {text}
    </Typography>
  );
};

export default Font;
