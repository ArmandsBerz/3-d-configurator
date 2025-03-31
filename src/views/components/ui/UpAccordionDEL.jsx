// import './UpAccordion.scss';
// import { useContext, useState, useEffect } from 'react';

// import { CgList } from 'react-icons/cg';
// import { IsopenContext } from '../../../context/isopenContext';

// function UpAccordion(props) {
//     const [open, setOpen] = useState(false);
//     const [stage, setStage] = useState('');
//     const { accordionOpen, dispatch } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();
//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     useEffect(() => {
//         setStage(props.stage && props.stage);
//     }, [props.stage]);

//     return (
//         <>

//             {stage === 3
//                 ? (<div className={` ${open ? ' openAccordion' : ''} up-accordion`}>
//                     <button

//                         className="w-full"
//                         onClick={() => setOpen(!open)}
//                     >
//                         <div className="accordion-button h-14 py-3.5 px-6 flex items-center">
//                             <CgList/><h3 className="grow text-left">{props.title || 'Accordions'} <span className="showExtenstion">Up</span></h3>
//                             <div className={`arrow${open ? ' active' : ''} flex items-center mr-2 grow-0`}>
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     aria-hidden="true"
//                                     role="img"
//                                     width="14"
//                                     height="14"
//                                     preserveAspectRatio="xMidYMid meet"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <path
//                                         fill="white"
//                                         d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                                     />
//                                 </svg>
//                             </div>
//                             {/* <p className="grow-0">{props.selectedOption || "Option"}</p> */}
//                         </div>
//                     </button>
//                     <div className={`accordion-body${open ? ' active' : ''}`}>
//                         <div

//                             className="accordion-body-content py-3.5 px-6 overflow-y-auto">
//                             {props.children}
//                         </div>
//                     </div>
//                 </div>) : (<div
//                     // eslint-disable-next-line max-len
//                     className={` ${open ? ' openAccordion' : ''} up-accordion  ${props.stage === 2 ? ' thirdMobileAccordion' : ''} ${accordionOpen ? ' acccccord' : ''}`}
//                 >
//                     <button
//                         className="w-full"
//                         style={{ zIndex: '22222' }}
//                         onClick={() => setOpen(!open)}
//                     >
//                         <div
//                             style={{ zIndex: '2222299999999999' }}
//                             onClick={() => { dispatch({ type: 'ACCORDIONOPEN' }); }}
//                             className="accordion-button h-14 py-3.5 px-6 flex items-center"
//                         >
//                             <div className={`arrow${open ? ' active' : ''} flex items-center mr-2 grow-0 uparrows`}>
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     aria-hidden="true"
//                                     role="img"
//                                     width="14"
//                                     height="14"
//                                     preserveAspectRatio="xMidYMid meet"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <path
//                                         fill="white"
//                                         d="M8.465 20.485L16.95 12L8.465 3.515L7.05 4.929L14.122 12L7.05 19.071l1.415 1.414Z"
//                                     />
//                                 </svg>
//                             </div>
//                             <h3 className="mobileAccordion grow text-left">
//                                 { props.title || 'Accordion' }
//                                 <span className="showExtenstion">Up</span>
//                             </h3>
//                             <CgList color="gray" fontSize={'30px'}/>
//                         </div>
//                     </button>
//                     <div className={`accordion-body${open ? ' active' : ''} `}>
//                         <div className="accordion-body-content py-3.5 px-6 overflow-y-auto">
//                             { props.children }
//                         </div>
//                     </div>
//                 </div>) }
//         </>
//     );
// }

// export { UpAccordion };

