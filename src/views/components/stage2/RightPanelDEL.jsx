// // import { useState } from "react";

// import { useContext, useEffect, useState } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { IsopenContext } from '../../../context/isopenContext';
// import { UpAccordion } from '../../components/ui/OptionAccordion';
// import LeftPanel from '../stage3/LeftPanel';
// import MiddleContainer from '../ui/MiddleContainer';

// function RightPanel(props) {
//     const { isMizedOpen, dispatch } = useContext(IsopenContext);
//     const { allMaximize } = useContext(IsopenContext);
//     const { accordionOpen } = useContext(IsopenContext);
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
//             {
//                 <div>

//                     <div
//                         className={`${
//                             props.stage === 3 ? 'stagethreeacc flex-col justify-end' : ''
//                         } accordionAndCTA flex  flex-col  justify-end ${
//                             allMaximize ? ' minimizeMenu' : ''
//                         } ${isMizedOpen ? ' hideMixed' : ''}`}
//                     >
//                         { (windowWidth && props.stage === 3) && <LeftPanel/>}
//                         <UpAccordion stage={2}>

//                             {/* <div>Accordion Up</div> */}

//                             <div className="mb-2">Glove Foundation</div>
//                             <div className="overScroll">
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                                 <div className="flex justify-between">
//                                     <div>Option</div>
//                                     <div>Value</div>
//                                 </div>
//                             </div>
//                         </UpAccordion>

//                         <button onClick={routeChange} className="cta rightButtonCTA">
//                             <p>
//                                 {props.stage === 3
//                   && windowWidth
//                   && !accordionOpen && !isMizedOpen
//                   && 'Call To Action'}
//                                 {props.stage === 3
//                   && windowWidth && !accordionOpen && isMizedOpen
//                   && 'Primary'}
//                                 {props.stage === 3 && windowWidth && accordionOpen && 'Primary'}
//                                 {props.stage === 2 && windowWidth && !accordionOpen && 'Call To Action'}
//                                 {props.stage === 2 && windowWidth && accordionOpen && 'Call To Action'}
//                                 {props.stage === 2 && !windowWidth && !accordionOpen && 'Call To Action'}
//                                 {props.stage === 3 && !windowWidth && !accordionOpen && 'Call To Action'}
//                                 {props.stage === 3 && !windowWidth && accordionOpen && 'Call To Action'}
//                                 {props.stage === 3 && windowWidth && isMizedOpen && 'Primary'}
//                                 {props.stage === 2 && !windowWidth && accordionOpen && 'Call To Action'}
//                             </p>
//                             <span>&rarr;</span>
//                         </button>

//                     </div>
//                 </div>
//             }
//         </>
//     );
// }

// export { RightPanel };
