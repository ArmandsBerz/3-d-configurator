import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';

// --- Constants (Decoupled Data Sources) ---

const leatherOptions = [
    { id: 'imgOpt1', title: 'Japanese Kip' },
    { id: 'imgOpt2', title: 'American Steerhide' }
];

const fontOptions = [
    { id: 'SCRIPT', label: 'SCRIPT' },
    { id: 'BLOCK', label: 'BLOCK' }
];

const colorSwatches = [
    '#C62828', '#AD1457', '#6A1B9A', '#4527A0', '#283593', '#1565C0',
    '#0277BD', '#00838F', '#00695C', '#2E7D32', '#558B2F', '#9E9D24',
    '#F9A825', '#FF8F00', '#EF6C00', '#D84315', '#4E342E', '#424242',
    '#BDBDBD', '#37474F',
];

const buildOptionsData = [
    { id: 'position', title: 'Position', options: [{id: 'INFIELD', label: 'INFIELD'}, {id: 'OUTFIELD', label: 'OUTFIELD'}, {id: 'PITCHER', label: 'PITCHER'}, {id: 'CATCHER', label: 'CATCHER'}, {id: 'FIRST BASE', label: 'FIRST BASE'}], layout: 'grid-cols-3' },
    { id: 'size', title: 'Size', options: [{id: '11"', label: '11"'}, {id: '11.25"', label: '11.25"'}, {id: '11.5"', label: '11.5"'}, {id: '11.75"', label: '11.75"'}, {id: '12"', label: '12"'}], layout: 'grid-cols-3' },
    { id: 'handOpeningSize', title: 'Hand Opening Size', options: [{id: 'ADULT', label: 'ADULT'}, {id: 'YOUTH', label: 'YOUTH'}], layout: 'grid-cols-2' },
    { id: 'stiffness', title: 'Stiffness', options: [{id: 'STIFF', label: 'STIFF'}, {id: 'STANDARD', label: 'STANDARD'}, {id: 'SOFT', label: 'SOFT'}], layout: 'grid-cols-3' },
    { id: 'throwingHand', title: 'Throwing Hand', options: [{id: 'RIGHT HAND', label: 'RIGHT HAND'}, {id: 'LEFT HAND', label: 'LEFT HAND'}], layout: 'grid-cols-2' }
];

