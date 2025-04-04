// import React from 'react';
// import ReactDOM from 'react-dom/client';

// import './v2/index.css';
// import './v2/main.scss';
// import './v2/assets/fonts/Oswald-ExtraLight.ttf';
// import './v2/assets/fonts/Oswald-Light.ttf';
// import './v2/assets/fonts/Oswald-Medium.ttf';
// import './v2/assets/fonts/Oswald-Regular.ttf';
// import './v2/assets/fonts/Oswald-SemiBold.ttf';
// import './v2/assets/fonts/Oswald-Bold.ttf';
// import App from './v2/App';
// import { IsopenContextProvider } from './v2/context/isopenContext';

// import SelectGroup from './selectGroup';

// import SceneBabylon, { colorOptions } from '../../../containers/scene/SceneBabylon';


// class UI extends React.Component {
//     isLoaded = false;

//     componentDidMount() {
//         this.isLoaded = true;
//         this.props.onLoaded();
//     }

//     renderGlove() {
//         return (
//             <div>
//                 <div>{this.props.glove.id}</div>

//                 {
//                     this.renderGloveObject(this.props.glove.id, this.props.glove.gloveObject)
//                 }
//             </div>
//         );
//     }

//     renderGloveObject(gloveId, gloveObject) {
//         return (
//             <div>
//                 <div>{gloveObject.id}</div>
//                 {
//                     this.renderSection(gloveId, 'zones', gloveObject)
//                 }
//             </div>
//         );
//     }

//     renderSection(gloveId, section, gloveObject) {
//         const gloveZones = gloveObject.zones.zones;

//         return (
//             <div>
//                 <div>{section}</div>
//                 <br />

//                 {
//                     gloveZones.map((element) => <SelectGroup
//                         gloveId={gloveId}
//                         itemId={gloveObject.id}
//                         section={section}
//                         messenger={this.props.messenger}
//                         key={element}
//                         subtitle={element}
//                         dataId={element}
//                         options={colorOptions}
//                     />)
//                 }
//             </div>
//         );
//     }

//     render() {
//         return this.renderGlove();
//     }
// }

// export default function initUI(app) {
//     const promise = new Promise((resolve) => {
//         const root = ReactDOM.createRoot(document.getElementById('ui-container'));

//         root.render(
//             <React.StrictMode>
//                 <IsopenContextProvider>
//                     <App />
//                 </IsopenContextProvider>
//             </React.StrictMode>,
//         );

//         // root.render(<UI glove={app.glove} messenger={app.messenger} onLoaded={resolve} />);
//     });

//     return promise;
// }
