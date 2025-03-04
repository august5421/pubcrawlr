const initialState = {
  isMobile: false,
  isTablet: false,
  isLarge: false,
  isLoading: {Name: '', Load: false},
  isAdmin: false,
  modalState: {
    open: false,
    content: null,
  },
  changeInData: 0,
  unseenRequests: 0,
  theme: {
    black: '#00171F',
    white: '#FFF',
    cream: '#f7f7f7',
    primary: '#00171F',
    secondary: '#277a73',
    tertiary: '#00b2a3',
    grey: '#dddddd'
  },
  showAuth: true,
  activeUser: { Name: '', UserId: '', Email: '', UserAvatarType: '', Friends: [] },
  barResults: [],
  selectedBars: [],
  userBarCrawls: [],
  localBarCrawls: [],
  barResultsInBounds: [],
  alert: {
    open: false,
    message: '',
    severity: 'error',
  },
  location: null,
  locationReq: 0,
  vibeDialogOpen: false,
  selectedVibes: []
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_MOBILE':
      return {
        ...state,
        isMobile: action.payload,
      };
    case 'SET_TABLET':
      return {
        ...state,
        isTablet: action.payload,
      };
    case 'SET_IS_LARGE':
      return {
        ...state,
        isLarge: action.payload,
      };
    case 'SET_IS_LOADING': {
      const { key, value } = action.payload;
      return {
          ...state,
          isLoading: {
              ...state.isLoading,
              [key]: value,
          },
      };
    }
    case 'SET_IS_ADMIN':
      return {
        ...state,
        isAdmin: action.payload,
      };
    case 'SET_LOCATION':
      return {
        ...state,
        location: action.payload,
      };
    case 'SET_LOCATION_REQ':
      return {
        ...state,
        locationReq: action.payload,
      };
    case 'SET_TRACK_NEW_CRAWLS':
      return {
        ...state,
        changeInData: action.payload,
      };
    case 'SET_MODAL': {
      const { open, content } = action.payload;
      return {
        ...state,
        modalState: {
          open: open !== undefined ? open : state.modal.open,
          content: content !== undefined ? content : state.modal.content,
        },
      };
    }
    case 'SET_SHOW_AUTH':
      return {
        ...state,
        showAuth: action.payload,
      };
    case 'SET_ACTIVE_USER': {
      const { key, value } = action.payload;
      return {
        ...state,
        activeUser: {
          ...state.activeUser,
          [key]: value,
        },
      };
    }
    case 'SET_SELECTED_BARS':
      return {
        ...state,
        selectedBars: action.payload,
      };
    case 'SET_SELECTED_VIBES':
      return {
        ...state,
        selectedVibes: action.payload,
      };
    case 'SET_BAR_RESULTS':
      return {
        ...state,
        barResults: action.payload,
      };
    case 'SET_BAR_RESULTS_IN_BOUNDS':
      return {
        ...state,
        barResultsInBounds: action.payload,
      };
    case 'SET_USER_BAR_CRAWLS':
      return {
        ...state,
        userBarCrawls: action.payload,
      };
    case 'SET_LOCAL_BAR_CRAWLS':
      return {
        ...state,
        localBarCrawls: action.payload,
      };
    case 'SET_UNSEEN_REQUESTS':
      return {
        ...state,
        unseenRequests: action.payload,
      };
    case 'SET_ALERT':
      return {
        ...state,
        alert: {
          ...state.alert,
          ...action.payload,
        },
      };
    case 'SET_VIBE_DIALOG':
      return {
        ...state,
        vibeDialogOpen: action.payload,
      };
    default:
      return state;
  }

};


export default rootReducer;
