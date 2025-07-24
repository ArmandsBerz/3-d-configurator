import React, { useState, useRef, useLayoutEffect, useCallback, useEffect, createContext, useContext, useReducer, ReactNode, ReactElement } from 'react';

// --- START: Core Type Definitions ---

type HexColor = string;
type Font = 'SCRIPT' | 'BLOCK';

type SingleColorPart = { type: 'single'; color: HexColor };
type DualColorPart = { type: 'dual'; inner: HexColor; outer: HexColor };
type WebPart = { type: 'web'; webType: string; color: HexColor };
type TextPart = { type: 'text'; text: string; font: Font; color: HexColor };
type ColorablePart = SingleColorPart | DualColorPart | WebPart | TextPart;

interface BuildConfig {
    imageSelection: 'imgOpt1' | 'imgOpt2';
    position: 'INFIELD' | 'OUTFIELD' | 'PITCHER' | 'CATCHER' | 'FIRST BASE';
    size: '11"' | '11.25"' | '11.5"' | '11.75"' | '12"';
    handOpeningSize: 'ADULT' | 'YOUTH';
    stiffness: 'STIFF' | 'STANDARD' | 'SOFT';
    throwingHand: 'RIGHT HAND' | 'LEFT HAND';
}

interface GloveConfiguration {
    build: BuildConfig;
    web: WebPart;
    thumb: DualColorPart;
    index: SingleColorPart;
    middle: DualColorPart;
    ring: DualColorPart;
    pinky: DualColorPart;
    thumbName: TextPart;
    pinkyName: TextPart;
}

interface AppState {
    configuration: GloveConfiguration;
    activeDualColorPart: (typeof DUAL_COLOR_SUB_PARTS)[keyof typeof DUAL_COLOR_SUB_PARTS];
}

type GloveAction =
    | { type: typeof ACTION_TYPES.UPDATE_BUILD; payload: BuildConfig }
    | { type: typeof ACTION_TYPES.UPDATE_COLOR; payload: { id: 'index'; color: HexColor } }
    | { type: typeof ACTION_TYPES.UPDATE_DUAL_COLOR; payload: { id: 'thumb' | 'middle' | 'ring' | 'pinky'; subPartId: (typeof DUAL_COLOR_SUB_PARTS)[keyof typeof DUAL_COLOR_SUB_PARTS]; color: HexColor } }
    | { type: typeof ACTION_TYPES.UPDATE_GALLERY; payload: WebPart }
    | { type: typeof ACTION_TYPES.UPDATE_TEXT; payload: { id: 'thumbName' | 'pinkyName'; data: TextPart } }
    | { type: typeof ACTION_TYPES.APPLY_COLOR_TO_ALL; payload: { color: HexColor } };

// --- END: Core Type Definitions ---

// --- START: ADD NEW PANEL PROP TYPES ---
type ColorPartId = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
type TextPartId = 'thumbName' | 'pinkyName';
type GalleryPartId = 'web';

interface BuildPanelProps {
    context: { id: 'build'; title: string };
    onClose: () => void;
}
interface ColorPanelProps {
    context: { id: ColorPartId; title: string };
    onClose: () => void;
}
interface TextPanelProps {
    context: { id: TextPartId; title: string };
    onClose: () => void;
}
interface GalleryPanelProps {
    context: { id: GalleryPartId; title: string };
    onClose: () => void;
}
// --- END: ADD NEW PANEL PROP TYPES ---

// --- START: Application-Wide Constants ---

export const CONTENT_TYPES = {
  BUILD: 'build',
  GALLERY: 'gallery',
  COLOR: 'color',
  DUAL_COLOR: 'dual-color',
  TEXT: 'text',
  SUMMARY: 'summary',
} as const;

export const ACTION_TYPES = {
  UPDATE_BUILD: 'UPDATE_BUILD',
  UPDATE_COLOR: 'UPDATE_COLOR',
  UPDATE_DUAL_COLOR: 'UPDATE_DUAL_COLOR',
  UPDATE_GALLERY: 'UPDATE_GALLERY',
  UPDATE_TEXT: 'UPDATE_TEXT',
  APPLY_COLOR_TO_ALL: 'APPLY_COLOR_TO_ALL',
} as const;

export const DUAL_COLOR_SUB_PARTS = {
    INNER: 'inner',
    OUTER: 'outer',
} as const;

export const POSITIONS = {
    TOP: 'top',
    BOTTOM: 'bottom',
} as const;

export const VARIANTS = {
    THEME: {
        DARK: 'dark',
        LIGHT: 'light',
    },
    LAYOUT: {
        DESKTOP: 'desktop',
        MOBILE: 'mobile',
    },
} as const;

export const ICONS = {
    CHECKMARK: 'checkmark',
    BACK_ARROW: 'backArrow',
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
} as const;

export const FORMAT_TYPES = {
    DEFAULT: 'default',
    HEADER: 'header',
    SUMMARY: 'summary',
} as const;

export const NUMERIC_CONSTANTS = {
    SCROLL_THRESHOLD: 1,
    DESKTOP_BREAKPOINT: '1024px',
} as const;

// --- END: Application-Wide Constants ---

// --- Constants (Decoupled Data Sources) ---

const leatherOptions = [
    { id: 'imgOpt1', title: 'Japanese Kip' },
    { id: 'imgOpt2', title: 'American Steerhide' }
];

const fontOptions: { id: Font, label: string }[] = [
    { id: 'SCRIPT', label: 'SCRIPT' },
    { id: 'BLOCK', label: 'BLOCK' }
];

const colorSwatches: { name: string, hex: HexColor }[] = [
    { name: 'Red', hex: '#C62828' }, { name: 'Pink', hex: '#AD1457' }, { name: 'Purple', hex: '#6A1B9A' }, { name: 'Indigo', hex: '#4527A0' }, { name: 'Royal', hex: '#283593' }, { name: 'Blue', hex: '#1565C0' }, { name: 'Light Blue', hex: '#0277BD' }, { name: 'Teal', hex: '#00838F' }, { name: 'Green', hex: '#00695C' }, { name: 'Forest', hex: '#2E7D32' }, { name: 'Lime', hex: '#558B2F' }, { name: 'Olive', hex: '#9E9D24' }, { name: 'Gold', hex: '#F9A825' }, { name: 'Orange', hex: '#FF8F00' }, { name: 'Burnt Orange', hex: '#EF6C00' }, { name: 'Red Orange', hex: '#D84315' }, { name: 'Brown', hex: '#4E342E' }, { name: 'Charcoal', hex: '#424242' }, { name: 'Grey', hex: '#BDBDBD' }, { name: 'Slate', hex: '#37474F' },
];

const buildOptionsData = [
    { id: 'position', title: 'Position', options: [{id: 'INFIELD', label: 'INFIELD'}, {id: 'OUTFIELD', label: 'OUTFIELD'}, {id: 'PITCHER', label: 'PITCHER'}, {id: 'CATCHER', label: 'CATCHER'}, {id: 'FIRST BASE', label: 'FIRST BASE'}], layout: 'grid-cols-3' }, { id: 'size', title: 'Size', options: [{id: '11"', label: '11"'}, {id: '11.25"', label: '11.25"'}, {id: '11.5"', label: '11.5"'}, {id: '11.75"', label: '11.75"'}, {id: '12"', label: '12"'}], layout: 'grid-cols-3' }, { id: 'handOpeningSize', title: 'Hand Opening Size', options: [{id: 'ADULT', label: 'ADULT'}, {id: 'YOUTH', label: 'YOUTH'}], layout: 'grid-cols-2' }, { id: 'stiffness', title: 'Stiffness', options: [{id: 'STIFF', label: 'STIFF'}, {id: 'STANDARD', label: 'STANDARD'}, {id: 'SOFT', label: 'SOFT'}], layout: 'grid-cols-3' }, { id: 'throwingHand', title: 'Throwing Hand', options: [{id: 'RIGHT HAND', label: 'RIGHT HAND'}, {id: 'LEFT HAND', label: 'LEFT HAND'}], layout: 'grid-cols-2' }
];

const webTypeOptions = [
    { id: 'MOD_TRAP', title: 'MOD TRAP' }, { id: 'ONE_PIECE', title: 'ONE PIECE' }, { id: 'TWO_PIECE', title: 'TWO PIECE' }, { id: 'DUAL_HINGE', title: 'DUAL HINGE' }, { id: 'FRAMED_MOD_TRAP', title: 'FRAMED MOD TRAP' }, { id: 'CLOSED_V', title: 'CLOSED V' }, { id: 'BASKET', title: 'BASKET' }, { id: 'BASKET_LACE', title: 'BASKET LACE' }, { id: 'SEALING', title: 'SEALING' }, { id: 'LACE_SEALING', title: 'LACE SEALING' }
];

type OptionsConfigItem = { id: keyof GloveConfiguration | 'build'; title: string; contentType: Exclude<(typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES], 'summary'>; };

const optionsConfig: OptionsConfigItem[] = [
    { id: 'build', title: 'Build Options', contentType: CONTENT_TYPES.BUILD },
    { id: 'web', title: 'Web', contentType: CONTENT_TYPES.GALLERY },
    { id: 'thumb', title: 'Thumb Color', contentType: CONTENT_TYPES.DUAL_COLOR },
    { id: 'index', title: 'Index Color', contentType: CONTENT_TYPES.COLOR },
    { id: 'middle', title: 'Middle Color', contentType: CONTENT_TYPES.DUAL_COLOR },
    { id: 'ring', title: 'Ring Color', contentType: CONTENT_TYPES.DUAL_COLOR },
    { id: 'pinky', title: 'Pinky Color', contentType: CONTENT_TYPES.DUAL_COLOR },
    { id: 'thumbName', title: 'Thumb Name', contentType: CONTENT_TYPES.TEXT },
    { id: 'pinkyName', title: 'Pinky Name', contentType: CONTENT_TYPES.TEXT },
];

