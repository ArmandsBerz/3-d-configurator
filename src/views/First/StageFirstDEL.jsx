// import { useContext, useEffect, useState } from 'react';
// import { Nav, MainContainer, LeftPanel, RightPanel, MiddleContainer, LeftPanelSt3 } from '../components/nav/Nav';
// import Card from '../components/stage1/Card';
// import Hero from '../components/stage1/Hero';
// import Modal from '../components/modal/Modal';
// import BuildModal from '../components/modal/BuildModal';
// import { NavLink } from 'react-router-dom';
// import { IsopenContext } from '../../context/isopenContext';
// import SceneBabylon from '../../containers/scene/SceneBabylon.ts';
// import './style.css';
// import './style.scss';

// // StageFirst Component
// function StageFirst() {
//     const [show, setShow] = useState(false);
//     const [showBuild, setShowBuild] = useState(false);
//     const { dispatch } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();
    
//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);
    
//     // Keep the window resize behavior as in the original file.
//     window.onresize = function (event) {
//         !windowWidth && document.location.reload(true);
//     };

//     const showModal = () => {
//         setShow(true);
//         dispatch({ type: 'MODALOPEN' });
//     };

//     const hideModal = () => {
//         setShow(false);
//         dispatch({ type: 'MODALOPEN' });
//     };

//     const showBuildModal = () => {
//         setShowBuild(true);
//         dispatch({ type: 'MODALOPEN' });
//     };

//     const hideBuildModal = () => {
//         setShowBuild(false);
//         dispatch({ type: 'MODALOPEN' });
//     };

//     return (
//         <>
//             <Nav />
//             <MainContainer stage="one">
//                 <div>
//                     <Hero handleOpen={showBuildModal} />
//                     <section className="elements">
//                         <div className="elements-container">
//                             {[0, 1, 2, 3, 4, 5, 7, 8, 9].map((i) => (
//                                 <Card
//                                     handleOpen={showModal}
//                                     handleOpenBuild={showBuildModal}
//                                     key={i}
//                                 />
//                             ))}
//                         </div>
//                         <div className="gradientsBottom"></div>
//                     </section>
//                 </div>
//             </MainContainer>
//             <Modal title="Title" show={show} handleClose={hideModal} />
//             <BuildModal stage="one" title="Title" show={showBuild} handleClose={hideBuildModal} />
//         </>
//     );
// }

// // StageSecond Component
// function StageSecond() {
//     // Combine all context properties in one call.
//     const { isMizedOpen, activeModel, dispatch, isLoadGlove, allMaximize } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();
//     const [zones, setZones] = useState([]);

//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     useEffect(() => {
//         if (isLoadGlove) {
//             const scenes = SceneBabylon.instance();
//             setZones(scenes.currentGlove.gloveZones.zones);
//         }
//     }, [activeModel]);

//     useEffect(() => {
//         if (isLoadGlove) {
//             const scenes = SceneBabylon.instance();
//             setZones(scenes.currentGlove.gloveZones.zones);
//         }
//     }, [isLoadGlove]);

//     useEffect(() => {
//         const scene = SceneBabylon.instance(() => dispatch({ type: 'LOAD_GLOVE' }));
//         scene.canvas.style.opacity = 1;
//         return () => {
//             scene.canvas.style.opacity = 0;
//         };
//     }, []);

//     return (
//         <>
//             <Nav />
//             {isLoadGlove ? (
//                 <MainContainer
//                     stage="two"
//                     leftPanel={<LeftPanel stage="two" zones={zones} />}
//                     rightPanel={(!allMaximize || !windowWidth) && <RightPanel stage={2} />}
//                 >
//                     {((!isMizedOpen && !windowWidth) ||
//                       (isMizedOpen && !windowWidth) ||
//                       (windowWidth && !isMizedOpen)) ? (
//                         <MiddleContainer stage="two" />
//                     ) : null}
//                 </MainContainer>
//             ) : null}

//             {(allMaximize && windowWidth) ? <MiddleContainer /> : null}
//         </>
//     );
// }

// // StageThird Component
// function StageThird() {
//     const { accordionOpen, allMaximize } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();

//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     useEffect(() => {
//         const scene = SceneBabylon.instance();
//         scene.canvas.style.opacity = 1;
//         return () => {
//             scene.canvas.style.opacity = 0;
//         };
//     }, []);

//     // Use the window resize behavior as in the original StageThird.
//     window.onresize = function (event) {
//         document.location.reload(false);
//     };

//     return (
//         <>
//             <Nav />
//             <MainContainer
//                 stage="three"
//                 leftPanel={!windowWidth && <LeftPanelSt3 stage="three" />}
//                 rightPanel={(!allMaximize || !windowWidth) && <RightPanel stage={3} />}
//             >
//                 {!windowWidth && <MiddleContainer stage="three" />}
//             </MainContainer>
//             {(allMaximize && windowWidth) && <MiddleContainer />}
//         </>
//     );
// }

// export { StageFirst, StageSecond, StageThird };
