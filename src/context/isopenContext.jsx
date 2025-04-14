/* ------------------------
   IMPORTS
------------------------ */
import React, { createContext, useReducer, useContext, useState, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { NavLink, useNavigate } from 'react-router-dom';
import { TbArrowsMaximize } from 'react-icons/tb';
import { CgArrowRight, CgList } from 'react-icons/cg';

// Merge SceneBabylon imports (adding colorOptions from the second file)
import SceneBabylon, {
  fonts,
  colorMap,
  additionalColors,
  Messenger,
  ZONES_WEB,
  colorOptions,
  playerPosition,
  configBuild
} from '../containers/scene/SceneBabylon';

import { useAppSelector } from '../store/rootReducer';
import {
  Select,
  SelectColor,
  SelectColor2,
  SelectImage,
  SelectInput,
  TextOptions,
  ColorOption,
  WebOption,
  NameOptions,
  ColorCircle,
  ColorCircle2,
  BuildModal,
  Modal,
  Hero,
  Card,
  SelectGroup
} from '../containers/scene/ui';

// CSS and font imports from the second file
import '../../src/index.css';
import '../../src/main.scss';
import App from '../App';

/* ------------------------
   ISOPEN CONTEXT & PROVIDER
------------------------ */
const INITIAL_STATE = {
  isOpen: false,
  isMizedOpen: false,
  allMaximize: false,
  singleOpened: false,
  arrowUp: false,
  accordionOpen: false,
  colorPrimary: '',
  secondStage: false,
  modalOpen: false,
  isLoadGlove: false,
  activeModel: 0,
  activePallet: 0,
};

const IsopenReducer = (state, action) => {
  switch (action.type) {
    case 'MIXEDOPENSHOW': {
      return {
        ...state,
        isMizedOpen: !state.isMizedOpen,
      };
    }
    case 'ALLMAXIMIZE': {
      return {
        ...state,
        allMaximize: !state.allMaximize,
      };
    }
    case 'SINGLEOPENED': {
      return {
        ...state,
        singleOpened: !state.singleOpened,
      };
    }
    case 'ARROWUP': {
      return {
        ...state,
        arrowUp: !state.arrowUp,
      };
    }
    case 'COLORPRIMARY': {
      return {
        ...state,
        colorPrimary: '',
      };
    }
    case 'ACCORDIONOPEN': {
      return {
        ...state,
        accordionOpen: !state.accordionOpen,
      };
    }
    case 'SECONDSTAGE': {
      return {
        ...state,
        secondStage: !state.secondStage,
      };
    }
    case 'MODALOPEN': {
      return {
        ...state,
        modalOpen: !state.modalOpen,
      };
    }
    case 'LOAD_GLOVE': {
      return {
        ...state,
        isLoadGlove: true,
      };
    }
    case 'SET_ACTIVE_MODEL': {
      return {
        ...state,
        activeModel: action.id,
      };
    }
    case 'SET_ACTIVE_PALLET': {
      return {
        ...state,
        activePallet: action.id,
      };
    }
    default:
      return state;
  }
};

export const IsopenContext = createContext(INITIAL_STATE);

export const IsopenContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(IsopenReducer, INITIAL_STATE);
  return (
    <IsopenContext.Provider
      value={{
        isOpen: state.isOpen,
        isMizedOpen: state.isMizedOpen,
        allMaximize: state.allMaximize,
        singleOpened: state.singleOpened,
        arrowUp: state.arrowUp,
        accordionOpen: state.accordionOpen,
        colorPrimary: state.colorPrimary,
        secondStage: state.secondStage,
        modalOpen: state.modalOpen,
        isLoadGlove: state.isLoadGlove,
        activeModel: state.activeModel,
        activePallet: state.activePallet,
        dispatch,
      }}
    >
      {children}
    </IsopenContext.Provider>
  );
};

