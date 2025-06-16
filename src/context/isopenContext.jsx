/* eslint-disable array-callback-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-multi-assign */

// Core React/UI imports
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { NavLink, useNavigate } from 'react-router-dom';
import { TbArrowsMaximize } from 'react-icons/tb';
import { CgArrowRight, CgList } from 'react-icons/cg';

// NEW: Redux imports
import { Provider } from 'react-redux';
import { useAppSelector, useAppDispatch, setupStore, engineReady, setBuildProperty } from '../store/rootReducer';

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
import App from '../App';


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
------------------------ */
function UpAccordion(props) {
    // REFACTORED: Simplified state management
  const [open, setOpen] = useState(false);
  
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
          {props.children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------
   LEFT PANEL COMPONENT (STAGE TWO)
   *** HEAVILY REFACTORED PER TASK REQUIREMENTS ***
------------------------ */
function LeftPanel(props) {
  // State from Redux and the new hook
  const isEngineReady = useAppSelector((state) => state.buildReducer.isEngineReady);
  const { position, pallette } = useAppSelector((state) => state.buildReducer);
  const engine = useEngine(); // Our new bridge to Babylon

  // MODIFIED: Centralized UI state for this component.
  // It now includes web selections and other zone colors.
  const [uiState, setUiState] = useState({
    webType: 'iOB',       // Default before engine is ready
    webColor: '#E5E7E8',  // Default before engine is ready
  });

  // Local UI state
  const [showBuild, setShowBuild] = useState(false);
  const [positionName, setPositionName] = useState(configBuild.Position[0]);
  const [gloveModelsForPosition, setGloveModelsForPosition] = useState(null);

  const colors = colorMap[pallette];

  useEffect(() => {
    // Update position name when Redux state changes
    const newPositionName = configBuild.Position[position];
    setPositionName(newPositionName);
    setGloveModelsForPosition(playerPosition[newPositionName].glove);
  }, [position]);


  // REFACTORED: This effect now initializes ALL states when the engine is ready.
  useEffect(() => {
    if (isEngineReady && engine && props.zones?.length > 0) {
      const scenes = SceneBabylon.instance();
      const initialWebType = scenes?.currentGlove?.websGlove[0] || 'iOB';
      const initialColor = colors.white;
      const initialFont = fonts[0];
      
      const initialZoneStates = {};
      const textZones = scenes?.currentGlove?.textZones || [];

      props.zones.forEach((item) => {
        // Exclude zones that will be handled by the dedicated WebOption component
        if (!ZONES_WEB.includes(item)) {
          initialZoneStates[item] = { value: initialColor };
          engine.updateColor(item, initialColor); // Command engine for other zones
        }
      });
      
      textZones.forEach((zone) => {
        initialZoneStates[zone] = { text: '', font: initialFont, color: initialColor };
        engine.updateText(zone, '', initialFont, initialColor);
      });
      
      // Command the engine for the initial web and lace state
      engine.setActiveWeb(initialWebType);
      engine.updateColor('web', initialColor);
      engine.updateColor('lace', initialColor);

      // Set the complete initial state for the entire panel
      setUiState({
        ...initialZoneStates,
        webType: initialWebType,
        webColor: initialColor
      });
    }
  }, [isEngineReady, engine, props.zones, colors]);

  const showBuildModal = () => setShowBuild(true);
  const hideBuildModal = () => setShowBuild(false);

  // REFACTORED: Original handler for generic color options
  const setOptions = (zone, option) => {
    if (engine && props.zones.includes(zone)) {
      engine.updateColor(zone, option.value);
    }
    setUiState({ ...uiState, [zone]: option });
  };

  // --- NEW HANDLERS FOR THE "SMART" COMPONENT ---
  
  // Connects UI action to the engine API for web type change
  const handleWebTypeChange = (newWebType) => {
    if (engine) {
      engine.setActiveWeb(newWebType);
    }
    setUiState(prevState => ({ ...prevState, webType: newWebType }));
  };
  
 // --- NEW HANDLERS FOR THE "SMART" COMPONENT ---

// ... (handleWebTypeChange remains the same)

// Connects UI action to the engine API for web color change
const handleWebColorChange = (newColor) => {
    if (engine) {
      engine.updateColor('web', newColor);
      // The line below has been removed.
      // engine.updateColor('lace', newColor); 
    }
    setUiState(prevState => ({ ...prevState, webColor: newColor }));
};

const handleTextChange = (zone, newProperty) => {
    const currentTextState = uiState[zone];
    const updatedTextState = { ...currentTextState, ...newProperty };

    setUiState(prevState => ({
        ...prevState,
        [zone]: updatedTextState,
    }));

    if (engine) {
        engine.updateText(
            zone,
            updatedTextState.text,
            updatedTextState.font,
            updatedTextState.color
        );
    }
};
  
  // --- END NEW HANDLERS ---

  const getColors = (name) => {
    const objColors = { ...(colors || {}) };
    Object.entries(additionalColors).forEach(([key, value]) => {
      if (value.zones.includes(name)) objColors[key] = value.value;
    });
    return objColors;
  };
  
 // REFACTORED: This function now filters out ONLY the web zone itself.
const getZones = () =>
    props.zones && props.zones.map((item, index) => {
      if (item !== 'web') { // <- CRITICAL CHANGE
        const arrColor = getColors(item);
        return (
          <ColorOption
            key={index}
            colors={arrColor}
            title={item}
            both={uiState[item] ? uiState[item].value : colors.white}
            setOptions={setOptions}
          />
        );
      }
      return null;
    });
  
  // --- NEW HELPER FUNCTIONS TO PROVIDE PROPS ---

  const getWebsForGlove = () => {
    if (!isEngineReady) return [];
    const scenes = SceneBabylon.instance();
    const webValues = scenes?.currentGlove?.websGlove || [];
    return webValues.map(webValue => ({
        value: webValue,
        // Create a user-friendly text label from the value, e.g., "modTrapOB" -> "Mod Trap"
        text: webValue.replace(/([A-Z])/g, ' $1').replace(/OB|CB|FB|CM/,'').trim(),
        image: `assets/web-icons/${webValue}.png` // Example path to a web thumbnail
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
      
      return (
        <TextOptions
            key={zone}
            title={title}
            colors={colors}
            defState={uiState[zone]} 
            names={fonts}
            selected={{ value: uiState[zone]?.font }}
            setOptions={(id, option) => handleTextChange(zone, option)} 
        />
      );
    });
  };
  // --- END NEW HELPER FUNCTIONS ---

  return (
    <div>
      <div className={`leftContainers`}>
        <div className="marginCenterYES">
          <OptionAccordion
            showBuildModal={showBuildModal}
            title="Build"
            selectedOption={uiState.imageOption && uiState.imageOption.value}
          >
            <BuildModal show={showBuild} handleClose={hideBuildModal} />
          </OptionAccordion>
          
          {/* NEW: Rendering the dumb WebOption component with the correct props */}
          {isEngineReady && (
            <WebOption
              title="Webs"
              webs={getWebsForGlove()}
              colors={getSelectableColors()}
              selectedWebType={uiState.webType}
              selectedWebColor={uiState.webColor}
              onWebTypeChange={handleWebTypeChange}
              onWebColorChange={handleWebColorChange}
            />
          )}

          {/* Render the rest of the color zones */}
          {isEngineReady && getZones()}

          {isEngineReady && renderTextOptions()}

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
        <UpAccordion stage="two">
          <div className="mb-2">Glove Foundation</div>
          <div className="overScroll">
            {/* ... content ... */}
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