// --- Helper Components ---
const ScrollGradient = ({ position, isVisible }) => {
    const isTop = position === 'top';
    return (
        <div
            className={`absolute left-0 right-0 h-[63px] ${isTop ? 'top-0 bg-gradient-to-b' : 'bottom-0 bg-gradient-to-t'} from-[#161616] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden="true"
        />
    );
};

const ImageOption = ({ id, title, isSelected, onSelect }) => (
    <button className={`relative p-3 h-24 cursor-pointer flex flex-col justify-center items-center text-center bg-[#2a2a2a] ${isSelected ? 'border-4 border-white' : 'hover:bg-[#333333]'} focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white`} onClick={onSelect}>
        <h4 className="text-base font-semibold text-white">{title}</h4>
        {isSelected && (
            <svg className="absolute top-2 right-2 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
        )}
    </button>
);

const PrimaryCTAButton = ({ label, onClick, ariaLabel }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 bg-[#2997FF] hover:bg-[#73BBFF] active:bg-[#0083FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-50 text-base font-semibold text-white h-[56px]"
        aria-label={ariaLabel || label}
    >
        <span className="ml-[5px]">{label}</span>
        <svg width="34" height="14" viewBox="0 0 34 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-[5px]"><path d="M0 8H32.5M32.5 8L25.5 1M32.5 8H0.5M32.5 8L25.6077 15" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    </button>
);

const SecondaryButton = ({ label, onClick, variant = 'dark', icon = 'checkmark' }) => {
  const baseClasses = "w-full flex items-center justify-center px-4 text-base font-semibold h-[56px] focus:outline-none";

  const variantClasses = variant === 'light'
    ? 'bg-white hover:bg-gray-200 active:bg-gray-300 text-[#161616] focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-400'
    : 'bg-[#393939] hover:bg-[#727272] active:bg-[#222222] text-white focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={label}
    >
      {icon === 'backArrow' && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-[5px]">
            <path d="M13 7H1M1 7L7 1M1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}

      <span>{label}</span>

      {icon === 'checkmark' && (
        <svg className="w-5 h-5 ml-[5px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      )}
    </button>
  );
};

const ColorSwatch = ({ color, isSelected, onSelect }) => (
    <button
        className={`w-[42px] h-[42px] rounded-full border-2 focus:outline-none ${
            isSelected
                ? 'border-transparent ring-4 ring-white'
                : 'border-transparent focus-visible:ring-4 focus-visible:ring-white/50'
        }`}
        style={{ backgroundColor: color }}
        onClick={() => onSelect(color)}
        aria-label={`Select color ${color}`}
    />
);

const ColorSwatchGrid = ({ swatches, selectedColor, onColorSelect }) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(42px,1fr))] gap-[10px] px-2 py-2">
        {swatches.map((color) => (
            <ColorSwatch
                key={color}
                color={color}
                isSelected={selectedColor === color}
                onSelect={onColorSelect}
            />
        ))}
    </div>
);

const AccordionOptionMobile = ({ title, onClose, headerAccessory = null, children }) => {
    const scrollContainerRef = useRef(null);
    const [isTopGradientVisible, setIsTopGradientVisible] = useState(false);
    const [isBottomGradientVisible, setIsBottomGradientVisible] = useState(false);

    const checkAndSetGradients = useCallback(() => {
        const element = scrollContainerRef.current;
        if (!element) return;

        const hasOverflow = element.scrollHeight > element.clientHeight;
        if (hasOverflow) {
            const isAtTop = element.scrollTop === 0;
            const isAtBottom = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1;
            setIsTopGradientVisible(!isAtTop);
            setIsBottomGradientVisible(!isAtBottom);
        } else {
            setIsTopGradientVisible(false);
            setIsBottomGradientVisible(false);
        }
    }, []);

    useLayoutEffect(() => {
        checkAndSetGradients();
    }, [children, checkAndSetGradients]);

    useEffect(() => {
        const element = scrollContainerRef.current;
        const handler = checkAndSetGradients;

        window.addEventListener('resize', handler);
        if (element) {
            element.addEventListener('scroll', handler);
        }

        return () => {
            window.removeEventListener('resize', handler);
            if (element) {
                element.removeEventListener('scroll', handler);
            }
        };
    }, [checkAndSetGradients]);

    return (
        <div className="absolute inset-0 bg-[#161616] z-20 h-full flex flex-col px-[23px]">
            <button
                className="flex items-center justify-between text-white py-3 h-[56px] w-full text-left mb-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/50"
                onClick={onClose}
            >
                <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    <span className="text-lg">{title}</span>
                </div>
                {headerAccessory}
            </button>
            <div className="flex-grow relative overflow-hidden">
                <ScrollGradient position="top" isVisible={isTopGradientVisible} />
                <div className="h-full overflow-y-auto" ref={scrollContainerRef}>
                    {children}
                </div>
                <ScrollGradient position="bottom" isVisible={isBottomGradientVisible} />
            </div>
        </div>
    );
};

const Option = ({ label, isSelected, onSelect }) => (
    <button
      className={`text-sm py-2 px-3 h-[36px] flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-inset ${
        isSelected
          ? 'bg-white text-[#222222] focus-visible:ring-blue-400'
          : 'bg-[#383838] hover:bg-[#595959] active:bg-[#272727] focus-visible:ring-white'
      }`}
      onClick={onSelect}
    >
      {label}
    </button>
);

const OptionGroup = ({ title, options, layout, selectedOption, onSelectOption }) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
        <div className={`grid ${layout} gap-2`}>
            {options.map((option) => (
                <Option
                    key={option.id}
                    label={option.label}
                    isSelected={selectedOption === option.id}
                    onSelect={() => onSelectOption(option.id)}
                />
            ))}
        </div>
    </div>
);

const OverviewButton = ({ onClick, isDesktop, isOpen }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center h-[56px] bg-[#393939] hover:bg-[#727272] active:bg-[#222222] text-base font-semibold text-white px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/50 ${isDesktop ? 'justify-between' : 'justify-center'}`}
        aria-label="Open summary panel"
    >
        <div className="flex items-center space-x-2">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.3"><path d="M17.1875 0H4.8125C3.53619 0 2.31204 0.507022 1.40953 1.40953C0.507021 2.31204 0 3.53619 0 4.8125V17.1875C0 18.4638 0.507021 19.688 1.40953 20.5905C2.31204 21.493 3.53619 22 4.8125 22H17.1875C18.4638 22 19.688 21.493 20.5905 20.5905C21.493 19.688 22 18.4638 22 17.1875V4.8125C22 3.53619 21.493 2.31204 20.5905 1.40953C19.688 0.507022 18.4638 0 17.1875 0ZM20.625 17.1875C20.625 18.0992 20.2628 18.9735 19.6181 19.6181C18.9735 20.2628 18.0992 20.625 17.1875 20.625H4.8125C3.9008 20.625 3.02653 20.2628 2.38185 19.6181C1.73717 18.9735 1.375 18.0992 1.375 17.1875V4.8125C1.375 3.9008 1.73717 3.02653 2.38185 2.38185C3.02654 1.73718 3.9008 1.375 4.8125 1.375H17.1875C18.0992 1.375 18.9735 1.73717 19.6181 2.38185C20.2628 3.02654 20.625 3.9008 20.625 4.8125V17.1875Z" fill="white"/><path d="M8.9375 5.5H17.1875V6.875H8.9375V5.5Z" fill="white"/><path d="M8.9375 10.3125H17.1875V11.6875H8.9375V10.3125Z" fill="white"/><path d="M8.9375 15.125H17.1875V16.5H8.9375V15.125Z" fill="white"/><path d="M7.5625 6.1875C7.5625 6.94681 6.94681 7.5625 6.1875 7.5625C5.42819 7.5625 4.8125 6.94681 4.8125 6.1875C4.8125 5.42819 5.42819 4.8125 6.1875 4.8125C6.94681 4.8125 7.5625 5.42819 7.5625 6.1875Z" fill="white"/><path d="M7.5625 11C7.5625 11.7593 6.94681 12.375 6.1875 12.375C5.42819 12.375 4.8125 11.7593 4.8125 11C4.8125 10.2407 5.42819 9.625 6.1875 9.625C6.94681 9.625 7.5625 10.2407 7.5625 11Z" fill="white"/><path d="M7.5625 15.8125C7.5625 16.5718 6.94681 17.1875 6.1875 17.1875C5.42819 17.1875 4.8125 16.5718 4.8125 15.8125C4.8125 15.0532 5.42819 14.4375 6.1875 14.4375C6.94681 14.4375 7.5625 15.0532 7.5625 15.8125Z" fill="white"/></g></svg>
            <span>Overview</span>
        </div>
        {isDesktop && (
            <svg
                className={`w-5 h-5 text-white transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
        )}
    </button>
);

const OrderButtonController = ({ isSummaryVisible, onReviewClick, onCompleteClick }) => {
  return isSummaryVisible ? (
    <PrimaryCTAButton
      label="Complete Order"
      onClick={onCompleteClick}
      ariaLabel="Complete Order"
    />
  ) : (
    <PrimaryCTAButton
      label="Review & Order"
      onClick={onReviewClick}
      ariaLabel="Review and Order"
    />
  );
};

// --- Accordion Component for Desktop ---
const AccordionOptionDesktop = ({ title, children, isOpen, onToggle, headerContent }) => (
    <div className="bg-[#1C1C1C] overflow-hidden pointer-events-auto">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-[#2A2A2A] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-inset"
        >
            <div className="flex items-center space-x-3">
                <svg
                    className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="flex items-center">
                {headerContent}
            </div>
        </button>
        <div
            className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
            <div className="overflow-hidden">
                {isOpen && (
                    <div className="p-4 border-t border-black/20">
                        {children}
                    </div>
                )}
            </div>
        </div>
    </div>
);

// --- DESKTOP OPTION COMPONENTS ---
const BuildOptionDesktop = ({ isOpen, onToggle, buildConfig, onBuildConfigChange, headerContent }) => {
    return (
        <AccordionOptionDesktop
            title="Build Options"
            isOpen={isOpen}
            onToggle={onToggle}
            headerContent={headerContent}
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Glove Leather</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {leatherOptions.map(option => (
                           <ImageOption
                             key={option.id}
                             id={option.id}
                             title={option.title}
                             isSelected={buildConfig.imageSelection === option.id}
                             onSelect={() => onBuildConfigChange({...buildConfig, imageSelection: option.id})}
                           />
                        ))}
                    </div>
                </div>
                {buildOptionsData.map((group) => (
                    <OptionGroup
                        key={group.id}
                        title={group.title}
                        options={group.options}
                        layout={group.layout}
                        selectedOption={buildConfig[group.id]}
                        onSelectOption={(value) => onBuildConfigChange({ ...buildConfig, [group.id]: value })}
                    />
                ))}
            </div>
        </AccordionOptionDesktop>
    );
};

const ColorOptionDesktop = ({
    title,
    isOpen,
    onToggle,
    colorValue,
    onColorSelect,
    onApplyToAll,
    headerAccessory
}) => {
    return (
        <>
            <AccordionOptionDesktop
                title={title}
                isOpen={isOpen}
                onToggle={onToggle}
                headerContent={headerAccessory}
            >
                <ColorSwatchGrid
                    swatches={colorSwatches}
                    selectedColor={colorValue}
                    onColorSelect={onColorSelect}
                />
            </AccordionOptionDesktop>
            {isOpen && <SecondaryButton label="Apply to All" onClick={onApplyToAll} variant="dark" icon="checkmark" />}
        </>
    );
};

// --- NEW DUAL COLOR COMPONENT (DESKTOP) ---
const ColorDualOptionDesktop = ({
    title,
    isOpen,
    onToggle,
    colorValue, // Expects { inner: 'color', outer: 'color' }
    onColorSelect, // Expects (subPartId, color) => {}
    onApplyToAll,
    headerAccessory
}) => {
    const [lastEditedPart, setLastEditedPart] = useState(null);

    const handleColorSelection = (subPart, color) => {
        onColorSelect(subPart, color);
        setLastEditedPart(subPart);
    };

    const handleApplyToAllClick = () => {
        const colorToApply = lastEditedPart === 'outer' ? colorValue.outer : colorValue.inner;
        onApplyToAll(colorToApply);
    };

    return (
        <>
            <AccordionOptionDesktop
                title={title}
                isOpen={isOpen}
                onToggle={onToggle}
                headerContent={headerAccessory}
            >
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Inner</h3>
                        <ColorSwatchGrid
                            swatches={colorSwatches}
                            selectedColor={colorValue.inner}
                            onColorSelect={(color) => handleColorSelection('inner', color)}
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Outer</h3>
                        <ColorSwatchGrid
                            swatches={colorSwatches}
                            selectedColor={colorValue.outer}
                            onColorSelect={(color) => handleColorSelection('outer', color)}
                        />
                    </div>
                </div>
            </AccordionOptionDesktop>
            {isOpen && <SecondaryButton label="Apply to All" onClick={handleApplyToAllClick} variant="dark" icon="checkmark" />}
        </>
    );
};

const TextOptionDesktop = ({ title, isOpen, onToggle, value, onChange, headerContent }) => {
    return (
        <AccordionOptionDesktop
            title={title}
            isOpen={isOpen}
            onToggle={onToggle}
            headerContent={headerContent}
        >
            <div className="space-y-5">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Text</h3>
                    <input type="text" className="w-full p-3 bg-[#2A2A2A] text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={value.text} onChange={(e) => onChange({ ...value, text: e.target.value })} placeholder="ENTER YOUR TEXT..."/>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Font</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {fontOptions.map(font => (
                           <button
                             key={font.id}
                             onClick={() => onChange({ ...value, font: font.id })}
                             className={`py-3 text-base font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-inset ${value.font === font.id ? 'bg-white text-black focus-visible:ring-blue-400' : 'bg-[#2a2a2a] hover:bg-[#333333] text-white focus-visible:ring-white'}`}
                           >
                               {font.label}
                           </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Color</h3>
                    <ColorSwatchGrid
                        swatches={colorSwatches}
                        selectedColor={value.color}
                        onColorSelect={(color) => onChange({ ...value, color: color })}
                    />
                </div>
            </div>
        </AccordionOptionDesktop>
    );
};


// --- Panel Components ---

const OrderSummaryInfo = ({ configuration, dataSources }) => {
    const { build, thumb, index, middle, ring, pinky, thumbName, pinkyName } = configuration;
    const { buildOptions, leatherOptions: leatherSource } = dataSources;

    const getBuildLabel = (key, value) => {
        if (key === 'imageSelection') {
            return leatherSource.find(opt => opt.id === value)?.title || value;
        }
        const group = buildOptions.find(g => g.id === key);
        const option = group?.options.find(o => o.id === value);
        return option?.label || value;
    };
    
    const getBuildTitle = (key) => {
        if (key === 'imageSelection') return "Glove Leather";
        return buildOptions.find(g => g.id === key)?.title || key;
    }
    
    const renderColorValue = (value) => {
        if (typeof value === 'object' && value !== null && value.inner && value.outer) {
            return `Inner: ${value.inner}, Outer: ${value.outer}`;
        }
        return value;
    };

    return (
        <div className="text-base text-gray-300 space-y-4 p-1">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Glove Foundation</h3>
                <div className="space-y-1 pl-2">
                    {Object.entries(build).map(([key, value]) => (
                        <p key={key}><span className="font-semibold text-gray-400">{getBuildTitle(key)}:</span> {getBuildLabel(key, value)}</p>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Color Scheme</h3>
                <div className="space-y-1 pl-2">
                    <p><span className="font-semibold text-gray-400">Thumb:</span> {renderColorValue(thumb)}</p>
                    <p><span className="font-semibold text-gray-400">Index:</span> {renderColorValue(index)}</p>
                    <p><span className="font-semibold text-gray-400">Middle:</span> {renderColorValue(middle)}</p>
                    <p><span className="font-semibold text-gray-400">Ring:</span> {renderColorValue(ring)}</p>
                    <p><span className="font-semibold text-gray-400">Pinky:</span> {renderColorValue(pinky)}</p>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personalization</h3>
                <div className="space-y-1 pl-2">
                    <p><span className="font-semibold text-gray-400">Thumb Name:</span> "{thumbName.text}" ({thumbName.font}, {thumbName.color})</p>
                    <p><span className="font-semibold text-gray-400">Pinky Name:</span> "{pinkyName.text}" ({pinkyName.font}, {pinkyName.color})</p>
                </div>
            </div>
        </div>
    );
};

const OverviewMobile = ({ onClose, configuration }) => {
    const dataSources = { buildOptions: buildOptionsData, leatherOptions: leatherOptions };
    return (
        <AccordionOptionMobile title="Order Summary" onClose={onClose}>
            <OrderSummaryInfo configuration={configuration} dataSources={dataSources} />
        </AccordionOptionMobile>
    );
};

const ColorOptionMobile = ({ editingColorContext, onClose, onColorSelect, selectedColor }) => {
  if (!editingColorContext) return null;

  return (
    <AccordionOptionMobile
      title={editingColorContext.title || 'Color Picker'}
      onClose={onClose}
      headerAccessory={<span className="text-sm text-gray-400">{selectedColor}</span>}
    >
      <ColorSwatchGrid
        swatches={colorSwatches}
        selectedColor={selectedColor}
        onColorSelect={onColorSelect}
      />
    </AccordionOptionMobile>
  );
};

// --- NEW DUAL COLOR COMPONENT (MOBILE) ---
const ColorDualOptionMobile = ({ editingColorContext, onClose, onColorSelect, colorValue, onSubPartEdit }) => {
    if (!editingColorContext) return null;

    const handleColorSelection = (subPart, color) => {
        onColorSelect(subPart, color);
        onSubPartEdit(subPart);
    };

    return (
        <AccordionOptionMobile
            title={editingColorContext.title || 'Color Picker'}
            onClose={onClose}
            headerAccessory={
                <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: colorValue.inner }}></span>
                    <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: colorValue.outer }}></span>
                </div>
            }
        >
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Inner</h3>
                    <ColorSwatchGrid
                        swatches={colorSwatches}
                        selectedColor={colorValue.inner}
                        onColorSelect={(color) => handleColorSelection('inner', color)}
                    />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Outer</h3>
                    <ColorSwatchGrid
                        swatches={colorSwatches}
                        selectedColor={colorValue.outer}
                        onColorSelect={(color) => handleColorSelection('outer', color)}
                    />
                </div>
            </div>
        </AccordionOptionMobile>
    );
};

const BuildOptionMobile = ({ editingBuildContext, onClose, buildConfig, onBuildConfigChange }) => {
    if (!editingBuildContext) return null;

    const handleSelectOption = (groupId, optionValue) => {
        onBuildConfigChange({
            ...buildConfig,
            [groupId]: optionValue
        });
    };

    const handleImageSelect = (selection) => {
        onBuildConfigChange({
            ...buildConfig,
            imageSelection: selection
        });
    };

    return (
        <AccordionOptionMobile title={editingBuildContext.title || 'Build Options'} onClose={onClose}>
            <div className="space-y-6 pb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Glove Leather</h3>
                    <div className="grid grid-cols-2 gap-3">
                       {leatherOptions.map(option => (
                           <ImageOption
                             key={option.id}
                             id={option.id}
                             title={option.title}
                             isSelected={buildConfig.imageSelection === option.id}
                             onSelect={() => handleImageSelect(option.id)}
                           />
                        ))}
                    </div>
                </div>

                {buildOptionsData.map((group) => (
                    <OptionGroup
                        key={group.id}
                        title={group.title}
                        options={group.options}
                        layout={group.layout}
                        selectedOption={buildConfig[group.id]}
                        onSelectOption={(value) => handleSelectOption(group.id, value)}
                    />
                ))}
            </div>
        </AccordionOptionMobile>
    );
};

const TextOptionMobile = ({ editingTextContext, value, onChange, onClose }) => {
  if (!editingTextContext) return null;

  const handleTextChange = (e) => onChange({ ...value, text: e.target.value });
  const handleFontChange = (fontId) => onChange({ ...value, font: fontId });
  const handleColorChange = (color) => onChange({ ...value, color });

  return (
    <AccordionOptionMobile
      title={editingTextContext.title}
      onClose={onClose}
      headerAccessory={<span className="text-sm text-gray-400">{value.color}</span>}
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Text</h3>
          <input type="text" className="w-full p-3 bg-[#2A2A2A] text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={value.text} onChange={handleTextChange} placeholder="ENTER YOUR TEXT..."/>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Font</h3>
          <div className="grid grid-cols-2 gap-3">
            {fontOptions.map(font => (
                <button
                  key={font.id}
                  onClick={() => handleFontChange(font.id)}
                  className={`py-3 text-base font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-inset ${value.font === font.id ? 'bg-white text-black focus-visible:ring-blue-400' : 'bg-[#2a2a2a] hover:bg-[#333333] text-white focus-visible:ring-white'}`}
                >
                    {font.label}
                </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Color</h3>
          <ColorSwatchGrid
            swatches={colorSwatches}
            selectedColor={value.color}
            onColorSelect={handleColorChange}
          />
        </div>
      </div>
    </AccordionOptionMobile>
  );
};

const FooterMobile = ({ openPanelName, onApplyColorToAll, onClosePanel, onReviewClick, onCompleteOrder, isDesktop }) => {
    const panelFooterMap = {
        color: (
            <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]">
                <SecondaryButton label="Apply to All" onClick={onApplyColorToAll} variant="dark" icon="checkmark" />
                <SecondaryButton label="Continue" onClick={onClosePanel} variant="light" icon="checkmark" />
            </div>
        ),
        'dual-color': (
             <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]">
                <SecondaryButton label="Apply to All" onClick={onApplyColorToAll} variant="dark" icon="checkmark" />
                <SecondaryButton label="Continue" onClick={onClosePanel} variant="light" icon="checkmark" />
            </div>
        ),
        build: (
            <SecondaryButton label="Continue" onClick={onClosePanel} variant="light" icon="checkmark" />
        ),
        text: (
            <SecondaryButton label="Continue" onClick={onClosePanel} variant="light" icon="checkmark" />
        ),
        summary: (
            <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]">
                <SecondaryButton label="Back" onClick={onClosePanel} variant="dark" icon="backArrow" />
                <OrderButtonController isSummaryVisible={true} onCompleteClick={onCompleteOrder} onReviewClick={() => {}} />
            </div>
        ),
    };

    const defaultFooter = (
        <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]">
            <OverviewButton onClick={onReviewClick} isDesktop={isDesktop} isOpen={false} />
            <OrderButtonController isSummaryVisible={false} onReviewClick={onReviewClick} onCompleteClick={onCompleteOrder} />
        </div>
    );
    
    return (
        <footer className="flex-shrink-0 bg-[#161616] flex items-center justify-start pb-[20px] px-[14px] pt-[10px]">
            {openPanelName ? panelFooterMap[openPanelName] : defaultFooter}
        </footer>
    );
};


// --- Breakpoint Hook (Included directly in the file) ---
const useBreakpoint = (breakpoint = '1024px') => {
    const query = `(min-width: ${breakpoint})`;
    const getInitialState = () => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    };
    const [isMatch, setIsMatch] = useState(getInitialState);
    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const handleBreakpointChange = (event) => {
            setIsMatch(event.matches);
        };
        mediaQueryList.addEventListener('change', handleBreakpointChange);
        return () => {
            mediaQueryList.removeEventListener('change', handleBreakpointChange);
        };
    }, [query]);
    return isMatch;
};

const OverviewDesktop = ({ configuration }) => {
    const [agnosticAccordionOpen, setAgnosticAccordionOpen] = useState(false);
    const dataSources = { buildOptions: buildOptionsData, leatherOptions: leatherOptions };

    useEffect(() => {
        if (!agnosticAccordionOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setAgnosticAccordionOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [agnosticAccordionOpen]);

    return (
        <div
            className="
            flex
            lg:absolute lg:bottom-[60px] lg:right-[60px]
            fixed w-full bottom-[-1rem] flex-row items-center gap-4
            lg:flex-col lg:justify-end lg:w-auto lg:h-auto lg:gap-0
            "
        >
            <div
                className="
                lg:w-[400px]
                text-[#999999] font-black text-[1.3rem] my-0 lg:mb-2.5 mx-0
                flex flex-col justify-end
                lg:h-auto h-[80.8vh]
                "
            >
                <OverviewButton
                    onClick={() => setAgnosticAccordionOpen(!agnosticAccordionOpen)}
                    isDesktop={true}
                    isOpen={agnosticAccordionOpen}
                />

                <div className={`bg-[#222222] transition-[height] duration-300 ease-in ${agnosticAccordionOpen ? 'overflow-y-scroll h-auto lg:h-[calc(100vh-335px)]' : 'overflow-hidden h-0'}`}>
                    <div className="text-base py-3.5 px-6">
                        <div>
                            <OrderSummaryInfo configuration={configuration} dataSources={dataSources} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:w-[400px] w-full self-end mb-[1.9rem] mr-[2.5rem] lg:m-0 z-[1]">
                <OrderButtonController
                    isSummaryVisible={agnosticAccordionOpen}
                    onReviewClick={() => setAgnosticAccordionOpen(true)}
                    onCompleteClick={() => alert('Proceeding to next step...')}
                />
            </div>
        </div>
    );
};

// --- NEW ABSTRACTION: AccordionDesktop ---
const AccordionDesktop = ({
    configuration,
    handleBuildConfigChange,
    handleColorSelect,
    handleDualColorSelect,
    handleApplyColorToAll,
    handleTextOptionChange,
}) => {
    const [openAccordion, setOpenAccordion] = useState('build');
    const [isAccordionScrolled, setIsAccordionScrolled] = useState(false);
    const accordionContainerRef = useRef(null);
    const [isTopGradientVisibleDesktop, setTopGradientVisibleDesktop] = useState(false);
    const [isBottomGradientVisibleDesktop, setBottomGradientVisibleDesktop] = useState(false);

    const handleAccordionToggle = (accordionId) => {
        setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
    };

    const checkAndSetGradientsDesktop = useCallback(() => {
        const element = accordionContainerRef.current;
        if (!element) return;
        const hasOverflow = element.scrollHeight > element.clientHeight;
        if (hasOverflow) {
            const isAtTop = element.scrollTop === 0;
            const isAtBottom = Math.ceil(element.scrollTop) + element.clientHeight >= element.scrollHeight;
            setTopGradientVisibleDesktop(!isAtTop);
            setBottomGradientVisibleDesktop(!isAtBottom);
        } else {
            setTopGradientVisibleDesktop(false);
            setBottomGradientVisibleDesktop(false);
        }
    }, []);

    useEffect(() => {
        checkAndSetGradientsDesktop();
    }, [checkAndSetGradientsDesktop, openAccordion]);

    useEffect(() => {
        const desktopHandler = checkAndSetGradientsDesktop;
        window.addEventListener('resize', desktopHandler);
        const desktopElement = accordionContainerRef.current;
        if (desktopElement) {
            desktopElement.addEventListener('scroll', desktopHandler);
        }
        return () => {
            window.removeEventListener('resize', desktopHandler);
            if (desktopElement) {
                desktopElement.removeEventListener('scroll', desktopHandler);
            }
        };
    }, [checkAndSetGradientsDesktop]);

    useEffect(() => {
        const handleAccordionScroll = () => {
            if (accordionContainerRef.current) {
                const { scrollTop } = accordionContainerRef.current;
                setIsAccordionScrolled(scrollTop > 0);
            }
        };

        const element = accordionContainerRef.current;
        if (element) {
            element.addEventListener('scroll', handleAccordionScroll);
        }

        return () => {
            if (element) {
                element.removeEventListener('scroll', handleAccordionScroll);
            }
        };
    }, []);

    const colorParts = [
        { id: 'thumb', title: 'Thumb Color' },
        { id: 'index', title: 'Index Color' },
        { id: 'middle', title: 'Middle Color' },
        { id: 'ring', title: 'Ring Color' },
        { id: 'pinky', title: 'Pinky Color' },
    ];

    return (
        <div className="absolute top-0 left-0 bottom-0 w-[400px] z-10 bg-[#161616] p-4 pointer-events-none">
            <div className="absolute w-[70px] h-[49px] bg-gray-300 bg-opacity-75 flex items-center justify-center pointer-events-auto"><p className="font-bold text-xl text-gray-900">LOGO</p></div>
            <div
                className={`absolute ${isAccordionScrolled ? 'top-[82px]' : 'top-[142px]'} bottom-4 left-4 right-4 pointer-events-auto pr-2 transition-all duration-30 ease-in-out overflow-hidden`}
            >
                <ScrollGradient position="top" isVisible={isTopGradientVisibleDesktop} />
                <div ref={accordionContainerRef} className="h-full overflow-y-auto space-y-4">
                    <BuildOptionDesktop
                        isOpen={openAccordion === 'build'}
                        onToggle={() => handleAccordionToggle('build')}
                        buildConfig={configuration.build}
                        onBuildConfigChange={handleBuildConfigChange}
                        headerContent={<span className="text-sm text-gray-400">Modify</span>}
                    />

                    {colorParts.map(part => {
                        const isDual = typeof configuration[part.id] === 'object';
                        if (isDual) {
                            return (
                                <ColorDualOptionDesktop
                                    key={part.id}
                                    title={part.title}
                                    isOpen={openAccordion === part.id}
                                    onToggle={() => handleAccordionToggle(part.id)}
                                    colorValue={configuration[part.id]}
                                    onColorSelect={(subPart, color) => handleDualColorSelect(part.id, subPart, color)}
                                    onApplyToAll={handleApplyColorToAll}
                                    headerAccessory={
                                        <div className="flex items-center space-x-2">
                                            <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: configuration[part.id].inner }}></span>
                                            <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: configuration[part.id].outer }}></span>
                                        </div>
                                    }
                                />
                            );
                        } else {
                            return (
                                <ColorOptionDesktop
                                    key={part.id}
                                    title={part.title}
                                    isOpen={openAccordion === part.id}
                                    onToggle={() => handleAccordionToggle(part.id)}
                                    colorValue={configuration[part.id]}
                                    onColorSelect={(color) => handleColorSelect(color, part.id)}
                                    onApplyToAll={() => handleApplyColorToAll(configuration[part.id])}
                                    headerAccessory={<span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: configuration[part.id] }}></span>}
                                />
                            );
                        }
                    })}

                    <TextOptionDesktop
                        title="Thumb Name"
                        isOpen={openAccordion === 'thumbName'}
                        onToggle={() => handleAccordionToggle('thumbName')}
                        value={configuration.thumbName}
                        onChange={(newState) => handleTextOptionChange(newState, 'thumbName')}
                        headerContent={<span className="text-sm text-gray-400 truncate max-w-[100px]">{configuration.thumbName.text}</span>}
                    />

                    <TextOptionDesktop
                        title="Pinky Name"
                        isOpen={openAccordion === 'pinkyName'}
                        onToggle={() => handleAccordionToggle('pinkyName')}
                        value={configuration.pinkyName}
                        onChange={(newState) => handleTextOptionChange(newState, 'pinkyName')}
                        headerContent={<span className="text-sm text-gray-400 truncate max-w-[100px]">{configuration.pinkyName.text}</span>}
                    />
                </div>
                <ScrollGradient position="bottom" isVisible={isBottomGradientVisibleDesktop} />
            </div>
        </div>
    );
};

