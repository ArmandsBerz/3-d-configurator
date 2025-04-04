// import { useContext, useEffect, useState } from "react";
// import { IsopenContext } from "../../../context/isopenContext";
// import BuildModal from "../../components/modal/BuildModal";
// import ColorCircle from "../../components/ui/ColorCircle";
// import ColorCircle2 from "../../components/ui/ColorCircle2";
// import { OptionAccordion } from '../../components/ui/OptionAccordion';
// import Select from "../../components/ui/Select";
// import SelectColor from "../../components/ui/SelectColor";
// import SelectColor2 from "../../components/ui/SelectColor2";
// import SelectInput from "../../components/ui/SelectInput";


// function LeftPanelM(props) {
//   const { singleOpened ,dispatch} = useContext(IsopenContext);
//   const [state, setState] = useState({});
//   const [show, setShow] = useState(false);
//   const [showBuild, setShowBuild] = useState(false);
//   const [both, setBoth] = useState(
//     state.colorOption && state.colorOption.value
//   );
//   const [windowWidth, setWindowWidth] = useState();
//   useEffect(() => {
//     setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//   }, []);
//   const [both2, setBoth2] = useState(
//     state.colorOption2 && state.colorOption2.value
//   );
//   const { allMaximize, arrowUp } =  useContext(IsopenContext);
//   const {accordionOpen } = useContext(IsopenContext);

//   console.log(singleOpened);
//   const showModal = () => {
//     setShow(true);
//   };

//   const hideModal = () => {
//     setShow(false);
//   };

//   const showBuildModal = () => {
//     setShowBuild(true);
//     dispatch({ type: 'SINGLEOPENED' })
    
//   };

//   const hideBuildModal = () => {
//     setShowBuild(false);
//     // dispatch({ type: 'ARROWUP' });
//   };
  

//   const setOptions = (value, option) => {
//     const newState = {
//       ...state,
//       [value]: option,
//     };
//     setState(newState);
//   };

//   useEffect(() => {
//     setBoth(state.colorOption && state.colorOption.value);
//     setBoth2(state.colorOption2 && state.colorOption2.value);
//     console.log(state.colorOption2 && state.colorOption2.value);
//     console.log(state.colorOption && state.colorOption.value);
//   }, [state.colorOption, state.colorOption2]);

//   const handlebutton = () => {
//     if (
//       (state.colorOption && state.colorOption.value) !==
//         (state.colorOption2 && state.colorOption2.value) ||
//       (state.colorOption && state.colorOption.value)
//     ) {
//       console.log('hi');
//       console.log(state.colorOption2 && state.colorOption2.value);
//       console.log(state.colorOption && state.colorOption.value);
//       setBoth(state.colorOption2 && state.colorOption2.value);
//       setBoth2(state.colorOption2 && state.colorOption2.value);
//     }
//     // setOptions('colorOption', option)
//     // console.log(state.colorOption2.value );
//   };
//   const handlebutton2 = () => {
//     if (
//       (state.colorOption && state.colorOption.value) !==
//         (state.colorOption2 && state.colorOption2.value) ||
//       (state.colorOption2 && state.colorOption2.value)
//     ) {
//       setBoth(state.colorOption && state.colorOption.value);
//       setBoth2(state.colorOption && state.colorOption.value);
//     }
//     // setOptions('colorOption', option)
//     // console.log(state.colorOption2.value );
//   };
  
//   return (
//     <div >
//       <div className="gradients"></div>
//       <OptionAccordion
//         stage="two"
//         showBuildModal={showBuildModal}
//         showBuild={showBuild}
//         title="Build"
//         selectedOption={state.imageOption && state.imageOption.value}
//       >
//         <BuildModal
//           title="Build Modal Me"
//           stage="two"
//           show={showBuild}
//           handleClose={hideBuildModal}
//         />

//         {/* <SelectImage
//           options={[
//             {
//               title: "Option Title",
//               text: "Option Text",
//               value: "option-value-1",
//               src: "https://via.placeholder.com/150",
//             },
//             {
//               title: "Option Title",
//               text: "Option Text",
//               value: "option-value-2",
//               src: "https://via.placeholder.com/150",
//             },
//             {
//               title: "Option Title",
//               text: "Option Text",
//               value: "option-value-3",
//               src: "https://via.placeholder.com/150",
//             },
//             {
//               title: "Option Title",
//               text: "Option Text",
//               value: "option-value-4",
//               src: "https://via.placeholder.com/150",
//             },
//           ]}
//         /> */}
//       </OptionAccordion>
//       <OptionAccordion  title="TextInput" selectedOption={state.textOption}>
//         <SelectInput
//           onSelection={(option) => setOptions('textOption', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <button className="inlineButton" 
//         // onClick={handlebutton}
//         >
//             <div>Primary</div> 
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button>
//       </OptionAccordion>
//       <OptionAccordion
      
