import React from 'react';
// import ReactDOM from 'react-dom/client';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './index.css';
import '../src/main.scss';
import './assets/fonts/BrushScript-Regular.ttf';
import App from './App';
import { IsopenContextProvider } from '../src/context/isopenContext';
import { setupStore } from './store/rootReducer';

const store = setupStore();
// const root = ReactDOM.createRoot(document.getElementById('root'));
ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <IsopenContextProvider>
                <App />
            </IsopenContextProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);
