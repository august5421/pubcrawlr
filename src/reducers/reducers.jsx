const initialState = {
  isMobile: false,
  isTablet: false,
  isLarge: false,
  isLoading: false,
  modalState: {
    open: false,
    content: null,
  },
  changeInData: 0,
  unseenRequests: 0,
  theme: {
    black: '#00171F',
    white: '#FFF',
    cream: '#daede9',
    primary: '#00171F',
    secondary: '#277a73',
    tertiary: '#00b2a3',
    grey: '#dddddd'
  },
  activePage: {Name: 'App', In: true},
  showAuth: true,
  activeUser: {Name: '', UserId: '', Email: '', UserAvatarType: '', Friends: []},
  barResults: [],
  selectedBars: [],
  userBarCrawls: [],
  alert: {
    open: false,
    message: '',
    severity: 'error', 
  },
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
    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_LOCATION':
      return {
        ...state,
        location: action.payload,
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
    case 'SET_ACTIVE_PAGE': {
        const { key, value } = action.payload;
        return {
            ...state,
            activePage: {
                ...state.activePage,
                [key]: value,
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
    case 'SET_BAR_RESULTS': 
      return {
        ...state,
        barResults: action.payload,
      };
    case 'SET_USER_BAR_CRAWLS': 
      return {
        ...state,
        userBarCrawls: action.payload,
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
    default:
      return state;
  }
  
};


export default rootReducer;
