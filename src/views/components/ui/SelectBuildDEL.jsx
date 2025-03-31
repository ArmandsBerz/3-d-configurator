// import './SelectBuild.scss';
// import { useEffect, useState } from 'react';

// function SelectBuild(props) {
//     const [selected, setSelected] = useState(null);

//     const [windowWidth, setWindowWidth] = useState();
//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     useEffect(() => {
//         setSelected(props.selected);
//     }, [props.selected]);

//     const handleSelection = (option) => {
//         setSelected(option);
//         if (props.onSelection) props.onSelection(option);
//         // console.log('[build] select', option);
//     };

//     const isSelected = (index) => props.selected === index;

//     const getStyles = () => {
//         let style;
//         switch (props.options.length) {
//         case 2:
//             style = { flex: '1', width: '100%' };
//             break;
//         case 3:
//             style = { flex: '1', width: '100%' };
//             break;
//         case 4:
//             style = {
//                 flex: '1', width: '100%',
//             };
//             break;
//         case 5:
//             style = {
//                 flex: '1', width: '100%', flexWrap: props.stage === 'two' ? 'wrap' : null,
//             };
//             break;

//         default:
//             break;
//         }

//         return style;
//     };

//     return (
//         <div className="select-build-container pb-4">
//             { props.subtitle ? <h3 style={{ color: 'white', fontSize: '18px' }} className="subtitle mb-2">{props.subtitle}</h3> : null }
//             <div className="modalSelect-build" style={{ flexWrap: props.stage === 'two' ? 'wrap' : null }}>
//                 { props.options.map((option, index) => (
//                     <div
//                         className="select-block"
//                         key={option.value}
//                         style={{
//                             flexGrow: 1, flexShrink: 1, flexBasis: 'auto',
//                         }}
//                         ref={(element) => {
//                             if (element && props.full) element.style.setProperty('width', '100%', 'important');
//                         }}
//                     >
//                         <button
//                             style={{ flex: '1', width: '100%' }}
//                             className={`option${isSelected(index) ? ' selected' : ''}  px-4 py-2`}
//                             key={option.value}
//                             onClick={() => handleSelection(option)}
//                         >
//                             {option.text}
//                         </button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// export { SelectBuild };
