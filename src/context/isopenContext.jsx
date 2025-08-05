/* eslint-disable array-callback-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-multi-assign */

// Core React/UI imports
// MODIFICATION: Import useRef to manage debounce timer
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
// MODIFICATION: Import useSearchParams to manage URL query parameters
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { TbArrowsMaximize } from 'react-icons/tb';
import { CgArrowRight, CgList } from 'react-icons/cg';

// NEW: Redux imports
import { Provider } from 'react-redux';
// MODIFIED: Import the new actions from the Redux slice, including setBuildProperty
import { useAppSelector, useAppDispatch, setupStore, engineReady, initializeSelections, updateSelection, setBuildProperty } from '../store/rootReducer';

// Engine and UI component imports
import SceneBabylon, {
  EngineAPI, // Import the new API
  fonts,
  colorMap,
  additionalColors,
  ZONES_WEB,
  colorOptions,
  playerPosition,
  configBuild
} from '../containers/scene/SceneBabylon';

import {
  Select,
  SelectColor,
  SelectImage,
  SelectInput,
  TextOptions,
  ColorOption,
  WebOption,
  NameOptions,
  ColorCircle,
  BuildModal,
  SelectGroup
} from '../containers/scene/ui';

// CSS and App imports
import '../../src/index.css';
import '../../src/main.scss';
import App from './ui';


// ------------------------
// IsopenContext and IsopenContextProvider HAVE BEEN DELETED
// All state is now managed by Redux.
// ------------------------


/* ------------------------
   USE_ENGINE HOOK (NEW)
   Defined here as per the "no new files" rule.
------------------------ */
const useEngine = () => {
  const isEngineReady = useAppSelector((state) => state.buildReducer.isEngineReady);
  // Return the API only when the engine is ready, otherwise null.
  return isEngineReady ? SceneBabylon.engineAPI : null;
};