interface GetColorDisplayOptions {
    format?: (typeof FORMAT_TYPES)[keyof typeof FORMAT_TYPES];
}

const getColorDisplay = (colorValue: ColorablePart | HexColor, options: GetColorDisplayOptions = {}): string => {
    const { format = FORMAT_TYPES.DEFAULT } = options;
    const getColorName = (hex: HexColor) => colorSwatches.find(c => c.hex === hex)?.name || hex;
    
    if (typeof colorValue === 'string') {
        return getColorName(colorValue);
    }

    switch (format) {
        case FORMAT_TYPES.HEADER:
            if (colorValue.type === 'dual') return `${getColorName(colorValue.inner)} · ${getColorName(colorValue.outer)}`;
            return getColorName(colorValue.color);
        case FORMAT_TYPES.SUMMARY:
            if (colorValue.type === 'dual') return `Inner: ${getColorName(colorValue.inner)}, Outer: ${getColorName(colorValue.outer)}`;
            if (colorValue.type === 'text') return getColorName(colorValue.color);
            if (colorValue.type === 'single' || colorValue.type === 'web') return `Color: ${getColorName(colorValue.color)}`;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const exhaustiveCheck: never = colorValue;
            return 'N/A';
        default:
            return JSON.stringify(colorValue);
    }
};

const getActiveColor = (
    colorValue: ColorablePart | null | undefined,
    activeSubPart: AppState['activeDualColorPart']
): HexColor | undefined => {
    if (!colorValue || typeof colorValue !== 'object') return undefined;

    switch (colorValue.type) {
        case 'web':
        case 'single':
        case 'text':
            return colorValue.color;
        case 'dual':
            return colorValue[activeSubPart];
        default:
            return undefined;
    }
};

// --- Centralized State Management ---

const initialState: AppState = {
    configuration: {
        build: { imageSelection: 'imgOpt1', position: 'OUTFIELD', size: '11"', handOpeningSize: 'ADULT', stiffness: 'STANDARD', throwingHand: 'RIGHT HAND' },
        web: { type: 'web', webType: 'MOD_TRAP', color: '#C62828' },
        thumb: { type: 'dual', inner: '#C62828', outer: '#2E7D32' },
        index: { type: 'single', color: '#1565C0' },
        middle: { type: 'dual', inner: '#2E7D32', outer: '#C62828' },
        ring: { type: 'dual', inner: '#F9A825', outer: '#6A1B9A' },
        pinky: { type: 'dual', inner: '#6A1B9A', outer: '#F9A825' },
        thumbName: { type: 'text', text: 'Thumb', font: 'SCRIPT', color: '#BDBDBD' },
        pinkyName: { type: 'text', text: 'Pinky', font: 'BLOCK', color: '#FFFFFF' },
    },
    activeDualColorPart: DUAL_COLOR_SUB_PARTS.INNER,
};

const gloveConfigReducer = (state: AppState, action: GloveAction): AppState => {
    switch (action.type) {
        case ACTION_TYPES.UPDATE_BUILD:
            return { ...state, configuration: { ...state.configuration, build: action.payload } };
        case ACTION_TYPES.UPDATE_COLOR:
            return { ...state, configuration: { ...state.configuration, [action.payload.id]: { type: 'single', color: action.payload.color } } };
        case ACTION_TYPES.UPDATE_DUAL_COLOR:
            const currentDualColorPart = state.configuration[action.payload.id];
            return {
                ...state,
                configuration: {
                    ...state.configuration,
                    [action.payload.id]: { ...currentDualColorPart, [action.payload.subPartId]: action.payload.color },
                },
                activeDualColorPart: action.payload.subPartId,
            };
        case ACTION_TYPES.UPDATE_GALLERY:
            return { ...state, configuration: { ...state.configuration, web: action.payload } };
        case ACTION_TYPES.UPDATE_TEXT:
            return { ...state, configuration: { ...state.configuration, [action.payload.id]: action.payload.data } };
        case ACTION_TYPES.APPLY_COLOR_TO_ALL: {
            const { color } = action.payload;
            if (!color) return state;
            const newConfig = { ...state.configuration };

            newConfig.index = { type: 'single', color: color };
            newConfig.web = { ...newConfig.web, color: color };
            newConfig.thumb = { type: 'dual', inner: color, outer: color };
            newConfig.middle = { type: 'dual', inner: color, outer: color };
            newConfig.ring = { type: 'dual', inner: color, outer: color };
            newConfig.pinky = { type: 'dual', inner: color, outer: color };

            return { ...state, configuration: newConfig };
        }
        default:
            const exhaustiveCheck: never = action;
            throw new Error(`Unhandled action: ${JSON.stringify(exhaustiveCheck)}`);
    }
};

const GloveConfiguratorContext = createContext<{ state: AppState; dispatch: React.Dispatch<GloveAction> } | undefined>(undefined);

interface GloveConfiguratorProviderProps {
    children: ReactNode;
}

const GloveConfiguratorProvider = ({ children }: GloveConfiguratorProviderProps) => {
    const [state, dispatch] = useReducer(gloveConfigReducer, initialState);
    return <GloveConfiguratorContext.Provider value={{ state, dispatch }}>{children}</GloveConfiguratorContext.Provider>;
};

const useGloveConfigurator = () => {
    const context = useContext(GloveConfiguratorContext);
    if (!context) throw new Error('useGloveConfigurator must be used within a GloveConfiguratorProvider');
    return context;
};

// --- Helper Components ---

