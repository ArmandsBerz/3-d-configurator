import React, { useState, useRef, useLayoutEffect } from 'react';

// --- Helper Components ---
const ImageOptionCard = ({ id, title, description, price, icon, isSelected, onSelect }) => (
<button className={`p-3 rounded-md cursor-pointer flex flex-col justify-between text-left ${isSelected ? 'bg-[#3a3a3a] ring-2 ring-blue-500' : 'bg-[#2a2a2a] hover:bg-[#333333]'}`} onClick={onSelect}>
<div>
<div className="flex items-center justify-between mb-1">
<div className="flex items-center text-xs text-gray-400">
{icon || <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A1.007 1.007 0 012 10V5a1 1 0 011-1h5a1 1 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>}
<span>{price}</span>
</div>
{isSelected && (<svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>)}
</div>
<h4 className="text-base font-semibold text-white mb-1">{title}</h4>
<p className="text-xs text-gray-400 leading-tight">{description}</p>
</div>
</button>
);

const ChoiceButton = ({ label }) => (<button className="bg-[#2a2a2a] hover:bg-[#333333] text-white text-sm py-2 px-3 rounded-md h-[36px] flex items-center justify-center">{label}</button>);

// --- Panel Components ---

const ColorPickerPanel = ({ editingColorContext, handleCloseColorPicker, selectedColorInPicker, setSelectedColorInPicker, colorSwatches }) => {
if (!editingColorContext) return null;
return (
<div className="bg-[#161616] h-full flex flex-col px-[23px]">
<button className="flex items-center justify-between text-white py-3 h-[56px] border-b border-gray-700 mb-3 w-full text-left" onClick={handleCloseColorPicker}>
<div className="flex items-center">
<svg className="w-5 h-5 mr-2 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
<span className="text-lg">{editingColorContext.title || 'Color Picker'}</span>
</div>
<span className="text-sm text-gray-400">{selectedColorInPicker || editingColorContext.currentColor}</span>
</button>
<div className="grid grid-cols-6 gap-[10px] overflow-y-auto flex-grow pb-4">
{colorSwatches.map((color) => ( <button key={color} className={`w-[42px] h-[42px] rounded-full border-2 ${selectedColorInPicker === color ? 'border-transparent ring-4 ring-white' : 'border-transparent'}`} style={{ backgroundColor: color }} onClick={() => setSelectedColorInPicker(color)} aria-label={`Select color ${color}`}/>))}
</div>
</div>
);
};

const BuildPanel = ({ editingBuildContext, handleCloseBuildPanel, selectedImageOption, setSelectedImageOption }) => {
if (!editingBuildContext) return null;
return (
<div className="bg-[#161616] h-full flex flex-col">
<button className="flex items-center text-white py-3 px-4 h-[56px] border-b border-gray-700 w-full text-left" onClick={handleCloseBuildPanel}>
<svg className="w-5 h-5 mr-2 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
<span className="text-lg">{editingBuildContext.title || 'Build Options'}</span>
</button>
<div className="flex-grow overflow-y-auto px-4 pt-3 pb-4 space-y-5">
<div><h3 className="text-sm text-gray-400 mb-2">Option With Image</h3><div className="grid grid-cols-2 gap-3"><ImageOptionCard id="imgOpt1" title="Option Title 1" description="Lorem ipsum dolor sit amet, consectetur" price="$000 - $000" isSelected={selectedImageOption === 'imgOpt1'} onSelect={() => setSelectedImageOption('imgOpt1')}/><ImageOptionCard id="imgOpt2" title="Option Title 2" description="Lorem ipsum dolor sit amet, consectetur" price="$000 - $000" isSelected={selectedImageOption === 'imgOpt2'} onSelect={() => setSelectedImageOption('imgOpt2')}/></div></div>
<div><h3 className="text-sm text-gray-400 mb-2">Option with 2 Choices</h3><div className="grid grid-cols-2 gap-3"><ChoiceButton label="OPTION"/><ChoiceButton label="OPTION"/></div></div>
<div><h3 className="text-sm text-gray-400 mb-2">Option with 3 Choices</h3><div className="grid grid-cols-3 gap-3"><ChoiceButton label="OPTION"/><ChoiceButton label="OPTION"/><ChoiceButton label="OPTION"/></div></div>
<div><h3 className="text-sm text-gray-400 mb-2">Option with 4 Choices</h3><div className="grid grid-cols-2 gap-3"><ChoiceButton label="OPTION"/><ChoiceButton label="OPTION"/><ChoiceButton label="OPTION"/><ChoiceButton label="OPTION"/></div></div>
<div><h3 className="text-sm text-gray-400 mb-2">Option with 5 Choices</h3><div className="flex flex-wrap gap-3">{[...Array(5)].map((_, i) => <ChoiceButton key={i} label="OPTION"/>)}</div></div>
</div>
</div>
);
};

