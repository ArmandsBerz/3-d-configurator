// /* eslint-disable no-await-in-loop */
// /* eslint-disable array-callback-return */
// import { useLayoutEffect, useState, useContext, useEffect } from 'react';
// import { CgArrowRight } from 'react-icons/cg';
// import { OptionAccordion, UpAccordion } from '../../components/ui/OptionAccordion';
// import Select from '../../components/ui/Select';
// import SelectInput from '../../components/ui/SelectInput';
// import SelectColor from '../../components/ui/SelectColor';
// import SelectColor2 from '../../components/ui/SelectColor2';
// import SelectImage from '../../components/ui/SelectImage';
// import ColorCircle from '../../components/ui/ColorCircle';
// import Modal from '../modal/Modal';
// import BuildModal from '../modal/BuildModal';
// import ColorOption from '../customizer/ColorOption.tsx';
// import NameOptions from '../customizer/NameOptions.tsx';
// import TextOptions from '../customizer/TextOptions.tsx';
// import WebOption from '../customizer/WebOption.tsx';

// import { IsopenContext } from '../../../context/isopenContext';
// import ColorCircle2 from '../ui/ColorCircle2';
// import SceneBabylon, { fonts, colorMap, additionalColors, Messenger, ZONES_WEB } from '../../../containers/scene/SceneBabylon.ts';
// import { playerPosition, configBuild } from '../../../helpers/config';
// import { useAppSelector } from '../../../../src/store/rootReducer';

// import MiddleContainer from '../ui/MiddleContainer';

// import { NavLink, useNavigate } from 'react-router-dom';

// function LeftPanel(props) {
//     const {
//         isLoadGlove, activeModel, activePallet, dispatch,
//     } = useContext(IsopenContext);
//     const { allMaximize, isMizedOpen } = useContext(IsopenContext);

//     const { position, pallette } = useAppSelector((state) => state.buildReducer);

//     const [state, setState] = useState({});
//     const [showBuild, setShowBuild] = useState(false);
//     const [scroll, setScroll] = useState();
//     const [positionName, setPositionName] = useState(configBuild.Position[0]);

//     const [model, setModel] = useState();
//     const [names, setNames] = useState(null);
//     const [messenger, setMessenger] = useState();

//     const [web, setWeb] = useState();

//     const colors = colorMap[pallette];
//     const [both, setBoth] = useState(
//         state.colorOption ? state.colorOption.value : colors.white,
//     );

//     const [both2, setBoth2] = useState(
//         state.colorOption2 ? state.colorOption2.value : '#222222',
//     );
//     const [windowWidth, setWindowWidth] = useState();
//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);

//         const scenes = SceneBabylon.instance();
//         setModel(scenes);
//         const namePosition = configBuild.Position[position];
//         setNames(playerPosition[namePosition].glove);

//         const mes = Messenger.instance();
//         setMessenger(mes);
//     }, []);

//     useEffect(() => {
//         const namePosition = configBuild.Position[position];
//         setPositionName(namePosition);
//         setNames(playerPosition[namePosition].glove);
//     }, [position]);

//     useEffect(() => {
//         if (names) {
//             setActiveModel();
//         }
//     }, [names]);

//     useEffect(() => {
//         const obj = {};
//         if (props?.zones?.length > 0) {
//             const val = model.currentGlove.websGlove[0];
//             const value = val.split('').slice(0, val.length - 2).join('');
//             model.setActiveWeb(value);
//             obj.webs = {
//                 id: 0,
//                 text: value,
//                 value,
//             };

//             props.zones.forEach((item) => {
//                 obj[item] = { value: colors.white };
//                 model.currentGlove.dataChangedCallback({
//                     key: item,
//                     value: colors.white,
//                 });
//             });

//             model.currentGlove.textZones.forEach((item) => {
//                 obj[item] = {
//                     color: colors.white,
//                     text: '',
//                     font: fonts[0],
//                 };
//             });
//             setState(obj);
//         }
//     }, [props.zones]);

//     useEffect(() => {
//         console.log('activeModel ', activeModel);
//         if (activeModel) {
//             setState({});
//             model.currentGlove.resetStyleText();
//             model.currentGlove.textZones.forEach((item) => {
//                 model.currentGlove.updateText(item);
//             });
//         }
//     }, [activeModel]);

//     useEffect(() => {
//         const elem = document.querySelector('.leftContainers');
//         elem.addEventListener('scroll', () => {
//             setScroll(elem.scrollTop);
//         });

//         const elemPanel = document.querySelector('.left-panel2');
//         elemPanel.addEventListener('scroll', () => {
//             setScroll(elemPanel.scrollTop);
//         });
//     }, []);

