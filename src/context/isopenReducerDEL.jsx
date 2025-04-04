// const IsopenReducer = (state, action) => {
//     // console.log('state, action ::', state, action);
//     switch (action.type) {
//     case 'MIXEDOPENSHOW': {
//         return {
//             ...state, isMizedOpen: !state.isMizedOpen,
//         };
//     }
//     case 'ALLMAXIMIZE': {
//         return {
//             ...state, allMaximize: !state.allMaximize,
//         };
//     }
//     case 'SINGLEOPENED': {
//         return {
//             ...state, singleOpened: !state.singleOpened,
//         };
//     }
//     case 'ARROWUP': {
//         return {
//             ...state, arrowUp: !state.arrowUp,
//         };
//     }
//     case 'COLORPRIMARY': {
//         return {
//             ...state, colorPrimary: '',
//         };
//     }
//     case 'ACCORDIONOPEN': {
//         return {
//             ...state, accordionOpen: !state.accordionOpen,
//         };
//     }
//     case 'FIRSTSTAGE': {
//         return {
//             ...state, firstStage: !state.firstStage,
//         };
//     }
//     case 'SECONDSTAGE': {
//         return {
//             ...state, secondStage: !state.secondStage,
//         };
//     }
//     case 'THIRDSTAGE': {
//         return {
//             ...state, thirdStage: !state.thirdStage,
//         };
//     }
//     case 'MODALOPEN': {
//         return {
//             ...state, modalOpen: !state.modalOpen,
//         };
//     }
//     case 'LOAD_GLOVE': {
//         return {
//             ...state, isLoadGlove: true,
//         };
//     }
//     case 'SET_ACTIVE_MODEL': {
//         return {
//             ...state, activeModel: action.id,
//         };
//     }
//     case 'SET_ACTIVE_PALLET': {
//         return {
//             ...state, activePallet: action.id,
//         };
//     }
//     default:
//         return state;
//     }
// };
// export { IsopenReducer };