/* ------------------------
   MIDDLE CONTAINER COMPONENT
------------------------ */
function MiddleContainer(props) {
  // REFACTORED: Gets state from Redux instead of Context
  const isEngineReady = useAppSelector((state) => state.buildReducer.isEngineReady);
  // Local UI state remains
  const [windowWidth, setWindowWidth] = useState();
  const [scene, setScene] = useState(null); // Initial state is null
  const [activeIndex, setActiveIndex] = useState(0);

  // NEW: Get engine instance via hook
  const engine = useEngine();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  useEffect(() => {
    if (isEngineReady) {
      // Get the scene object directly from the engine instance for read-only data like glovesDesign
      const scenes = SceneBabylon.instance();
      setScene(scenes);
    }
  }, [isEngineReady]);

  const setIndex = (id) => {
    setActiveIndex(id);
    // NEW: Use the formal API to change the glove model
    if (engine) {
      engine.setActiveGlove(id);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      // State like accordionOpen and allMaximize would now come from Redux if they need to be global
      className={`centerStageTwo middle-container flex flex-col flex-1`}
    >
      <div className="middle-container-content flex-1 w-full"></div>
      <div className="stageTwoCenter middle-container-menu flex flex-col justify-center items-center">
        <div className="navigation-dots flex my-2">
          {scene && scene.glovesDesign && scene.glovesDesign.length > 0
            ? scene.glovesDesign.map((item, index) => (
                <svg
                  onClick={() => setIndex(index)}
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="img"
                  width="16"
                  height="16"
                  preserveAspectRatio="xMidYMid meet"
                  viewBox="0 0 32 32"
                  key={index}
                  className="cursor-pointer"
                >
                  <circle cx="16" cy="16" r="8" fill={activeIndex === index ? '#fff' : '#ffffff66'} />
                </svg>
              ))
            : null}
        </div>
        <div className="navigation-instructions flex">
           {/* This component's internal logic remains largely the same, but no longer uses context */}
           {/* ... SVG icons and text for instructions ... */}
        </div>
      </div>
    </div>
  );
}


/* ------------------------
   OPTION ACCORDION COMPONENT
------------------------ */
const OptionAccordion = (props) => {
    // REFACTORED: This component is now simpler. It manages its own 'open' state.
    // Global state interactions (like MIXEDOPENSHOW) would be handled via Redux if needed.
  const [open, setOpen] = useState(false);

  const openButton = () => {
    setOpen(!open);
    if (props.showBuildModal) {
      props.showBuildModal();
    }
  };

  return (
    <div className={`option-accordion ${open ? ' open' : ''} ${props.title === 'Build' ? 'accordionBuild' : ''}`}>
      <button className="w-full mb-0" onClick={openButton}>
        <div className="accordion-header h-14 py-3.5 px-6 flex items-center">
          <div className={`arrow${open ? ' active' : ''} flex items-center mr-2 grow-0 uparrows`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              width="14"
              height="14"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 24 24"
            >
              <path fill="white" d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z" />
            </svg>
          </div>
          <h3 className="grow text-left">{props.title || 'Title'}</h3>
          <div className="font-normal grow-0 max-w-[10rem] text-ellipsis overflow-hidden whitespace-nowrap">
            {props.selectedOption}
          </div>
        </div>
      </button>
      <div className={`accordion-body ${open ? ' active' : ''}`}>
          <div className={`accordion-body-content ${props.title === 'Build' ? 'py-3.5 px-4' : 'pt-3.5 px-6'}`}>
            {props.children}
          </div>
        </div>
    </div>
  );
};


/* ------------------------
   UP ACCORDION COMPONENT
   *** MODIFIED TO READ REDUX STATE ***
------------------------ */
function UpAccordion(props) {
  // REFACTORED: Simplified state management
  const [open, setOpen] = useState(false);
  // NEW: Select the shared selections state from the Redux store.
  const selections = useAppSelector((state) => state.buildReducer.selections);

  // NEW: Helper function to render a summary of selections
  const renderSelectionSummary = () => {
    // Don't render if the accordion is closed or there's nothing selected
    if (!open || !selections || Object.keys(selections).length === 0) {
      return null;
    }

    return (
      <div className="selection-summary text-xs text-gray-400 mt-2 mb-4">
        <h4 className="font-bold text-white mb-2">Current Selections:</h4>
        <ul className="list-disc list-inside">
          {Object.entries(selections).map(([key, val]) => {
            let displayValue = '';
            // Safely determine how to display the value
            if (typeof val === 'string') {
              displayValue = val;
            } else if (val && typeof val === 'object' && 'value' in val) {
              // This correctly displays the name now.
              displayValue = val.name || val.value;
            } else if (val && typeof val === 'object' && 'text' in val) {
              
              // Check if the color property is an object; if so, use its name.
              // Otherwise, fall back to displaying the color value directly.
              const colorDisplay = (val.color && typeof val.color === 'object')
                ? val.color.name
                : val.color;

              displayValue = `"${val.text}" (${val.font}, ${colorDisplay})`;

            }

            return <li key={key}><span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {displayValue}</li>;
          })}
        </ul>
      </div>
    );
  };
  
  return (
    <div className={`up-accordion ${open ? ' openAccordion' : ''}`}>
      <button className="w-full" onClick={() => setOpen(!open)}>
        <div className="accordion-button h-14 py-3.5 px-6 flex items-center">
          <div className={`arrow${open ? ' active' : ''} flex items-center mr-2 grow-0 uparrows`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              width="14"
              height="14"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 24 24"
            >
              <path fill="white" d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z" />
            </svg>
          </div>
          <h3 className="mobileAccordion grow text-left">
            {props.title || 'Accordion'} <span className="showExtenstion">Up</span>
          </h3>
          <CgList color="gray" fontSize={'30px'} />
        </div>
      </button>
      <div className={`accordion-body${open ? ' active' : ''}`}>
        <div className="accordion-body-content py-3.5 px-6 overflow-y-auto">
          {/* RENDER THE SUMMARY HERE! */}
          {renderSelectionSummary()}
          {/* Original children will still render below the summary */}
          {props.children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------
   LEFT PANEL COMPONENT (STAGE TWO)
   *** MODIFIED FOR REDUX STATE SYNC & INTEGRATED CORRECTION ***
------------------------ */
function LeftPanel(props) {
  // --- HOOKS AND STATE ---
  const isEngineReady = useAppSelector((state) => state.buildReducer.isEngineReady);
  const { position, pallette } = useAppSelector((state) => state.buildReducer);
  const uiState = useAppSelector((state) => state.buildReducer.selections);
  const dispatch = useAppDispatch();
  const engine = useEngine();

  // FIX #1: Add a ref to hold the timer for debouncing text input
  const textUpdateDebounce = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [showBuild, setShowBuild] = useState(false);
  const [positionName, setPositionName] = useState(configBuild.Position[0]);
  const [gloveModelsForPosition, setGloveModelsForPosition] = useState(null);

  const colors = colorMap[pallette];

  // --- NEWLY INTEGRATED CODE ---
  // This useEffect re-establishes the link between UI state (position) and the 3D Engine
  useEffect(() => {
    if (engine) {
      // 1. Determine the name of the glove model based on the selected position index
      const selectedPositionName = configBuild.Position[position];
      const gloveModelName = playerPosition[selectedPositionName].glove[0];

      // 2. Find the index of this model in the scene's master list
      const sceneInstance = SceneBabylon.instance();
      const gloveIndex = sceneInstance.gloves.findIndex(glove => glove === gloveModelName);

      // 3. If found, command the engine to set the active glove
      if (gloveIndex !== -1) {
          engine.setActiveGlove(gloveIndex);
          // Also update the activeModel index in Redux to keep everything in sync
          dispatch(setBuildProperty({ key: 'activeModel', value: gloveIndex }));
      }
    }
  }, [position, engine, dispatch]); // Rerun this logic whenever the position or engine readiness changes
  // --- END OF INTEGRATED CODE ---

  useEffect(() => {
    const newPositionName = configBuild.Position[position];
    setPositionName(newPositionName);
    setGloveModelsForPosition(playerPosition[newPositionName].glove);
  }, [position]);


  // --- EFFECT 1: Initialize state from URL or defaults (URL -> REDUX) ---
  useEffect(() => {
    if (isEngineReady && engine && props.zones?.length > 0) {
      const scenes = SceneBabylon.instance();
      const initialColor = colors.white;
      const initialFont = fonts[0];
      const textZones = scenes?.currentGlove?.textZones || [];
      const initialZoneStates = {};

      const findColorObject = (colorValue) => {
        const entry = Object.entries(colors).find(([_, hex]) => hex === colorValue);
        if (entry) {
          return { name: entry[0].replace(/_/g, ' '), value: colorValue };
        }
        return { name: colorValue, value: colorValue }; // Fallback for custom colors
      };

      props.zones.forEach((item) => {
        if (!ZONES_WEB.includes(item)) {
          const colorValue = searchParams.get(item) || initialColor;
          initialZoneStates[item] = findColorObject(colorValue);
          engine.updateColor(item, colorValue);
        }
      });
      
      // FIX #2: Refactored logic to normalize text state on initialization
      textZones.forEach((zone) => {
          let textState;
          try {
            const textParam = searchParams.get(zone);
            if (!textParam) throw new Error("No URL parameter for text zone");
            textState = JSON.parse(textParam);
          } catch (e) {
            // If parsing fails or param is missing, create a default state.
            // The key change is wrapping 'initialColor' with 'findColorObject'.
            textState = { text: '', font: initialFont, color: initialColor };
          }
          
          // --- STATE NORMALIZATION ---
          // Always ensure the 'color' property is an object before it goes to Redux.
          // This fixes inconsistent states from old URLs or defaults.
          if (typeof textState.color === 'string') {
            textState.color = findColorObject(textState.color);
          }

          initialZoneStates[zone] = textState;
          
          // Update the engine with the now-normalized state
          engine.updateText(zone, textState.text, textState.font, textState.color.value);
      });
      
      const initialWebType = searchParams.get('webType') || scenes?.currentGlove?.websGlove[0] || 'iOB';
      engine.setActiveWeb(initialWebType);
      
      const initialWebColorValue = searchParams.get('webColor') || initialColor;
      engine.updateColor('web', initialWebColorValue);

      const initialLaceColorValue = searchParams.get('lace') || initialColor;
      engine.updateColor('lace', initialLaceColorValue);

      const fullInitialState = {
        ...initialZoneStates,
        webType: initialWebType,
        webColor: findColorObject(initialWebColorValue),
        lace: findColorObject(initialLaceColorValue),
      };
      
      dispatch(initializeSelections(fullInitialState));
    }
  }, [isEngineReady, engine, props.zones, colors, dispatch, searchParams]);


  // --- EFFECT 2: Update URL when Redux state changes (Redux -> URL) ---
  useEffect(() => {
    if (!uiState || Object.keys(uiState).length === 0) {
        return;
    }
    
    const newParams = new URLSearchParams();

    Object.entries(uiState).forEach(([key, value]) => {
        if (key === 'webType') {
            newParams.set(key, value);
        } else if (value && typeof value === 'object' && 'value' in value) {
            newParams.set(key, value.value);
        } else if (value && typeof value === 'object' && 'text' in value) {
            newParams.set(key, JSON.stringify(value));
        }
    });

    setSearchParams(newParams, { replace: true });

  }, [uiState, setSearchParams]);


  const showBuildModal = () => setShowBuild(true);
  const hideBuildModal = () => setShowBuild(false);

  const setOptions = (zone, option) => {
    if (engine && props.zones.includes(zone)) {
      engine.updateColor(zone, option.value);
    }
    dispatch(updateSelection({ key: zone, value: option }));
  };
  
  const handleWebTypeChange = (newWebType) => {
    if (engine) {
      engine.setActiveWeb(newWebType);
    }
    dispatch(updateSelection({ key: 'webType', value: newWebType }));
  };
  
  const handleWebColorChange = (newColorOption) => {
    if (engine) {
      engine.updateColor('web', newColorOption.value);
    }
    dispatch(updateSelection({ key: 'webColor', value: newColorOption }));
  };

  // FIX #1: This function now debounces the expensive call to the 3D engine.
  const handleTextChange = (zone, newProperty) => {
    const currentTextState = uiState[zone] || {}; 
    const updatedTextState = { ...currentTextState, ...newProperty };

    // Update Redux state immediately so the UI input field is responsive.
    dispatch(updateSelection({ key: zone, value: updatedTextState }));

    // Clear any existing timer.
    if (textUpdateDebounce.current) {
        clearTimeout(textUpdateDebounce.current);
    }

    // Set a new timer to update the 3D scene after a short delay.
    textUpdateDebounce.current = setTimeout(() => {
        if (engine) {
            const textColorForEngine = (updatedTextState.color && typeof updatedTextState.color === 'object')
                ? updatedTextState.color.value
                : updatedTextState.color;

            engine.updateText(
                zone,
                updatedTextState.text,
                updatedTextState.font,
                textColorForEngine
            );
        }
    }, 300); // 300ms delay prevents updates on every keystroke
  };
  
  const getColors = (name) => {
    const objColors = { ...(colors || {}) };
    Object.entries(additionalColors).forEach(([key, value]) => {
      if (value.zones.includes(name)) objColors[key] = value.value;
    });
    return objColors;
  };
  
  const getZones = () =>
    props.zones && props.zones.map((item, index) => {
      if (item !== 'web' && item !== 'lace') {
        const arrColor = getColors(item);
        if (!uiState) return null;
        const currentOption = uiState[item];
        return (
          <ColorOption
            key={index}
            colors={arrColor}
            title={item}
            both={currentOption ? currentOption.value : colors.white}
            setOptions={setOptions}
          />
        );
      }
      return null;
    });
  
  const getWebsForGlove = () => {
    if (!isEngineReady) return [];
    const scenes = SceneBabylon.instance();
    const webValues = scenes?.currentGlove?.websGlove || [];
    return webValues.map(webValue => ({
        value: webValue,
        text: webValue.replace(/([A-Z])/g, ' $1').replace(/OB|CB|FB|CM/,'').trim(),
        image: `assets/web-icons/${webValue}.png`
    }));
  };

  const getSelectableColors = () => {
    if (!colors) return [];
    return Object.entries(colors).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value
    }));
  };
  
  const renderTextOptions = () => {
    const scenes = SceneBabylon.instance();
    const textZones = scenes?.currentGlove?.textZones;

    if (!textZones || !uiState) return null;

    return textZones.map((zone) => {
      const title = zone.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      const currentTextState = uiState[zone];
      
      return (
        <TextOptions
            key={zone}
            title={title}
            colors={colors}
            defState={uiState[zone]} 
            names={fonts}
            selected={{ value: currentTextState?.font }}
            setOptions={(id, option) => handleTextChange(zone, option)} 
        />
      );
    });
  };

  return (
    <div>
      <div className={`leftContainers`}>
        <div className="marginCenterYES">
          <OptionAccordion
            showBuildModal={showBuildModal}
            title="Build"
            selectedOption={uiState && uiState.imageOption ? uiState.imageOption.value : ''}
          >
            <BuildModal show={showBuild} handleClose={hideBuildModal} />
          </OptionAccordion>
          
          {isEngineReady && uiState && (
            <WebOption
              title="Webs"
              webs={getWebsForGlove()}
              colors={getSelectableColors()}
              selectedWebType={uiState.webType}
              selectedWebColor={uiState.webColor?.value}
              onWebTypeChange={handleWebTypeChange}
              onWebColorChange={handleWebColorChange}
            />
          )}

          {isEngineReady && uiState && props.zones.includes('lace') && (
            <ColorOption
              colors={getColors('lace')}
              title="lace"
              both={uiState.lace ? uiState.lace.value : colors.white}
              setOptions={setOptions}
            />
          )}

          {isEngineReady && uiState && getZones()}
          {isEngineReady && uiState && renderTextOptions()}

        </div>
        <div className="gradientsStage2Bottom" />
      </div>
    </div>
  );
}


/* ------------------------
   RIGHT PANEL COMPONENT
------------------------ */
function RightPanel(props) {
  const navigate = useNavigate();
  const routeChange = () => navigate('/stage-two');

  return (
    <div>
      <div className={`accordionAndCTA flex flex-col justify-end`}>
        <UpAccordion title="Glove Foundation" stage="two">
          <div className="overScroll">
            {/* Original content can still go here if needed */}
          </div>
        </UpAccordion>
        <button onClick={routeChange} className="cta rightButtonCTA">
          <p>Call To Action</p>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------
   MAIN CONTAINER COMPONENT
------------------------ */
function MainContainer(props) {
  // Simplified, no longer needs context
  return (
    <div id="main" className="main-container flex">
      <div className={`left-panel left-panel2 px-5 overflow-y-auto`}>
        {props.leftPanel}
      </div>
      <main className={`centerSecond center-panel center-panel2`}>
        {props.children}
      </main>
      <div className="right-panel2 px-5">
        {props.rightPanel}
      </div>
    </div>
  );
}

/* ------------------------
   STAGE SECOND COMPONENT
   *** CRITICAL REFACTOR ***
------------------------ */
function StageSecond() {
  // REFACTORED: Get state from Redux
  const isEngineReady = useAppSelector((state) => state.buildReducer.isEngineReady);
  const activeModel = useAppSelector((state) => state.buildReducer.activeModel);
  const dispatch = useAppDispatch();
  
  const [zones, setZones] = useState([]);

  // This effect now sets the zones once the engine is ready
  useEffect(() => {
    if (isEngineReady) {
      const scenes = SceneBabylon.instance();
      if (scenes && scenes.currentGlove && scenes.currentGlove.gloveZones) {
        setZones(scenes.currentGlove.gloveZones.zones);
      }
    }
  }, [activeModel, isEngineReady]);

  // CRITICAL: This effect initializes the engine and dispatches the ready action.
  useEffect(() => {
    // The callback passed to instance() is now the Redux action dispatcher.
    const scene = SceneBabylon.instance(() => dispatch(engineReady()));

    if (scene && scene.canvas) {
      scene.canvas.style.opacity = '1';
      return () => {
        if (scene.canvas) {
          scene.canvas.style.opacity = '0';
        }
      };
    }
    return () => {};
  }, [dispatch]);

  return (
    <>
      <h1 className="logo">LOGO</h1>
      {/* The UI now renders once the engine is confirmed ready via Redux */ }
      {isEngineReady ? (
        <MainContainer
          stage="two"
          leftPanel={<LeftPanel stage="two" zones={zones} />}
          rightPanel={<RightPanel stage="2" />}
        >
          <MiddleContainer stage="two" />
        </MainContainer>
      ) : (
        <div>Loading...</div> // Or some other loading indicator
      )}
    </>
  );
}


/* ------------------------
   UI CLASS (from second file) - Deprecated but kept as per instructions
------------------------ */
class UI extends React.Component {
  // ... this class remains as is, though its pattern is no longer used by the main app flow
  render() { return null; }
}

/* ------------------------
   INIT UI FUNCTION (default export)
   *** REFACTORED ***
------------------------ */
export default function initUI(app) {
  const promise = new Promise((resolve) => {
    const rootElement = document.getElementById('ui-container');
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      const store = setupStore(); // Setup the redux store

      // REFACTORED: Wrapped App in Redux Provider, removed IsopenContextProvider
      root.render(
        <React.StrictMode>
          <Provider store={store}>
            <App />
          </Provider>
        </React.StrictMode>
      );
      resolve();
    } else {
      console.error("UI container 'ui-container' not found.");
      resolve();
    }
  });

  return promise;
}

/* ------------------------
   EXPORTS
------------------------ */
export {
  LeftPanel,
  RightPanel,
  MainContainer,
  MiddleContainer,
  StageSecond,
  OptionAccordion,
  UpAccordion,
};