//     useEffect(() => {
//         setBoth(state.colorOption && state.colorOption.value);
//         setBoth2(state.colorOption2 && state.colorOption2.value);
//     }, [state.colorOption, state.colorOption2]);

//     useEffect(() => {
//         if (state.webs) {
//             updWebs();
//         }
//     }, [state.webs]);

//     useEffect(() => {
//         console.log('[state]', state);
//     }, [state]);

//     const setActiveModel = async () => {
//         const namePosition = configBuild.Position[position];
//         const name = playerPosition[namePosition].glove[0];
//         const id = model.gloves.findIndex((item) => item === name);
//         await model.setActiveGlove(id);
//         dispatch({ type: 'SET_ACTIVE_MODEL', id });
//         // setOptions('webs', null);
//     };

//     const updWebs = async () => {
//         for (let i = 0; i < ZONES_WEB.length; i++) {
//             const item = ZONES_WEB[i];
//             console.log('item ::', item, ZONES_WEB);
//             const val = state[item].value ? state[item].value : colors.white;
//             await model.currentGlove.dataChangedCallback({
//                 key: item,
//                 value: val,
//             });
//         }
//     };

//     const showBuildModal = () => {
//         setShowBuild(true);
//         dispatch({ type: 'SINGLEOPENED' });
//     };

//     window.onresize = function (event) {
//         document.location.reload(false);
//     };

//     const hideBuildModal = () => {
//         setShowBuild(false);
//     };

//     const setOptions = (value, option) => {
//         console.log('setOptions ::', value, option);
//         if (props.zones.includes(value)) {
//             model.currentGlove.dataChangedCallback({
//                 key: value,
//                 value: option.value,
//             });
//         }

//         const newState = {
//             ...state,
//             [value]: option,
//         };
//         setState(newState);
//     };

//     const setOptionsText = (id, option) => {
//         console.log('setOptionsText ::', id, option);
//         model.currentGlove.changeTextStyle(Object.keys(option)[0], Object.values(option)[0]);

//         const name = model.currentGlove.textZones[id];

//         model.currentGlove.updateText(name);

//         const newState = {
//             ...state,
//             [name]: {
//                 ...state[name],
//                 ...option,
//             },
//         };
//         setState(newState);
//     };

//     const handlebutton = () => {
//         if (
//             (state.colorOption && state.colorOption.value)
//         !== (state.colorOption2 && state.colorOption2.value)
//         || (state.colorOption && state.colorOption.value)
//         ) {
//             setBoth(state.colorOption2 && state.colorOption2.value);
//             setBoth2(state.colorOption2 && state.colorOption2.value);
//         }
//     };

//     const handleButton2 = () => {
//         if ((state.colorOption && state.colorOption.value)
//                 !== (state.colorOption2 && state.colorOption2.value)
//                 || (state.colorOption2 && state.colorOption2.value)) {
//             setBoth(state.colorOption && state.colorOption.value);
//             setBoth2(state.colorOption && state.colorOption.value);
//         }
//     };

//     const getColors = (name) => {
//         const objColors = { ...colors };

//         Object.entries(additionalColors).forEach(([key, value]) => {
//             if (value.zones.includes(name)) objColors[key] = value.value;
//         });

//         return objColors;
//     };

//     const getZones = () => props.zones.map((item, index) => {
//         const arrColor = getColors(item);
//         if (item !== 'web') {
//             return <ColorOption
//                 key={index}
//                 colors={arrColor}
//                 title={item}
//                 windowWidth={windowWidth}
//                 both={state[item] ? state[item].value : both}
//                 setOptions={setOptions}
//                 handleButton={handleButton2}
//             />;
//         }
//     });

//     const getGloveNames = () => <NameOptions
//         title={'Gloves'}
//         windowWidth={windowWidth}
//         defState={state}
//         names={names}
//         onSelection={async (option) => {
//             const id = model.gloves.findIndex((item) => item === option.value);
//             await model.setActiveGlove(id);
//             dispatch({ type: 'SET_ACTIVE_MODEL', id });
//             setOptions('activeGlove', option);
//             setOptions('webs', null);
//         }}
//     />;

//     const getTextZones = () => {
//         const arr = model.currentGlove.textZones.map((item) => {
//             const arrChar = item.split('');
//             arrChar[0] = arrChar[0].toUpperCase();
//             const id = arrChar.length - 4;
//             arrChar.splice(id, 0, ' ');
//             const newName = arrChar.join('');
//             return newName;
//         });

//         return arr.map((item, index) => <TextOptions
//             title={item}
//             id={index}
//             key={index}
//             colors={colors}
//             windowWidth={windowWidth}
//             defState={state[model.currentGlove.textZones[index]]}
//             names={fonts}
//             selected={{ value: state[model.currentGlove.textZones[index]]?.font }}
//             setOptions={setOptionsText}
//             setOptionsInput={(option) => {
//                 model.currentGlove.updateText(option, model.currentGlove.textZones[index]);
//             }}
//         />);
//     };

