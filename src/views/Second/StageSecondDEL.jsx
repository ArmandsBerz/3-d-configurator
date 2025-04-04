// import './style.css';
// import { useContext, useEffect, useState } from 'react';
// import { Nav, LeftPanel, RightPanel, MainContainer, MiddleContainer } from '../components/nav/Nav';
// import { IsopenContext } from '../../context/isopenContext';

// import SceneBabylon from '../../containers/scene/SceneBabylon.ts';

// function StageSecond() {
//     const { isMizedOpen, activeModel, dispatch } = useContext(IsopenContext);
//     const { isLoadGlove } = useContext(IsopenContext);
//     const { allMaximize } = useContext(IsopenContext);
//     const handleClick = () => {
//         dispatch({ type: 'MIXEDOPENSHOW' });
//     };
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
//             {
//                 isLoadGlove ? <MainContainer
//                     stage={'two'}
//                     leftPanel={<LeftPanel stage={'two'} zones={zones}/>}
//                     rightPanel={(!allMaximize || !windowWidth) && <RightPanel stage={2} />}
//                 >
//                     {
//                         ((!isMizedOpen && !windowWidth) || (isMizedOpen && !windowWidth) || (windowWidth && !isMizedOpen))
//                             ? <MiddleContainer stage={'two'} /> : null
//                     }
//                 </MainContainer> : null
//             }

//             {(allMaximize && windowWidth) ? <MiddleContainer /> : null}
//         </>
//     );
// }
// export { StageSecond };
