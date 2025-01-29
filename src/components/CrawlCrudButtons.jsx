import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoading, setModal, setChangeInData, setAlert } from '../actions/actions';
import Font from './Font';
import { useNavigate } from 'react-router-dom';
import { deleteBarCrawl } from '../services/BarCrawlService';
import { useEffect } from 'react';

function CrawlCrudButtons({ crawl, setSelectedBarCrawl, setExpanded }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const isLoading = useSelector((state) => state.isLoading);
  const changeInData = useSelector((state) => state.changeInData);
  const navigate = useNavigate();

  const handleDeleteCrawl = (crawl) => {
    dispatch(setIsLoading("Load", true));
    dispatch(setIsLoading("Name", 'Delete'));;
    dispatch(
      setModal(
        true,
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
            text="Are you sure?"
            color={theme.primary}
            variant="h6"
            weight="bold"
            fontFamily="PrimaryOrig"
          />
          <Typography id="auth-modal-description" sx={{ mb: 3 }}>
            Deleting this crawl will permanently remove it from your account and from those invited.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                deleteBarCrawl(crawl.id).then(() => {
                  setExpanded(null);
                  setSelectedBarCrawl([])
                  dispatch(setChangeInData(changeInData + 1));
                  dispatch(setModal(false, null));
                  dispatch(setAlert({ open: true, severity: 'success', message: 'Bar crawl deleted successfully!' }));
                  dispatch(setIsLoading("Load", false));
                  dispatch(setIsLoading("Name", ''));;
                  navigate('/');
                });
              }}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                dispatch(setIsLoading("Load", false));
                dispatch(setIsLoading("Name", ''));
                dispatch(setModal(false, null))
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )
    );
  };

  return (
    <Box style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Button variant="contained" color="primary">
          Start
        </Button>
      </Box>
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate(`/Crawl/${crawl.id}`)} 
        >
          Edit
        </Button>
      </Box>
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Button variant="contained" color="error" onClick={() => handleDeleteCrawl(crawl)}>
          {isLoading.Name === 'Delete' && isLoading.Load ? (<CircularProgress size="25px" sx={{ color: theme.white }} />) : ('Delete')}
        </Button>
      </Box>
    </Box>
  );
}

export default CrawlCrudButtons;
