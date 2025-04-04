// import './OptionAccordion.scss';
// import './UpAccordion.scss';
// import { useContext, useState, useEffect } from 'react';
// import { IsopenContext } from '../../../context/isopenContext';
// import { MiddleContainer } from '../../components/nav/Nav';
// import { CgList } from 'react-icons/cg';

// const OptionAccordion = (props) => {
//     const [open, setOpen] = useState(false);
//     const [buildOpen, setBuildOpen] = useState(false);
//     const [isOpened, setIsOpened] = useState(false);
//     const { accordionOpen, isMizedOpen, dispatch } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();

//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     const handleClick = () => {
//         dispatch({ type: 'MIXEDOPENSHOW' });
//     };

//     const handleBuild = () => {
//         setBuildOpen(!buildOpen);
//         setOpen(!open);
//     };

//     const openButton = () => {
//         console.log('openButton');
//         setOpen(!open);
//         props.showBuildModal ? props.showBuildModal() : null;
//     };

//     return (
//         <>
//             {props.title === 'Mixed Options' ? (
//                 <div className={`option-accordion mixedoptions ${open ? ' openMixed' : ' '}`}>
//                     {windowWidth && <MiddleContainer stage={3} />}
//                     <button className="w-full" onClick={openButton}>
//                         <div
//                             onClick={!props.stage === 3 ? handleClick : null}
//                             className={` ${accordionOpen && 'hideMixedAcc'} accordion-header h-14 py-3.5 px-6 flex items-center`}
//                         >
//                             <div className={`arrow${open ? ' active' : ' '} flex items-center mr-2 grow-0`}>
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
//                             <h3 className="grow text-left">{props.title || 'Title'}</h3>
//                             <div className="font-normal grow-0 max-w-[10rem] text-ellipsis overflow-hidden whitespace-nowrap">
//                                 {props.selectedOption}
//                             </div>
//                         </div>
//                     </button>
//                     {(props.title === 'Mixed Options' && !windowWidth) && (
//                         <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content-mixed py-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {(props.title === 'Mixed Options' && windowWidth) && (
//                         <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content-mixed py-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             ) : (
//                 <div
//                     className={`option-accordion${open ? ' open' : ''} ${isMizedOpen && ' FirstClosed'} ${props.title === 'Build' ? 'accordionBuild' : ''}`}
//                 >
//                     <button
//                         style={{ marginBottom: '0px' }}
//                         className="w-full"
//                         onClick={props.title === 'Build' ? handleBuild : openButton}
//                     >
//                         {(isMizedOpen && windowWidth) && <MiddleContainer />}
//                         <div onClick={handleClick} className="accordion-header h-14 py-3.5 px-6 flex items-center">
//                             <div className={`arrow${open ? ' active' : ' '} flex items-center mr-2 grow-0`}>
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
//                             <h3 className="grow text-left">{props.title || 'Title'}</h3>
//                             <div className="font-normal grow-0 max-w-[10rem] text-ellipsis overflow-hidden whitespace-nowrap">
//                                 {props.selectedOption}
//                             </div>
//                         </div>
//                     </button>
//                     {props.title === 'Build' && (
//                         <div className={`accordion-body ${open ? ' active ' : (isOpened ? ' colorno ' : '')}`}>
//                             <div className="accordion-body-content py-3.5 px-4">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.title === 'Color Option1' && (
//                         <div className={`accordion-body ${open ? ' active' : (isOpened ? ' colorno' : '')}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.title === 'Color Option2' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.title === 'Title' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.title === '2 Options' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.type === 'TextInput' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.title === 'TextInput' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.title === 'Dual Color' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.type === 'colorOption' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {props.type === 'options' && (
//                         <div className={`accordion-body${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {(props.title === 'Mixed Options' && !windowWidth) && (
//                         <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                     {(props.title === 'Mixed Options' && windowWidth) && (
//                         <div className={`accordion-body mixedAcc ${open ? ' active' : ''}`}>
//                             <div className="accordion-body-content pt-3.5 px-6">
//                                 {props.children}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </>
//     );
// };

// function UpAccordion(props) {
//     const [open, setOpen] = useState(false);
//     const [stage, setStage] = useState('');
//     const { accordionOpen, dispatch } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();

//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     useEffect(() => {
//         setStage(props.stage);
//     }, [props.stage]);

//     return (
//         <>
//             {stage === 3 ? (
//                 <div className={` ${open ? ' openAccordion' : ''} up-accordion`}>
//                     <button className="w-full" onClick={() => setOpen(!open)}>
//                         <div className="accordion-button h-14 py-3.5 px-6 flex items-center">
//                             <CgList />
//                             <h3 className="grow text-left">
//                                 {props.title || 'Accordions'} <span className="showExtenstion">Up</span>
//                             </h3>
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
//                         </div>
//                     </button>
//                     <div className={`accordion-body${open ? ' active' : ''}`}>
//                         <div className="accordion-body-content py-3.5 px-6 overflow-y-auto">
//                             {props.children}
//                         </div>
//                     </div>
//                 </div>
//             ) : (
//                 <div className={` ${open ? ' openAccordion' : ''} up-accordion ${props.stage === 2 ? ' thirdMobileAccordion' : ''} ${accordionOpen ? ' acccccord' : ''}`}>
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
//                                 {props.title || 'Accordion'} <span className="showExtenstion">Up</span>
//                             </h3>
//                             <CgList color="gray" fontSize={'30px'} />
//                         </div>
//                     </button>
//                     <div className={`accordion-body${open ? ' active' : ''}`}>
//                         <div className="accordion-body-content py-3.5 px-6 overflow-y-auto">
//                             {props.children}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

// export { OptionAccordion, UpAccordion };