//     const getWebsNames = () => {
//         const arr = model.currentGlove.websGlove.map((item) => item.split('').slice(0, item.length - 2).join(''));
//         const arrPlayerWeb = playerPosition[positionName].web;
//         const arrWeb = arrPlayerWeb.filter((item) => arr.includes(item));
//         return <WebOption
//             title={'Webs'}
//             windowWidth={windowWidth}
//             defState={state}
//             colors={colors}
//             webs={arrWeb}
//             selected={state.webs}
//             setOptionsColor={setOptions}
//             onSelection={async (option) => {
//                 const value = `${option.value}`;
//                 model.setActiveWeb(value);
//                 setOptions('webs', option);
//             }}
//         />;
//     };

//     return (
//         <div>
//             <div
//                 className={`${allMaximize ? 'hideLeft' : ''} ${
//                     isMizedOpen ? ' LeftContainerOpen ' : 'leftContainers'
//                 }`}
//             >
//                 {!isMizedOpen && windowWidth && (
//                     <div
//                         className='controls'
//                         style={{
//                             position: 'sticky',
//                             top: 0,
//                             zIndex: '11111111111',
//                             marginBottom: '2rem !important',
//                         }}
//                     >
//                         <MiddleContainer stage={2} />
//                         {scroll ? <div className="gradientsStage2" /> : null}
//                     </div>
//                 )}
//                 <div
//                     className={`${isMizedOpen ? 'marginCenterNO' : 'marginCenterYES'}`}
//                 >

//                     <OptionAccordion
//                         stage="two"
//                         showBuildModal={showBuildModal}
//                         showBuild={showBuild}
//                         title="Build"
//                         selectedOption={state.imageOption && state.imageOption.value}
//                     >
//                         <BuildModal
//                             title="Option With Image"
//                             stage="two"
//                             show={showBuild}
//                             handleClose={hideBuildModal}
//                         />
//                     </OptionAccordion>
//                     {scroll ? <div className="gradientsStage2" /> : null}
//                     {names ? getGloveNames() : null}
//                     {model ? getWebsNames() : null}
//                     {/* {model ? getTextZones() : null} */}
//                     {isLoadGlove ? getZones() : null}
//                 </div>
//                 <div className="gradientsStage2Bottom" />
//             </div>
//         </div>
//     );
// }

// function RightPanel(props) {
//     const { isMizedOpen, dispatch, accordionOpen } = useContext(IsopenContext);
//     const { allMaximize } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();
//     const navigate = useNavigate();
//     const routeChange = () => {
//         const path = '/stage-three';
//         navigate(path);
//     };
//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     return (
//         <>
//             <div>
//                 <div
//                     className={`${
//                         props.stage === 3 ? 'stagethreeacc flex-col justify-end' : ''
//                     } accordionAndCTA flex flex-col justify-end ${
//                         allMaximize ? ' minimizeMenu' : ''
//                     } ${isMizedOpen ? ' hideMixed' : ''}`}
//                 >
//                     {(windowWidth && props.stage === 3) && <LeftPanel />}
//                     <UpAccordion stage={2}>
//                         <div className="mb-2">Glove Foundation</div>
//                         <div className="overScroll">
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                             <div className="flex justify-between">
//                                 <div>Option</div>
//                                 <div>Value</div>
//                             </div>
//                         </div>
//                     </UpAccordion>
//                     <button onClick={routeChange} className="cta rightButtonCTA">
//                         <p>
//                             {props.stage === 3 && windowWidth && !accordionOpen && !isMizedOpen && 'Call To Action'}
//                             {props.stage === 3 && windowWidth && !accordionOpen && isMizedOpen && 'Primary'}
//                             {props.stage === 3 && windowWidth && accordionOpen && 'Primary'}
//                             {props.stage === 2 && windowWidth && !accordionOpen && 'Call To Action'}
//                             {props.stage === 2 && windowWidth && accordionOpen && 'Call To Action'}
//                             {props.stage === 2 && !windowWidth && !accordionOpen && 'Call To Action'}
//                             {props.stage === 3 && !windowWidth && !accordionOpen && 'Call To Action'}
//                             {props.stage === 3 && !windowWidth && accordionOpen && 'Call To Action'}
//                             {props.stage === 3 && windowWidth && isMizedOpen && 'Primary'}
//                             {props.stage === 2 && !windowWidth && accordionOpen && 'Call To Action'}
//                         </p>
//                         <span>&rarr;</span>
//                     </button>
//                 </div>
//             </div>
//         </>
//     );
// }

// export { LeftPanel, RightPanel };