interface ScrollGradientProps {
    position: (typeof POSITIONS)[keyof typeof POSITIONS];
    isVisible: boolean;
}
const ScrollGradient = ({ position, isVisible }: ScrollGradientProps) => {
    const isTop = position === POSITIONS.TOP;
    return <div className={`absolute left-0 right-0 h-[63px] ${isTop ? 'top-0 bg-gradient-to-b' : 'bottom-0 bg-gradient-to-t'} from-[#161616] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />;
};

const ColorIndicator = ({ color }: { color: HexColor }) => (
    <span
        className="w-5 h-5 rounded-full border border-white/20"
        style={{ backgroundColor: color }}
    ></span>
);

interface ImageOptionProps {
    id: string;
    title: string;
    isSelected: boolean;
    onSelect: () => void;
}
const ImageOption = ({ id, title, isSelected, onSelect }: ImageOptionProps) => (
    <button className={`relative h-[100px] cursor-pointer flex flex-col justify-center items-center text-center bg-[#2a2a2a] ${isSelected ? 'border-4 border-white' : 'hover:bg-[#333333]'} focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white`} onClick={onSelect}>
        <h4 className="text-base font-semibold text-white">{title}</h4>
        {isSelected && <div className="absolute top-0 right-0 w-[28px] h-[28px] bg-white flex items-center justify-center"><svg className="w-[14px] h-[14px] text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>}
    </button>
);

interface PrimaryCTAButtonProps {
    label: string;
    onClick: () => void;
    ariaLabel?: string;
}
const PrimaryCTAButton = ({ label, onClick, ariaLabel }: PrimaryCTAButtonProps) => (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-between px-4 bg-[#2997FF] hover:bg-[#73BBFF] active:bg-[#0083FF] text-base font-semibold text-white h-[56px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" aria-label={ariaLabel || label}>
        <span className="ml-[5px]">{label}</span>
        <svg width="34" height="14" viewBox="0 0 34 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-[5px]"><path d="M0 8H32.5M32.5 8L25.5 1M32.5 8H0.5M32.5 8L25.6077 15" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
    </button>
);

interface SecondaryButtonProps {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    variant?: (typeof VARIANTS.THEME)[keyof typeof VARIANTS.THEME];
    icon?: (typeof ICONS)[keyof typeof ICONS];
    disabled?: boolean;
}
const SecondaryButton = ({ label, onClick, variant = VARIANTS.THEME.DARK, icon = ICONS.CHECKMARK, disabled = false }: SecondaryButtonProps) => {
    const baseClasses = "w-full flex items-center justify-center px-4 text-base font-semibold h-[56px] focus:outline-none transition-opacity";
    const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = variant === VARIANTS.THEME.LIGHT ? 'bg-white hover:bg-gray-200 active:bg-gray-300 text-[#161616] focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-400' : 'bg-[#393939] hover:bg-[#727272] active:bg-[#222222] text-white focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white';
    return (
        <button type="button" onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${disabledClasses}`} aria-label={label}>
            {icon === ICONS.BACK_ARROW && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-[5px]"><path d="M13 7H1M1 7L7 1M1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            <span>{label}</span>
            {icon === ICONS.CHECKMARK && <svg className="w-5 h-5 ml-[5px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
        </button>
    );
};

interface ColorSwatchProps {
    color: HexColor;
    name: string;
    isSelected: boolean;
    onSelect: (color: HexColor) => void;
}
const ColorSwatch = ({ color, name, isSelected, onSelect }: ColorSwatchProps) => (
    <button className={`w-[42px] h-[42px] rounded-full border-2 focus:outline-none ${isSelected ? 'border-transparent ring-4 ring-white' : 'border-transparent focus-visible:ring-4 focus-visible:ring-white/50'}`} style={{ backgroundColor: color }} onClick={() => onSelect(color)} aria-label={`Select color ${name}`} />
);

interface ColorSwatchGridProps {
    swatches: { name: string, hex: HexColor }[];
    selectedColor: HexColor | undefined;
    onColorSelect: (color: HexColor) => void;
}
const ColorSwatchGrid = ({ swatches, selectedColor, onColorSelect }: ColorSwatchGridProps) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(42px,1fr))] gap-[10px] px-2 py-2">
        {swatches.map((swatch) => <ColorSwatch key={swatch.hex} color={swatch.hex} name={swatch.name} isSelected={selectedColor === swatch.hex} onSelect={onColorSelect} />)}
    </div>
);

// --- Accordion Containers ---

interface AccordionOptionHeaderProps {
    title: string;
    onClick: () => void;
    accessoryContent: ReactNode;
    icon: (typeof ICONS.DESKTOP) | (typeof ICONS.MOBILE);
    isOpen: boolean;
    variant: (typeof VARIANTS.LAYOUT)[keyof typeof VARIANTS.LAYOUT];
    controlsId: string;
}
const AccordionOptionHeader = ({ title, onClick, accessoryContent, icon, isOpen, variant, controlsId }: AccordionOptionHeaderProps) => {
    const baseClasses = "w-full flex justify-between items-center text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white";
    const variantClasses = variant === VARIANTS.LAYOUT.DESKTOP ? "p-4 h-[56px] hover:bg-[#2A2A2A] transition-colors" : "py-3 h-[56px] mb-3 text-white";
    return (
        <button onClick={onClick} className={`${baseClasses} ${variantClasses}`} aria-expanded={isOpen} aria-controls={controlsId}>
            <div className="flex items-center space-x-3">
                {icon === ICONS.DESKTOP && <svg className={`h-[15px] w-auto transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg>}
                {icon === ICONS.MOBILE && <svg className="w-5 h-5 mr-2 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>}
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="flex items-center">{accessoryContent}</div>
        </button>
    );
};

interface AccordionOptionDesktopProps {
    title: string;
    children: ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    headerContent: ReactNode;
    actionButton?: ReactNode;
}
const AccordionOptionDesktop = ({ title, children, isOpen, onToggle, headerContent, actionButton }: AccordionOptionDesktopProps) => {
    const contentId = `content-${title.replace(/\s+/g, '-')}`;
    return (
        <div className="bg-[#1C1C1C] overflow-hidden pointer-events-auto">
            <AccordionOptionHeader variant={VARIANTS.LAYOUT.DESKTOP} title={title} onClick={onToggle} accessoryContent={headerContent} icon={ICONS.DESKTOP} isOpen={isOpen} controlsId={contentId} />
            <div id={contentId} className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">{isOpen && <div className="p-4">{children}{actionButton && <div className="mt-4">{actionButton}</div>}</div>}</div>
            </div>
        </div>
    );
};

interface AccordionOptionMobileProps {
    title: string;
    onClose: () => void;
    headerAccessory?: ReactNode | null;
    children: ReactNode;
}
const AccordionOptionMobile = ({ title, onClose, headerAccessory = null, children }: AccordionOptionMobileProps) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [isTopGradientVisible, setIsTopGradientVisible] = useState(false);
    const [isBottomGradientVisible, setIsBottomGradientVisible] = useState(false);
    const checkAndSetGradients = useCallback(() => {
        const element = scrollContainerRef.current;
        if (!element) return;
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setIsTopGradientVisible(hasOverflow && element.scrollTop > 0);
        setIsBottomGradientVisible(hasOverflow && Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) >= NUMERIC_CONSTANTS.SCROLL_THRESHOLD);
    }, []);
    useLayoutEffect(() => { checkAndSetGradients(); }, [children, checkAndSetGradients]);
    useEffect(() => {
        const element = scrollContainerRef.current;
        const handler = checkAndSetGradients;
        window.addEventListener('resize', handler);
        if (element) element.addEventListener('scroll', handler);
        return () => {
            window.removeEventListener('resize', handler);
            if (element) element.removeEventListener('scroll', handler);
        };
    }, [checkAndSetGradients]);
    return (
        <div className="absolute inset-0 bg-[#161616] z-20 h-full flex flex-col px-[23px]">
            <AccordionOptionHeader variant={VARIANTS.LAYOUT.MOBILE} title={title} onClick={onClose} accessoryContent={headerAccessory} icon={ICONS.MOBILE} isOpen={true} controlsId={`mobile-panel-${title.replace(/\s+/g, '-')}`} />
            <div className="flex-grow relative overflow-hidden">
                <ScrollGradient position={POSITIONS.TOP} isVisible={isTopGradientVisible} />
                <div className="h-full overflow-y-auto" ref={scrollContainerRef}>{children}</div>
                <ScrollGradient position={POSITIONS.BOTTOM} isVisible={isBottomGradientVisible} />
            </div>
        </div>
    );
};

// --- Content Components ---

interface ColorContentProps {
    value: HexColor;
    onChange: (color: HexColor) => void;
}
const ColorContent = ({ value, onChange }: ColorContentProps) => <ColorSwatchGrid swatches={colorSwatches} selectedColor={value} onColorSelect={onChange} />;

interface DualColorContentProps {
    value: DualColorPart;
    onChange: (subPart: (typeof DUAL_COLOR_SUB_PARTS)[keyof typeof DUAL_COLOR_SUB_PARTS], color: HexColor) => void;
    labels?: { inner: string; outer: string };
}
const DualColorContent = ({ value, onChange, labels = { inner: "Inner", outer: "Outer" } }: DualColorContentProps) => (
    <div className="space-y-4">
        <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{labels.inner}</h3>
            <ColorSwatchGrid swatches={colorSwatches} selectedColor={value.inner} onColorSelect={(color) => onChange(DUAL_COLOR_SUB_PARTS.INNER, color)} />
        </div>
        <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{labels.outer}</h3>
            <ColorSwatchGrid swatches={colorSwatches} selectedColor={value.outer} onColorSelect={(color) => onChange(DUAL_COLOR_SUB_PARTS.OUTER, color)} />
        </div>
    </div>
);

interface OptionProps {
    label: string;
    isSelected: boolean;
    onSelect: () => void;
}
const Option = ({ label, isSelected, onSelect }: OptionProps) => (
    <button className={`text-sm py-2 px-3 h-[36px] flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-inset ${isSelected ? 'bg-white text-[#222222] focus-visible:ring-blue-400' : 'bg-[#383838] hover:bg-[#595959] active:bg-[#272727] focus-visible:ring-white'}`} onClick={onSelect}>
        {label}
    </button>
);

interface OptionGroupProps {
    title: string;
    options: { id: string, label: string }[];
    layout: string;
    selectedOption: string;
    onSelectOption: (id: string) => void;
}
const OptionGroup = ({ title, options, layout, selectedOption, onSelectOption }: OptionGroupProps) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
        <div className={`grid ${layout} gap-2`}>
            {options.map((option) => <Option key={option.id} label={option.label} isSelected={selectedOption === option.id} onSelect={() => onSelectOption(option.id)} />)}
        </div>
    </div>
);

interface ImageGroupProps {
    title: string;
    options: { id: string, title: string }[];
    layout: string;
    selectedOption: string;
    onSelectOption: (id: string) => void;
}
const ImageGroup = ({ title, options, layout, selectedOption, onSelectOption }: ImageGroupProps) => (
    <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
        <div className={`grid ${layout} gap-[10px]`}>
            {options.map((option) => <ImageOption key={option.id} id={option.id} title={option.title} isSelected={selectedOption === option.id} onSelect={() => onSelectOption(option.id)} />)}
        </div>
    </div>
);

interface BuildOptionProps {
    isDesktop: boolean;
}
const BuildOption = ({ isDesktop }: BuildOptionProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const { build: buildConfig } = state.configuration;
    const onBuildConfigChange = (newConfig: BuildConfig) => dispatch({ type: ACTION_TYPES.UPDATE_BUILD, payload: newConfig });
    return (
        <div className={`space-y-6 ${!isDesktop ? 'pb-4' : ''}`}>
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Glove Leather</h3>
                <div className="grid grid-cols-2 gap-[10px]">
                    {leatherOptions.map(option => <ImageOption key={option.id} id={option.id} title={option.title} isSelected={buildConfig.imageSelection === option.id} onSelect={() => onBuildConfigChange({ ...buildConfig, imageSelection: option.id as 'imgOpt1' | 'imgOpt2' })} />)}
                </div>
            </div>
            {buildOptionsData.map((group) => <OptionGroup key={group.id} title={group.title} options={group.options} layout={group.layout} selectedOption={buildConfig[group.id as keyof Omit<BuildConfig, 'imageSelection'>]} onSelectOption={(value) => onBuildConfigChange({ ...buildConfig, [group.id]: value })} />)}
        </div>
    );
};

interface TextOptionProps {
    contextId: TextPartId;
}
const TextOption = ({ contextId }: TextOptionProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const value = state.configuration[contextId];
    const onChange = (newValue: TextPart) => dispatch({ type: ACTION_TYPES.UPDATE_TEXT, payload: { id: contextId, data: newValue } });
    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Text</h3>
                <input type="text" className="w-full p-3 bg-[#2A2A2A] text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={value.text} onChange={(e) => onChange({ ...value, text: e.target.value })} placeholder="ENTER YOUR TEXT..." />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Font</h3>
                <div className="grid grid-cols-2 gap-3">
                    {fontOptions.map(font => <button key={font.id} onClick={() => onChange({ ...value, font: font.id })} className={`py-3 text-base font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-inset ${value.font === font.id ? 'bg-white text-black focus-visible:ring-blue-400' : 'bg-[#2a2a2a] hover:bg-[#333333] text-white focus-visible:ring-white'}`}>{font.label}</button>)}
                </div>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Color</h3>
                <ColorSwatchGrid swatches={colorSwatches} selectedColor={value.color} onColorSelect={(color) => onChange({ ...value, color: color })} />
            </div>
        </div>
    );
};

