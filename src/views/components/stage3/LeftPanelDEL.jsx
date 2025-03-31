// import { useContext, useEffect, useState } from 'react';

// import { Link, NavLink } from 'react-router-dom';
// import { OptionAccordion } from '../../components/ui/OptionAccordion';
// import Select from '../../components/ui/Select';
// import SelectInput from '../../components/ui/SelectInput';
// import SelectColor from '../../components/ui/SelectColor';
// import ColorCircle from '../../components/ui/ColorCircle';
// import { IsopenContext } from '../../../context/isopenContext';
// import SceneBabylon, { fonts, colorMap, additionalColors } from '../../../containers/scene/SceneBabylon.ts';
// import { playerPosition, configBuild } from '../../../helpers/config';
// import { useAppSelector } from '../../../../src/store/rootReducer';
// import TextOptions from '../customizer/TextOptions.tsx';

// function LeftPanelSt3(props) {
//     const { allMaximize, activePallet } = useContext(IsopenContext);
//     const { position, pallette } = useAppSelector((state) => state.buildReducer);

//     const [windowWidth, setWindowWidth] = useState();
//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 900);
//     }, []);
//     const [state, setState] = useState({});
//     const [model, setModel] = useState();
//     const [names, setNames] = useState(null);

//     const colors = colorMap[activePallet];

//     useEffect(() => {
//         const scenes = SceneBabylon.instance();
//         setModel(scenes);
//         // setNames(scenes.glovesDesign);
//         const namePosition = configBuild.Position[position];
//         setNames(playerPosition[namePosition].glove);
//     }, []);

//     const setOptions = (value, option) => {
//         const newState = {
//             ...state,
//             [value]: option,
//         };
//         setState(newState);
//     };

//     const getColors = () => {
//         const arr = Object.values(colors).map((item) => ({ value: item }));

//         return arr;
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
//     return (
//         <div className={`${windowWidth ? 'stagethrees' : 'stagethreemobile'}`} >
//             {
//                 ((!allMaximize && !windowWidth) || (allMaximize && !windowWidth) || (!allMaximize && windowWidth)) && <>
//                     { 
                        
//                     }

//                     {
//                         model ? getTextZones() : null
//                     }

//                     {!windowWidth
//                         && <NavLink to={'/stage-two'}>

//                             <button
//                                 className="w-full"
//                                 style={{
//                                     position: 'absolute', height: '56px', bottom: '60px', left: '40px', backgroundColor: '#222222', width: '180px',
//                                 }}
//                             >
//                                 <div style={{ zIndex: '2222299999999999' }} className="accordion-button h-14 py-3.5 px-6 flex items-center">
//                                     <div className={'arrow mr-2 grow-0'}>
//                                         <span style={{ fontSize: '26px', lineHeight: '16px' }}>&larr;</span>
//                                     </div>
//                                     <h3 className="mobileAccordion grow text-left">Back To Design</h3>
//                                     {/* <p className="grow-0">{props.selectedOption || "Option"}</p> */}
//                                 </div>
//                             </button>
//                         </NavLink>
//                     }
//                 </>
//             }
//         </div>
//     );
// }

// export { LeftPanelSt3 };