// --- NEW ABSTRACTION: AccordionMobile ---
const AccordionMobile = ({
    configuration,
    handleOpenBuildOption,
    handleOpenColorPicker,
    handleOpenDualColorPicker,
    handleOpenTextOption,
    openAccordionOptionMobile
}) => {
    const listContainerRef = useRef(null);
    const [topGradientVisible, setTopGradientVisible] = useState(false);
    const [bottomGradientVisible, setBottomGradientVisible] = useState(false);

    const checkAndSetGradients = useCallback(() => {
        const listElement = listContainerRef.current;
        if (!listElement) return;
        const hasOverflow = listElement.scrollHeight > listElement.clientHeight;
        if (hasOverflow) {
            const isAtTop = listElement.scrollTop === 0;
            const isAtBottom = Math.ceil(listElement.scrollTop) + listElement.clientHeight >= listElement.scrollHeight;
            setTopGradientVisible(!isAtTop);
            setBottomGradientVisible(!isAtBottom);
        } else {
            setTopGradientVisible(false);
            setBottomGradientVisible(false);
        }
    }, []);

    useEffect(() => {
        checkAndSetGradients();
    }, [checkAndSetGradients, openAccordionOptionMobile]);

    useEffect(() => {
        const mobileHandler = checkAndSetGradients;
        window.addEventListener('resize', mobileHandler);
        const mobileElement = listContainerRef.current;
        if (mobileElement) {
            mobileElement.addEventListener('scroll', mobileHandler);
        }
        return () => {
            window.removeEventListener('resize', mobileHandler);
            if (mobileElement) {
                mobileElement.removeEventListener('scroll', mobileHandler);
            }
        };
    }, [checkAndSetGradients]);
    
    const optionItems = [
        { id: 'build', title: 'Build', type: 'build' },
        { id: 'thumb', title: 'Thumb', type: 'color' },
        { id: 'index', title: 'Index', type: 'color' },
        { id: 'middle', title: 'Middle', type: 'color' },
        { id: 'ring', title: 'Ring', type: 'color' },
        { id: 'pinky', title: 'Pinky', type: 'color' },
        { id: 'thumbName', title: 'Thumb Name', type: 'text' },
        { id: 'pinkyName', title: 'Pinky Name', type: 'text' },
    ];

    return (
        <section
            ref={listContainerRef}
            className={`px-4 bg-[#161616] h-full overflow-y-auto ${openAccordionOptionMobile ? 'opacity-50 pointer-events-none' : ''}`}
            tabIndex="-1"
        >
            <ScrollGradient position="top" isVisible={topGradientVisible} />

            {optionItems.map(item => {
                const isDual = typeof configuration[item.id] === 'object' && item.type === 'color';

                if (item.type === 'build') {
                    return (
                        <button key={item.id} data-id={item.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => handleOpenBuildOption('build', 'Build Options')}>
                            <div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">{item.title}</span></div>
                            <span className="text-sm text-gray-400">Modify</span>
                        </button>
                    );
                }

                if (item.type === 'color') {
                    if (isDual) {
                         return (
                            <button key={item.id} data-id={item.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => handleOpenDualColorPicker(item.id, `${item.title} Color`)}>
                                <div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">{item.title}</span></div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration[item.id].inner }}></span>
                                    <span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration[item.id].outer }}></span>
                                </div>
                            </button>
                        );
                    } else {
                        return (
                             <button key={item.id} data-id={item.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => handleOpenColorPicker(item.id, `${item.title} Color`)}>
                                <div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">{item.title}</span></div>
                                <span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration[item.id] }}></span>
                            </button>
                        );
                    }
                }

                if (item.type === 'text') {
                    return (
                        <button key={item.id} data-id={item.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => handleOpenTextOption(item.id, item.title)}>
                            <div className="flex items-center"><svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg><span className="text-lg">{item.title}</span></div>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-400 truncate max-w-[100px]">{configuration[item.id].text}</span>
                                <span className="w-6 h-6 rounded-full" style={{ backgroundColor: configuration[item.id].color }}></span>
                            </div>
                        </button>
                    );
                }
                return null;
            })}
            
            <ScrollGradient position="bottom" isVisible={bottomGradientVisible} />
        </section>
    );
};