//         title="Color Option1"
//         selectedOption={<ColorCircle color={both} />}
//       >
//         <SelectColor
//           colors={[
//             { value: '#E5E7E8' },
//             { value: '#A9131B' },
//             { value: '#BD5C2B' },
//             { value: '#6DB0A2' },
//             { value: '#CDB17D' },
//             { value: '#D9A62B' },
//             { value: '#0C164D' },
//             { value: '#1C3F30' },
//             { value: '#8C4C2C' },
//             { value: '#301D29' },
//             { value: '#BD782D' },
//             { value: '#706E64' },
//             { value: '#4B8EA7' },
//             { value: '#AC2D6B' },
//             { value: '#23282F' },
//             { value: '#0B0D10' },

//             { value: '#B98A42' },
//             { value: '#421518' },
//             { value: '#39221B' },
//             { value: '#6E9132' },
//             { value: '#602D28' },
//             { value: '#0A4175' },
//           ]}
//           onSelection={(option) => setOptions('colorOption', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <div className="buttonAndIcon">
//           <button className="inlineButton" onClick={handlebutton2}>
//             <div>Secondary</div>
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button>
//           {windowWidth &&<button className="inlineButton primaryButton" 
//           // onClick={handlebutton}
//           >
//            <div>Primary</div>
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="black"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button>}
//         </div>
//       </OptionAccordion>
//       <OptionAccordion
//         title="Color Option2"
//         selectedOption={<ColorCircle2 color={both2} />}
//       >
//         <SelectColor2
//           colors={[
//             { value: '#E5E7E8' },
//             { value: '#A9131B' },
//             { value: '#BD5C2B' },
//             { value: '#6DB0A2' },
//             { value: '#CDB17D' },
//             { value: '#D9A62B' },
//             { value: '#0C164D' },
//             { value: '#1C3F30' },
//             { value: '#8C4C2C' },
//             { value: '#301D29' },
//             { value: '#BD782D' },
//             { value: '#706E64' },
//             { value: '#4B8EA7' },
//             { value: '#AC2D6B' },
//             { value: '#23282F' },
//             { value: '#0B0D10' },

//             { value: '#B98A42' },
//             { value: '#421518' },
//             { value: '#39221B' },
//             { value: '#6E9132' },
//             { value: '#602D28' },
//             { value: '#0A4175' },
//           ]}
//           onSelection={(option) => setOptions('colorOption2', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <div className="buttonAndIcon">
//           <button className="inlineButton" onClick={handlebutton}>
//             <div>Secondary</div>
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button>
//           {windowWidth && <button className="inlineButton primaryButton" 
//           // onClick={handlebutton}
//           >
//             <div>Primary</div>
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="black"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button>}
//         </div>{' '}
//       </OptionAccordion>

//       <OptionAccordion
//         title="Dual Color"
//         selectedOption={
//           <div className="flex">
//             <ColorCircle
//               color={state.dualColorOption1 && state.dualColorOption1.value}
//             />
//             <ColorCircle
//               color={state.dualColorOption2 && state.dualColorOption2.value}
//             />
//           </div>
//         }
//       >
//         <SelectColor
//           subtitle="Primary Color"
//           colors={[
//             { value: '#E5E7E8' },
//             { value: '#A9131B' },
//             { value: '#BD5C2B' },
//             { value: '#6DB0A2' },
//             { value: '#CDB17D' },
//             { value: '#D9A62B' },
//             { value: '#0C164D' },
//             { value: '#1C3F30' },
//             { value: '#8C4C2C' },
//             { value: '#301D29' },
//             { value: '#BD782D' },
//             { value: '#706E64' },
//             { value: '#4B8EA7' },
//             { value: '#AC2D6B' },
//             { value: '#23282F' },
//             { value: '#0B0D10' },

//             { value: '#B98A42' },
//             { value: '#421518' },
//             { value: '#39221B' },
//             { value: '#6E9132' },
//             { value: '#602D28' },
//             { value: '#0A4175' },
//           ]}
//           onSelection={(option) => setOptions('dualColorOption1', option)}
//         />
//         <SelectColor
//           subtitle="Secondary Color"
//           colors={[
//             { value: '#E5E7E8' },
//             { value: '#A9131B' },
//             { value: '#BD5C2B' },
//             { value: '#6DB0A2' },
//             { value: '#CDB17D' },
//             { value: '#D9A62B' },
//             { value: '#0C164D' },
//             { value: '#1C3F30' },
//             { value: '#8C4C2C' },
//             { value: '#301D29' },
//             { value: '#BD782D' },
//             { value: '#706E64' },
//             { value: '#4B8EA7' },
//             { value: '#AC2D6B' },
//             { value: '#23282F' },
//             { value: '#0B0D10' },

