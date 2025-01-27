import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers/reducers';
import App from './App';
import './main.css'
import MobileDetector from './components/MobileDetector';
import { BrowserRouter } from 'react-router-dom';

const store = createStore(rootReducer);

const root = document.getElementById('root');
const rootElement = ReactDOM.createRoot(root);

rootElement.render(
  <Provider store={store}>
      <MobileDetector />
      <BrowserRouter>
        <App />
      </BrowserRouter>
  </Provider>
);
