import { createRoot } from 'react-dom/client'; // Use the correct modern import
import { Provider } from 'react-redux';

import './index.css'; // Use the correct relative path
import App from './ui';
import { setupStore } from './store/rootReducer';

// This part is fine
const store = setupStore();

// Get the root DOM element
const rootElement = document.getElementById('root');

// Create the root using the modern API
const root = createRoot(rootElement);

// Use the new render method on the root
root.render(
    // StrictMode is still good practice
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);