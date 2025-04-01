// /* eslint-disable max-len */
// import { useState } from 'react';
// import './SelectImage.scss';
// import './SelectInput.scss';

// function SelectImage(props) {
//     const [selected, setSelected] = useState(0);

//     const handleSelection = (option) => {
//         console.log('option ::', option);
//         // setSelected(option);
//         props.onSelection(option);
//     };

//     // useEffect(() => {
//     //   if (selected === null && props.options.length > 0) {
//     //     handleSelection(props.options[0]);
//     //   }
//     // })

//     const isSelected = (index) => props.selected === index;

//     return (
//         <div className="select-image-container pb-2">
//             {props.subtitle ? (
//                 <h3 style={{ fontSize: '18px' }} className="subtitle mb-2">
//                     {props.subtitle}
//                 </h3>
//             ) : null}
//             <div className={`grid grid-cols-${props.options.length > 2 ? '3' : '2'} gap-3`}>
//                 {props.options.map((option, index) => (
//                     <button
//                         className={`option${isSelected(index) ? ' selected' : ''}`}
//                         style={{ backgroundImage: `url(${option.src})` }}
//                         key={`${option.value}${Math.random()}`}
//                         onClick={() => handleSelection(option)}
//                     >
//                         <div className="checked">
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 aria-hidden="true"
//                                 role="img"
//                                 width="14"
//                                 height="14"
//                                 preserveAspectRatio="xMidYMid meet"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     fill="black"
//                                     d="m8.818 19.779l-6.364-6.364l2.83-2.83l3.534 3.544l9.898-9.908l2.83 2.83L8.818 19.779Z"
//                                 />
//                             </svg>
//                         </div>
//                         {option.title}
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// }

// function SelectInput(props) {
//     // const [input, setInput] = useState(props.value ? props.value : '');

//     const handleInput = (value) => {
//         // setInput(value);
//         props.onSelection(value);
//     };

//     return (
//         <div className="select-input-container mb-4">
//             {props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null}
//             <div className="input-container">
//                 <input
//                     placeholder="Enter your text..."
//                     type="text"
//                     value={props.value ? props.value : ''}
//                     onChange={(e) => handleInput(e.target.value)}
//                     maxLength={props.maxLength ? props.maxLength : 10}
//                 />
//             </div>
//         </div>
//     );
// }

// export { SelectImage, SelectInput };
