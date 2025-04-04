// import React from 'react';

// import { OptionAccordion } from '../../../context/isopenContext'; 
// import Select from '../ui/Select';

// const NameOptions = ({
//     title, windowWidth, defState, names, onSelection, selected,
// }) => {
//     const arr = names.map((item, id) => ({ id, text: item, value: item }));

//     return <OptionAccordion
//         title={title}
//         type={'options'}
//         selectedOption={defState.activeGlove && defState.activeGlove.text}
//     >
//         <Select
//             full
//             options={arr}
//             selected={selected}
//             onSelection={ async (option) => onSelection(option)}
//         />
//         {windowWidth && (
//             <div
//                 className="buttonLine"
//                 style={{
//                     width: '120%',
//                     marginLeft: '-28px',
//                     height: '10px',
//                     backgroundColor: '#161616',
//                 }}
//             ></div>
//         )}
//     </OptionAccordion>;
// };

// export { NameOptions };
