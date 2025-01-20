import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { setMobile, setTablet, setIsLarge } from '../actions/actions';

const MobileDetector = () => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isTablet = useMediaQuery({ query: '(max-width: 992px)' });
  const isLarge = useMediaQuery({ query: '(min-width: 1500px)' });
  
  useEffect(() => {
    dispatch(setMobile(isMobile));
    dispatch(setTablet(isTablet));
    dispatch(setIsLarge(isLarge));
  }, [isMobile, isTablet, isLarge, dispatch]);

  return null;
};

export default MobileDetector;