// --- Main UI Component ---
const UI = () => {
    const isDesktop = useBreakpoint();

    const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
    const [openAccordionOptionMobile, setOpenAccordionOptionMobile] = useState(null);
    const [mobileLastEditedSubPart, setMobileLastEditedSubPart] = useState(null);

    const [configuration, setConfiguration] = useState({
        build: {
            imageSelection: 'imgOpt1',
            position: 'OUTFIELD',
            size: '11"',
            handOpeningSize: 'ADULT',
            stiffness: 'STANDARD',
            throwingHand: 'RIGHT HAND'
        },
        thumb: { inner: '#C62828', outer: '#2E7D32' },
        index: '#1565C0',
        middle: { inner: '#2E7D32', outer: '#C62828' },
        ring: { inner: '#F9A825', outer: '#6A1B9A' },
        pinky: { inner: '#6A1B9A', outer: '#F9A825' },
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

    const handleOpenColorPicker = (optionId, optionTitle) => {
        setOpenAccordionOptionMobile({ name: 'color', context: { id: optionId, title: optionTitle } });
    };

    const handleOpenDualColorPicker = (optionId, optionTitle) => {
        setMobileLastEditedSubPart(null); // Reset on open for default behavior
        setOpenAccordionOptionMobile({ name: 'dual-color', context: { id: optionId, title: optionTitle } });
    };

    const handleColorSelect = (color, contextId) => {
        if (contextId) {
            setConfiguration(prev => ({ ...prev, [contextId]: color }));
        }
    };
    
    const handleDualColorSelect = (partId, subPartId, newColor) => {
        setConfiguration(prev => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                [subPartId]: newColor
            }
        }));
    };

    const handleApplyColorToAll = (colorToApply) => {
        let activeColor = colorToApply;

        if (!activeColor && openAccordionOptionMobile) {
            const contextId = openAccordionOptionMobile.context.id;
            const configValue = configuration[contextId];

            if (openAccordionOptionMobile.name === 'color') {
                activeColor = configValue;
            } else if (openAccordionOptionMobile.name === 'dual-color') {
                activeColor = mobileLastEditedSubPart === 'outer' ? configValue.outer : configValue.inner;
            }
        }
        
        if (activeColor) {
             setConfiguration(prev => {
                const newConfig = { ...prev };
                ['thumb', 'index', 'middle', 'ring', 'pinky'].forEach(partId => {
                    if (typeof newConfig[partId] === 'object') {
                        newConfig[partId] = {
                            inner: activeColor,
                            outer: activeColor
                        };
                    } else {
                        newConfig[partId] = activeColor;
                    }
                });
                return newConfig;
            });
        }
    };


    const handleOpenBuildOption = (optionId, optionTitle) => {
        setOpenAccordionOptionMobile({ name: 'build', context: { id: optionId, title: optionTitle } });
    };

    const handleBuildConfigChange = (newBuildData) => {
        setConfiguration(prev => ({...prev, build: newBuildData}));
    };

    const handleOpenTextOption = (optionId, optionTitle) => {
        setOpenAccordionOptionMobile({ name: 'text', context: { id: optionId, title: optionTitle } });
    };

    const handleTextOptionChange = (newTextData, contextId) => {
        if (contextId) {
            setConfiguration(prev => ({...prev, [contextId]: newTextData}));
        }
    };

    const GOLDEN_RATIO_CONSTANT = 1.618;
    const VIZ_PROPORTION = 1 / GOLDEN_RATIO_CONSTANT;
    const CONTROLS_PROPORTION = 1 - VIZ_PROPORTION;

    const handleShare = useCallback(async () => {
        const configUrl = `${window.location.origin}?config=${encodeURIComponent(JSON.stringify(configuration))}`;
        const shareData = {
            title: 'My Custom Glove',
            text: 'Check out the glove I designed!',
            url: configUrl,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(configUrl);
                alert('Sharable link copied to clipboard!');
            } catch (err) {
                alert('Failed to copy link.');
            }
        }
    }, [configuration]);

    return (
        <div className="flex flex-col lg:relative h-[100dvh] bg-[#161616] text-white">
            <main className={`p-4 flex flex-col items-center justify-center relative bg-[#161616] overflow-auto h-full w-full ${ isVisualizationExpanded ? 'flex-grow' : 'lg:absolute lg:inset-0'}`} style={!isDesktop && !isVisualizationExpanded ? { flexBasis: `${VIZ_PROPORTION * 100}%` } : {}}>
                { !isDesktop && <div className="absolute top-[20px] left-[20px] w-[70px] h-[49px] bg-gray-300 bg-opacity-75 z-10 flex items-center justify-center"><p className="font-bold text-xl text-gray-900">LOGO</p></div> }
                <button
                    className="absolute top-[20px] right-[20px] z-20 p-2 hover:bg-gray-800 hover:bg-opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
                    aria-label="Share configuration"
                    onClick={handleShare}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[31px] h-[31px] text-[#FFFFFF]"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
                <img src={`${process.env.PUBLIC_URL}/gloves.png`} alt="Glove Visualization" className="object-contain max-w-full max-h-full z-0" />
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-between text-xs z-10">
                    {!isDesktop && <button className="p-1 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer ml-[14px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => setIsVisualizationExpanded(!isVisualizationExpanded)} aria-label={isVisualizationExpanded ? "Collapse visualization" : "Expand visualization"}>
                        {isVisualizationExpanded ? ( <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M17.3176 3.39899C16.9681 3.39899 16.6330 3.53795 16.3856 3.78514C16.1386 4.03232 15.9997 4.3675 15.9997 4.71725V10.3042C15.9997 10.9906 16.5561 11.547 17.2424 11.547L22.8324 11.547C23.1819 11.547 23.5173 11.408 23.7644 11.1609C24.0116 10.9139 24.1505 10.5785 24.1505 10.229C24.1505 9.87922 24.0116 9.54402 23.7644 9.29685C23.5173 9.04967 23.1819 8.9107 22.8324 8.9107H20.501L27.167 2.24612C27.4123 1.99854 27.5496 1.66397 27.5488 1.31541C27.5482 0.966682 27.4093 0.632697 27.1629 0.386154C26.9164 0.139575 26.5824 0.000809714 26.2337 1.87161e-06C25.8852 -0.000604998 25.5505 0.136743 25.3029 0.382111L18.6359 7.04824V4.71693C18.6359 4.36719 18.4969 4.03199 18.2498 3.78482C18.0026 3.53764 17.6673 3.39899 17.3176 3.39899Z" fill="white"/><path d="M24.1489 17.3166C24.1489 16.9671 24.0099 16.632 23.7627 16.3846C23.5155 16.1377 23.1804 15.9987 22.8306 15.9987H17.2437C16.5573 15.9987 16.0008 16.5551 16.0008 17.2414V22.8314C16.0008 23.1809 16.1398 23.5163 16.387 23.7634C16.634 24.0106 16.9694 24.1496 17.3189 24.1496C17.6686 24.1496 18.0038 24.0106 18.251 23.7634C18.4982 23.5163 18.6372 23.1809 18.6372 22.8314V20.5L25.3017 27.166C25.5493 27.4113 25.8839 27.5487 26.2324 27.5478C26.5812 27.5472 26.9152 27.4083 27.1617 27.1619C27.4083 26.9154 27.547 26.5814 27.5478 26.2328C27.5485 25.8843 27.4111 25.5495 27.1657 25.3019L20.4996 18.6349H22.8309C23.1807 18.6349 23.5159 18.496 23.763 18.2488C24.0102 18.0016 24.1489 17.6664 24.1489 17.3166Z" fill="white"/><path d="M10.2312 24.1479C10.5807 24.1479 10.9159 24.0089 11.1632 23.7617C11.4102 23.5146 11.5491 23.1794 11.5491 22.8296V17.2427C11.5491 16.5563 10.9928 15.9999 10.3064 15.9999H4.71642C4.36691 15.9999 4.03154 16.1388 3.7844 16.386C3.53724 16.633 3.39829 16.9684 3.39829 17.3179C3.39829 17.6677 3.53724 18.0029 3.7844 18.25C4.03156 18.4972 4.36691 18.6362 4.71642 18.6362H7.04786L0.381872 25.3008C0.136529 25.5483 -0.0008042 25.8829 3.54305e-06 26.2315C0.000610281 26.5802 0.139565 26.9142 0.385917 27.1607C0.632472 27.4073 0.966407 27.5461 1.31508 27.5469C1.66358 27.5475 1.9983 27.4101 2.24591 27.1648L8.91293 20.4986V22.8299C8.91293 23.1797 9.05189 23.5149 9.29905 23.7621C9.54621 24.0092 9.88149 24.1479 10.2312 24.1479Z" fill="white"/><path d="M3.39996 10.2302C3.39996 10.5797 3.53893 10.9149 3.78612 11.1622C4.0333 11.4092 4.36848 11.5482 4.71822 11.5482L10.3052 11.5482C10.9916 11.5482 11.548 10.9918 11.548 10.3055L11.548 4.71544C11.548 4.36594 11.409 4.03057 11.1618 3.78343C10.9149 3.53627 10.5795 3.39731 10.2299 3.39731C9.88019 3.39731 9.54499 3.53627 9.29783 3.78343C9.05064 4.03059 8.91168 4.36594 8.91168 4.71544V7.04688L2.2471 0.380895C1.99951 0.135552 1.66495 -0.00178075 1.31639 -0.00097302C0.967659 -0.000366296 0.633674 0.138588 0.387132 0.384941C0.140553 0.631495 0.00178728 0.96543 0.00097943 1.31411C0.000372556 1.6626 0.137721 1.99733 0.383088 2.24493L7.04922 8.91195H4.71791C4.36817 8.91195 4.03296 9.05091 3.7858 9.29807C3.53861 9.54523 3.39996 9.88052 3.39996 10.2302Z" fill="white"/></svg>
                        ) : ( <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M28 1.24271C28 0.556382 27.4436 0 26.7572 0H21.1692C20.8195 0 20.4843 0.138953 20.2371 0.386114C19.9899 0.633274 19.851 0.968417 19.851 1.31792C19.851 1.66763 19.9899 2.0028 20.2371 2.24994C20.4843 2.4971 20.8195 2.63605 21.1692 2.63605H23.4991L16.8345 9.30049C16.5891 9.54805 16.4518 9.88279 16.4524 10.2313C16.4532 10.58 16.5920 10.914 16.8385 11.1605C17.0851 11.4068 17.4191 11.5456 17.7678 11.5464C18.1163 11.5472 18.4509 11.4099 18.6985 11.1645L25.3636 4.49957V6.83184C25.3636 7.18135 25.5024 7.51672 25.7498 7.76386C25.9969 8.01102 26.3321 8.14997 26.6819 8.14997C27.0314 8.14997 27.3666 8.01102 27.6138 7.76386C27.861 7.5167 27.9999 7.18135 27.9999 6.83184L28 1.24271Z" fill="white"/><path d="M11.1656 16.8327C10.9184 16.5856 10.5831 16.4468 10.2335 16.4468C9.88397 16.4468 9.54857 16.5856 9.30141 16.8327L2.63631 23.4992V21.167C2.63631 20.8175 2.49735 20.4821 2.25016 20.235C2.00298 19.9878 1.6678 19.8488 1.31805 19.8488C0.968513 19.8488 0.633316 19.9878 0.386152 20.235C0.138967 20.4821 0 20.8175 0 21.167V26.7565C0 27.4428 0.556426 27.9992 1.24281 27.9992H6.82977C7.17931 27.9992 7.51471 27.8602 7.76187 27.6133C8.00906 27.3661 8.14803 27.0307 8.14803 26.6812C8.14803 26.3315 8.00906 25.9964 7.76187 25.7492C7.51469 25.5021 7.17931 25.3631 6.82977 25.3631H4.49929L11.1654 18.6966C11.4126 18.4492 11.5514 18.1141 11.5514 17.7646C11.5514 17.4151 11.4126 17.0797 11.1654 16.8326L11.1656 16.8327Z" fill="white"/><path d="M19.8508 26.6821C19.8508 27.0316 19.9898 27.3667 20.237 27.6141C20.4841 27.861 20.8193 28 21.1691 28H26.756C27.4424 28 27.9988 27.4436 27.9988 26.7573V21.1673C27.9988 20.8178 27.8599 20.4824 27.6127 20.2353C27.3657 19.9881 27.0303 19.8492 26.6808 19.8492C26.331 19.8492 25.9958 19.8881 25.7487 20.2353C25.5015 20.4824 25.3625 20.8178 25.3625 21.1673V23.4987L18.6979 16.8327C18.4503 16.5874 18.1158 16.4501 17.7672 16.4509C17.4185 16.4515 17.0845 16.5904 16.838 16.8368C16.5914 17.0833 16.4526 17.4173 16.4518 17.7659C16.4512 18.1144 16.5886 18.4492 16.8339 18.6968L23.5001 25.3638H21.1687C20.819 25.3638 20.4838 25.5027 20.2366 25.7499C19.9895 25.9971 19.8505 26.3322 19.8505 26.6819L19.8508 26.6821Z" fill="white"/><path d="M11.1656 9.30049L4.50001 2.63605H6.82987C7.17941 2.63605 7.51481 2.4971 7.76198 2.24994C8.00916 2.00278 8.14813 1.66764 8.14813 1.31792C8.14813 0.968417 8.00916 0.633253 7.76198 0.386114C7.51479 0.138953 7.17941 0 6.82987 0H1.24292C0.55653 0 0.000103511 0.55637 0.000103511 1.24269V6.8322C0.000103511 7.1817 0.139071 7.51707 0.386255 7.76421C0.63344 8.01137 0.968616 8.15033 1.31816 8.15033C1.6679 8.15033 2.0031 8.01137 2.25027 7.76421C2.49745 7.51705 2.63642 7.1817 2.63642 6.8322V4.49993L9.30151 11.1649C9.5491 11.4102 9.88387 11.5476 10.2324 11.5467C10.5812 11.5459 10.9151 11.4072 11.1617 11.1608C11.4081 10.9143 11.5468 10.5803 11.5476 10.2317C11.5484 9.88317 11.4111 9.54845 11.1657 9.30084L11.1656 9.30049Z" fill="white"/> </svg>
                        )}
                    </button>}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5 text-gray-400">
                            <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path fillRule="evenodd" clipRule="evenodd" d="M13.9645 16.8222L11.6787 19.1079C11.3445 19.4429 11.3445 19.9857 11.6787 20.3204L13.9645 22.6062C14.2994 22.9404 14.8423 22.9404 15.177 22.6062C15.5112 22.2712 15.5112 21.7284 15.177 21.3937L13.4968 19.7143L15.177 18.0349C15.5112 17.7 15.5112 17.1572 15.177 16.8225C14.842 16.4883 14.2992 16.4883 13.9645 16.8225V16.8222Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M16.8217 14.0355L19.1074 16.3213C19.4424 16.6555 19.9852 16.6555 20.3199 16.3213L22.6057 14.0355C22.9399 13.7006 22.9399 13.1577 22.6057 12.823C22.2707 12.4888 21.7279 12.4888 21.3932 12.823L19.7138 14.5032L18.0344 12.823C17.6995 12.4888 17.1566 12.4888 16.8219 12.823C16.4877 13.158 16.4877 13.7008 16.8219 14.0355H16.8217Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M8.91752 18.3994C6.3032 17.9039 4.15009 17.0485 2.85341 15.9501C2.1539 15.3575 1.71386 14.7118 1.71386 14.0003C1.71386 12.9901 2.55339 12.1214 3.83099 11.3638C6.12361 10.0044 9.82882 9.14309 14 9.14309C18.171 9.14309 21.8761 10.0044 24.169 11.3638C25.4468 12.1215 26.2861 12.9901 26.2861 14.0003C26.2861 15.0106 25.4466 15.8792 24.169 16.6369C21.8764 17.9963 18.1712 18.8576 14 18.8576H12.2857C11.8125 18.8576 11.4285 19.2415 11.4285 19.7147C11.4285 20.1879 11.8125 20.5719 12.2857 20.5719H14C18.5338 20.5719 22.5507 19.5895 25.0428 18.1114C26.9561 16.9772 28 15.5136 28 14.0003C28 12.487 26.9561 11.0237 25.0428 9.88929C22.5507 8.41093 18.5335 7.42878 14 7.42878C9.4665 7.42878 5.44931 8.41119 2.95718 9.88929C1.04387 11.0235 0 12.487 0 14.0003C0 15.1644 0.600521 16.2884 1.74567 17.2581C3.21534 18.5027 5.6355 19.5221 8.59902 20.0839C9.06357 20.1719 9.5128 19.8663 9.60083 19.401C9.68885 18.9364 9.38323 18.4872 8.91791 18.3992L8.91752 18.3994Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M18.3988 19.0825C17.9034 21.6968 17.048 23.8499 15.9496 25.1466C15.3569 25.8461 14.7113 26.2861 13.9998 26.2861C12.9896 26.2861 12.1209 25.4466 11.3633 24.169C10.0038 21.8764 9.14257 18.1712 9.14257 14C9.14257 9.82902 10.0038 6.12393 11.3633 3.83099C12.121 2.55319 12.9896 1.71386 13.9998 1.71386C15.01 1.71386 15.8787 2.55339 16.6363 3.83099C17.9958 6.12361 18.857 9.82882 18.857 14V15.7143C18.857 16.1875 19.241 16.5715 19.7142 16.5715C20.1874 16.5715 20.5714 16.1875 20.5714 15.7143V14C20.5714 9.46623 19.5889 5.44931 18.1108 2.95718C16.9766 1.04387 15.5131 0 13.9998 0C12.4865 0 11.0232 1.04387 9.88877 2.95718C8.41041 5.44931 7.42825 9.4665 7.42825 14C7.42825 18.5335 8.41067 22.5507 9.88877 25.0428C11.023 26.9561 12.4865 28 13.9998 28C15.1638 28 16.2878 27.3995 17.2575 26.2543C18.5022 24.7847 19.5216 22.3645 20.0834 19.401C20.1714 18.9364 19.8658 18.4872 19.4005 18.3992C18.9359 18.3112 18.4867 18.6168 18.3986 19.0821L18.3988 19.0825Z" fill="currentColor"/></svg><span>Drag to Rotate</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-gray-400">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M17.7074 0.622701C13.7678 -0.849719 9.19902 0.35492 6.54529 3.54063C3.34439 7.42228 4.00108 12.4284 6.79166 15.7212C4.60296 17.8895 2.41426 20.0312 0.225712 22.1728C-0.0752372 22.4673 -0.0752372 22.976 0.225712 23.2705L0.745564 23.7791C1.04651 24.0736 1.56636 24.0736 1.8673 23.7791C4.08325 21.6108 6.27195 19.4691 8.48796 17.3007C10.4851 18.7731 13.0568 19.5226 15.902 19.0407C20.6076 18.2375 23.8906 14.1952 24 9.59073C23.8905 5.62857 21.5102 2.06825 17.7076 0.622653L17.7074 0.622701ZM14.1783 17.6219C9.69157 17.6219 5.97086 13.9544 5.97086 9.59078C5.97086 5.20044 9.71888 1.53289 14.1783 1.55966C18.7471 1.55966 22.3037 5.20044 22.3857 9.59078C22.2762 13.9811 18.7471 17.6219 14.1783 17.6219Z" fill="currentColor"/><path d="M14.7527 4.2367H13.3848V8.92152H8.81601V10.26H13.3848V14.9449H14.7527V10.26H19.7593V8.92152H14.7527V4.2367Z" fill="currentColor"/></svg><span>Pinch to Zoom</span>
                        </div>
                    </div>
                    <div className="p-1 w-7 h-7" aria-hidden="true"></div>
                </div>
            </main>

            {!isVisualizationExpanded && (
                isDesktop ? (
                    <>
                        <AccordionDesktop
                            configuration={configuration}
                            handleBuildConfigChange={handleBuildConfigChange}
                            handleColorSelect={handleColorSelect}
                            handleDualColorSelect={handleDualColorSelect}
                            handleApplyColorToAll={handleApplyColorToAll}
                            handleTextOptionChange={handleTextOptionChange}
                        />
                        <OverviewDesktop configuration={configuration} />
                    </>
                ) : (
                    <div className="flex flex-col overflow-hidden bg-[#161616]" style={{ flexBasis: `${CONTROLS_PROPORTION * 100}%` }}>
                        <div className="relative flex-grow overflow-hidden">

                            <AccordionMobile
                                configuration={configuration}
                                handleOpenBuildOption={handleOpenBuildOption}
                                handleOpenColorPicker={handleOpenColorPicker}
                                handleOpenDualColorPicker={handleOpenDualColorPicker}
                                handleOpenTextOption={handleOpenTextOption}
                                openAccordionOptionMobile={openAccordionOptionMobile}
                            />

                            {openAccordionOptionMobile && (
                                <div className="absolute inset-0 z-30 flex flex-col bg-[#161616] pt-[10px]">
                                    <div className="flex-grow relative overflow-hidden">
                                        {openAccordionOptionMobile.name === 'summary' && <OverviewMobile onClose={() => setOpenAccordionOptionMobile(null)} configuration={configuration} />}
                                        {openAccordionOptionMobile.name === 'color' && <ColorOptionMobile onClose={() => setOpenAccordionOptionMobile(null)} editingColorContext={openAccordionOptionMobile.context} selectedColor={openAccordionOptionMobile.context ? configuration[openAccordionOptionMobile.context.id] : ''} onColorSelect={(color) => handleColorSelect(color, openAccordionOptionMobile.context.id)} />}
                                        {openAccordionOptionMobile.name === 'dual-color' && <ColorDualOptionMobile onClose={() => setOpenAccordionOptionMobile(null)} editingColorContext={openAccordionOptionMobile.context} colorValue={openAccordionOptionMobile.context ? configuration[openAccordionOptionMobile.context.id] : {}} onColorSelect={(subPartId, color) => handleDualColorSelect(openAccordionOptionMobile.context.id, subPartId, color)} onSubPartEdit={setMobileLastEditedSubPart} />}
                                        {openAccordionOptionMobile.name === 'build' && <BuildOptionMobile onClose={() => setOpenAccordionOptionMobile(null)} editingBuildContext={openAccordionOptionMobile.context} buildConfig={configuration.build} onBuildConfigChange={handleBuildConfigChange} />}
                                        {openAccordionOptionMobile.name === 'text' && <TextOptionMobile onClose={() => setOpenAccordionOptionMobile(null)} editingTextContext={openAccordionOptionMobile.context} value={openAccordionOptionMobile.context ? configuration[openAccordionOptionMobile.context.id] : null} onChange={(newState) => handleTextOptionChange(newState, openAccordionOptionMobile.context.id)} />}
                                    </div>
                                    <FooterMobile
                                        openPanelName={openAccordionOptionMobile?.name}
                                        onApplyColorToAll={() => handleApplyColorToAll(null)}
                                        onClosePanel={() => setOpenAccordionOptionMobile(null)}
                                        onCompleteOrder={() => alert('Complete Order clicked!')}
                                        onReviewClick={() => setOpenAccordionOptionMobile({ name: 'summary' })}
                                        isDesktop={isDesktop}
                                    />
                                </div>
                            )}
                        </div>

                        {!openAccordionOptionMobile && (
                            <FooterMobile
                                openPanelName={null}
                                onReviewClick={() => setOpenAccordionOptionMobile({ name: 'summary' })}
                                onCompleteOrder={() => alert('Complete Order clicked!')}
                                isDesktop={isDesktop}
                            />
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default UI;