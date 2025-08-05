/* eslint-disable array-callback-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-multi-assign */

// Core React imports
import React, { useState, useEffect, useRef, createContext } from 'react';
import ReactDOM from 'react-dom/client';

// Redux imports for the main entry point
import { Provider } from 'react-redux';
import { setupStore } from '../store/rootReducer';

// Engine and NEW UI imports
import SceneBabylon, { EngineAPI } from '../containers/scene/SceneBabylon';
import App from './ui'; // This is the new UI App from ui.tsx

// CSS imports
import '../../src/index.css';
import '../../src/main.scss';


// ------------------------
// PHASE 2: BUILD THE REACT BRIDGE
// ------------------------

// Step 1: Create EngineContext
// This context will provide the engineAPI to all child components.
export const EngineContext = createContext<EngineAPI | null>(null);

// Step 2: Create a SceneComponent
// This component is responsible for creating the canvas, initializing the engine,
// and providing the engineAPI to the rest of the app.
function SceneComponent({ children }) {
  const canvasRef = useRef(null);
  const [engineApi, setEngineApi] = useState<EngineAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Keep a mutable reference to the scene instance
    let sceneInstance: SceneBabylon | null = null;

    // This effect runs only once when the component mounts
    const initializeScene = async () => {
      if (canvasRef.current) {
        try {
          // Create the engine instance using the canvas from our ref
          sceneInstance = new SceneBabylon(canvasRef.current);
          // Call the new load method to start loading assets
          const api = await sceneInstance.load();
          // Store the API in state once loading is complete
          setEngineApi(api);
        } catch (err) {
          console.error("Failed to initialize the Babylon scene.", err);
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeScene();
    
    // Cleanup function to dispose of the engine when the component unmounts
    return () => {
      if (sceneInstance) {
        sceneInstance.engine.dispose();
      }
    };

  }, []); // Empty dependency array ensures this runs only once.

  return (
    // This container ensures the UI and canvas can stack correctly.
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* Display loading or error states */}
      {isLoading && <div style={{color: 'white', textAlign: 'center', paddingTop: '20%'}}>Loading Scene...</div>}
      {error && <div style={{color: 'red', textAlign: 'center', paddingTop: '20%'}}>Error: {error.message}</div>}

      {/* Once the engine is loaded, provide the API and render the UI */}
      {!isLoading && !error && engineApi && (
        <EngineContext.Provider value={engineApi}>
          {children}
        </EngineContext.Provider>
      )}
    </div>
  );
}


/* ------------------------
   STAGE SECOND COMPONENT (REWRITTEN)
   This component now assembles the new architecture.
------------------------ */
export function StageSecond() {
  return (
    <SceneComponent>
      <App />
    </SceneComponent>
  );
}


/* ------------------------
   INIT UI FUNCTION (UPDATED)
   This function is the main entry point for the application.
------------------------ */
export default function initUI() {
  const promise = new Promise<void>((resolve) => {
    const rootElement = document.getElementById('ui-container');
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      const store = setupStore(); // Setup the redux store

      root.render(
        <React.StrictMode>
          <Provider store={store}>
            <StageSecond />
          </Provider>
        </React.StrictMode>
      );
      resolve();
    } else {
      console.error("UI container 'ui-container' not found.");
      resolve(); // Resolve even on error to not block other processes
    }
  });

  return promise;
}