//             { value: '#B98A42' },
//             { value: '#421518' },
//             { value: '#39221B' },
//             { value: '#6E9132' },
//             { value: '#602D28' },
//             { value: '#0A4175' },
//           ]}
//           onSelection={(option) => setOptions('dualColorOption2', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <button className="inlineButton" onClick={handlebutton}>
//             <div>Secondary</div> 
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button>
//       </OptionAccordion>
//       <OptionAccordion
//         title="2 Options"
//         selectedOption={state.firstOption && state.firstOption.text}
//       >
//         <Select
//           options={[
//             {
//               text: 'Option1',
//               value: 1,
//             },
//             {
//               text: 'Option2',
//               value: 2,
//             },
//           ]}
//           onSelection={async (option) => setOptions('firstOption', option)}
      
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//       <button className="inlineButton" 
//       // onClick={handlebutton}
//       >
//             <div>Primary</div> 
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button>  
//       </OptionAccordion>
//       <OptionAccordion
//       title="Title"
//         selectedOption={state.secondOption && state.secondOption.text}
//       >
//         <Select
//           options={[
//             {
//               text: 'Option 1',
//               value: 1,
//             },
//             {
//               text: 'Option 2',
//               value: 2,
//             },
//             {
//               text: 'Option 3',
//               value: 3,
//             },
//           ]}
//           onSelection={(option) => setOptions('secondOption', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <button className="inlineButton" 
//         // onClick={handlebutton}
//         >
//             <div>Primary</div> 
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button> 
//       </OptionAccordion>
//       <OptionAccordion
//       title="Title"
//         selectedOption={state.thirdOption && state.thirdOption.text}
//       >
//         <Select
//           options={[
//             {
//               text: 'Option 4',
//               value: 1,
//             },
//             {
//               text: 'Option 5',
//               value: 2,
//             },
//             {
//               text: 'Option 6',
//               value: 3,
//             },
//             {
//               text: 'Option 7',
//               value: 4,
//             },
//           ]}
//           onSelection={(option) => setOptions('thirdOption', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <button className="inlineButton" 
//         // onClick={handlebutton}
//         >

//             <div>Secondary</div> 
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button> 
//       </OptionAccordion>
//       <OptionAccordion
//         title="Title"
//         selectedOption={state.fourthOption && state.fourthOption.text}
//       >
//         <Select
//           subtitle="Subtitle"
//           options={[
//             {
//               text: 'Option A',
//               value: 1,
//             },
//             {
//               text: 'Option B',
//               value: 2,
//             },
//           ]}
//           onSelection={(option) => setOptions('fourthOption', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <button className="inlineButton" 
//         // onClick={handlebutton}
//         >
//             <div>Primary</div> 
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button> 
//       </OptionAccordion>
//       <OptionAccordion
//       title="Title"
//         selectedOption={`${state.fifthOption ? state.fifthOption.text : ''} ${
//           state.sixthOption ? state.sixthOption.text : ''
//         }`}
//       >
//         <Select
//           subtitle="Subtitle"
//           options={[
//             {
//               text: 'Option 1',
//               value: 1,
//             },
//             {
//               text: 'Option 2',
//               value: 2,
//             },
//           ]}
//           onSelection={(option) => setOptions('fifthOption', option)}
//         />
//         <Select
//           subtitle="Subtitle"
//           options={[
//             {
//               text: 'Option 3',
//               value: 1,
//             },
//             {
//               text: 'Option 4',
//               value: 2,
//             },
//           ]}
//           onSelection={(option) => setOptions('sixthOption', option)}
//         />
//         <div
//           className="buttonLine"
//           style={{
//             width: '400px',
//             left: '-25px',
//             height: '10px',
//             position: 'relative',
//             backgroundColor: 'black',
//           }}
//         ></div>
//         <button className="inlineButton" 
//         // onClick={handlebutton}
//         >
//             <div>Primary</div> 
//             <div className="iconButt">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//                 role="img"
//                 width="14"
//                 height="14"
//                 preserveAspectRatio="xMidYMid meet"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   fill="white"
//                   d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                 />
//               </svg>
//             </div>
//           </button> 
//       </OptionAccordion>
//       <div style={{ height: '1.2rem' }}></div>
//       <div className="gradients"></div>
//     </div>
//   );
// }

// export default LeftPanelM;