const TextPanel = ({ editingTextContext, panelState, setPanelState, handleClose, colorSwatches }) => {
if (!editingTextContext) return null;
const handleTextChange = (e) => setPanelState(prev => ({ ...prev, text: e.target.value }));
const handleFontChange = (font) => setPanelState(prev => ({ ...prev, font }));
const handleColorChange = (color) => setPanelState(prev => ({ ...prev, color }));

return (
<div className="bg-[#161616] h-full flex flex-col">
{/* --- MODIFICATION IS HERE --- */}
<button className="flex items-center justify-between text-white py-3 px-4 h-[56px] border-b border-gray-700 w-full text-left" onClick={handleClose}>
<div className="flex items-center">
<svg className="w-5 h-5 mr-2 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
<span className="text-lg">{editingTextContext.title}</span>
</div>
{/* The round swatch was replaced by this text span for consistency with the ColorPickerPanel */}
<span className="text-sm text-gray-400">{panelState.color}</span>
</button>
{/* --- END MODIFICATION --- */}
<div className="flex-grow overflow-y-auto px-4 pt-4 pb-4 space-y-5">
<div>
<h3 className="text-sm font-semibold text-gray-400 mb-2">Text</h3>
<input type="text" className="w-full p-3 bg-[#2A2A2A] text-white rounded-md placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={panelState.text} onChange={handleTextChange} placeholder="ENTER YOUR TEXT..."/>
</div>
<div>
<h3 className="text-sm font-semibold text-gray-400 mb-2">Font</h3>
<div className="grid grid-cols-2 gap-3">
<button onClick={() => handleFontChange('SCRIPT')} className={`py-3 rounded-md text-base font-bold ${panelState.font === 'SCRIPT' ? 'bg-white text-black' : 'bg-[#2a2a2a] hover:bg-[#333333] text-white'}`}>SCRIPT</button>
<button onClick={() => handleFontChange('BLOCK')} className={`py-3 rounded-md text-base font-bold ${panelState.font === 'BLOCK' ? 'bg-white text-black' : 'bg-[#2a2a2a] hover:bg-[#333333] text-white'}`}>BLOCK</button>
</div>
</div>
<div>
<h3 className="text-sm font-semibold text-gray-400 mb-2">Color</h3>
<div className="grid grid-cols-7 gap-[10px]">
{colorSwatches.map((color) => ( <button key={color} className={`w-[42px] h-[42px] rounded-full border-2 ${panelState.color === color ? 'border-transparent ring-4 ring-white' : 'border-transparent'}`} style={{ backgroundColor: color }} onClick={() => handleColorChange(color)} aria-label={`Select color ${color}`}/>))}
</div>
</div>
</div>
</div>
);
};


