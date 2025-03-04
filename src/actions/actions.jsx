export const setMobile = (state) => ({
  type: 'SET_MOBILE',
  payload: state,
});
export const setTablet = (state) => ({
  type: 'SET_TABLET',
  payload: state,
});
export const setIsLarge = (state) => ({
  type: 'SET_IS_LARGE',
  payload: state,
});
export const setIsLoading = (key, value) => ({
  type: 'SET_IS_LOADING',
  payload: { key, value },
});
export const setIsAdmin = (state) => ({
  type: 'SET_IS_ADMIN',
  payload: state,
});
export const setShowAuth = (state) => ({
  type: 'SET_SHOW_AUTH',
  payload: state,
});
export const setActiveUser = (state) => ({
  type: 'SET_ACTIVE_USER',
  payload: state,
})
export const setSelectedBars = (bars) => ({
  type: 'SET_SELECTED_BARS',
  payload: bars,
});
export const setBarResults = (bars) => ({
  type: 'SET_BAR_RESULTS',
  payload: bars,
});
export const setBarResultsInBounds = (bars) => ({
  type: 'SET_BAR_RESULTS_IN_BOUNDS',
  payload: bars,
});
export const setAlert = (payload) => ({
  type: 'SET_ALERT',
  payload,
});
export const setUserBarCrawls = (payload) => ({
  type: 'SET_USER_BAR_CRAWLS',
  payload,
});
export const setLocalBarCrawls = (payload) => ({
  type: 'SET_LOCAL_BAR_CRAWLS',
  payload,
});
export const setLocation = (payload) => ({
  type: 'SET_LOCATION',
  payload,
});
export const setLocationReq = (payload) => ({
  type: 'SET_LOCATION_REQ',
  payload,
});
export const setChangeInData = (payload) => ({
  type: 'SET_TRACK_NEW_CRAWLS',
  payload,
});
export const setModal = (open, content = null) => ({
  type: 'SET_MODAL',
  payload: { open, content },
});
export const setUnseenRequests = (count) => ({
  type: 'SET_UNSEEN_REQUESTS',
  payload: count,
});
export const setVibeDialog = (state) => ({
  type: 'SET_VIBE_DIALOG',
  payload: state,
})
export const setSelectedVibes = (state) => ({
  type: 'SET_SELECTED_VIBES',
  payload: state,
});