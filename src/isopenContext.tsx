import React, { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import SceneBabylon, { EngineAPI } from './SceneBabylon'; // CORRECTED PATH
import App, { useGloveConfigurator } from './ui'; // CORRECTED PATH

// 1. The Engine Context
export const EngineContext = createContext<EngineAPI | null>(null);

// 2. The Scene Component (Owner of the canvas)
function SceneComponent({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engineApi, setEngineApi] = useState<EngineAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let sceneInstance: SceneBabylon | null = null;

    const initializeScene = async () => {
      if (canvasRef.current) {
        try {
          sceneInstance = new SceneBabylon(canvasRef.current);
          const api = await sceneInstance.load();
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

    return () => {
      // Clean up the engine instance when the component unmounts
      if (sceneInstance) {
        sceneInstance.engine.dispose();
      }
    };
  }, []); // The empty dependency array ensures this runs only once.

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* The canvas for the 3D scene, rendered at the bottom layer (z-index: 0) */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* Loading or Error UI */}
      {isLoading && <div style={{ color: 'white', textAlign: 'center', paddingTop: '20%' }}>Loading Scene...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center', paddingTop: '20%' }}>Error: {error.message}</div>}

      {/* Once the engine is ready, provide its API via context and render the children (the UI overlay) */}
      {!isLoading && !error && engineApi && (
        <EngineContext.Provider value={engineApi}>
          {children}
        </EngineContext.Provider>
      )}
    </div>
  );
}

// 3. The Logic Bridge (Translator between UI and Engine)
function LogicBridge() {
  const engineAPI = useContext(EngineContext);
  const { state } = useGloveConfigurator();
  
  useEffect(() => {
    if (!engineAPI) return; // Don't do anything if the engine isn't ready
    // This is where you will translate UI state into engine commands.
    // For now, it is intentionally left empty.
  }, [state.configuration, engineAPI]); // This effect re-runs whenever the configuration changes

  return null; // This component does not render anything
}

// 4. The Main Assembler Component
export function StageSecond() {
  return (
    <SceneComponent>
      <App>
        <LogicBridge />
      </App>
    </SceneComponent>
  );
}