// --- Main UI Component ---
const UI = () => {
const [isSummaryPanelVisible, setIsSummaryPanelVisible] = useState(false);
const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
const [activeView, setActiveView] = useState('configuratorList');
const [configuration, setConfiguration] = useState({
build: 'imgOpt1',
thumb: '#C62828',
index: '#1565C0',
middle: '#2E7D32',
ring: '#F9A825',
pinky: '#6A1B9A',
thumbName: {
text: 'Thumb',
font: 'SCRIPT',
color: '#BDBDBD'
},
pinkyName: {
text: 'Pinky',
font: 'BLOCK',
color: '#FFFFFF'
},
});

const [editingColorContext, setEditingColorContext] = useState(null);
const [selectedColorInPicker, setSelectedColorInPicker] = useState('');
const [editingBuildContext, setEditingBuildContext] = useState(null);
const [selectedImageOption, setSelectedImageOption] = useState('');

const [editingTextContext, setEditingTextContext] = useState(null);
const [textPanelState, setTextPanelState] = useState(null);

// --- UPDATE: Refs for scrollIntoView method ---
const listContainerRef = useRef(null);
const lastInteractedItemIdRef = useRef(null);

const colorSwatches = [
'#C62828', '#AD1457', '#6A1B9A', '#4527A0', '#283593', '#1565C0',
'#0277BD', '#00838F', '#00695C', '#2E7D32', '#558B2F', '#9E9D24',
'#F9A825', '#FF8F00', '#EF6C00', '#D84315', '#4E342E', '#424242',
'#BDBDBD', '#37474F',
];

// --- UPDATE: Effect to restore scroll position ---
useLayoutEffect(() => {
    // Only scroll if the list is the active view and the visualization is not expanded
    if (activeView === 'configuratorList' && !isVisualizationExpanded && lastInteractedItemIdRef.current && listContainerRef.current) {
        const element = listContainerRef.current.querySelector(`[data-id="${lastInteractedItemIdRef.current}"]`);
        if (element) {
            element.scrollIntoView({ block: 'center' });
        }
        // We no longer clear the ref here, so it's "remembered"
    }
}, [activeView, isVisualizationExpanded]); // Dependency array now includes isVisualizationExpanded


// --- Handlers for Color Picker ---
const handleOpenColorPicker = (optionId, optionTitle) => {
lastInteractedItemIdRef.current = optionId; // --- UPDATE: Save the ID of the clicked item
setEditingColorContext({ id: optionId, title: optionTitle, currentColor: configuration[optionId] });
setSelectedColorInPicker(configuration[optionId]);
setActiveView('colorPickerPanel');
};
const handleCloseColorPicker = () => setActiveView('configuratorList');
const handlePaintSectionAndReturn = () => {
if (editingColorContext) {
setConfiguration(prev => ({ ...prev, [editingColorContext.id]: selectedColorInPicker }));
handleCloseColorPicker();
}
};

// --- Handlers for Build Panel ---
const handleOpenBuildPanel = (optionId, optionTitle) => {
lastInteractedItemIdRef.current = optionId; // --- UPDATE: Save the ID of the clicked item
setEditingBuildContext({ id: optionId, title: optionTitle });
setSelectedImageOption(configuration[optionId]);
setActiveView('buildPanel');
};
const handleCloseBuildPanel = () => setActiveView('configuratorList');
const handleBuildCallToAction = () => {
if (editingBuildContext) {
setConfiguration(prev => ({ ...prev, [editingBuildContext.id]: selectedImageOption }));
}
handleCloseBuildPanel();
};
// --- Handlers for Text Panel ---
const handleOpenTextPanel = (optionId, optionTitle) => {
lastInteractedItemIdRef.current = optionId; // --- UPDATE: Save the ID of the clicked item
setEditingTextContext({ id: optionId, title: optionTitle });
setTextPanelState(configuration[optionId]);
setActiveView('textPanel');
};
const handleCloseTextPanel = () => setActiveView('configuratorList');
const handleTextPanelConfirm = () => {
if (editingTextContext) {
setConfiguration(prev => ({ ...prev, [editingTextContext.id]: textPanelState }));
}
handleCloseTextPanel();
};


const GOLDEN_RATIO_CONSTANT = 1.618;
const VIZ_PROPORTION = 1 / GOLDEN_RATIO_CONSTANT;
const CONTROLS_PROPORTION = 1 - VIZ_PROPORTION;

return (
<div className="flex flex-col h-[100dvh] bg-[#161616] text-white">
<main className={`p-4 flex flex-col items-center justify-center relative bg-[#161616] overflow-auto ${ isVisualizationExpanded ? 'flex-grow h-full' : '' }`} style={!isVisualizationExpanded ? { flexBasis: `${VIZ_PROPORTION * 100}%` } : {}}>
<div className="absolute top-[20px] left-[20px] w-[70px] h-[49px] bg-gray-300 bg-opacity-75 rounded z-10 flex items-center justify-center"><p className="font-bold text-xl text-gray-900">LOGO</p></div>
{/* --- ADDITION IS HERE --- */}
<button className="absolute top-[20px] right-[20px] z-10 p-2 rounded-md hover:bg-gray-800 hover:bg-opacity-50" aria-label="Share configuration">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[31px] h-[31px] text-[#2997FF]"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
</button>
{/* --- END ADDITION --- */}
<img src={`${process.env.PUBLIC_URL}/gloves.png`} alt="Glove Visualization" className="object-contain max-w-full max-h-full z-10" />
<div className="absolute bottom-4 inset-x-0 flex items-center justify-between text-xs z-10">
<button className="p-1 hover:bg-gray-800 hover:bg-opacity-50 rounded-md cursor-pointer ml-[14px]" onClick={() => setIsVisualizationExpanded(!isVisualizationExpanded)} aria-label={isVisualizationExpanded ? "Collapse visualization" : "Expand visualization"}>
{isVisualizationExpanded ? ( <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M17.3176 3.39899C16.9681 3.39899 16.633 3.53795 16.3856 3.78514C16.1386 4.03232 15.9997 4.3675 15.9997 4.71725V10.3042C15.9997 10.9906 16.5561 11.547 17.2424 11.547L22.8324 11.547C23.1819 11.547 23.5173 11.408 23.7644 11.1609C24.0116 10.9139 24.1505 10.5785 24.1505 10.229C24.1505 9.87922 24.0116 9.54402 23.7644 9.29685C23.5173 9.04967 23.1819 8.9107 22.8324 8.9107H20.501L27.167 2.24612C27.4123 1.99854 27.5496 1.66397 27.5488 1.31541C27.5482 0.966682 27.4093 0.632697 27.1629 0.386154C26.9164 0.139575 26.5824 0.000809714 26.2337 1.87161e-06C25.8852 -0.000604998 25.5505 0.136743 25.3029 0.382111L18.6359 7.04824V4.71693C18.6359 4.36719 18.4969 4.03199 18.2498 3.78482C18.0026 3.53764 17.6673 3.39899 17.3176 3.39899Z" fill="white"/><path d="M24.1489 17.3166C24.1489 16.9671 24.0099 16.632 23.7627 16.3846C23.5155 16.1377 23.1804 15.9987 22.8306 15.9987H17.2437C16.5573 15.9987 16.0008 16.5551 16.0008 17.2414V22.8314C16.0008 23.1809 16.1398 23.5163 16.387 23.7634C16.634 24.0106 16.9694 24.1496 17.3189 24.1496C17.6686 24.1496 18.0038 24.0106 18.251 23.7634C18.4982 23.5163 18.6372 23.1809 18.6372 22.8314V20.5L25.3017 27.166C25.5493 27.4113 25.8839 27.5487 26.2324 27.5478C26.5812 27.5472 26.9152 27.4083 27.1617 27.1619C27.4083 26.9154 27.547 26.5814 27.5478 26.2328C27.5485 25.8843 27.4111 25.5495 27.1657 25.3019L20.4996 18.6349H22.8309C23.1807 18.6349 23.5159 18.496 23.763 18.2488C24.0102 18.0016 24.1489 17.6664 24.1489 17.3166Z" fill="white"/><path d="M10.2312 24.1479C10.5807 24.1479 10.9159 24.0089 11.1632 23.7617C11.4102 23.5146 11.5491 23.1794 11.5491 22.8296V17.2427C11.5491 16.5563 10.9928 15.9999 10.3064 15.9999H4.71642C4.36691 15.9999 4.03154 16.1388 3.7844 16.386C3.53724 16.633 3.39829 16.9684 3.39829 17.3179C3.39829 17.6677 3.53724 18.0029 3.7844 18.25C4.03156 18.4972 4.36691 18.6362 4.71642 18.6362H7.04786L0.381872 25.3008C0.136529 25.5483 -0.0008042 25.8829 3.54305e-06 26.2315C0.000610281 26.5802 0.139565 26.9142 0.385917 27.1607C0.632472 27.4073 0.966407 27.5461 1.31508 27.5469C1.66358 27.5475 1.9983 27.4101 2.24591 27.1648L8.91293 20.4986V22.8299C8.91293 23.1797 9.05189 23.5149 9.29905 23.7621C9.54621 24.0092 9.88149 24.1479 10.2312 24.1479Z" fill="white"/><path d="M3.39996 10.2302C3.39996 10.5797 3.53893 10.9149 3.78612 11.1622C4.0333 11.4092 4.36848 11.5482 4.71822 11.5482L10.3052 11.5482C10.9916 11.5482 11.548 10.9918 11.548 10.3055L11.548 4.71544C11.548 4.36594 11.409 4.03057 11.1618 3.78343C10.9149 3.53627 10.5795 3.39731 10.2299 3.39731C9.88019 3.39731 9.54499 3.53627 9.29783 3.78343C9.05064 4.03059 8.91168 4.36594 8.91168 4.71544V7.04688L2.2471 0.380895C1.99951 0.135552 1.66495 -0.00178075 1.31639 -0.00097302C0.967659 -0.000366296 0.633674 0.138588 0.387132 0.384941C0.140553 0.631495 0.00178728 0.96543 0.00097943 1.31411C0.000372556 1.6626 0.137721 1.99733 0.383088 2.24493L7.04922 8.91195H4.71791C4.36817 8.91195 4.03296 9.05091 3.7858 9.29807C3.53861 9.54523 3.39996 9.88052 3.39996 10.2302Z" fill="white"/></svg>
) : ( <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M28 1.24271C28 0.556382 27.4436 0 26.7572 0H21.1692C20.8195 0 20.4843 0.138953 20.2371 0.386114C19.9899 0.633274 19.851 0.968417 19.851 1.31792C19.851 1.66763 19.9899 2.0028 20.2371 2.24994C20.4843 2.4971 20.8195 2.63605 21.1692 2.63605H23.4991L16.8345 9.30049C16.5891 9.54805 16.4518 9.88279 16.4524 10.2313C16.4532 10.58 16.592 10.914 16.8385 11.1605C17.0851 11.4068 17.4191 11.5456 17.7678 11.5464C18.1163 11.5472 18.4509 11.4099 18.6985 11.1645L25.3636 4.49957V6.83184C25.3636 7.18135 25.5024 7.51672 25.7498 7.76386C25.9969 8.01102 26.3321 8.14997 26.6819 8.14997C27.0314 8.14997 27.3666 8.01102 27.6138 7.76386C27.861 7.5167 27.9999 7.18135 27.9999 6.83184L28 1.24271Z" fill="white"/><path d="M11.1656 16.8327C10.9184 16.5856 10.5831 16.4468 10.2335 16.4468C9.88397 16.4468 9.54857 16.5856 9.30141 16.8327L2.63631 23.4992V21.167C2.63631 20.8175 2.49735 20.4821 2.25016 20.235C2.00298 19.9878 1.6678 19.8488 1.31805 19.8488C0.968513 19.8488 0.633316 19.9878 0.386152 20.235C0.138967 20.4821 0 20.8175 0 21.167V26.7565C0 27.4428 0.556426 27.9992 1.24281 27.9992H6.82977C7.17931 27.9992 7.51471 27.8602 7.76187 27.6133C8.00906 27.3661 8.14803 27.0307 8.14803 26.6812C8.14803 26.3315 8.00906 25.9964 7.76187 25.7492C7.51469 25.5021 7.17931 25.3631 6.82977 25.3631H4.49929L11.1654 18.6966C11.4126 18.4492 11.5514 18.1141 11.5514 17.7646C11.5514 17.4151 11.4126 17.0797 11.1654 16.8326L11.1656 16.8327Z" fill="white"/><path d="M19.8508 26.6821C19.8508 27.0316 19.9898 27.3667 20.237 27.6141C20.4841 27.861 20.8193 28 21.1691 28H26.756C27.4424 28 27.9988 27.4436 27.9988 26.7573V21.1673C27.9988 20.8178 27.8599 20.4824 27.6127 20.2353C27.3657 19.9881 27.0303 19.8492 26.6808 19.8492C26.331 19.8492 25.9958 19.8881 25.7487 20.2353C25.5015 20.4824 25.3625 20.8178 25.3625 21.1673V23.4987L18.6979 16.8327C18.4503 16.5874 18.1158 16.4501 17.7672 16.4509C17.4185 16.4515 17.0845 16.5904 16.838 16.8368C16.5914 17.0833 16.4526 17.4173 16.4518 17.7659C16.4512 18.1144 16.5886 18.4492 16.8339 18.6968L23.5001 25.3638H21.1687C20.819 25.3638 20.4838 25.5027 20.2366 25.7499C19.9895 25.9971 19.8505 26.3322 19.8505 26.6819L19.8508 26.6821Z" fill="white"/><path d="M11.1656 9.30049L4.50001 2.63605H6.82987C7.17941 2.63605 7.51481 2.4971 7.76198 2.24994C8.00916 2.00278 8.14813 1.66764 8.14813 1.31792C8.14813 0.968417 8.00916 0.633253 7.76198 0.386114C7.51479 0.138953 7.17941 0 6.82987 0H1.24292C0.55653 0 0.000103511 0.55637 0.000103511 1.24269V6.8322C0.000103511 7.1817 0.139071 7.51707 0.386255 7.76421C0.63344 8.01137 0.968616 8.15033 1.31816 8.15033C1.6679 8.15033 2.0031 8.01137 2.25027 7.76421C2.49745 7.51705 2.63642 7.1817 2.63642 6.8322V4.49993L9.30151 11.1649C9.5491 11.4102 9.88387 11.5476 10.2324 11.5467C10.5812 11.5459 10.9151 11.4072 11.1617 11.1608C11.4081 10.9143 11.5468 10.5803 11.5476 10.2317C11.5484 9.88317 11.4111 9.54845 11.1657 9.30084L11.1656 9.30049Z" fill="white"/> </svg>
)}
</button>
<div className="flex items-center space-x-4"><div className="flex items-center space-x-1.5 text-gray-400"><svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path fillRule="evenodd" clipRule="evenodd" d="M13.9645 16.8222L11.6787 19.1079C11.3445 19.4429 11.3445 19.9857 11.6787 20.3204L13.9645 22.6062C14.2994 22.9404 14.8423 22.9404 15.177 22.6062C15.5112 22.2712 15.5112 21.7284 15.177 21.3937L13.4968 19.7143L15.177 18.0349C15.5112 17.7 15.5112 17.1572 15.177 16.8225C14.842 16.4883 14.2992 16.4883 13.9645 16.8225V16.8222Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M16.8217 14.0355L19.1074 16.3213C19.4424 16.6555 19.9852 16.6555 20.3199 16.3213L22.6057 14.0355C22.9399 13.7006 22.9399 13.1577 22.6057 12.823C22.2707 12.4888 21.7279 12.4888 21.3932 12.823L19.7138 14.5032L18.0344 12.823C17.6995 12.4888 17.1566 12.4888 16.8219 12.823C16.4877 13.158 16.4877 13.7008 16.8219 14.0355H16.8217Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M8.91752 18.3994C6.3032 17.9039 4.15009 17.0485 2.85341 15.9501C2.1539 15.3575 1.71386 14.7118 1.71386 14.0003C1.71386 12.9901 2.55339 12.1214 3.83099 11.3638C6.12361 10.0044 9.82882 9.14309 14 9.14309C18.171 9.14309 21.8761 10.0044 24.169 11.3638C25.4468 12.1215 26.2861 12.9901 26.2861 14.0003C26.2861 15.0106 25.4466 15.8792 24.169 16.6369C21.8764 17.9963 18.1712 18.8576 14 18.8576H12.2857C11.8125 18.8576 11.4285 19.2415 11.4285 19.7147C11.4285 20.1879 11.8125 20.5719 12.2857 20.5719H14C18.5338 20.5719 22.5507 19.5895 25.0428 18.1114C26.9561 16.9772 28 15.5136 28 14.0003C28 12.487 26.9561 11.0237 25.0428 9.88929C22.5507 8.41093 18.5335 7.42878 14 7.42878C9.4665 7.42878 5.44931 8.41119 2.95718 9.88929C1.04387 11.0235 0 12.487 0 14.0003C0 15.1644 0.600521 16.2884 1.74567 17.2581C3.21534 18.5027 5.6355 19.5221 8.59902 20.0839C9.06357 20.1719 9.5128 19.8663 9.60083 19.401C9.68885 18.9364 9.38323 18.4872 8.91791 18.3992L8.91752 18.3994Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M18.3988 19.0825C17.9034 21.6968 17.048 23.8499 15.9496 25.1466C15.3569 25.8461 14.7113 26.2861 13.9998 26.2861C12.9896 26.2861 12.1209 25.4466 11.3633 24.169C10.0038 21.8764 9.14257 18.1712 9.14257 14C9.14257 9.82902 10.0038 6.12393 11.3633 3.83099C12.121 2.55319 12.9896 1.71386 13.9998 1.71386C15.01 1.71386 15.8787 2.55339 16.6363 3.83099C17.9958 6.12361 18.857 9.82882 18.857 14V15.7143C18.857 16.1875 19.241 16.5715 19.7142 16.5715C20.1874 16.5715 20.5714 16.1875 20.5714 15.7143V14C20.5714 9.46623 19.5889 5.44931 18.1108 2.95718C16.9766 1.04387 15.5131 0 13.9998 0C12.4865 0 11.0232 1.04387 9.88877 2.95718C8.41041 5.44931 7.42825 9.4665 7.42825 14C7.42825 18.5335 8.41067 22.5507 9.88877 25.0428C11.023 26.9561 12.4865 28 13.9998 28C15.1638 28 16.2878 27.3995 17.2575 26.2543C18.5022 24.7847 19.5216 22.3645 20.0834 19.401C20.1714 18.9364 19.8658 18.4872 19.4005 18.3992C18.9359 18.3112 18.4867 18.6168 18.3986 19.0821L18.3988 19.0825Z" fill="currentColor"/></svg><span>Drag to Rotate</span></div>
<div className="flex items-center space-x-1.5 text-gray-400"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M17.7074 0.622701C13.7678 -0.849719 9.19902 0.35492 6.54529 3.54063C3.34439 7.42228 4.00108 12.4284 6.79166 15.7212C4.60296 17.8895 2.41426 20.0312 0.225712 22.1728C-0.0752372 22.4673 -0.0752372 22.976 0.225712 23.2705L0.745564 23.7791C1.04651 24.0736 1.56636 24.0736 1.8673 23.7791C4.08325 21.6108 6.27195 19.4691 8.48796 17.3007C10.4851 18.7731 13.0568 19.5226 15.902 19.0407C20.6076 18.2375 23.8906 14.1952 24 9.59073C23.8905 5.62857 21.5102 2.06825 17.7076 0.622653L17.7074 0.622701ZM14.1783 17.6219C9.69157 17.6219 5.97086 13.9544 5.97086 9.59078C5.97086 5.20044 9.71888 1.53289 14.1783 1.55966C18.7471 1.55966 22.3037 5.20044 22.3857 9.59078C22.2762 13.9811 18.7471 17.6219 14.1783 17.6219Z" fill="currentColor"/><path d="M14.7527 4.2367H13.3848V8.92152H8.81601V10.26H13.3848V14.9449H14.7527V10.26H19.7593V8.92152H14.7527V4.2367Z" fill="currentColor"/></svg><span>Pinch to Zoom</span></div>
</div>
<div className="p-1 w-7 h-7" aria-hidden="true"></div>
</div>
</main>

{!isVisualizationExpanded && (
<div className="flex flex-col overflow-hidden bg-[#161616]" style={{ flexBasis: `${CONTROLS_PROPORTION * 100}%` }}>
<div className="relative flex-grow overflow-hidden">
{activeView === 'configuratorList' && (
<>
{/* --- UPDATE: Added ref and data-id attributes for scrollIntoView --- */}
<section ref={listContainerRef} className={`px-4 bg-[#161616] h-full overflow-y-auto ${isSummaryPanelVisible ? 'opacity-50 pointer-events-none' : ''}`}>
<button data-id="build" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenBuildPanel('build', 'Build Options')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Build</span></div>
<span className="text-sm text-gray-400">Modify</span>
</button>
<button data-id="thumb" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenColorPicker('thumb', 'Thumb Color')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Thumb</span></div>
<span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration.thumb }}></span>
</button>
<button data-id="index" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenColorPicker('index', 'Index Color')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Index</span></div>
<span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration.index }}></span>
</button>
<button data-id="middle" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenColorPicker('middle', 'Middle Color')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Middle</span></div>
<span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration.middle }}></span>
</button>
<button data-id="ring" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenColorPicker('ring', 'Ring Color')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Ring</span></div>
<span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration.ring }}></span>
</button>
<button data-id="pinky" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenColorPicker('pinky', 'Pinky Color')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Pinky</span></div>
<span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration.pinky }}></span>
</button>
<button data-id="thumbName" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenTextPanel('thumbName', 'Thumb Name')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Thumb Name</span></div>
<div className="flex items-center space-x-3">
<span className="text-sm text-gray-400 truncate max-w-[100px]">{configuration.thumbName.text}</span>
<span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration.thumbName.color }}></span>
</div>
</button>
<button data-id="pinkyName" className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] rounded-md" onClick={() => handleOpenTextPanel('pinkyName', 'Pinky Name')}>
<div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">Pinky Name</span></div>
<div className="flex items-center space-x-3">
<span className="text-sm text-gray-400 truncate max-w-[100px]">{configuration.pinkyName.text}</span>
<span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration.pinkyName.color }}></span>
</div>
</button>
</section>
{isSummaryPanelVisible && ( <div className="absolute inset-0 bg-[#161616] z-20 flex flex-col h-full"> <div className="flex items-center justify-between text-white py-3 px-4 bg-[#1C1C1C] cursor-pointer h-[56px]" onClick={() => setIsSummaryPanelVisible(false)}> <div className="flex items-center"> <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3"><g opacity="0.7"><path d="M17.1875 0H4.8125C3.53619 0 2.31204 0.507022 1.40953 1.40953C0.507021 2.31204 0 3.53619 0 4.8125V17.1875C0 18.4638 0.507021 19.688 1.40953 20.5905C2.31204 21.493 3.53619 22 4.8125 22H17.1875C18.4638 22 19.688 21.493 20.5905 20.5905C21.493 19.688 22 18.4638 22 17.1875V4.8125C22 3.53619 21.493 2.31204 20.5905 1.40953C19.688 0.507022 18.4638 0 17.1875 0ZM20.625 17.1875C20.625 18.0992 20.2628 18.9735 19.6181 19.6181C18.9735 20.2628 18.0992 20.625 17.1875 20.625H4.8125C3.9008 20.625 3.02653 20.2628 2.38185 19.6181C1.73717 18.9735 1.375 18.0992 1.375 17.1875V4.8125C1.375 3.9008 1.73717 3.02653 2.38185 2.38185C3.02654 1.73718 3.9008 1.375 4.8125 1.375H17.1875C18.0992 1.375 18.9735 1.73717 19.6181 2.38185C20.2628 3.02654 20.625 3.9008 20.625 4.8125V17.1875Z" fill="white"/><path d="M8.9375 5.5H17.1875V6.875H8.9375V5.5Z" fill="white"/><path d="M8.9375 10.3125H17.1875V11.6875H8.9375V10.3125Z" fill="white"/><path d="M8.9375 15.125H17.1875V16.5H8.9375V15.125Z" fill="white"/><path d="M7.5625 6.1875C7.5625 6.94681 6.94681 7.5625 6.1875 7.5625C5.42819 7.5625 4.8125 6.94681 4.8125 6.1875C4.8125 5.42819 5.42819 4.8125 6.1875 4.8125C6.94681 4.8125 7.5625 5.42819 7.5625 6.1875Z" fill="white"/><path d="M7.5625 11C7.5625 11.7593 6.94681 12.375 6.1875 12.375C5.42819 12.375 4.8125 11.7593 4.8125 11C4.8125 10.2407 5.42819 9.625 6.1875 9.625C6.94681 9.625 7.5625 10.2407 7.5625 11Z" fill="white"/><path d="M7.5625 15.8125C7.5625 16.5718 6.94681 17.1875 6.1875 17.1875C5.42819 17.1875 4.8125 16.5718 4.8125 15.8125C4.8125 15.0532 5.42819 14.4375 6.1875 14.4375C6.94681 14.4375 7.5625 15.0532 7.5625 15.8125Z" fill="white"/></g></svg> <span className="text-lg">Accordion Up</span></div> <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div> <div className="flex-grow bg-[#161616] p-4 overflow-y-auto"><p className="text-lg font-semibold mb-3 text-white">Glove Foundation</p> {['Option', 'Option', 'Option', 'Option', 'Option', 'Option', 'Option','Option','Option','Option'].map((item, index) => (<p key={index} className="text-base mb-2 text-gray-300">{item}</p>))}</div></div>)}
</>
)}
{activeView === 'colorPickerPanel' && ( <ColorPickerPanel editingColorContext={editingColorContext} handleCloseColorPicker={handleCloseColorPicker} selectedColorInPicker={selectedColorInPicker} setSelectedColorInPicker={setSelectedColorInPicker} colorSwatches={colorSwatches}/> )}
{activeView === 'buildPanel' && ( <BuildPanel editingBuildContext={editingBuildContext} handleCloseBuildPanel={handleCloseBuildPanel} selectedImageOption={selectedImageOption} setSelectedImageOption={setSelectedImageOption}/> )}
{activeView === 'textPanel' && ( <TextPanel editingTextContext={editingTextContext} panelState={textPanelState} setPanelState={setTextPanelState} handleClose={handleCloseTextPanel} colorSwatches={colorSwatches}/> )}
</div>
<footer className="flex-shrink-0 bg-[#161616] flex items-center justify-start mt-[10px] pb-[20px] px-[14px]">
{activeView === 'colorPickerPanel' ? ( <> <button type="button" onClick={handleCloseColorPicker} className="flex items-center justify-center px-4 bg-[#3A3A3A] hover:bg-[#4A4A4A] active:bg-[#2A2A2A] rounded text-base font-semibold text-white w-[146px] h-[56px]" aria-label="Cancel color selection"><span>Cancel</span></button> <button type="button" onClick={handlePaintSectionAndReturn} className="flex items-center justify-between px-4 ml-[10px] bg-[#2997FF] hover:bg-[#73BBFF] active:bg-[#0083FF] rounded text-base font-semibold text-white w-[244px] h-[56px]" aria-label="Apply color to section and return"><span className="ml-[5px]">Primary</span><svg className="w-5 h-5 mr-[5px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></button></>)
: activeView === 'buildPanel' ? ( <> <button type="button" onClick={handleCloseBuildPanel} className="text-white h-[56px] w-[146px] flex items-center justify-center">Cancel</button><button type="button" onClick={handleBuildCallToAction} className="flex items-center justify-center px-4 ml-[10px] bg-white hover:bg-gray-200 active:bg-gray-300 rounded text-base font-semibold text-[#161616] w-[244px] h-[56px]" aria-label="Confirm build options"><span>Call To Action</span><svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></button></>)
: activeView === 'textPanel' ? ( <> <button type="button" onClick={handleCloseTextPanel} className="text-white h-[56px] w-[146px] flex items-center justify-center">Cancel</button><button type="button" onClick={handleTextPanelConfirm} className="flex items-center justify-center px-4 ml-[10px] bg-white hover:bg-gray-200 active:bg-gray-300 rounded text-base font-semibold text-[#161616] w-[244px] h-[56px]" aria-label="Confirm text customization"><span>Call To Action</span><svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></button></>)
: activeView === 'configuratorList' ? ( isSummaryPanelVisible ? ( <> <button type="button" onClick={() => setIsSummaryPanelVisible(false)} className="flex items-center justify-center px-4 bg-[#3A3A3A] hover:bg-[#4A4A4A] active:bg-[#2A2A2A] rounded text-base font-semibold text-white w-[146px] h-[56px]" aria-label="Close summary panel"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span>Secondary</span></button> <button type="button" className="flex items-center justify-between px-4 ml-[10px] bg-[#2997FF] hover:bg-[#73BBFF] active:bg-[#0083FF] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded text-base font-semibold text-white w-[244px] h-[56px]" aria-label="Primary action"><span className="ml-[5px]">Primary</span><svg width="34" height="14" viewBox="0 0 34 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-[5px]"><path d="M0 8H32.5M32.5 8L25.5 1M32.5 8H0.5M32.5 8L25.6077 15" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg></button></>)
: ( <> <button type="button" onClick={() => setIsSummaryPanelVisible(true)} className="flex items-center justify-center space-x-2 px-4 bg-[#1A1A1A] hover:bg-[#222222] active:bg-[#1F1F1F] rounded text-base font-semibold text-white w-[146px] h-[56px]" aria-label="Open summary panel"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.3"><path d="M17.1875 0H4.8125C3.53619 0 2.31204 0.507022 1.40953 1.40953C0.507021 2.31204 0 3.53619 0 4.8125V17.1875C0 18.4638 0.507021 19.688 1.40953 20.5905C2.31204 21.493 3.53619 22 4.8125 22H17.1875C18.4638 22 19.688 21.493 20.5905 20.5905C21.493 19.688 22 18.4638 22 17.1875V4.8125C22 3.53619 21.493 2.31204 20.5905 1.40953C19.688 0.507022 18.4638 0 17.1875 0ZM20.625 17.1875C20.625 18.0992 20.2628 18.9735 19.6181 19.6181C18.9735 20.2628 18.0992 20.625 17.1875 20.625H4.8125C3.9008 20.625 3.02653 20.2628 2.38185 19.6181C1.73717 18.9735 1.375 18.0992 1.375 17.1875V4.8125C1.375 3.9008 1.73717 3.02653 2.38185 2.38185C3.02654 1.73718 3.9008 1.375 4.8125 1.375H17.1875C18.0992 1.375 18.9735 1.73717 19.6181 2.38185C20.2628 3.02654 20.625 3.9008 20.625 4.8125V17.1875Z" fill="white"/><path d="M8.9375 5.5H17.1875V6.875H8.9375V5.5Z" fill="white"/><path d="M8.9375 10.3125H17.1875V11.6875H8.9375V10.3125Z" fill="white"/><path d="M8.9375 15.125H17.1875V16.5H8.9375V15.125Z" fill="white"/><path d="M7.5625 6.1875C7.5625 6.94681 6.94681 7.5625 6.1875 7.5625C5.42819 7.5625 4.8125 6.94681 4.8125 6.1875C4.8125 5.42819 5.42819 4.8125 6.1875 4.8125C6.94681 4.8125 7.5625 5.42819 7.5625 6.1875Z" fill="white"/><path d="M7.5625 11C7.5625 11.7593 6.94681 12.375 6.1875 12.375C5.42819 12.375 4.8125 11.7593 4.8125 11C4.8125 10.2407 5.42819 9.625 6.1875 9.625C6.94681 9.625 7.5625 10.2407 7.5625 11Z" fill="white"/><path d="M7.5625 15.8125C7.5625 16.5718 6.94681 17.1875 6.1875 17.1875C5.42819 17.1875 4.8125 16.5718 4.8125 15.8125C4.8125 15.0532 5.42819 14.4375 6.1875 14.4375C6.94681 14.4375 7.5625 15.0532 7.5625 15.8125Z" fill="white"/></g></svg>
<span>Accordion</span>
</button>
<button type="button" className="flex items-center justify-between px-4 ml-[10px] bg-[#2997FF] hover:bg-[#73BBFF] active:bg-[#0083FF] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded text-base font-semibold text-white w-[244px] h-[56px]">
<span className="ml-[5px]">Call To Action</span>
<svg width="34" height="14" viewBox="0 0 34 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-[5px]"><path d="M0 8H32.5M32.5 8L25.5 1M32.5 8H0.5M32.5 8L25.6077 15" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
</button>
</>
)
) : null }
</footer>
</div>
)}
</div>
);
};

export default UI;