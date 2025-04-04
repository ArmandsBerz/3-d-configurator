// import { useContext, useEffect, useState } from 'react';
// import { IsopenContext } from '../../../context/isopenContext';
// import './MainContainer.scss';
// import BuildModal from '../modal/BuildModal';

// function MainContainer(props) {
//     const { modalOpen, accordionOpen } = useContext(IsopenContext);
//     const { isMizedOpen, dispatch } = useContext(IsopenContext);
//     const [windowWidth, setWindowWidth] = useState();
//     const [show, setShow] = useState(false);
//     useEffect(() => {
//         setWindowWidth(window.innerWidth && window.innerWidth <= 600);
//     }, []);

//     const hideModal = () => {
//         setShow(false);
//     };

//     useEffect(() => {
//         // eslint-disable-next-line no-unused-expressions
//         props.stage === 'two' ? setShow(true) : null;
//     }, []);
//     return (
//         <div id='main' className="main-container flex">
//             <BuildModal
//                 stage="one"
//                 title="Build"
//                 show={show}
//                 // show={true}
//                 handleClose={hideModal}
//             />
//             <div
//                 className={`${
//                     accordionOpen ? 'hideLeftPanel ' : ''
//                 } ${props.stage === 'one' ? 'left-panel' : 'left-panel left-panel2 '}   px-5 overflow-y-auto`}
//             >
//                 {props.leftPanel}
//             </div>
//             <main
//                 className={`${accordionOpen ? 'hideLeftPanel ' : ''} ${modalOpen ? ' disableScroll ' : ''} ${
//                     props.stage === 'two' || props.stage === 'three'
//                         ? ' centerSecond'
//                         : ''
//                 } ${props.stage === 'one' ? 'center-panel ' : ' center-panel center-panel2 '}`}
//             >
//                 {props.children}
//             </main>
//             {((!isMizedOpen && !windowWidth)
//         || (!isMizedOpen && windowWidth)
//         || (isMizedOpen && !windowWidth)) && (
//                 <div className={`${props.stage === 'one' ? ' right-panel ' : ' right-panel2 '}  px-5`}>{props.rightPanel}</div>
//             )}

//         </div>
//     );
// }


// export { MainContainer };
