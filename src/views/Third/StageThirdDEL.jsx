// import './style.css';
// import { NavLink } from 'react-router-dom';
// import { useContext, useEffect, useState } from 'react';
// import { Nav, MainContainer, MiddleContainer } from '../components/nav/Nav';
// import { RightPanel, LeftPanelSt3 } from '../components/nav/Nav';
// import { IsopenContext } from '../../context/isopenContext';

// import SceneBabylon from '../../containers/scene/SceneBabylon.ts';

// function StageThird() {
//     const { accordionOpen } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();
//     const { allMaximize } = useContext(IsopenContext);
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

//     const stage = 3;
//     window.onresize = function (event) {
//         document.location.reload(false);
//     };

//     return (
//         <>
//             <Nav />
//             <MainContainer
//                 stage={'three'}
//                 leftPanel={ !windowWidth && < LeftPanelSt3 stage={'three'} />}
//                 rightPanel={(!allMaximize || !windowWidth) && <RightPanel stage={3} />}
//             >
//                 {!windowWidth && <MiddleContainer stage={'three'} />}
//             </MainContainer>
//             {(allMaximize && windowWidth) && <MiddleContainer/>}
//         </>
//     );
// }
// export { StageThird };