interface GalleryOptionProps {
    isDesktop: boolean;
}
const GalleryOption = ({ isDesktop }: GalleryOptionProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const { web: config } = state.configuration;
    const onConfigChange = (newConfig: WebPart) => dispatch({ type: ACTION_TYPES.UPDATE_GALLERY, payload: newConfig });
    return (
        <div className={`space-y-6 ${!isDesktop ? 'pb-4' : ''}`}>
            <ImageGroup title="Type" layout="grid-cols-3" options={webTypeOptions} selectedOption={config.webType} onSelectOption={(optionId) => onConfigChange({ ...config, webType: optionId })} />
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Color</h3>
                <ColorSwatchGrid swatches={colorSwatches} selectedColor={config.color} onColorSelect={(color) => onConfigChange({ ...config, color: color })} />
            </div>
        </div>
    );
};

// --- Panel Components ---

const SummaryPanel = ({ onClose }: { onClose: () => void }) => <OverviewMobile onClose={onClose} />;

const BuildPanel = ({ context, onClose }: BuildPanelProps) => (
    <AccordionOptionMobile title={context.title} onClose={onClose}>
        <BuildOption isDesktop={false} />
    </AccordionOptionMobile>
);

const GalleryPanel = ({ context, onClose }: GalleryPanelProps) => {
    const { state } = useGloveConfigurator();
    const headerAccessory = (
        <span className="text-sm text-gray-400 font-semibold truncate max-w-[150px]">
            {`${webTypeOptions.find(opt => opt.id === state.configuration.web.webType)?.title || ''} · ${getColorDisplay(state.configuration.web, {format: FORMAT_TYPES.HEADER})}`}
        </span>
    );
    return (
        <AccordionOptionMobile title={context.title} onClose={onClose} headerAccessory={headerAccessory}>
            <GalleryOption isDesktop={false} />
        </AccordionOptionMobile>
    );
};

const TextPanel = ({ context, onClose }: TextPanelProps) => {
    const { state } = useGloveConfigurator();
    const headerAccessory = <span className="text-sm text-gray-400 truncate max-w-[100px]">{state.configuration[context.id].text}</span>;
    return (
        <AccordionOptionMobile title={context.title} onClose={onClose} headerAccessory={headerAccessory}>
            <TextOption contextId={context.id} />
        </AccordionOptionMobile>
    );
};

const ColorPanel = ({ context, onClose }: ColorPanelProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const { id, title } = context;
    const colorValue = state.configuration[id];

    const headerAccessory = (
        <span className="text-sm text-gray-400 font-semibold">
            {getColorDisplay(colorValue, { format: FORMAT_TYPES.HEADER })}
        </span>
    );

    return (
        <AccordionOptionMobile title={title} onClose={onClose} headerAccessory={headerAccessory}>
            {colorValue.type === 'dual' ? (
                <DualColorContent
                    value={colorValue}
                    onChange={(subPart, color) =>
                        dispatch({
                            type: ACTION_TYPES.UPDATE_DUAL_COLOR,
                            payload: { id: id as 'thumb' | 'middle' | 'ring' | 'pinky', subPartId: subPart, color }
                        })
                    }
                />
            ) : (
                <ColorContent
                    value={colorValue.color}
                    onChange={(color) =>
                        dispatch({
                            type: ACTION_TYPES.UPDATE_COLOR,
                            payload: { id: 'index', color }
                        })
                    }
                />
            )}
        </AccordionOptionMobile>
    );
};

// --- Other UI Components ---

const OrderSummaryInfo = () => {
    const { state } = useGloveConfigurator();
    const { configuration } = state;
    const { build, web, thumb, index, middle, ring, pinky, thumbName, pinkyName } = configuration;
    const getBuildLabel = (key: string, value: string) => {
        if (key === 'imageSelection') return leatherOptions.find(opt => opt.id === value)?.title || value;
        const group = buildOptionsData.find(g => g.id === key);
        return group?.options.find(o => o.id === value)?.label || value;
    };
    const getBuildTitle = (key: string) => key === 'imageSelection' ? "Glove Leather" : buildOptionsData.find(g => g.id === key)?.title || key;
    const getWebLabel = (value: string) => webTypeOptions.find(opt => opt.id === value)?.title || value;
    return (
        <div className="text-base text-gray-300 space-y-4 p-1">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Glove Foundation</h3>
                <div className="space-y-1 pl-2">
                    {Object.entries(build).map(([key, value]) => <p key={key}><span className="font-semibold text-gray-400">{getBuildTitle(key)}:</span> {getBuildLabel(key, value)}</p>)}
                    {web && <p><span className="font-semibold text-gray-400">Web:</span> {getWebLabel(web.webType)}</p> }
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Color Scheme</h3>
                <div className="space-y-1 pl-2">
                    <p><span className="font-semibold text-gray-400">Thumb:</span> {getColorDisplay(thumb, { format: FORMAT_TYPES.SUMMARY })}</p>
                    <p><span className="font-semibold text-gray-400">Index:</span> {getColorDisplay(index, { format: FORMAT_TYPES.SUMMARY })}</p>
                    <p><span className="font-semibold text-gray-400">Middle:</span> {getColorDisplay(middle, { format: FORMAT_TYPES.SUMMARY })}</p>
                    <p><span className="font-semibold text-gray-400">Ring:</span> {getColorDisplay(ring, { format: FORMAT_TYPES.SUMMARY })}</p>
                    <p><span className="font-semibold text-gray-400">Pinky:</span> {getColorDisplay(pinky, { format: FORMAT_TYPES.SUMMARY })}</p>
                    {web && <p><span className="font-semibold text-gray-400">Web Color:</span> {getColorDisplay(web, { format: FORMAT_TYPES.SUMMARY })}</p>}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personalization</h3>
                <div className="space-y-1 pl-2">
                    <p><span className="font-semibold text-gray-400">Thumb Name:</span> "{thumbName.text}" ({thumbName.font}, {getColorDisplay(thumbName.color, { format: FORMAT_TYPES.SUMMARY })})</p>
                    <p><span className="font-semibold text-gray-400">Pinky Name:</span> "{pinkyName.text}" ({pinkyName.font}, {getColorDisplay(pinkyName.color, { format: FORMAT_TYPES.SUMMARY })})</p>
                </div>
            </div>
        </div>
    );
};

const OverviewMobile = ({ onClose }: { onClose: () => void }) => (
    <AccordionOptionMobile title="Order Summary" onClose={onClose}>
        <OrderSummaryInfo />
    </AccordionOptionMobile>
);

