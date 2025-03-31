// import React, { useEffect, useState } from 'react';
// import { CgArrowRight } from 'react-icons/cg';

// import { OptionAccordion } from '../../../context/isopenContext';
// import { ColorCircle } from '../ui/ColorCircle';
// import SelectColor from '../ui/SelectColor';
// import SceneBabylon, { colorMap } from '../../../containers/scene/SceneBabylon';

// const ColorOption = ({
//     title, windowWidth, both, setOptions, handleButton, colors,
// }) => {
//     const [state, setState] = useState(false);
//     const [color, setColor] = useState(!both ? colors.white : both);

//     const getColors = () => {
//         const arr = Object.values(colors).map((item) => ({ value: item }));

//         return arr;
//     };

//     return (
//         <OptionAccordion
//             type={'colorOption'}
//             title={title}
//             selectedOption={<ColorCircle color={!both ? color : both} />}
//         >
//             <SelectColor
//                 colors={getColors()}
//                 selected={color}
//                 onSelection={(option) => setOptions(title, option)}
//             />
//             <div
//                 className="buttonLine"
//                 style={{
//                     width: '100vw',
//                     marginLeft: '-28px',
//                     height: '10px',
//                     backgroundColor: '#161616',
//                 }}
//             ></div>
//             <div className="buttonAndIcon">
//                 <button className="inlineButton" onClick={handleButton}>
//                     <div>Secondary</div>
//                     <div className="iconButtSecondary">
//                         <CgArrowRight />
//                     </div>
//                 </button>
//                 {windowWidth && (
//                     <button
//                         className="inlineButton primaryButton"
//                         // onClick={handleButton}
//                     >
//                         <div>Primary</div>
//                         <div className="iconButt">
//                             <CgArrowRight />
//                         </div>
//                     </button>
//                 )}
//             </div>
//         </OptionAccordion>
//     );
// };

// export { ColorOption };
