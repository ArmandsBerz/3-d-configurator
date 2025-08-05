import React from 'react';
// import ReactDOM from 'react-dom/client';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import '../src/index.css';
import '../src/main.scss';
import './assets/fonts/BrushScript-Regular.ttf';
import App from './ui';
// DELETED: The IsopenContextProvider import is removed.
import { setupStore } from './store/rootReducer';

const store = setupStore();
// const root = ReactDOM.createRoot(document.getElementById('root'));
ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            {/* The obsolete IsopenContextProvider has been removed from here */}
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);