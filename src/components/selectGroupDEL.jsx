// import React, { useEffect, useState } from 'react';
// import _ from 'lodash';
// import '../../../components/ui/SelectBuild.scss';

// class SelectGroup extends React.Component {
//     constructor(props) {
//         super(props);
//         // this.handleChange = this.handleChange.bind(this);
//         this.state = {
//             selectedId: null,
//         };

//         const { messenger } = this.props;

//         messenger.onDataChanged.add((data) => {
//             if (this.isThisDataMine(data)) {
//                 // console.log(`data: ${data.key} ${data.value} ${this.optionValues()}`);

//                 if (this.optionValues().includes(data.value)) {
//                     this.selectButton(data.value, false);
//                 } else {
//                     // NOT SUPPORTED VALUE
//                     this.selectFirstButton();
//                 }
//             }
//         });

//         messenger.onLoaded.add((data) => {
//             if (!messenger.hasData(this.props.gloveId, this.props.itemId, this.props.section, this.props.dataId)) {
//                 this.selectFirstButton();
//             }
//         });
//     }

//     isThisDataMine(data) {
//         return data.gloveId === this.props.gloveId &&
//                data.itemId === this.props.itemId &&
//                data.section === this.props.section &&
//                this.props.dataId === data.key;
//     }

//     buttonSelected = (selectedId) => (ev) => {
//         this.selectButton(selectedId, true);
//     };

//     selectButton(selectedId, updateData) {
//         // console.log(`selectButton: ${selectedId}`);
//         this.setState({ selectedId });
//         if (updateData) {
//             this.props.messenger.updateData(this.props.gloveId, this.props.itemId, this.props.section, this.props.dataId, selectedId);
//         }
//     }

//     selectFirstButton() {
//         this.selectButton(this.props.options[0].value, true);
//     }

//     optionValues() {
//         return _.map(this.props.options, 'value');
//     }

//     render() {
//         return (
//             <div>
//                 <div>{this.props.subtitle}</div>
//                 {this.props.options.map((data) => (
//                     <button 
//                         className={data.value === this.state.selectedId ? 'selected' : ''} 
//                         type="button" 
//                         style={{ width: '25%', border: 'none' }} 
//                         key={data.value} 
//                         onClick={this.buttonSelected(data.value)}>
//                         {data.text}
//                     </button>
//                 ))}
//             </div>
//         );
//     }
// }

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
//             case 2:
//                 style = { flex: '1', width: '100%' };
//                 break;
//             case 3:
//                 style = { flex: '1', width: '100%' };
//                 break;
//             case 4:
//                 style = { flex: '1', width: '100%' };
//                 break;
//             case 5:
//                 style = { 
//                     flex: '1', 
//                     width: '100%', 
//                     flexWrap: props.stage === 'two' ? 'wrap' : null 
//                 };
//                 break;
//             default:
//                 break;
//         }
//         return style;
//     };

//     return (
//         <div className="select-build-container pb-4">
//             {props.subtitle ? (
//                 <h3 style={{ color: 'white', fontSize: '18px' }} className="subtitle mb-2">
//                     {props.subtitle}
//                 </h3>
//             ) : null}
//             <div className="modalSelect-build" style={{ flexWrap: props.stage === 'two' ? 'wrap' : null }}>
//                 {props.options.map((option, index) => (
//                     <div
//                         className="select-block"
//                         key={option.value}
//                         style={{
//                             flexGrow: 1,
//                             flexShrink: 1,
//                             flexBasis: 'auto',
//                         }}
//                         ref={(element) => {
//                             if (element && props.full) {
//                                 element.style.setProperty('width', '100%', 'important');
//                             }
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

// export { SelectGroup, SelectBuild };
