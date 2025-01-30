import { useEffect, useState, useRef } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import ProfileManagement from '../components/ProfileManagement.jsx';
import FriendManagement from '../components/FriendManagement.jsx';
import BarcrawlManagement from '../components/BarcrawlManagement.jsx';

function DashboardPage() {
  const theme = useSelector((state) => state.theme);
  const isMobile = useSelector((state) => state.isMobile);
  const isTablet = useSelector((state) => state.isTablet);
  const [activePane, setActivePane] = useState({ Name: '', active: false });

  const containerRef = useRef(null);

  const setPaneToActive = (paneName) => {
    if (activePane.Name === paneName) return; 
    setActivePane({ Name: paneName, active: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActivePane({ Name: '', active: false });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isMobile || isTablet ? 'column' : 'row',
        overflow: isMobile || isTablet ? 'scroll' : null,
        height: 'calc(100vh - 50px)',
        padding: '0px 15px 0px 15px',
        backgroundColor: theme.white,
        width: 'calc(100vw - 15px)',
      }}
    >
      {['Profile', 'Friends', 'Crawls'].map((pane) => {
        const isActive = activePane.Name === pane;
        return (
          <Box
            key={pane}
            onClick={(e) => {
              e.stopPropagation();
              setPaneToActive(pane);
            }}
            style={{
              display: 'flex',
              flex: isActive ? 6 : 3,
              flexDirection: 'column',
              height: 'calc(100vh - 50px)',
              minWidth: '325px',
              width: '100%',
              transition: 'flex 0.3s ease-in-out',
            }}
          >
            {pane === 'Profile' && <ProfileManagement />}
            {pane === 'Friends' && <FriendManagement />}
            {pane === 'Crawls' && <BarcrawlManagement />}
          </Box>
        );
      })}
    </Box>
  );
}

export default DashboardPage;
