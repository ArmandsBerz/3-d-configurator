/* ------------------------
   IMPORTS
------------------------ */
import React, { createContext, useReducer, useContext, useState, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { NavLink, useNavigate } from 'react-router-dom';
import { TbArrowsMaximize } from 'react-icons/tb';
import { CgArrowRight, CgList } from 'react-icons/cg';

// Merge SceneBabylon imports (adding colorOptions from the second file)
import SceneBabylon, { fonts, colorMap, additionalColors, Messenger, ZONES_WEB, colorOptions, playerPosition, configBuild } from '../containers/scene/SceneBabylon';

import { useAppSelector } from '../store/rootReducer';
import { Select, SelectColor, SelectColor2, SelectImage, SelectInput, TextOptions, ColorOption, WebOption, NameOptions, ColorCircle, ColorCircle2, BuildModal, Modal, Hero, Card, SelectGroup } from '../containers/scene/ui';

import '../views/components/nav/Nav.css';
import '../views/components/ui/MainContainer.scss';
import '../views/First/style.css';
import '../views/First/style.scss';
import '../views/components/ui/Select.scss';

// CSS and font imports from the second file
import '../../src/index.css';
import '../../src/main.scss';
import '../assets/fonts/Oswald-ExtraLight.ttf';
import '../assets/fonts/Oswald-Light.ttf';
import '../assets/fonts/Oswald-Medium.ttf';
import '../assets/fonts/Oswald-Regular.ttf';
import '../assets/fonts/Oswald-SemiBold.ttf';
import '../assets/fonts/Oswald-Bold.ttf';

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
  firstStage: false,
  secondStage: false,
  thirdStage: false,
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
    case 'FIRSTSTAGE': {
      return {
        ...state,
        firstStage: !state.firstStage,
      };
    }
    case 'SECONDSTAGE': {
      return {
        ...state,
        secondStage: !state.secondStage,
      };
    }
    case 'THIRDSTAGE': {
      return {
        ...state,
        thirdStage: !state.thirdStage,
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
        firstStage: state.firstStage,
        secondStage: state.secondStage,
        thirdStage: state.thirdStage,
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
      // even if not loaded, we try to get an instance (since it won't crash)
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
      className={`${
        !windowWidth ? 'centerStageTwo' : ''
      } ${accordionOpen ? 'CenterClosedContext' : ''} middle-container flex flex-col flex-1 ${
        allMaximize ? 'iconsMinimize' : ''
      }`}
    >
      <div className="middle-container-content flex-1 w-full"></div>
      <div
        className={`${
          props.stage === 'two' ? 'stageTwoCenter' : ''
        } ${props.stage === 3 ? 'stageThreeCenter' : ''} middle-container-menu flex flex-col justify-center items-center`}
      >
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
                  <circle
                    cx="16"
                    cy="16"
                    r="8"
                    fill={activeIndex === index ? '#fff' : '#ffffff66'}
                  />
                </svg>
              ))
            : null}
        </div>
        <div className="navigation-instructions flex">
          {windowWidth && (
            <div
              style={{ color: 'white', fontSize: '28px', cursor: 'pointer' }}
              onClick={() => {
                dispatch({ type: 'ALLMAXIMIZE' });
              }}
              className="mr-4"
            >
              <TbArrowsMaximize />
            </div>
          )}
          <div className="mr-4">
            {windowWidth ? (
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.91752 18.3994C6.3032 17.9039 4.15009 17.0485 2.85341 15.9501C2.1539 15.3575 1.71386 14.7118 1.71386 14.0003C1.71386 12.9901 2.55339 12.1214 3.83099 11.3638C6.12361 10.0044 9.82882 9.14309 14 9.14309C18.171 9.14309 21.8761 10.0044 24.169 11.3638C25.4468 12.1215 26.2861 12.9901 26.2861 14.0003C26.2861 15.0106 25.4466 15.8792 24.169 16.6369C21.8764 17.9963 18.1712 18.8576 14 18.8576H12.2857C11.8125 18.8576 11.4285 19.2415 11.4285 19.7147C11.4285 20.1879 11.8125 20.5719 12.2857 20.5719H14C18.5338 20.5719 22.5507 19.5895 25.0428 18.1114C26.9561 16.9772 28 15.5136 28 14.0003C28 12.487 26.9561 11.0237 25.0428 9.88929C22.5507 8.41093 18.5335 7.42878 14 7.42878C9.4665 7.42878 5.44931 8.41119 2.95718 9.88929C1.04387 11.0235 0 12.487 0 14.0003C0 15.1644 0.600521 16.2884 1.74567 17.2581C3.21534 18.5027 5.6355 19.5221 8.59902 20.0839C9.06357 20.1719 9.5128 19.8663 9.60083 19.401C9.68885 18.9364 9.38323 18.4872 8.91791 18.3992L8.91752 18.3994Z"
                  fill="grey"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.3988 19.0825C17.9034 21.6968 17.048 23.8499 15.9496 25.1466C15.3569 25.8461 14.7113 26.2861 13.9998 26.2861C12.9896 26.2861 12.1209 25.4466 11.3633 24.169C10.0038 21.8764 9.14257 18.1712 9.14257 14C9.14257 9.82902 10.0038 6.12393 11.3633 3.83099C12.121 2.55319 12.9896 1.71386 13.9998 1.71386C15.01 1.71386 15.8787 2.55339 16.6363 3.83099C17.9958 6.12361 18.857 9.82882 18.857 14V15.7143C18.857 16.1875 19.241 16.5715 19.7142 16.5715C20.1874 16.5715 20.5714 16.1875 20.5714 15.7143V14C20.5714 9.46623 19.5889 5.44931 18.1108 2.95718C16.9766 1.04387 15.5131 0 13.9998 0C12.4865 0 11.0232 1.04387 9.88877 2.95718C8.41041 5.44931 7.42825 9.4665 7.42825 14C7.42825 18.5335 8.41067 22.5507 9.88877 25.0428C11.023 26.9561 12.4865 28 13.9998 28C15.1638 28 16.2878 27.3995 17.2575 26.2543C18.5022 24.7847 19.5216 22.3645 20.0834 19.401C20.1714 18.9364 19.8658 18.4872 19.4005 18.3992C18.9359 18.3112 18.4867 18.6168 18.3986 19.0821L18.3988 19.0825Z"
                  fill="white"
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
    props.showBuildModal ? props.showBuildModal() : null;
  };

  return (
    <>
      {props.title === 'Mixed Options' ? (
        <div className={`option-accordion mixedoptions ${open ? ' openMixed' : ' '}`}>
          {windowWidth && <MiddleContainer stage={3} />}
          <button className="w-full" onClick={openButton}>
            <div
              onClick={!props.stage === 3 ? handleClick : null}
              className={` ${accordionOpen && 'hideMixedAcc'} accordion-header h-14 py-3.5 px-6 flex items-center`}
            >
              <div className={`arrow${open ? ' active' : ' '} flex items-center mr-2 grow-0`}>
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
          {(props.title === 'Mixed Options' && !windowWidth) && (
            <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
              <div className="accordion-body-content-mixed py-3.5 px-6">
                {props.children}
              </div>
            </div>
          )}
          {(props.title === 'Mixed Options' && windowWidth) && (
            <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
              <div className="accordion-body-content-mixed py-3.5 px-6">
                {props.children}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`option-accordion${open ? ' open' : ''} ${isMizedOpen && ' FirstClosed'} ${
            props.title === 'Build' ? 'accordionBuild' : ''
          }`}
        >
          <button
            style={{ marginBottom: '0px' }}
            className="w-full"
            onClick={props.title === 'Build' ? handleBuild : openButton}
          >
            {(isMizedOpen && windowWidth) && <MiddleContainer />}
            <div onClick={handleClick} className="accordion-header h-14 py-3.5 px-6 flex items-center">
              <div className={`arrow${open ? ' active' : ' '} flex items-center mr-2 grow-0`}>
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
          {(props.title === 'Mixed Options' && !windowWidth) && (
            <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
              <div className="accordion-body-content pt-3.5 px-6">
                {props.children}
              </div>
            </div>
          )}
          {(props.title === 'Mixed Options' && windowWidth) && (
            <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
              <div className="accordion-body-content pt-3.5 px-6">
                {props.children}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/* ------------------------
   UP ACCORDION COMPONENT
------------------------ */
function UpAccordion(props) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState('');
  const { accordionOpen, dispatch } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  useEffect(() => {
    setStage(props.stage);
  }, [props.stage]);

  return (
    <>
      {stage === 3 ? (
        <div className={` ${open ? ' openAccordion' : ''} up-accordion`}>
          <button className="w-full" onClick={() => setOpen(!open)}>
            <div className="accordion-button h-14 py-3.5 px-6 flex items-center">
              <CgList />
              <h3 className="grow text-left">
                {props.title || 'Accordions'} <span className="showExtenstion">Up</span>
              </h3>
              <div className={`arrow${open ? ' active' : ''} flex items-center mr-2 grow-0`}>
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
            </div>
          </button>
          <div className={`accordion-body${open ? ' active' : ''}`}>
            <div className="accordion-body-content py-3.5 px-6 overflow-y-auto">
              {props.children}
            </div>
          </div>
        </div>
      ) : (
        <div className={` ${open ? ' openAccordion' : ''} up-accordion ${props.stage === 2 ? ' thirdMobileAccordion' : ''} ${accordionOpen ? ' acccccord' : ''}`}>
          <button
            className="w-full"
            style={{ zIndex: '22222' }}
            onClick={() => setOpen(!open)}
          >
            <div
              style={{ zIndex: '2222299999999999' }}
              onClick={() => {
                dispatch({ type: 'ACCORDIONOPEN' });
              }}
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
      )}
    </>
  );
}

/* ------------------------
   NAV COMPONENT
------------------------ */
function Nav() {
  const [open, setOpen] = useState(false);
  const { allMaximize, dispatch, isMizedOpen, firstStage, secondStage, thirdStage } =
    useContext(IsopenContext);

  const handleFirst = () => {
    dispatch({ type: 'FIRSTSTAGE' });
  };
  const handleSecond = () => {
    dispatch({ type: 'SECONDSTAGE' });
  };
  const handleThird = () => {
    dispatch({ type: 'THIRDSTAGE' });
  };

  return (
    <nav id="mainNav">
      <h1 style={{ fontFamily: 'Inter', fontWeight: '500' }} className="logo">
        LOGO
      </h1>
      <div className="stages-container">
        <NavLink to="/" className="not-active">
          {' Stage 1 '}
        </NavLink>
        <NavLink style={{ margin: '0px 20px' }} to="/stage-two">
          {' Stage 2 '}
        </NavLink>
        <NavLink to="/stage-three">{' Stage 3 '}</NavLink>
      </div>
      <div className={`menuContainer ${!open ? 'menuOpened' : ''}`}>
        <div
          onClick={() => setOpen(!open)}
          className={`mainDrop ${open ? 'openedArr' : 'closedArr'} flex items-center mr-2 grow-0`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="img"
            width="34"
            height="34"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 24 24"
          >
            <path fill="#d9d9d9" d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z" />
          </svg>
        </div>
        <div className={`navMobile ${!open ? 'hidemenus' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'active' : 'not-active')}
            onClick={handleFirst}
          >
            {' Stage! 1 '}
          </NavLink>
          <NavLink
            to="/stage-two"
            className={({ isActive }) => (isActive ? 'active' : 'not-active')}
            onClick={handleSecond}
          >
            {' Stage 2 '}
          </NavLink>
          <NavLink
            to="/stage-three"
            className={({ isActive }) => (isActive ? 'active' : 'not-active')}
            onClick={handleThird}
          >
            {' Stage 3 '}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

/* ------------------------
   LEFT PANEL COMPONENT (STAGE TWO)
------------------------ */
function LeftPanel(props) {
  const { isLoadGlove, activeModel, activePallet, dispatch, allMaximize, isMizedOpen } =
    useContext(IsopenContext);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className={`${allMaximize ? 'hideLeft' : ''} ${
        isMizedOpen ? 'LeftContainerOpen' : 'leftContainers'
      }`}
      >
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
            <MiddleContainer stage={2} />
            {scroll ? <div className="gradientsStage2" /> : null}
          </div>
        )}
        <div className={isMizedOpen ? 'marginCenterNO' : 'marginCenterYES'}>
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
        </div>
        <div className="gradientsStage2Bottom" />
      </div>
    </div>
  );
}

/* ------------------------
   LEFT PANEL COMPONENT (STAGE THREE)
------------------------ */
function LeftPanelSt3(props) {
  const { allMaximize, activePallet } = useContext(IsopenContext);
  const { position, pallette } = useAppSelector((state) => state.buildReducer);
  const [windowWidth, setWindowWidth] = useState();
  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 900);
  }, []);
  const [state, setState] = useState({});
  const [model, setModel] = useState();
  const [names, setNames] = useState(null);

  const colors = colorMap[activePallet];

  useEffect(() => {
    const scenes = SceneBabylon.instance();
    setModel(scenes);
    const namePosition = configBuild.Position[position];
    setNames(playerPosition[namePosition].glove);
  }, [position]);

  const setOptions = (value, option) => {
    setState({
      ...state,
      [value]: option
    });
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

  const getTextZones = () => {
    if (!model) return null;

    const arr = model.currentGlove.textZones.map((item) => {
      const arrChar = item.split('');
      arrChar[0] = arrChar[0].toUpperCase();
      const idx = arrChar.length - 4;
      arrChar.splice(idx, 0, ' ');
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

  return (
    <div className={`${windowWidth ? 'stagethrees' : 'stagethreemobile'}`}>
      {((!allMaximize && !windowWidth) ||
        (allMaximize && !windowWidth) ||
        (!allMaximize && windowWidth)) && (
        <>
          {model ? getTextZones() : null}
          {!windowWidth && (
            <NavLink to={'/stage-two'}>
              <button
                className="w-full"
                style={{
                  position: 'absolute',
                  height: '56px',
                  bottom: '60px',
                  left: '40px',
                  backgroundColor: '#222222',
                  width: '180px'
                }}
              >
                <div
                  style={{ zIndex: '2222299999999999' }}
                  className="accordion-button h-14 py-3.5 px-6 flex items-center"
                >
                  <div className="arrow mr-2 grow-0">
                    <span style={{ fontSize: '26px', lineHeight: '16px' }}>&larr;</span>
                  </div>
                  <h3 className="mobileAccordion grow text-left">Back To Design</h3>
                </div>
              </button>
            </NavLink>
          )}
        </>
      )}
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
    navigate('/stage-three');
  };

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  return (
    <div>
      <div
        className={`${
          props.stage === 3 ? 'stagethreeacc flex-col justify-end' : ''
        } accordionAndCTA flex flex-col justify-end ${
          allMaximize ? 'minimizeMenu' : ''
        } ${isMizedOpen ? 'hideMixed' : ''}`}
      >
        {windowWidth && props.stage === 3 && <LeftPanel />}
        <UpAccordion stage={2}>
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
            {props.stage === 3 && windowWidth && !accordionOpen && !isMizedOpen && 'Call To Action'}
            {props.stage === 3 && windowWidth && !accordionOpen && isMizedOpen && 'Primary'}
            {props.stage === 3 && windowWidth && accordionOpen && 'Primary'}
            {props.stage === 2 && windowWidth && !accordionOpen && 'Call To Action'}
            {props.stage === 2 && windowWidth && accordionOpen && 'Call To Action'}
            {props.stage === 2 && !windowWidth && !accordionOpen && 'Call To Action'}
            {props.stage === 3 && !windowWidth && !accordionOpen && 'Call To Action'}
            {props.stage === 3 && !windowWidth && accordionOpen && 'Call To Action'}
            {props.stage === 3 && windowWidth && isMizedOpen && 'Primary'}
            {props.stage === 2 && !windowWidth && accordionOpen && 'Call To Action'}
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
  const { isMizedOpen, dispatch } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  const hideModal = () => {
    setShow(false);
  };

  useEffect(() => {
    if (props.stage === 'two') {
      setShow(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="main" className="main-container flex">
      <BuildModal stage="one" title="Build" show={show} handleClose={hideModal} />
      <div
        className={`${accordionOpen ? 'hideLeftPanel' : ''} ${
          props.stage === 'one' ? 'left-panel' : 'left-panel left-panel2'
        } px-5 overflow-y-auto`}
      >
        {props.leftPanel}
      </div>
      <main
        className={`${accordionOpen ? 'hideLeftPanel' : ''} ${
          modalOpen ? 'disableScroll' : ''
        } ${props.stage === 'two' || props.stage === 'three' ? 'centerSecond' : ''} ${
          props.stage === 'one' ? 'center-panel' : 'center-panel center-panel2'
        }`}
      >
        {props.children}
      </main>
      {((!isMizedOpen && !windowWidth) ||
        (!isMizedOpen && windowWidth) ||
        (isMizedOpen && !windowWidth)) && (
        <div
          className={`${
            props.stage === 'one' ? 'right-panel' : 'right-panel2'
          } px-5`}
        >
          {props.rightPanel}
        </div>
      )}
    </div>
  );
}

/* ------------------------
   STAGE FIRST COMPONENT
------------------------ */
function StageFirst() {
  const [show, setShow] = useState(false);
  const [showBuild, setShowBuild] = useState(false);
  const { dispatch } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  // Keep the window resize behavior as in the original
  window.onresize = function () {
    if (!windowWidth) {
      document.location.reload(true);
    }
  };

  const showModal = () => {
    setShow(true);
    dispatch({ type: 'MODALOPEN' });
  };

  const hideModal = () => {
    setShow(false);
    dispatch({ type: 'MODALOPEN' });
  };

  const showBuildModal = () => {
    setShowBuild(true);
    dispatch({ type: 'MODALOPEN' });
  };

  const hideBuildModal = () => {
    setShowBuild(false);
    dispatch({ type: 'MODALOPEN' });
  };

  return (
    <>
      <Nav />
      <MainContainer stage="one">
        <div>
          <Hero handleOpen={showBuildModal} />
          <section className="elements">
            <div className="elements-container">
              {[0, 1, 2, 3, 4, 5, 7, 8, 9].map((i) => (
                <Card handleOpen={showModal} handleOpenBuild={showBuildModal} key={i} />
              ))}
            </div>
            <div className="gradientsBottom"></div>
          </section>
        </div>
      </MainContainer>
      <Modal title="Title" show={show} handleClose={hideModal} />
      <BuildModal stage="one" title="Title" show={showBuild} handleClose={hideBuildModal} />
    </>
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
          rightPanel={(!allMaximize || !windowWidth) && <RightPanel stage={2} />}
        >
          {((!isMizedOpen && !windowWidth) ||
            (isMizedOpen && !windowWidth) ||
            (windowWidth && !isMizedOpen)) && <MiddleContainer stage="two" />}
        </MainContainer>
      ) : null}

      {allMaximize && windowWidth && <MiddleContainer />}
    </>
  );
}

/* ------------------------
   STAGE THIRD COMPONENT
------------------------ */
function StageThird() {
  const { accordionOpen, allMaximize } = useContext(IsopenContext);
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  useEffect(() => {
    const scene = SceneBabylon.instance();
    scene.canvas.style.opacity = 1;
    return () => {
      scene.canvas.style.opacity = 0;
    };
  }, []);

  // Keep the original resize behavior
  window.onresize = function () {
    document.location.reload(false);
  };

  return (
    <>
      <Nav />
      <MainContainer
        stage="three"
        leftPanel={!windowWidth && <LeftPanelSt3 stage="three" />}
        rightPanel={(!allMaximize || !windowWidth) && <RightPanel stage={3} />}
      >
        {!windowWidth && <MiddleContainer stage="three" />}
      </MainContainer>
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
  LeftPanelSt3,
  MainContainer,
  MiddleContainer,
  StageFirst,
  StageSecond,
  StageThird,
  OptionAccordion,
  UpAccordion,
};