interface OverviewButtonProps {
    onClick: () => void;
    isDesktop: boolean;
    isOpen: boolean;
}
const OverviewButton = ({ onClick, isDesktop, isOpen }: OverviewButtonProps) => (
    <button type="button" onClick={onClick} className={`w-full flex items-center h-[56px] bg-[#393939] hover:bg-[#727272] active:bg-[#222222] text-base font-semibold text-white px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white ${isDesktop ? 'justify-between' : 'justify-center'}`} aria-label="Open summary panel" aria-expanded={isOpen} aria-controls="overview-content">
        <div className="flex items-center space-x-2">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.3"><path d="M17.1875 0H4.8125C3.53619 0 2.31204 0.507022 1.40953 1.40953C0.507021 2.31204 0 3.53619 0 4.8125V17.1875C0 18.4638 0.507021 19.688 1.40953 20.5905C2.31204 21.493 3.53619 22 4.8125 22H17.1875C18.4638 22 19.688 21.493 20.5905 20.5905C21.493 19.688 22 18.4638 22 17.1875V4.8125C22 3.53619 21.493 2.31204 20.5905 1.40953C19.688 0.507022 18.4638 0 17.1875 0ZM20.625 17.1875C20.625 18.0992 20.2628 18.9735 19.6181 19.6181C18.9735 20.2628 18.0992 20.625 17.1875 20.625H4.8125C3.9008 20.625 3.02653 20.2628 2.38185 19.6181C1.73717 18.9735 1.375 18.0992 1.375 17.1875V4.8125C1.375 3.9008 1.73717 3.02653 2.38185 2.38185C3.02654 1.73718 3.9008 1.375 4.8125 1.375H17.1875C18.0992 1.375 18.9735 1.73717 19.6181 2.38185C20.2628 3.02654 20.625 3.9008 20.625 4.8125V17.1875Z" fill="white"/><path d="M8.9375 5.5H17.1875V6.875H8.9375V5.5Z" fill="white"/><path d="M8.9375 10.3125H17.1875V11.6875H8.9375V10.3125Z" fill="white"/><path d="M8.9375 15.125H17.1875V16.5H8.9375V15.125Z" fill="white"/><path d="M7.5625 6.1875C7.5625 6.94681 6.94681 7.5625 6.1875 7.5625C5.42819 7.5625 4.8125 6.94681 4.8125 6.1875C4.8125 5.42819 5.42819 4.8125 6.1875 4.8125C6.94681 4.8125 7.5625 5.42819 7.5625 6.1875Z" fill="white"/><path d="M7.5625 11C7.5625 11.7593 6.94681 12.375 6.1875 12.375C5.42819 12.375 4.8125 11.7593 4.8125 11C4.8125 10.2407 5.42819 9.625 6.1875 9.625C6.94681 9.625 7.5625 10.2407 7.5625 11Z" fill="white"/><path d="M7.5625 15.8125C7.5625 16.5718 6.94681 17.1875 6.1875 17.1875C5.42819 17.1875 4.8125 16.5718 4.8125 15.8125C4.8125 15.0532 5.42819 14.4375 6.1875 14.4375C6.94681 14.4375 7.5625 15.0532 7.5625 15.8125Z" fill="white"/></g></svg>
            <span>Overview</span>
        </div>
        {isDesktop && <svg className={`w-5 h-5 text-white transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>}
    </button>
);

interface OrderButtonControllerProps {
    isSummaryVisible: boolean;
    onReviewClick: () => void;
    onCompleteClick: () => void;
}
const OrderButtonController = ({ isSummaryVisible, onReviewClick, onCompleteClick }: OrderButtonControllerProps) => {
    return isSummaryVisible ? <PrimaryCTAButton label="Complete Order" onClick={onCompleteClick} ariaLabel="Complete Order" /> : <PrimaryCTAButton label="Review & Order" onClick={onReviewClick} ariaLabel="Review and Order" />;
};

type MobileAccordionState =
    | { name: typeof CONTENT_TYPES.SUMMARY }
    | { name: typeof CONTENT_TYPES.BUILD; context: BuildPanelProps['context'] }
    | { name: typeof CONTENT_TYPES.GALLERY; context: GalleryPanelProps['context'] }
    | { name: typeof CONTENT_TYPES.COLOR; context: ColorPanelProps['context'] }
    | { name: typeof CONTENT_TYPES.DUAL_COLOR; context: ColorPanelProps['context'] }
    | { name: typeof CONTENT_TYPES.TEXT; context: TextPanelProps['context'] }
    | null;


interface FooterMobileProps {
    openPanelName?: (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES] | null;
    onClosePanel: () => void;
    onReviewClick: () => void;
    onCompleteOrder: () => void;
    isDesktop: boolean;
    openAccordionOptionMobile: MobileAccordionState;
}
const FooterMobile = ({ openPanelName, onClosePanel, onReviewClick, onCompleteOrder, isDesktop, openAccordionOptionMobile }: FooterMobileProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const getApplyAllColor = (): HexColor | undefined => {
        if (!openAccordionOptionMobile || openAccordionOptionMobile.name === CONTENT_TYPES.SUMMARY || openAccordionOptionMobile.name === CONTENT_TYPES.BUILD || openAccordionOptionMobile.name === CONTENT_TYPES.TEXT) {
            return undefined;
        }
        
        const { context } = openAccordionOptionMobile;
        const configValue = state.configuration[context.id];
        return getActiveColor(configValue, state.activeDualColorPart);
    };
    const onApplyColorToAll = (color?: HexColor) => {
        if (color) dispatch({ type: ACTION_TYPES.APPLY_COLOR_TO_ALL, payload: { color } });
    };
    const colorToApply = getApplyAllColor();
    const panelFooterMap: { [key in (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES]]?: ReactElement } = {
        [CONTENT_TYPES.COLOR]: <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]"><SecondaryButton label="Apply to All" onClick={() => onApplyColorToAll(colorToApply)} variant={VARIANTS.THEME.DARK} icon={ICONS.CHECKMARK} disabled={!colorToApply} /><SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={ICONS.CHECKMARK} /></div>,
        [CONTENT_TYPES.DUAL_COLOR]: <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]"><SecondaryButton label="Apply to All" onClick={() => onApplyColorToAll(colorToApply)} variant={VARIANTS.THEME.DARK} icon={ICONS.CHECKMARK} disabled={!colorToApply} /><SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={ICONS.CHECKMARK} /></div>,
        [CONTENT_TYPES.BUILD]: <SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={ICONS.CHECKMARK} />,
        [CONTENT_TYPES.GALLERY]: <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]"><SecondaryButton label="Apply to All" onClick={() => onApplyColorToAll(colorToApply)} variant={VARIANTS.THEME.DARK} icon={ICONS.CHECKMARK} disabled={!colorToApply} /><SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={ICONS.CHECKMARK} /></div>,
        [CONTENT_TYPES.TEXT]: <SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={ICONS.CHECKMARK} />,
        [CONTENT_TYPES.SUMMARY]: <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]"><SecondaryButton label="Back" onClick={onClosePanel} variant={VARIANTS.THEME.DARK} icon={ICONS.BACK_ARROW} /><OrderButtonController isSummaryVisible={true} onCompleteClick={onCompleteOrder} onReviewClick={() => {}} /></div>,
    };
    const defaultFooter = <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]"><OverviewButton onClick={onReviewClick} isDesktop={isDesktop} isOpen={false} /><OrderButtonController isSummaryVisible={false} onReviewClick={onReviewClick} onCompleteClick={onCompleteOrder} /></div>;
    return <footer className="flex-shrink-0 bg-[#161616] flex items-center justify-start pb-[20px] px-[14px] pt-[10px]">{openPanelName ? (panelFooterMap[openPanelName as keyof typeof panelFooterMap] || defaultFooter) : defaultFooter}</footer>;
};

const useBreakpoint = (breakpoint: string = NUMERIC_CONSTANTS.DESKTOP_BREAKPOINT): boolean => {
    const query = `(min-width: ${breakpoint})`;
    const getInitialState = () => typeof window !== 'undefined' ? window.matchMedia(query).matches : false;
    const [isMatch, setIsMatch] = useState(getInitialState);
    useEffect(() => {
        const mediaQueryList = window.matchMedia(query);
        const handleBreakpointChange = (event: MediaQueryListEvent) => setIsMatch(event.matches);
        mediaQueryList.addEventListener('change', handleBreakpointChange);
        return () => mediaQueryList.removeEventListener('change', handleBreakpointChange);
    }, [query]);
    return isMatch;
};

const OverviewDesktop = () => {
    const [agnosticAccordionOpen, setAgnosticAccordionOpen] = useState(false);
    useEffect(() => {
        if (!agnosticAccordionOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setAgnosticAccordionOpen(false); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [agnosticAccordionOpen]);
    return (
        <div className="flex lg:absolute lg:bottom-[60px] lg:right-[60px] fixed w-full bottom-[-1rem] flex-row items-center gap-4 lg:flex-col lg:justify-end lg:w-auto lg:h-auto lg:gap-0">
            <div className="lg:w-[400px] text-[#999999] font-black text-[1.3rem] my-0 lg:mb-2.5 mx-0 flex flex-col justify-end lg:h-auto h-[80.8vh]">
                <OverviewButton onClick={() => setAgnosticAccordionOpen(!agnosticAccordionOpen)} isDesktop={true} isOpen={agnosticAccordionOpen} />
                <div id="overview-content" className={`bg-[#222222] transition-[height] duration-300 ease-in ${agnosticAccordionOpen ? 'overflow-y-scroll h-auto lg:h-[calc(100vh-335px)]' : 'overflow-hidden h-0'}`}>
                    <div className="text-base py-3.5 px-6">
                        <OrderSummaryInfo />
                    </div>
                </div>
            </div>
            <div className="lg:w-[400px] w-full self-end mb-[1.9rem] mr-[2.5rem] lg:m-0 z-[1]">
                <OrderButtonController isSummaryVisible={agnosticAccordionOpen} onReviewClick={() => setAgnosticAccordionOpen(true)} onCompleteClick={() => alert('Proceeding to next step...')} />
            </div>
        </div>
    );
};

// --- Main Accordion Components ---

const AccordionDesktop = ({ options }: { options: OptionsConfigItem[] }) => {
    const { state, dispatch } = useGloveConfigurator();
    const { configuration, activeDualColorPart } = state;
    const [openAccordion, setOpenAccordion] = useState<string | null>(CONTENT_TYPES.BUILD);
    const accordionContainerRef = useRef<HTMLDivElement>(null);
    const [isTopGradientVisible, setTopGradientVisible] = useState(false);
    const [isBottomGradientVisible, setBottomGradientVisible] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleAccordionToggle = (accordionId: string) => setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
    
    const handleApplyColorToAll = (colorString?: HexColor) => {
        if (colorString) dispatch({ type: ACTION_TYPES.APPLY_COLOR_TO_ALL, payload: { color: colorString } });
    };

    const checkAndSetGradients = useCallback(() => {
        const element = accordionContainerRef.current;
        if (!element) return;
        const hasOverflow = element.scrollHeight > element.clientHeight;
        setTopGradientVisible(hasOverflow && element.scrollTop > 0);
        setBottomGradientVisible(hasOverflow && Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) >= NUMERIC_CONSTANTS.SCROLL_THRESHOLD);
        setIsScrolled(element.scrollTop > 0);
    }, []);

    useEffect(() => { checkAndSetGradients(); }, [checkAndSetGradients, openAccordion]);
    useEffect(() => {
        const element = accordionContainerRef.current;
        const handler = checkAndSetGradients;
        window.addEventListener('resize', handler);
        if (element) element.addEventListener('scroll', handler);
        return () => {
            window.removeEventListener('resize', handler);
            if (element) element.removeEventListener('scroll', handler);
        };
    }, [checkAndSetGradients]);

    const renderHeaderAccessory = (item: OptionsConfigItem) => {
        if (item.id === 'build') return null;
        const isAccordionOpen = openAccordion === item.id;
        const configValue = configuration[item.id as keyof Omit<GloveConfiguration, 'build'>];
        switch (configValue.type) {
            case 'web':
                const webTypeTitle = webTypeOptions.find(opt => opt.id === configValue.webType)?.title || configValue.webType;
                return (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400 font-semibold truncate max-w-[100px]">{webTypeTitle}</span>
                        {isAccordionOpen ? <span className="text-sm text-gray-400 font-semibold">{`· ${getColorDisplay(configValue, { format: FORMAT_TYPES.HEADER })}`}</span> : <ColorIndicator color={configValue.color} />}
                    </div>
                );
            case 'dual':
                return isAccordionOpen ? <span className="text-sm text-gray-400 font-semibold">{getColorDisplay(configValue, { format: FORMAT_TYPES.HEADER })}</span> : <div className="flex items-center space-x-2.5"><ColorIndicator color={configValue.inner} /><ColorIndicator color={configValue.outer} /></div>;
            case 'single':
                return isAccordionOpen ? <span className="text-sm text-gray-400 font-semibold">{getColorDisplay(configValue, { format: FORMAT_TYPES.HEADER })}</span> : <ColorIndicator color={configValue.color} />;
            case 'text':
                return <span className="text-sm text-gray-400 truncate max-w-[100px]">{configValue.text}</span>;
            default:
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const exhaustiveCheck: never = configValue;
                return null;
        }
    };

    return (
        <div className="absolute top-0 left-0 bottom-0 w-[440px] z-10 bg-[#161616] p-10 pointer-events-none">
            <div className="absolute z-20 w-[70px] h-[49px] bg-gray-300 bg-opacity-75 flex items-center justify-center pointer-events-auto"><p className="font-bold text-xl text-gray-900">LOGO</p></div>
            <div className={`absolute ${isScrolled ? 'top-[82px]' : 'top-[142px]'} bottom-4 left-[40px] w-[400px] pointer-events-auto transition-all duration-30 ease-in-out overflow-hidden`}>
                <ScrollGradient position={POSITIONS.TOP} isVisible={isTopGradientVisible} />
                <div ref={accordionContainerRef} className="h-full overflow-y-auto space-y-4">
                    {options.map(item => (
                        <AccordionOptionDesktop
                            key={item.id}
                            title={item.title}
                            isOpen={openAccordion === item.id}
                            onToggle={() => handleAccordionToggle(item.id)}
                            headerContent={renderHeaderAccessory(item)}
                            actionButton={
                                (() => {
                                    if (item.contentType === CONTENT_TYPES.COLOR || item.contentType === CONTENT_TYPES.DUAL_COLOR || item.contentType === CONTENT_TYPES.GALLERY) {
                                        const configValue = configuration[item.id as keyof Omit<GloveConfiguration, 'build'>];
                                        return (
                                            <SecondaryButton
                                                label="Apply to All"
                                                onClick={() => handleApplyColorToAll(getActiveColor(configValue, activeDualColorPart))}
                                            />
                                        );
                                    }
                                    return null;
                                })()
                            }
                        >
                            {(() => {
                                if (item.id === 'build') {
                                    return <BuildOption isDesktop={true} />;
                                }
                                const configValue = configuration[item.id];
                                switch (item.contentType) {
                                    case CONTENT_TYPES.COLOR:
                                        return <ColorContent
                                            value={(configValue as SingleColorPart).color}
                                            onChange={(color) => dispatch({ type: ACTION_TYPES.UPDATE_COLOR, payload: { id: 'index', color } })}
                                        />;
                                    case CONTENT_TYPES.DUAL_COLOR:
                                        return <DualColorContent
                                            value={configValue as DualColorPart}
                                            onChange={(subPart, color) => dispatch({ type: ACTION_TYPES.UPDATE_DUAL_COLOR, payload: { id: item.id as 'thumb' | 'middle' | 'ring' | 'pinky', subPartId: subPart, color } })}
                                        />;
                                    case CONTENT_TYPES.TEXT:
                                        return <TextOption contextId={item.id as TextPartId} />;
                                    case CONTENT_TYPES.GALLERY:
                                        return <GalleryOption isDesktop={true} />;
                                    default:
                                        return null;
                                }
                            })()}
                        </AccordionOptionDesktop>
                    ))}
                </div>
                <ScrollGradient position={POSITIONS.BOTTOM} isVisible={isBottomGradientVisible} />
            </div>
        </div>
    );
};

interface AccordionMobileProps {
    options: OptionsConfigItem[];
    onOpenPanel: (item: OptionsConfigItem) => void;
    openAccordionOptionMobile: MobileAccordionState;
}

// --- START: MODIFIED AccordionMobile Component ---
const AccordionMobile = React.forwardRef<HTMLElement, AccordionMobileProps>(
    ({ options, onOpenPanel, openAccordionOptionMobile }, ref) => {
        const { state } = useGloveConfigurator();
        const { configuration } = state;
        const [topGradientVisible, setTopGradientVisible] = useState(false);
        const [bottomGradientVisible, setBottomGradientVisible] = useState(false);

        const checkAndSetGradients = useCallback(() => {
            const listElement = (ref as React.MutableRefObject<HTMLElement | null>)?.current;
            if (!listElement) return;
            const hasOverflow = listElement.scrollHeight > listElement.clientHeight;
            setTopGradientVisible(hasOverflow && listElement.scrollTop > 0);
            setBottomGradientVisible(hasOverflow && Math.abs(listElement.scrollHeight - listElement.clientHeight - listElement.scrollTop) >= NUMERIC_CONSTANTS.SCROLL_THRESHOLD);
        }, [ref]);

        useEffect(() => { checkAndSetGradients(); }, [checkAndSetGradients, openAccordionOptionMobile]);

        useEffect(() => {
            const mobileHandler = checkAndSetGradients;
            window.addEventListener('resize', mobileHandler);
            const mobileElement = (ref as React.MutableRefObject<HTMLElement | null>)?.current;
            if (mobileElement) mobileElement.addEventListener('scroll', mobileHandler);
            return () => {
                window.removeEventListener('resize', mobileHandler);
                if (mobileElement) mobileElement.removeEventListener('scroll', mobileHandler);
            };
        }, [checkAndSetGradients, ref]);

        const renderAccessory = (item: OptionsConfigItem) => {
            if (item.id === 'build') return null;
            const configValue = configuration[item.id as keyof Omit<GloveConfiguration, 'build'>];
            switch (configValue.type) {
                case 'web':
                    const webTypeTitle = webTypeOptions.find(opt => opt.id === configValue.webType)?.title || configValue.webType;
                    return <div className="flex items-center space-x-2"><span className="text-sm text-gray-400 font-semibold truncate max-w-[100px]">{webTypeTitle}</span><ColorIndicator color={configValue.color} /></div>;
                case 'dual':
                    return <div className="flex items-center space-x-2"><ColorIndicator color={configValue.inner} /><ColorIndicator color={configValue.outer} /></div>;
                case 'single':
                    return <ColorIndicator color={configValue.color} />;
                case 'text':
                    return <span className="text-sm text-gray-400 truncate max-w-[100px]">{configValue.text}</span>;
                default:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars 
                    const exhaustiveCheck: never = configValue;
                    return null;
            }
        };

        return (
            <section ref={ref} className={`px-4 bg-[#161616] h-full overflow-y-auto ${openAccordionOptionMobile ? 'opacity-50 pointer-events-none' : ''}`} tabIndex={-1}>
                <ScrollGradient position={POSITIONS.TOP} isVisible={topGradientVisible} />
                {options.map(item => (
                    <button key={item.id} data-id={item.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => onOpenPanel(item)}>
                        <div className="flex items-center">
                            <svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3"><path d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/></svg>
                            <span className="text-lg">{item.title}</span>
                        </div>
                        {renderAccessory(item)}
                    </button>
                ))}
                <ScrollGradient position={POSITIONS.BOTTOM} isVisible={bottomGradientVisible} />
            </section>
        );
    }
);
// --- END: MODIFIED AccordionMobile Component ---


// --- Main UI Component ---
const UI = () => {
    const isDesktop = useBreakpoint();
    const { state } = useGloveConfigurator();
    const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
    const [openAccordionOptionMobile, setOpenAccordionOptionMobile] = useState<MobileAccordionState>(null);
    
    // --- START: MODIFIED UI Component ---
    const mobileListRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const listElement = mobileListRef.current;
        if (!listElement) return;

        if (openAccordionOptionMobile) {
            listElement.setAttribute('inert', '');
        } else {
            listElement.removeAttribute('inert');
        }
    }, [openAccordionOptionMobile]);
    // --- END: MODIFIED UI Component ---

    const handleOpenPanel = (item: OptionsConfigItem) => {
        const { id, title, contentType } = item;
        // This assertion is a concession because mapping the generic `OptionsConfigItem`
        // to the specific members of the `MobileAccordionState` union is complex.
        // However, `renderMobilePanel` consumes it safely with a discriminated union check.
        setOpenAccordionOptionMobile({ name: contentType, context: { id: id as any, title } } as MobileAccordionState);
    };

    const handleShare = useCallback(async () => {
        const configUrl = `${window.location.origin}?config=${encodeURIComponent(JSON.stringify(state.configuration))}`;
        const shareData = { title: 'My Custom Glove', text: 'Check out the glove I designed!', url: configUrl };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.log('Share failed', err); }
        } else {
            try { await navigator.clipboard.writeText(configUrl); alert('Sharable link copied to clipboard!'); } catch (err) { alert('Failed to copy link.'); }
        }
    }, [state.configuration]);

    const renderMobilePanel = () => {
        if (!openAccordionOptionMobile) return null;

        const onClose = () => setOpenAccordionOptionMobile(null);
        
        switch (openAccordionOptionMobile.name) {
            case CONTENT_TYPES.SUMMARY:
                return <SummaryPanel onClose={onClose} />;
            case CONTENT_TYPES.BUILD:
                return <BuildPanel context={openAccordionOptionMobile.context} onClose={onClose} />;
            case CONTENT_TYPES.GALLERY:
                return <GalleryPanel context={openAccordionOptionMobile.context} onClose={onClose} />;
            case CONTENT_TYPES.COLOR:
            case CONTENT_TYPES.DUAL_COLOR:
                return <ColorPanel context={openAccordionOptionMobile.context} onClose={onClose} />;
            case CONTENT_TYPES.TEXT:
                return <TextPanel context={openAccordionOptionMobile.context} onClose={onClose} />;
            default:
                // This will never be hit if MobileAccordionState is correct, but good for safety
                const exhaustiveCheck: never = openAccordionOptionMobile;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _ = exhaustiveCheck;
                return null;
        }
    };
    
    const GOLDEN_RATIO_CONSTANT = 1.618;
    const VIZ_PROPORTION = 1 / GOLDEN_RATIO_CONSTANT;
    const CONTROLS_PROPORTION = 1 - VIZ_PROPORTION;

    return (
        <div className="flex flex-col lg:relative h-[100dvh] bg-[#161616] text-white">
            <main className={`p-4 flex flex-col items-center justify-center relative bg-[#161616] overflow-auto h-full w-full ${isVisualizationExpanded ? 'flex-grow' : 'lg:absolute lg:inset-0'}`} style={!isDesktop && !isVisualizationExpanded ? { flexBasis: 'calc(61.8% - 66px)' } : {}}>
                {!isDesktop && <div className="absolute top-[20px] left-[20px] w-[70px] h-[49px] bg-gray-300 bg-opacity-75 z-10 flex items-center justify-center"><p className="font-bold text-xl text-gray-900">LOGO</p></div>}
                <button className="absolute top-[20px] right-[20px] z-20 p-2 hover:bg-gray-800 hover:bg-opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" aria-label="Share configuration" onClick={handleShare}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[31px] h-[31px] text-[#FFFFFF]"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
                <img src={`${process.env.PUBLIC_URL}/gloves.png`} alt="Glove Visualization" className="object-contain max-w-full max-h-full z-0" />
                
                {/* --- START: MODIFIED CODE BLOCK --- */}
                <div className="absolute bottom-4 inset-x-0 h-8 z-10 pointer-events-none" aria-hidden="true">
                    {/* 1. The Button: Absolutely positioned on the left. Renders ONLY on mobile. */}
                    {!isDesktop && (
                        <button
                            className="absolute left-5 bottom-0 p-1 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white pointer-events-auto"
                            onClick={() => setIsVisualizationExpanded(!isVisualizationExpanded)}
                            aria-label={isVisualizationExpanded ? "Collapse visualization" : "Expand visualization"}
                        >
                            {isVisualizationExpanded ? <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M17.3176 3.39899C16.9681 3.39899 16.6330 3.53795 16.3856 3.78514C16.1386 4.03232 15.9997 4.3675 15.9997 4.71725V10.3042C15.9997 10.9906 16.5561 11.547 17.2424 11.547L22.8324 11.547C23.1819 11.547 23.5173 11.408 23.7644 11.1609C24.0116 10.9139 24.1505 10.5785 24.1505 10.229C24.1505 9.87922 24.0116 9.54402 23.7644 9.29685C23.5173 9.04967 23.1819 8.9107 22.8324 8.9107H20.501L27.167 2.24612C27.4123 1.99854 27.5496 1.66397 27.5488 1.31541C27.5482 0.966682 27.4093 0.632697 27.1629 0.386154C26.9164 0.139575 26.5824 0.000809714 26.2337 1.87161e-06C25.8852 -0.000604998 25.5505 0.136743 25.3029 0.382111L18.6359 7.04824V4.71693C18.6359 4.36719 18.4969 4.03199 18.2498 3.78482C18.0026 3.53764 17.6673 3.39899 17.3176 3.39899Z" fill="white"/><path d="M24.1489 17.3166C24.1489 16.9671 24.0099 16.632 23.7627 16.3846C23.5155 16.1377 23.1804 15.9987 22.8306 15.9987H17.2437C16.5573 15.9987 16.0008 16.5551 16.0008 17.2414V22.8314C16.0008 23.1809 16.1398 23.5163 16.387 23.7634C16.634 24.0106 16.9694 24.1496 17.3189 24.1496C17.6686 24.1496 18.0038 24.0106 18.251 23.7634C18.4982 23.5163 18.6372 23.1809 18.6372 22.8314V20.5L25.3017 27.166C25.5493 27.4113 25.8839 27.5487 26.2324 27.5478C26.5812 27.5472 26.9152 27.4083 27.1617 27.1619C27.4083 26.9154 27.547 26.5814 27.5478 26.2328C27.5485 25.8843 27.4111 25.5495 27.1657 25.3019L20.4996 18.6349H22.8309C23.1807 18.6349 23.5159 18.496 23.763 18.2488C24.0102 18.0016 24.1489 17.6664 24.1489 17.3166Z" fill="white"/><path d="M10.2312 24.1479C10.5807 24.1479 10.9159 24.0089 11.1632 23.7617C11.4102 23.5146 11.5491 23.1794 11.5491 22.8296V17.2427C11.5491 16.5563 10.9928 15.9999 10.3064 15.9999H4.71642C4.36691 15.9999 4.03154 16.1388 3.7844 16.386C3.53724 16.633 3.39829 16.9684 3.39829 17.3179C3.39829 17.6677 3.53724 18.0029 3.7844 18.25C4.03156 18.4972 4.36691 18.6362 4.71642 18.6362H7.04786L0.381872 25.3008C0.136529 25.5483 -0.0008042 25.8829 3.54305e-06 26.2315C0.000610281 26.5802 0.139565 26.9142 0.385917 27.1607C0.632472 27.4073 0.966407 27.5461 1.31508 27.5469C1.66358 27.5475 1.9983 27.4101 2.24591 27.1648L8.91293 20.4986V22.8299C8.91293 23.1797 9.05189 23.5149 9.29905 23.7621C9.54621 24.0092 9.88149 24.1479 10.2312 24.1479Z" fill="white"/><path d="M3.39996 10.2302C3.39996 10.5797 3.53893 10.9149 3.78612 11.1622C4.0333 11.4092 4.36848 11.5482 4.71822 11.5482L10.3052 11.5482C10.9916 11.5482 11.548 10.9918 11.548 10.3055L11.548 4.71544C11.548 4.36594 11.409 4.03057 11.1618 3.78343C10.9149 3.53627 10.5795 3.39731 10.2299 3.39731C9.88019 3.39731 9.54499 3.53627 9.29783 3.78343C9.05064 4.03059 8.91168 4.36594 8.91168 4.71544V7.04688L2.2471 0.380895C1.99951 0.135552 1.66495 -0.00178075 1.31639 -0.00097302C0.967659 -0.000366296 0.633674 0.138588 0.387132 0.384941C0.140553 0.631495 0.00178728 0.96543 0.00097943 1.31411C0.000372556 1.6626 0.137721 1.99733 0.383088 2.24493L7.04922 8.91195H4.71791C4.36817 8.91195 4.03296 9.05091 3.7858 9.29807C3.53861 9.54523 3.39996 9.88052 3.39996 10.2302Z" fill="white"/></svg> : <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M28 1.24271C28 0.556382 27.4436 0 26.7572 0H21.1692C20.8195 0 20.4843 0.138953 20.2371 0.386114C19.9899 0.633274 19.851 0.968417 19.851 1.31792C19.851 1.66763 19.9899 2.0028 20.2371 2.24994C20.4843 2.4971 20.8195 2.63605 21.1692 2.63605H23.4991L16.8345 9.30049C16.5891 9.54805 16.4518 9.88279 16.4524 10.2313C16.4532 10.58 16.5920 10.914 16.8385 11.1605C17.0851 11.4068 17.4191 11.5456 17.7678 11.5464C18.1163 11.5472 18.4509 11.4099 18.6985 11.1645L25.3636 4.49957V6.83184C25.3636 7.18135 25.5024 7.51672 25.7498 7.76386C25.9969 8.01102 26.3321 8.14997 26.6819 8.14997C27.0314 8.14997 27.3666 8.01102 27.6138 7.76386C27.861 7.5167 27.9999 7.18135 27.9999 6.83184L28 1.24271Z" fill="white"/><path d="M11.1656 16.8327C10.9184 16.5856 10.5831 16.4468 10.2335 16.4468C9.88397 16.4468 9.54857 16.5856 9.30141 16.8327L2.63631 23.4992V21.167C2.63631 20.8175 2.49735 20.4821 2.25016 20.235C2.00298 19.9878 1.6678 19.8488 1.31805 19.8488C0.968513 19.8488 0.633316 19.9878 0.386152 20.235C0.138967 20.4821 0 20.8175 0 21.167V26.7565C0 27.4428 0.556426 27.9992 1.24281 27.9992H6.82977C7.17931 27.9992 7.51471 27.8602 7.76187 27.6133C8.00906 27.3661 8.14803 27.0307 8.14803 26.6812C8.14803 26.3315 8.00906 25.9964 7.76187 25.7492C7.51469 25.5021 7.17931 25.3631 6.82977 25.3631H4.49929L11.1654 18.6966C11.4126 18.4492 11.5514 18.1141 11.5514 17.7646C11.5514 17.4151 11.4126 17.0797 11.1654 16.8326L11.1656 16.8327Z" fill="white"/><path d="M19.8508 26.6821C19.8508 27.0316 19.9898 27.3667 20.237 27.6141C20.4841 27.861 20.8193 28 21.1691 28H26.756C27.4424 28 27.9988 27.4436 27.9988 26.7573V21.1673C27.9988 20.8178 27.8599 20.4824 27.6127 20.2353C27.3657 19.9881 27.0303 19.8492 26.6808 19.8492C26.331 19.8492 25.9958 19.8881 25.7487 20.2353C25.5015 20.4824 25.3625 20.8178 25.3625 21.1673V23.4987L18.6979 16.8327C18.4503 16.5874 18.1158 16.4501 17.7672 16.4509C17.4185 16.4515 17.0845 16.5904 16.838 16.8368C16.5914 17.0833 16.4526 17.4173 16.4518 17.7659C16.4512 18.1144 16.5886 18.4492 16.8339 18.6968L23.5001 25.3638H21.1687C20.819 25.3638 20.4838 25.5027 20.2366 25.7499C19.9895 25.9971 19.8505 26.3322 19.8505 26.6819L19.8508 26.6821Z" fill="white"/><path d="M11.1656 9.30049L4.50001 2.63605H6.82987C7.17941 2.63605 7.51481 2.4971 7.76198 2.24994C8.00916 2.00278 8.14813 1.66764 8.14813 1.31792C8.14813 0.968417 8.00916 0.633253 7.76198 0.386114C7.51479 0.138953 7.17941 0 6.82987 0H1.24292C0.55653 0 0.000103511 0.55637 0.000103511 1.24269V6.8322C0.000103511 7.1817 0.139071 7.51707 0.386255 7.76421C0.63344 8.01137 0.968616 8.15033 1.31816 8.15033C1.6679 8.15033 2.0031 8.01137 2.25027 7.76421C2.49745 7.51705 2.63642 7.1817 2.63642 6.8322V4.49993L9.30151 11.1649C9.5491 11.4102 9.88387 11.5476 10.2324 11.5467C10.5812 11.5459 10.9151 11.4072 11.1617 11.1608C11.4081 10.9143 11.5468 10.5803 11.5476 10.2317C11.5484 9.88317 11.4111 9.54845 11.1657 9.30084L11.1656 9.30049Z" fill="white"/> </svg>}
                        </button>
                    )}

                    {/* 2. The Text: Centered within a full-width container. Renders on BOTH mobile and desktop. */}
                    <div className="flex justify-center items-center h-full">
                        <div className="flex items-center space-x-4 text-xs text-gray-400 pointer-events-auto">
                            <div className="flex items-center space-x-1.5">
                                <svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path fillRule="evenodd" clipRule="evenodd" d="M13.9645 16.8222L11.6787 19.1079C11.3445 19.4429 11.3445 19.9857 11.6787 20.3204L13.9645 22.6062C14.2994 22.9404 14.8423 22.9404 15.177 22.6062C15.5112 22.2712 15.5112 21.7284 15.177 21.3937L13.4968 19.7143L15.177 18.0349C15.5112 17.7 15.5112 17.1572 15.177 16.8225C14.842 16.4883 14.2992 16.4883 13.9645 16.8225V16.8222Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M16.8217 14.0355L19.1074 16.3213C19.4424 16.6555 19.9852 16.6555 20.3199 16.3213L22.6057 14.0355C22.9399 13.7006 22.9399 13.1577 22.6057 12.823C22.2707 12.4888 21.7279 12.4888 21.3932 12.823L19.7138 14.5032L18.0344 12.823C17.6995 12.4888 17.1566 12.4888 16.8219 12.823C16.4877 13.158 16.4877 13.7008 16.8219 14.0355H16.8217Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M8.91752 18.3994C6.3032 17.9039 4.15009 17.0485 2.85341 15.9501C2.1539 15.3575 1.71386 14.7118 1.71386 14.0003C1.71386 12.9901 2.55339 12.1214 3.83099 11.3638C6.12361 10.0044 9.82882 9.14309 14 9.14309C18.171 10.0044 21.8761 10.0044 24.169 11.3638C25.4468 12.1215 26.2861 12.9901 26.2861 14.0003C26.2861 15.0106 25.4466 15.8792 24.169 16.6369C21.8764 17.9963 18.1712 18.8576 14 18.8576H12.2857C11.8125 18.8576 11.4285 19.2415 11.4285 19.7147C11.4285 20.1879 11.8125 20.5719 12.2857 20.5719H14C18.5338 20.5719 22.5507 19.5889 25.0428 18.1114C26.9561 16.9772 28 15.5136 28 14.0003C28 12.487 26.9561 11.0237 25.0428 9.88929C22.5507 8.41093 18.5335 7.42878 14 7.42878C9.4665 7.42878 5.44931 8.41119 2.95718 9.88929C1.04387 11.0235 0 12.487 0 14.0003C0 15.1644 0.600521 16.2884 1.74567 17.2581C3.21534 18.5027 5.6355 19.5221 8.59902 20.0839C9.06357 20.1719 9.5128 19.8663 9.60083 19.401C9.68885 18.9364 9.38323 18.4872 8.91791 18.3992L8.91752 18.3994Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M18.3988 19.0825C17.9034 21.6968 17.048 23.8499 15.9496 25.1466C15.3569 25.8461 14.7113 26.2861 13.9998 26.2861C12.9896 26.2861 12.1209 25.4466 11.3633 24.169C10.0038 21.8764 9.14257 18.1712 9.14257 14C9.14257 9.82902 10.0038 6.12393 11.3633 3.83099C12.121 2.55319 12.9896 1.71386 13.9998 1.71386C15.01 1.71386 15.8787 2.55339 16.6363 3.83099C17.9958 6.12361 18.857 9.82882 18.857 14V15.7143C18.857 16.1875 19.241 16.5715 19.7142 16.5715C20.1874 16.5715 20.5714 16.1875 20.5714 15.7143V14C20.5714 9.46623 19.5889 5.44931 18.1108 2.95718C16.9766 1.04387 15.5131 0 13.9998 0C12.4865 0 11.0232 1.04387 9.88877 2.95718C8.41041 5.44931 7.42825 9.4665 7.42825 14C7.42825 18.5335 8.41067 22.5507 9.88877 25.0428C11.023 26.9561 12.4865 28 13.9998 28C15.1638 28 16.2878 27.3995 17.2575 26.2543C18.5022 24.7847 19.5216 22.3645 20.0834 19.401C20.1714 18.9364 19.8658 18.4872 19.4005 18.3992C18.9359 18.3112 18.4867 18.6168 18.3986 19.0821L18.3988 19.0825Z" fill="currentColor"/></svg>
                                <span>Drag to Rotate</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7"><path d="M17.7074 0.622701C13.7678 -0.849719 9.19902 0.35492 6.54529 3.54063C3.34439 7.42228 4.00108 12.4284 6.79166 15.7212C4.60296 17.8895 2.41426 20.0312 0.225712 22.1728C-0.0752372 22.4673 -0.0752372 22.976 0.225712 23.2705L0.745564 23.7791C1.04651 24.0736 1.56636 24.0736 1.8673 23.7791C4.08325 21.6108 6.27195 19.4691 8.48796 17.3007C10.4851 18.7731 13.0568 19.5226 15.902 19.0407C20.6076 18.2375 23.8906 14.1952 24 9.59073C23.8905 5.62857 21.5102 2.06825 17.7076 0.622653L17.7074 0.622701ZM14.1783 17.6219C9.69157 17.6219 5.97086 13.9544 5.97086 9.59078C5.97086 5.20044 9.71888 1.53289 14.1783 1.55966C18.7471 1.55966 22.3037 5.20044 22.3857 9.59078C22.2762 13.9811 18.7471 17.6219 14.1783 17.6219Z" fill="currentColor"/><path d="M14.7527 4.2367H13.3848V8.92152H8.81601V10.26H13.3848V14.9449H14.7527V10.26H19.7593V8.92152H14.7527V4.2367Z" fill="currentColor"/></svg>
                                <span>Pinch to Zoom</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* --- END: MODIFIED CODE BLOCK --- */}

            </main>

            {!isVisualizationExpanded && (
                isDesktop ? (
                    <>
                        <AccordionDesktop options={optionsConfig} />
                        <OverviewDesktop />
                    </>
                ) : (
                    <div className="flex flex-col overflow-hidden bg-[#161616]" style={{ flexBasis: 'calc(38.2% + 66px)' }}>
                        <div className="relative flex-grow overflow-hidden">
                            <AccordionMobile
                                ref={mobileListRef}
                                options={optionsConfig}
                                onOpenPanel={handleOpenPanel}
                                openAccordionOptionMobile={openAccordionOptionMobile}
                            />
                            {renderMobilePanel()}
                        </div>
                        <FooterMobile
                            openPanelName={openAccordionOptionMobile?.name}
                            onClosePanel={() => setOpenAccordionOptionMobile(null)}
                            onCompleteOrder={() => alert('Complete Order clicked!')}
                            onReviewClick={() => setOpenAccordionOptionMobile({ name: CONTENT_TYPES.SUMMARY })}
                            isDesktop={isDesktop}
                            openAccordionOptionMobile={openAccordionOptionMobile}
                        />
                    </div>
                )
            )}
        </div>
    );
};

const App = () => (
    <GloveConfiguratorProvider>
        <UI />
    </GloveConfiguratorProvider>
);

export default App;