/* ------------------------
   MIDDLE CONTAINER COMPONENT
------------------------ */
function MiddleContainer(props) {
  const { accordionOpen, isLoadGlove, allMaximize, dispatch } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();
  const [scene, setScene] = useState();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  useEffect(() => {
    if (isLoadGlove) {
      const scenes = SceneBabylon.instance();
      setScene(scenes);
    } else {
      // Even if not loaded, get an instance (it won't crash)
      const fallback = SceneBabylon.instance();
      setScene(fallback);
    }
  }, [isLoadGlove]);

  const setIndex = (id) => {
    setActiveIndex(id);
    if (scene) {
      scene.setActiveGlove(id);
      dispatch({ type: 'SET_ACTIVE_MODEL', id });
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`centerStageTwo middle-container flex flex-col flex-1 ${accordionOpen ? 'CenterClosedContext' : ''} ${allMaximize ? 'iconsMinimize' : ''}`}
    >
      <div className="middle-container-content flex-1 w-full"></div>
      <div className="stageTwoCenter middle-container-menu flex flex-col justify-center items-center">
        <div className="navigation-dots flex my-2">
          {scene
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
                >
                  <circle cx="16" cy="16" r="8" fill={activeIndex === index ? '#fff' : '#ffffff66'} />
                </svg>
              ))
            : null}
        </div>
        <div className="navigation-instructions flex">
          {windowWidth && (
            <div style={{ color: 'white', fontSize: '28px', cursor: 'pointer' }} onClick={() => dispatch({ type: 'ALLMAXIMIZE' })} className="mr-4">
              <TbArrowsMaximize />
            </div>
          )}
          <div className="mr-4">
            {windowWidth ? (
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.9645 16.8222L11.6787 19.1079C11.3445 19.4429 11.3445 19.9857 11.6787 20.3204L13.9645 22.6062C14.2994 22.9404 14.8423 22.9404 15.177 22.6062C15.5112 22.2712 15.5112 21.7284 15.177 21.3937L13.4968 19.7143L15.177 18.0349C15.5112 17.7 15.5112 17.1572 15.177 16.8225C14.842 16.4883 14.2992 16.4883 13.9645 16.8225V16.8222Z"
                  fill="grey"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.8217 14.0355L19.1074 16.3213C19.4424 16.6555 19.9852 16.6555 20.3199 16.3213L22.6057 14.0355C22.9399 13.7006 22.9399 13.1577 22.6057 12.823C22.2707 12.4888 21.7279 12.4888 21.3932 12.823L19.7138 14.5032L18.0344 12.823C17.6995 12.4888 17.1566 12.4888 16.8219 12.823C16.4877 13.158 16.4877 13.7008 16.8219 14.0355H16.8217Z"
                  fill="grey"
                />
              </svg>
            ) : (
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.7074 0.622701C13.7678 -0.849719 9.19902 0.35492 6.54529 3.54063C3.34439 7.42228 4.00108 12.4284 6.79166 15.7212C4.60296 17.8895 2.41426 20.0312 0.225712 22.1728C-0.0752372 22.4673 -0.0752372 22.976 0.225712 23.2705L0.745564 23.7791C1.04651 24.0736 1.56636 24.0736 1.8673 23.7791C4.08325 21.6108 6.27195 19.4691 8.48796 17.3007C10.4851 18.7731 13.0568 19.5226 15.902 19.0407C20.6076 18.2375 23.8906 14.1952 24 9.59073C23.8905 5.62857 21.5102 2.06825 17.7076 0.622653L17.7074 0.622701ZM14.1783 17.6219C9.69157 17.6219 5.97086 13.9544 5.97086 9.59078C5.97086 5.20044 9.71888 1.53289 14.1783 1.55966C18.7471 1.55966 22.3037 5.20044 22.3857 9.59078C22.2762 13.9811 18.7471 17.6219 14.1783 17.6219Z"
                  fill="white"
                />
                <path
                  d="M14.7527 4.2367H13.3848V8.92152H8.81601V10.26H13.3848V14.9449H14.7527V10.26H19.7593V8.92152H14.7527V4.2367Z"
                  fill="white"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------
   OPTION ACCORDION COMPONENT
------------------------ */
const OptionAccordion = (props) => {
  const [open, setOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const { accordionOpen, isMizedOpen, dispatch } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  const handleClick = () => {
    dispatch({ type: 'MIXEDOPENSHOW' });
  };

  const handleBuild = () => {
    setBuildOpen(!buildOpen);
    setOpen(!open);
  };

  const openButton = () => {
    console.log('openButton');
    setOpen(!open);
    if (props.showBuildModal) {
      props.showBuildModal();
    }
  };

  // We now support only Stage Two, so always render the default branch.
  return (
    <div className={`option-accordion up-accordion ${open ? ' open' : ''} ${isMizedOpen ? ' FirstClosed' : ''}`}>
      <button style={{ marginBottom: '0px' }} className="w-full" onClick={props.title === 'Build' ? handleBuild : openButton}>
        {(isMizedOpen && windowWidth) && <MiddleContainer />}
        <div onClick={handleClick} className="accordion-header h-14 py-3.5 px-6 flex items-center">
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
      {props.title === 'Build' && (
        <div className={`accordion-body ${open ? ' active ' : (isOpened ? ' colorno ' : '')}`}>
          <div className="accordion-body-content py-3.5 px-4">
            {props.children}
          </div>
        </div>
      )}
      {props.title === 'Color Option1' && (
        <div className={`accordion-body ${open ? ' active' : (isOpened ? ' colorno' : '')}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.title === 'Color Option2' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.title === 'Title' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.title === '2 Options' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.type === 'TextInput' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.title === 'TextInput' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.title === 'Dual Color' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.type === 'colorOption' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
      {props.type === 'options' && (
        <div className={`accordion-body${open ? ' active' : ''}`}>
          <div className="accordion-body-content pt-3.5 px-6">
            {props.children}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------
   UP ACCORDION COMPONENT
------------------------ */
function UpAccordion(props) {
  const [open, setOpen] = useState(false);
  const { accordionOpen, dispatch } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  return (
    <div className={`up-accordion ${open ? ' openAccordion' : ''} ${accordionOpen ? ' acccccord' : ''}`}>
      <button className="w-full" style={{ zIndex: '22222' }} onClick={() => setOpen(!open)}>
        <div
          style={{ zIndex: '2222299999999999' }}
          onClick={() => dispatch({ type: 'ACCORDIONOPEN' })}
          className="accordion-button h-14 py-3.5 px-6 flex items-center"
        >
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
   NAV COMPONENT
------------------------ */
function Nav() {
  const [open, setOpen] = useState(false);
  const { allMaximize, dispatch, isMizedOpen } = useContext(IsopenContext);

  // Only Stage Two is used.
  const handleSecond = () => {
    dispatch({ type: 'SECONDSTAGE' });
  };

  return (
    <nav id="mainNav">
      <h1 style={{ fontFamily: 'Inter', fontWeight: '500' }} className="logo">
        LOGO
      </h1>
    </nav>
  );
}

/* ------------------------
   LEFT PANEL COMPONENT (STAGE TWO)
------------------------ */
function LeftPanel(props) {
  const { isLoadGlove, activeModel, activePallet, dispatch, allMaximize, isMizedOpen } = useContext(IsopenContext);
  const { position, pallette } = useAppSelector((state) => state.buildReducer);

  const [state, setState] = useState({});
  const [showBuild, setShowBuild] = useState(false);
  const [scroll, setScroll] = useState();
  const [positionName, setPositionName] = useState(configBuild.Position[0]);
  const [model, setModel] = useState();
  const [names, setNames] = useState(null);
  const [messenger, setMessenger] = useState();
  const [web, setWeb] = useState();

  const colors = colorMap[pallette];
  const [both, setBoth] = useState(state.colorOption ? state.colorOption.value : colors.white);
  const [both2, setBoth2] = useState(state.colorOption2 ? state.colorOption2.value : '#222222');
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
    const scenes = SceneBabylon.instance();
    setModel(scenes);
    const namePosition = configBuild.Position[position];
    setNames(playerPosition[namePosition].glove);
    const mes = Messenger.instance();
    setMessenger(mes);
  }, []);

  useEffect(() => {
    const namePosition = configBuild.Position[position];
    setPositionName(namePosition);
    setNames(playerPosition[namePosition].glove);
  }, [position]);

  useEffect(() => {
    if (names) {
      setActiveGloveModel();
    }
  }, [names]);

  useEffect(() => {
    if (props?.zones?.length > 0) {
      const obj = {};
      // Set default webs
      const val = model.currentGlove.websGlove[0];
      const value = val.split('').slice(0, val.length - 2).join('');
      model.setActiveWeb(value);
      obj.webs = { id: 0, text: value, value };

      // Set default for each zone
      props.zones.forEach((item) => {
        obj[item] = { value: colors.white };
        model.currentGlove.dataChangedCallback({ key: item, value: colors.white });
      });

      // Set default text zones
      model.currentGlove.textZones.forEach((item) => {
        obj[item] = { color: colors.white, text: '', font: fonts[0] };
      });

      setState(obj);
    }
  }, [props.zones]);

  useEffect(() => {
    if (activeModel) {
      setState({});
      model.currentGlove.resetStyleText();
      model.currentGlove.textZones.forEach((item) => {
        model.currentGlove.updateText(item);
      });
    }
  }, [activeModel, model]);

  useEffect(() => {
    const elem = document.querySelector('.leftContainers');
    if (elem) {
      elem.addEventListener('scroll', () => setScroll(elem.scrollTop));
    }
    const elemPanel = document.querySelector('.left-panel2');
    if (elemPanel) {
      elemPanel.addEventListener('scroll', () => setScroll(elemPanel.scrollTop));
    }
  }, []);

  useEffect(() => {
    setBoth(state.colorOption && state.colorOption.value);
    setBoth2(state.colorOption2 && state.colorOption2.value);
  }, [state.colorOption, state.colorOption2]);

  useEffect(() => {
    if (state.webs) {
      updWebs();
    }
  }, [state.webs]);

  useEffect(() => {
    console.log('[state]', state);
  }, [state]);

  const setActiveGloveModel = async () => {
    const namePosition = configBuild.Position[position];
    const name = playerPosition[namePosition].glove[0];
    const id = model.gloves.findIndex((item) => item === name);
    await model.setActiveGlove(id);
    dispatch({ type: 'SET_ACTIVE_MODEL', id });
  };

  const updWebs = async () => {
    for (let i = 0; i < ZONES_WEB.length; i++) {
      const item = ZONES_WEB[i];
      const val = state[item]?.value ? state[item].value : colors.white;
      await model.currentGlove.dataChangedCallback({ key: item, value: val });
    }
  };

  const showBuildModal = () => {
    setShowBuild(true);
    dispatch({ type: 'SINGLEOPENED' });
  };

  const hideBuildModal = () => {
    setShowBuild(false);
  };

  const setOptions = (value, option) => {
    if (props.zones.includes(value)) {
      model.currentGlove.dataChangedCallback({ key: value, value: option.value });
    }
    setState({ ...state, [value]: option });
  };

  const setOptionsText = (id, option) => {
    model.currentGlove.changeTextStyle(Object.keys(option)[0], Object.values(option)[0]);
    const name = model.currentGlove.textZones[id];
    model.currentGlove.updateText(name);
    setState({
      ...state,
      [name]: {
        ...state[name],
        ...option
      }
    });
  };

  const handlebutton = () => {
    if (
      (state.colorOption?.value !== state.colorOption2?.value) ||
      state.colorOption?.value
    ) {
      setBoth(state.colorOption2?.value);
      setBoth2(state.colorOption2?.value);
    }
  };

  const handleButton2 = () => {
    if (
      (state.colorOption?.value !== state.colorOption2?.value) ||
      state.colorOption2?.value
    ) {
      setBoth(state.colorOption?.value);
      setBoth2(state.colorOption?.value);
    }
  };

  const getColors = (name) => {
    const objColors = { ...colors };
    Object.entries(additionalColors).forEach(([key, value]) => {
      if (value.zones.includes(name)) objColors[key] = value.value;
    });
    return objColors;
  };

  const getZones = () =>
    props.zones.map((item, index) => {
      const arrColor = getColors(item);
      if (item !== 'web') {
        return (
          <ColorOption
            key={index}
            colors={arrColor}
            title={item}
            windowWidth={windowWidth}
            both={state[item] ? state[item].value : both}
            setOptions={setOptions}
            handleButton={handleButton2}
          />
        );
      }
      return null;
    });

  const getGloveNames = () => (
    <NameOptions
      title="Gloves"
      windowWidth={windowWidth}
      defState={state}
      names={names}
      onSelection={async (option) => {
        const id = model.gloves.findIndex((item) => item === option.value);
        await model.setActiveGlove(id);
        dispatch({ type: 'SET_ACTIVE_MODEL', id });
        setOptions('activeGlove', option);
        setOptions('webs', null);
      }}
    />
  );

  const getTextZones = () => {
    const arr = model.currentGlove.textZones.map((item) => {
      const arrChar = item.split('');
      arrChar[0] = arrChar[0].toUpperCase();
      const id = arrChar.length - 4;
      arrChar.splice(id, 0, ' ');
      return arrChar.join('');
    });

    return arr.map((item, index) => (
      <TextOptions
        title={item}
        id={index}
        key={index}
        colors={colors}
        windowWidth={windowWidth}
        defState={state[model.currentGlove.textZones[index]]}
        names={fonts}
        selected={{ value: state[model.currentGlove.textZones[index]]?.font }}
        setOptions={setOptionsText}
        setOptionsInput={(option) => {
          model.currentGlove.updateText(option, model.currentGlove.textZones[index]);
        }}
      />
    ));
  };

  const getWebsNames = () => {
    const arr = model.currentGlove.websGlove.map((item) =>
      item.split('').slice(0, item.length - 2).join('')
    );
    const arrPlayerWeb = playerPosition[positionName].web;
    const arrWeb = arrPlayerWeb.filter((item) => arr.includes(item));

    return (
      <WebOption
        title="Webs"
        windowWidth={windowWidth}
        defState={state}
        colors={colors}
        webs={arrWeb}
        selected={state.webs}
        setOptionsColor={setOptions}
        onSelection={async (option) => {
          const value = `${option.value}`;
          model.setActiveWeb(value);
          setOptions('webs', option);
        }}
      />
    );
  };

  return (
    <div>
      <div className={`${allMaximize ? 'hideLeft' : ''} ${isMizedOpen ? 'LeftContainerOpen' : 'leftContainers'}`}>
        {!isMizedOpen && windowWidth && (
          <div
            className="controls"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: '11111111111',
              marginBottom: '2rem !important'
            }}
          >
            <MiddleContainer stage="two" />
            {scroll ? <div className="gradientsStage2" /> : null}
          </div>
        )}
        <div className="marginCenterYES">
          <OptionAccordion
            stage="two"
            showBuildModal={showBuildModal}
            showBuild={showBuild}
            title="Build"
            selectedOption={state.imageOption && state.imageOption.value}
          >
            <BuildModal
              title="Option With Image"
              stage="two"
              show={showBuild}
              handleClose={hideBuildModal}
            />
          </OptionAccordion>
          {scroll ? <div className="gradientsStage2" /> : null}
          {names ? getGloveNames() : null}
          {model ? getWebsNames() : null}
          {isLoadGlove ? getZones() : null}
          {model ? getTextZones() : null}
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
  const { isMizedOpen, dispatch, accordionOpen, allMaximize } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();
  const navigate = useNavigate();

  const routeChange = () => {
    // Only Stage Two is used.
    navigate('/stage-two');
  };

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  return (
    <div>
      <div
        className={`accordionAndCTA flex flex-col justify-end ${allMaximize ? 'minimizeMenu' : ''} ${isMizedOpen ? 'hideMixed' : ''}`}
      >
        <UpAccordion stage="two">
          <div className="mb-2">Glove Foundation</div>
          <div className="overScroll">
            <div className="flex justify-between">
              <div>Option</div>
              <div>Value</div>
            </div>
            {Array.from({ length: 20 }).map((_, idx) => (
              <div className="flex justify-between" key={idx}>
                <div>Option</div>
                <div>Value</div>
              </div>
            ))}
          </div>
        </UpAccordion>
        <button onClick={routeChange} className="cta rightButtonCTA">
          <p>
            {props.stage === 2 && windowWidth && !accordionOpen && 'Call To Action'}
            {props.stage === 2 && windowWidth && accordionOpen && 'Call To Action'}
            {props.stage === 2 && !windowWidth && !accordionOpen && 'Call To Action'}
          </p>
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
  const { modalOpen, accordionOpen } = useContext(IsopenContext);
  const { isMizedOpen } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  const hideModal = () => {
    setShow(false);
  };

  // We assume props.stage is always "two"
  return (
    <div id="main" className="main-container flex">
      <div className={`${accordionOpen ? 'hideLeftPanel' : ''} left-panel left-panel2 px-5 overflow-y-auto`}>
        {props.leftPanel}
      </div>
      <main className={`${accordionOpen ? 'hideLeftPanel' : ''} ${modalOpen ? 'disableScroll' : ''} centerSecond center-panel center-panel2`}>
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
------------------------ */
function StageSecond() {
  const { isMizedOpen, activeModel, dispatch, isLoadGlove, allMaximize } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();
  const [zones, setZones] = useState([]);

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  useEffect(() => {
    if (isLoadGlove) {
      const scenes = SceneBabylon.instance();
      setZones(scenes.currentGlove.gloveZones.zones);
    }
  }, [activeModel]);

  useEffect(() => {
    if (isLoadGlove) {
      const scenes = SceneBabylon.instance();
      setZones(scenes.currentGlove.gloveZones.zones);
    }
  }, [isLoadGlove]);

  useEffect(() => {
    const scene = SceneBabylon.instance(() => dispatch({ type: 'LOAD_GLOVE' }));
    scene.canvas.style.opacity = 1;
    return () => {
      scene.canvas.style.opacity = 0;
    };
  }, [dispatch]);

  return (
    <>
      <Nav />
      {isLoadGlove ? (
        <MainContainer
          stage="two"
          leftPanel={<LeftPanel stage="two" zones={zones} />}
          rightPanel={(!allMaximize || !windowWidth) && <RightPanel stage="2" />}
        >
          {((!isMizedOpen && !windowWidth) || (isMizedOpen && !windowWidth) || (windowWidth && !isMizedOpen)) && <MiddleContainer stage="two" />}
        </MainContainer>
      ) : null}
      {allMaximize && windowWidth && <MiddleContainer />}
    </>
  );
}

/* ------------------------
   UI CLASS (from second file)
------------------------ */
class UI extends React.Component {
  isLoaded = false;

  componentDidMount() {
    this.isLoaded = true;
    this.props.onLoaded();
  }

  renderGlove() {
    return (
      <div>
        <div>{this.props.glove.id}</div>
        {this.renderGloveObject(this.props.glove.id, this.props.glove.gloveObject)}
      </div>
    );
  }

  renderGloveObject(gloveId, gloveObject) {
    return (
      <div>
        <div>{gloveObject.id}</div>
        {this.renderSection(gloveId, 'zones', gloveObject)}
      </div>
    );
  }

  renderSection(gloveId, section, gloveObject) {
    const gloveZones = gloveObject.zones.zones;
    return (
      <div>
        <div>{section}</div>
        <br />
        {gloveZones.map((element) => (
          <SelectGroup
            gloveId={gloveId}
            itemId={gloveObject.id}
            section={section}
            messenger={this.props.messenger}
            key={element}
            subtitle={element}
            dataId={element}
            options={colorOptions}
          />
        ))}
      </div>
    );
  }

  render() {
    return this.renderGlove();
  }
}

/* ------------------------
   INIT UI FUNCTION (default export)
------------------------ */
export default function initUI(app) {
  const promise = new Promise((resolve) => {
    const root = ReactDOM.createRoot(document.getElementById('ui-container'));

    root.render(
      <React.StrictMode>
        <IsopenContextProvider>
          <App />
        </IsopenContextProvider>
      </React.StrictMode>
    );

    // Alternatively, you can render the UI component:
    // root.render(<UI glove={app.glove} messenger={app.messenger} onLoaded={resolve} />);
  });

  return promise;
}

/* ------------------------
   EXPORTS
------------------------ */
export {
  Nav,
  LeftPanel,
  RightPanel,
  MainContainer,
  MiddleContainer,
  StageSecond,
  OptionAccordion,
  UpAccordion,
};
