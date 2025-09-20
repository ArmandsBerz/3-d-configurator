import { SceneManager } from './viewer';
import { SceneContext, GloveLogicController, leatherOptions, fontOptions, colorSwatches, buildOptionsData, webTypeOptions, initialState, getColorDisplay, getActiveColor, DUAL_COLOR_SUB_PARTS, FORMAT_TYPES } from './logic';
import 'wicg-inert';
import React, { useState, useRef, useLayoutEffect, useCallback, useEffect, createContext, useContext, useReducer, ReactNode, ReactElement } from 'react';
import BabylonCanvas from './viewer';
import { SummaryIcon, BackArrowIcon, CheckmarkIcon, LongArrowRightIcon, CaretRightIcon, CaretDownIcon, CaretUpIcon, ShareIcon, CollapseIcon, ExpandIcon, DragIcon, ZoomIcon } from './icons';

// --- START: Core Type Definitions ---

export type HexColor = string;
export type Font = 'SCRIPT' | 'BLOCK';

export type SingleColorPart = { type: 'single'; color: HexColor };
export type DualColorPart = { type: 'dual'; inner: HexColor; outer: HexColor };
export type WebPart = { type: 'web'; webType: string; color: HexColor };
export type TextPart = { type: 'text'; text: string; font: Font; color: HexColor };
export type ColorablePart = SingleColorPart | DualColorPart | WebPart | TextPart;

interface BuildConfig {
    imageSelection: 'imgOpt1' | 'imgOpt2';
    position: 'INFIELD' | 'OUTFIELD' | 'PITCHER' | 'CATCHER' | 'FIRST BASE';
    size: '11"' | '11.25"' | '11.5"' | '11.75"' | '12"';
    handOpeningSize: 'ADULT' | 'YOUTH';
    stiffness: 'STIFF' | 'STANDARD' | 'SOFT';
    throwingHand: 'RIGHT HAND' | 'LEFT HAND';
}

export interface GloveConfiguration {
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

export interface AppState {
    configuration: GloveConfiguration;
    activeDualColorPart: (typeof DUAL_COLOR_SUB_PARTS)[keyof typeof DUAL_COLOR_SUB_PARTS];
}

export type GloveAction =
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
    headerRef: React.RefObject<HTMLButtonElement | null>;
}
interface ColorPanelProps {
    context: { id: ColorPartId; title: string };
    onClose: () => void;
    headerRef: React.RefObject<HTMLButtonElement | null>;
}
interface TextPanelProps {
    context: { id: TextPartId; title: string };
    onClose: () => void;
    headerRef: React.RefObject<HTMLButtonElement | null>;
}
interface GalleryPanelProps {
    context: { id: GalleryPartId; title: string };
    onClose: () => void;
    headerRef: React.RefObject<HTMLButtonElement | null>;
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

export const NUMERIC_CONSTANTS = {
    SCROLL_THRESHOLD: 1,
    DESKTOP_BREAKPOINT: '1024px',
} as const;

// --- END: Application-Wide Constants ---

// --- Constants (Decoupled Data Sources) ---

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

// --- Centralized State Management ---

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

export const useGloveConfigurator = () => {
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
    tabIndex?: number;
}
const ImageOption = React.forwardRef<HTMLButtonElement, ImageOptionProps>(
    ({ title, isSelected, onSelect, tabIndex }, ref) => (
        <button ref={ref} tabIndex={tabIndex} className={`relative h-[100px] cursor-pointer flex flex-col justify-center items-center text-center bg-[#2a2a2a] ${isSelected ? 'border-4 border-white' : 'hover:bg-[#333333]'} focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white`} onClick={onSelect}>
            <h4 className="text-base font-semibold text-white">{title}</h4>
            {isSelected && <div className="absolute top-0 right-0 w-[28px] h-[28px] bg-white flex items-center justify-center"><CheckmarkIcon /></div>}
        </button>
    )
);

interface PrimaryCTAButtonProps {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel?: string;
}
const PrimaryCTAButton = ({ label, onClick, ariaLabel }: PrimaryCTAButtonProps) => (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-between px-4 bg-[#2997FF] hover:bg-[#73BBFF] active:bg-[#0083FF] text-base font-semibold text-white h-[56px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" aria-label={ariaLabel || label}>
        <span className="ml-[5px]">{label}</span>
        <LongArrowRightIcon />
    </button>
);

interface SecondaryButtonProps {
    label: ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    variant?: (typeof VARIANTS.THEME)[keyof typeof VARIANTS.THEME];
    icon?: ReactNode | null;
    disabled?: boolean;
    justify?: 'justify-center' | 'justify-between';
}

const SecondaryButton = ({
    label,
    onClick,
    variant = VARIANTS.THEME.DARK,
    icon = null,
    disabled = false,
    justify = 'justify-center',
}: SecondaryButtonProps) => {
    const baseClasses = `w-full flex items-center px-4 text-base font-semibold h-[56px] focus:outline-none transition-opacity ${justify}`;
    const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = variant === VARIANTS.THEME.LIGHT
        ? 'bg-white hover:bg-gray-200 active:bg-gray-300 text-[#161616] focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-400'
        : 'bg-[#393939] hover:bg-[#727272] active:bg-[#222222] text-white focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
            aria-label={typeof label === 'string' ? label : undefined}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

interface ColorSwatchProps {
    color: HexColor;
    name: string;
    isSelected: boolean;
    onSelect: () => void;
    tabIndex: number;
    elRef: React.RefObject<HTMLButtonElement>;
}
const ColorSwatch = ({ color, name, isSelected, onSelect, tabIndex, elRef }: ColorSwatchProps) => (
    <button
        ref={elRef}
        tabIndex={tabIndex}
        role="radio"
        aria-checked={isSelected}
        className={`w-[42px] h-[42px] rounded-full border-2 focus:outline-none ${isSelected ? 'border-transparent ring-4 ring-white' : 'border-transparent focus-visible:ring-4 focus-visible:ring-white/50'}`}
        style={{ backgroundColor: color }}
        onClick={onSelect}
        aria-label={`Select color ${name}`}
    />
);

interface ColorSwatchGridProps {
    swatches: { name: string, hex: HexColor }[];
    selectedColor: HexColor | undefined;
    onColorSelect: (color: HexColor) => void;
}
const ColorSwatchGrid = ({ swatches, selectedColor, onColorSelect }: ColorSwatchGridProps) => {
    const { containerRef, itemRefs, showNavigationHint, gridEventHandlers, activeIndex, setActiveIndex } = useGridNavigation<HTMLDivElement>(swatches.length);
    const itemRefsCasted = itemRefs as React.MutableRefObject<React.RefObject<HTMLButtonElement>[]>;

    return (
        <div
            ref={containerRef}
            className="option-group-container relative grid grid-cols-[repeat(auto-fit,minmax(42px,1fr))] gap-[10px] px-2 py-2"
            role="radiogroup"
            {...gridEventHandlers}
        >
            <NavigationHint isVisible={showNavigationHint} />
            {swatches.map((swatch, index) => {
                const isSelected = selectedColor === swatch.hex;
                return (
                    <ColorSwatch
                        key={swatch.hex}
                        elRef={itemRefsCasted.current[index]}
                        color={swatch.hex}
                        name={swatch.name}
                        isSelected={isSelected}
                        onSelect={() => {
                            onColorSelect(swatch.hex);
                            setActiveIndex(index);
                        }}
                        tabIndex={index === activeIndex ? 0 : -1}
                    />
                );
            })}
        </div>
    );
};

// --- Accordion Containers ---

interface AccordionOptionHeaderProps {
    title: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    accessoryContent: ReactNode;
    icon: (typeof ICONS.DESKTOP) | (typeof ICONS.MOBILE);
    isOpen: boolean;
    variant: (typeof VARIANTS.LAYOUT)[keyof typeof VARIANTS.LAYOUT];
    controlsId: string;
}
const AccordionOptionHeader = React.forwardRef<HTMLButtonElement, AccordionOptionHeaderProps>(
    ({ title, onClick, accessoryContent, icon, isOpen, variant, controlsId }, ref) => {
    const baseClasses = "w-full flex justify-between items-center text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white";
    const variantClasses = variant === VARIANTS.LAYOUT.DESKTOP ? "p-4 h-[56px] hover:bg-[#2A2A2A] transition-colors" : "py-3 h-[56px] mb-3 text-white";
    return (
        <button ref={ref} onClick={onClick} className={`${baseClasses} ${variantClasses}`} aria-expanded={isOpen} aria-controls={controlsId}>
            <div className="flex items-center space-x-3">
                {icon === ICONS.DESKTOP && <CaretRightIcon className={`h-[15px] w-auto transform transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />}
                {icon === ICONS.MOBILE && <CaretDownIcon className="w-5 h-5 mr-2 transform rotate-90" />}
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <div className="flex items-center">{accessoryContent}</div>
        </button>
    );
});

interface AccordionOptionDesktopProps {
    title: string;
    children: ReactNode;
    isOpen: boolean;
    onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
    headerRef: React.RefObject<HTMLButtonElement | null>;
}
const AccordionOptionMobile = ({ title, onClose, headerAccessory = null, children, headerRef }: AccordionOptionMobileProps) => {
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

    const handleReactiveScrollFix = (event: React.FocusEvent<HTMLDivElement>) => {
        const parentGroup = (event.target as HTMLElement).closest('.option-group-container');
        if (parentGroup) {
            parentGroup.scrollIntoView({
                behavior: 'auto',
                block: 'nearest'
            });
        }
    };

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
        <div className="absolute inset-0 bg-[#161616] z-20 h-full flex flex-col px-[19px]">
            <AccordionOptionHeader ref={headerRef} variant={VARIANTS.LAYOUT.MOBILE} title={title} onClick={onClose} accessoryContent={headerAccessory} icon={ICONS.MOBILE} isOpen={true} controlsId={`mobile-panel-${title.replace(/\s+/g, '-')}`} />
            <div className="flex-grow relative overflow-hidden p-[4px]">
                <ScrollGradient position={POSITIONS.TOP} isVisible={isTopGradientVisible} />
                <div className="h-full overflow-y-auto focus:outline-none focus-visible:ring-4 focus-visible:ring-white" ref={scrollContainerRef} onFocusCapture={handleReactiveScrollFix}>{children}</div>
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
        <div className="option-group-container">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{labels.inner}</h3>
            <ColorSwatchGrid swatches={colorSwatches} selectedColor={value.inner} onColorSelect={(color) => onChange(DUAL_COLOR_SUB_PARTS.INNER, color)} />
        </div>
        <div className="option-group-container">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{labels.outer}</h3>
            <ColorSwatchGrid swatches={colorSwatches} selectedColor={value.outer} onColorSelect={(color) => onChange(DUAL_COLOR_SUB_PARTS.OUTER, color)} />
        </div>
    </div>
);

interface OptionProps {
    label: string;
    isSelected: boolean;
    onSelect: () => void;
    tabIndex?: number;
}
const Option = React.forwardRef<HTMLButtonElement, OptionProps>(
    ({ label, isSelected, onSelect, tabIndex }, ref) => (
        <button ref={ref} tabIndex={tabIndex} className={`text-sm py-2 px-3 h-[40px] flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-inset ${isSelected ? 'bg-white text-[#222222] focus-visible:ring-blue-400' : 'bg-[#383838] hover:bg-[#595959] active:bg-[#272727] focus-visible:ring-white'}`} onClick={onSelect}>
            {label}
        </button>
    )
);

interface OptionGroupProps {
    title: string;
    options: { id: string, label: string }[];
    layout: string;
    selectedOption: string;
    onSelectOption: (id: string) => void;
}
const OptionGroup = ({ title, options, layout, selectedOption, onSelectOption }: OptionGroupProps) => {
    const { containerRef, itemRefs, showNavigationHint, gridEventHandlers, activeIndex, setActiveIndex } = useGridNavigation<HTMLDivElement>(options.length);
    const itemRefsCasted = itemRefs as React.MutableRefObject<React.RefObject<HTMLButtonElement>[]>;

    return (
        <div className="option-group-container">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
            <div ref={containerRef} className={`relative grid ${layout} gap-2`} {...gridEventHandlers}>
                <NavigationHint isVisible={showNavigationHint} />
                {options.map((option, index) => {
                    const isSelected = selectedOption === option.id;
                    return (
                        <Option
                            key={option.id}
                            ref={itemRefsCasted.current[index]}
                            label={option.label}
                            isSelected={isSelected}
                            onSelect={() => {
                                onSelectOption(option.id);
                                setActiveIndex(index);
                            }}
                            tabIndex={index === activeIndex ? 0 : -1}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface ImageGroupProps {
    title: string;
    options: { id: string, title: string }[];
    layout: string;
    selectedOption: string;
    onSelectOption: (id: string) => void;
}
const ImageGroup = ({ title, options, layout, selectedOption, onSelectOption }: ImageGroupProps) => {
    const { containerRef, itemRefs, showNavigationHint, gridEventHandlers, activeIndex, setActiveIndex } = useGridNavigation<HTMLDivElement>(options.length);
    const itemRefsCasted = itemRefs as React.MutableRefObject<React.RefObject<HTMLButtonElement>[]>;

    return (
        <div className="option-group-container">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{title}</h3>
            <div ref={containerRef} className={`relative grid ${layout} gap-[10px]`} {...gridEventHandlers}>
                <NavigationHint isVisible={showNavigationHint} />
                {options.map((option, index) => {
                    const isSelected = selectedOption === option.id;
                    return (
                        <ImageOption
                            key={option.id}
                            ref={itemRefsCasted.current[index]}
                            id={option.id}
                            title={option.title}
                            isSelected={isSelected}
                            onSelect={() => {
                                onSelectOption(option.id);
                                setActiveIndex(index);
                            }}
                            tabIndex={index === activeIndex ? 0 : -1}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface BuildOptionProps {
    isDesktop: boolean;
}
const BuildOption = ({ isDesktop }: BuildOptionProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const { build: buildConfig } = state.configuration;
    const onBuildConfigChange = (newConfig: BuildConfig) => dispatch({ type: ACTION_TYPES.UPDATE_BUILD, payload: newConfig });
    return (
        <div className={`space-y-6 ${!isDesktop ? 'pb-4' : ''}`}>
            <ImageGroup
                title="Glove Leather"
                layout="grid-cols-2"
                options={leatherOptions}
                selectedOption={buildConfig.imageSelection}
                onSelectOption={(value) => onBuildConfigChange({ ...buildConfig, imageSelection: value as 'imgOpt1' | 'imgOpt2' })}
            />
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

    const { containerRef, itemRefs, showNavigationHint, gridEventHandlers, activeIndex, setActiveIndex } = useGridNavigation<HTMLDivElement>(fontOptions.length);
    const itemRefsCasted = itemRefs as React.MutableRefObject<React.RefObject<HTMLButtonElement>[]>;

    return (
        <div className="space-y-5">
            <div className="option-group-container">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Text</h3>
                <input type="text" className="w-full p-3 bg-[#2A2A2A] text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={value.text} onChange={(e) => onChange({ ...value, text: e.target.value })} placeholder="ENTER YOUR TEXT..." />
            </div>
            <div className="option-group-container">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Font</h3>
                <div ref={containerRef} className="relative grid grid-cols-2 gap-3" {...gridEventHandlers}>
                    <NavigationHint isVisible={showNavigationHint} />
                    {fontOptions.map((font, index) => (
                        <button
                            key={font.id}
                            ref={itemRefsCasted.current[index]}
                            onClick={() => {
                                onChange({ ...value, font: font.id });
                                setActiveIndex(index);
                            }}
                            tabIndex={index === activeIndex ? 0 : -1}
                            className={`py-3 text-base font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-inset ${value.font === font.id ? 'bg-white text-black focus-visible:ring-blue-400' : 'bg-[#2a2a2a] hover:bg-[#333333] text-white focus-visible:ring-white'}`}
                        >
                            {font.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="option-group-container">
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
            <div className="option-group-container">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Color</h3>
                <ColorSwatchGrid swatches={colorSwatches} selectedColor={config.color} onColorSelect={(color) => onConfigChange({ ...config, color: color })} />
            </div>
        </div>
    );
};

// --- Panel Components ---

const SummaryPanel = ({ onClose, headerRef }: { onClose: () => void, headerRef: React.RefObject<HTMLButtonElement | null> }) => <OverviewMobile onClose={onClose} headerRef={headerRef} />;

const BuildPanel = ({ context, onClose, headerRef }: BuildPanelProps) => (
    <AccordionOptionMobile title={context.title} onClose={onClose} headerRef={headerRef}>
        <BuildOption isDesktop={false} />
    </AccordionOptionMobile>
);

const GalleryPanel = ({ context, onClose, headerRef }: GalleryPanelProps) => {
    const { state } = useGloveConfigurator();
    const headerAccessory = (
        <span className="text-sm text-gray-400 font-semibold truncate max-w-[150px]">
            {`${webTypeOptions.find(opt => opt.id === state.configuration.web.webType)?.title || ''} · ${getColorDisplay(state.configuration.web, {format: FORMAT_TYPES.HEADER})}`}
        </span>
    );
    return (
        <AccordionOptionMobile title={context.title} onClose={onClose} headerAccessory={headerAccessory} headerRef={headerRef}>
            <GalleryOption isDesktop={false} />
        </AccordionOptionMobile>
    );
};

const TextPanel = ({ context, onClose, headerRef }: TextPanelProps) => {
    const { state } = useGloveConfigurator();
    const headerAccessory = <span className="text-sm text-gray-400 truncate max-w-[100px]">{state.configuration[context.id].text}</span>;
    return (
        <AccordionOptionMobile title={context.title} onClose={onClose} headerAccessory={headerAccessory} headerRef={headerRef}>
            <TextOption contextId={context.id} />
        </AccordionOptionMobile>
    );
};

const ColorPanel = ({ context, onClose, headerRef }: ColorPanelProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const { id, title } = context;
    const colorValue = state.configuration[id];

    const headerAccessory = (
        <span className="text-sm text-gray-400 font-semibold">
            {getColorDisplay(colorValue, { format: FORMAT_TYPES.HEADER })}
        </span>
    );

    return (
        <AccordionOptionMobile title={title} onClose={onClose} headerAccessory={headerAccessory} headerRef={headerRef}>
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

const OverviewMobile = ({ onClose, headerRef }: { onClose: () => void, headerRef: React.RefObject<HTMLButtonElement | null> }) => (
    <AccordionOptionMobile title="Order Summary" onClose={onClose} headerRef={headerRef}>
        <OrderSummaryInfo />
    </AccordionOptionMobile>
);

interface OverviewButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    isDesktop: boolean;
    isOpen: boolean;
}
const OverviewButton = ({ onClick, isDesktop, isOpen }: OverviewButtonProps) => (
    <button type="button" onClick={onClick} className={`w-full flex items-center h-[56px] bg-[#393939] hover:bg-[#727272] active:bg-[#222222] text-base font-semibold text-white px-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white ${isDesktop ? 'justify-between' : 'justify-center'}`} aria-label="Open summary panel" aria-expanded={isOpen} aria-controls="overview-content">
        <div className="flex items-center space-x-2">
            <SummaryIcon />
            <span>Overview</span>
        </div>
        {isDesktop && <CaretUpIcon className={`w-5 h-5 text-white transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />}
    </button>
);

interface OrderButtonControllerProps {
    isSummaryVisible: boolean;
    onReviewClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
    onReviewClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onCompleteOrder: () => void;
    isDesktop: boolean;
    openAccordionOptionMobile: MobileAccordionState;
}

interface OverviewActionControllerProps {
    isOpen: boolean;
    onOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const OverviewActionController = ({ isOpen, onOpen, onClose }: OverviewActionControllerProps) => {
    if (isOpen) {
        return (
            <SecondaryButton
                label="Back"
                onClick={onClose}
                variant={VARIANTS.THEME.DARK}
                icon={<BackArrowIcon />}
            />
        );
    }

    return (
        <SecondaryButton
            onClick={onOpen}
            variant={VARIANTS.THEME.DARK}
            justify="justify-center"
            label={
                <div className="flex items-center space-x-2">
                    <SummaryIcon />
                    <span>Overview</span>
                </div>
            }
        />
    );
};


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
    const isSummaryOpen = openPanelName === CONTENT_TYPES.SUMMARY;

    if (!openPanelName || isSummaryOpen) {
        return (
            <footer className="flex-shrink-0 bg-[#161616] flex items-center justify-start pb-[20px] px-[14px] pt-[10px]">
                <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]">
                    <OverviewActionController
                        isOpen={isSummaryOpen}
                        onOpen={onReviewClick}
                        onClose={onClosePanel}
                    />
                    <OrderButtonController
                        isSummaryVisible={isSummaryOpen}
                        onReviewClick={onReviewClick}
                        onCompleteClick={onCompleteOrder}
                    />
                </div>
            </footer>
        );
    }

    let panelSpecificFooter: ReactElement;
    switch (openPanelName) {
        case CONTENT_TYPES.COLOR:
        case CONTENT_TYPES.DUAL_COLOR:
        case CONTENT_TYPES.GALLERY:
            panelSpecificFooter = (
                <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]">
                    <SecondaryButton label="Apply to All" onClick={() => onApplyColorToAll(colorToApply)} variant={VARIANTS.THEME.DARK} icon={<CheckmarkIcon />} disabled={!colorToApply} />
                    <SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={<CheckmarkIcon />} />
                </div>
            );
            break;

        case CONTENT_TYPES.BUILD:
        case CONTENT_TYPES.TEXT:
            panelSpecificFooter = (
                <SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={<CheckmarkIcon />} />
            );
            break;

        default:
            const exhaustiveCheck: never = openPanelName;
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = exhaustiveCheck;
            panelSpecificFooter = <div />;
    }

    return (
        <footer className="flex-shrink-0 bg-[#161616] flex items-center justify-start pb-[20px] px-[14px] pt-[10px]">
            {panelSpecificFooter}
        </footer>
    );
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

const NavigationHint = ({ isVisible }: { isVisible: boolean }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 flex items-start justify-center pt-[10px] bg-black bg-opacity-65 z-10 pointer-events-none">
            <p className="text-white text-sm font-semibold">Use arrow keys to navigate</p>
        </div>
    );
};

const useGridNavigation = <T extends HTMLElement>(itemCount: number) => {
    const [showNavigationHint, setShowNavigationHint] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const mouseClickInProgress = useRef(false);
    const containerRef = useRef<T>(null);
    const itemRefs = useRef<React.RefObject<HTMLElement>[]>([]);

    if (itemRefs.current.length !== itemCount) {
        itemRefs.current = Array(itemCount).fill(null).map((_, i) => itemRefs.current[i] || React.createRef());
    }

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
        if (mouseClickInProgress.current) {
            mouseClickInProgress.current = false;
            const newIndex = itemRefs.current.findIndex(ref => ref.current === document.activeElement);
            if (newIndex !== -1) {
                setActiveIndex(newIndex);
            }
            return;
        }
        if (containerRef.current && !containerRef.current.contains(event.relatedTarget as Node)) {
            setShowNavigationHint(true);
        }
    };

    const handleMouseDown = () => {
        mouseClickInProgress.current = true;
        setShowNavigationHint(false);
    };

    const handleBlur = () => {
        setShowNavigationHint(false);
        mouseClickInProgress.current = false;
        setActiveIndex(0);
    };

    const handleKeyDown = (event: React.KeyboardEvent<T>) => {
        const { key } = event;

        if (['Enter', ' '].includes(key)) {
            if (showNavigationHint) {
                setShowNavigationHint(false);
            }
            return;
        }

        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            return;
        }
        event.preventDefault();

        if (showNavigationHint) {
            setShowNavigationHint(false);
        }

        const focusedIndex = activeIndex;
        if (focusedIndex === -1) return;

        const container = containerRef.current;
        if (!container) return;
        
        const numColumns = window.getComputedStyle(container).gridTemplateColumns.split(' ').length;
        if (numColumns === 0) return;

        let nextIndex = focusedIndex;

        switch (key) {
            case 'ArrowRight':
                nextIndex = focusedIndex + 1;
                break;
            case 'ArrowLeft':
                nextIndex = focusedIndex - 1;
                break;
            case 'ArrowUp':
                nextIndex = focusedIndex - numColumns;
                break;
            case 'ArrowDown':
                nextIndex = focusedIndex + numColumns;
                break;
        }
        
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
            const currentRow = Math.floor(focusedIndex / numColumns);
            const nextRow = Math.floor(nextIndex / numColumns);
            if (currentRow !== nextRow) {
                return;
            }
        }

        if (nextIndex >= 0 && nextIndex < itemCount) {
            itemRefs.current[nextIndex]?.current?.focus();
            setActiveIndex(nextIndex);
        }
    };
    
    const gridEventHandlers = {
        onFocus: handleFocus,
        onMouseDown: handleMouseDown,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
    };

    return { containerRef, itemRefs, showNavigationHint, gridEventHandlers, activeIndex, setActiveIndex };
};

const useEscapeKey = (ref: React.RefObject<HTMLElement | null>, callback: () => void, isListening: boolean = true) => {
    useEffect(() => {
        const element = ref.current;
        if (!isListening || !element) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                callback();
            }
        };

        element.addEventListener('keydown', handleKeyDown);

        return () => {
            element.removeEventListener('keydown', handleKeyDown);
        };
    }, [ref, callback, isListening]);
};

const OverviewDesktop = () => {
    const [agnosticAccordionOpen, setAgnosticAccordionOpen] = useState(false);
    const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const closeOverview = useCallback(() => setAgnosticAccordionOpen(false), []);
    useEscapeKey(containerRef, closeOverview, agnosticAccordionOpen);

    useLayoutEffect(() => {
        if (!agnosticAccordionOpen && triggerButtonRef.current) {
            triggerButtonRef.current.focus();
            triggerButtonRef.current = null;
        }
    }, [agnosticAccordionOpen]);

    const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        triggerButtonRef.current = event.currentTarget;
        setAgnosticAccordionOpen(true);
    };

    const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!agnosticAccordionOpen) {
            triggerButtonRef.current = event.currentTarget;
        }
        setAgnosticAccordionOpen(!agnosticAccordionOpen);
    };

    return (
        <div ref={containerRef} className="flex lg:absolute lg:bottom-[60px] lg:right-[60px] fixed w-full bottom-[-1rem] flex-row items-center gap-4 lg:flex-col lg:justify-end lg:w-auto lg:h-auto lg:gap-0 pointer-events-auto">
            <div className="lg:w-[400px] text-[#999999] font-black text-[1.3rem] my-0 lg:mb-2.5 mx-0 flex flex-col justify-end lg:h-auto h-[80.8vh]">
                <OverviewButton onClick={handleToggle} isDesktop={true} isOpen={agnosticAccordionOpen} />
                <div  
                    id="overview-content"
                    className={`bg-[#222222] transition-[height] duration-300 ease-in ${agnosticAccordionOpen ? 'overflow-y-scroll h-auto lg:h-[calc(100vh-335px)]' : 'overflow-hidden h-0'} focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white show-thin-scrollbar`}
                >
                    <div className="text-base py-3.5 px-6">
                        <OrderSummaryInfo />
                    </div>
                </div>
            </div>
            <div className="lg:w-[400px] w-full self-end mb-[1.9rem] mr-[2.5rem] lg:m-0 z-[1]">
                <OrderButtonController  
                    isSummaryVisible={agnosticAccordionOpen}  
                    onReviewClick={handleOpen}  
                    onCompleteClick={() => alert('Proceeding to next step...')}  
                />
            </div>
        </div>
    );
};

// --- Main Accordion Components ---

const AccordionDesktop = ({ options }: { options: OptionsConfigItem[] }) => {
    const { state, dispatch } = useGloveConfigurator();
    const { configuration, activeDualColorPart } = state;
    const [openAccordion, setOpenAccordion] = useState<string | null>(CONTENT_TYPES.BUILD);
    const closingPanelIdRef = useRef<string | null>(null);
    const accordionContainerRef = useRef<HTMLDivElement>(null);
    const [isTopGradientVisible, setTopGradientVisible] = useState(false);
    const [isBottomGradientVisible, setBottomGradientVisible] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleAccordionToggle = (accordionId: string, event: React.MouseEvent<HTMLButtonElement>) => {
        if (openAccordion === accordionId) {
            closingPanelIdRef.current = accordionId;
        }
        setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
    };

    const closeAccordion = useCallback(() => {
        if (document.activeElement === accordionContainerRef.current) {
            return;
        }
        closingPanelIdRef.current = openAccordion;
        setOpenAccordion(null);
    }, [openAccordion]);

    useEscapeKey(accordionContainerRef, closeAccordion, openAccordion !== null);

    useLayoutEffect(() => {
        if (openAccordion === null && closingPanelIdRef.current) {
            const panelIdToFocus = closingPanelIdRef.current;
            const panelData = options.find(opt => opt.id === panelIdToFocus);

            if (panelData) {
                const contentId = `content-${panelData.title.replace(/\s+/g, '-')}`;
                const headerButtonToFocus = accordionContainerRef.current?.querySelector(`button[aria-controls="${contentId}"]`);
                
                if (headerButtonToFocus instanceof HTMLButtonElement) {
                    headerButtonToFocus.focus();
                }
            }
            
            closingPanelIdRef.current = null;
        }
    }, [openAccordion, options]);

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

    const handleReactiveScrollFix = (event: React.FocusEvent<HTMLDivElement>) => {
        const parentGroup = (event.target as HTMLElement).closest('.option-group-container');
        if (parentGroup) {
            parentGroup.scrollIntoView({
                behavior: 'auto',
                block: 'nearest'
            });
        }
    };

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
                <div ref={accordionContainerRef} className="h-full overflow-y-auto space-y-4 focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-white focus-visible:outline-offset-[-4px]" onFocusCapture={handleReactiveScrollFix}>
                    {options.map(item => (
                        <AccordionOptionDesktop
                            key={item.id}
                            title={item.title}
                            isOpen={openAccordion === item.id}
                            onToggle={(e) => handleAccordionToggle(item.id, e)}
                            headerContent={renderHeaderAccessory(item)}
                            actionButton={
                                (() => {
                                    if (item.contentType === CONTENT_TYPES.COLOR || item.contentType === CONTENT_TYPES.DUAL_COLOR || item.contentType === CONTENT_TYPES.GALLERY) {
                                        const configValue = configuration[item.id as keyof Omit<GloveConfiguration, 'build'>];
                                        return (
                                            <SecondaryButton
                                                label="Apply to All"
                                                onClick={() => handleApplyColorToAll(getActiveColor(configValue, activeDualColorPart))}
                                                icon={<CheckmarkIcon />}
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
    onOpenPanel: (item: OptionsConfigItem, event: React.MouseEvent<HTMLButtonElement>) => void;
    openAccordionOptionMobile: MobileAccordionState;
}

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
                    <button key={item.id} data-id={item.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] cursor-pointer hover:bg-[#2A2A2A] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={(e) => onOpenPanel(item, e)}>
                        <div className="flex items-center">
                            <CaretRightIcon className="h-4 w-auto mr-3" />
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


// --- Main UI Component (THIS IS THE MODIFIED VERSION) ---
const UI = () => {
    const isDesktop = useBreakpoint();
    const { state } = useGloveConfigurator();
    const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
    const [openAccordionOptionMobile, setOpenAccordionOptionMobile] = useState<MobileAccordionState>(null);
    const appContainerRef = useRef<HTMLDivElement>(null);

    // --- START: 1 of 2 ADDED SECTIONS ---
    // This new ref and effect hook handle the resizing logic.
    const mainRef = useRef<HTMLElement>(null);

    useEffect(() => {
    const babylonContainer = document.getElementById('babylon-container');
    const mainEl = mainRef.current;

    if (!babylonContainer || !mainEl) {
        return;
    }

    const observer = new ResizeObserver(entries => {
        // Defer the DOM update to the next animation frame
        window.requestAnimationFrame(() => {
            for (let entry of entries) {
                const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];

                // Set the size using the original, precise values
                babylonContainer.style.width = `${width}px`;
                babylonContainer.style.height = `${height}px`;
            }
        });
    });

    observer.observe(mainEl);

    return () => {
        observer.disconnect();
    };
}, []); // The empty array ensures this effect runs only once.
    // --- END: 1 of 2 ADDED SECTIONS ---

    // --- Application-level Focus Containment ---
    useEffect(() => {
        const container = appContainerRef.current;
        if (!container) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            const focusableElements = Array.from(
                container.querySelectorAll<HTMLElement>(
                    'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter(el => !el.hasAttribute('inert') && window.getComputedStyle(el).display !== 'none');

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        };
        
        container.addEventListener('keydown', handleKeyDown);
        return () => {
            if (container) {
                container.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [isDesktop, openAccordionOptionMobile, isVisualizationExpanded]); // Re-run when layout changes might alter focusable elements

    // --- START: Focus Management Implementation ---
    const mobileListRef = useRef<HTMLElement>(null);
    const panelHeaderRef = useRef<HTMLButtonElement | null>(null);
    const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

    useLayoutEffect(() => {
        const listElement = mobileListRef.current;
        if (!listElement) return;

        if (openAccordionOptionMobile) {
            // Panel is open, make list inert
            listElement.setAttribute('inert', '');
            // Set focus immediately after DOM mutation but before paint
            panelHeaderRef.current?.focus();
        } else {
            // Panel is closed, remove inert and return focus
            listElement.removeAttribute('inert');
            if (triggerButtonRef.current) {
                triggerButtonRef.current.focus();
                triggerButtonRef.current = null; // Clear ref after use
            }
        }
    }, [openAccordionOptionMobile]);

    const handleOpenPanel = (item: OptionsConfigItem, event: React.MouseEvent<HTMLButtonElement>) => {
        triggerButtonRef.current = event.currentTarget; // Save the trigger button
        const { id, title, contentType } = item;
    
        let panelState: MobileAccordionState;
    
        switch (contentType) {
            case CONTENT_TYPES.BUILD:
                panelState = {
                    name: contentType,
                    context: { id: id as 'build', title }
                };
                break;
            case CONTENT_TYPES.GALLERY:
                panelState = {
                    name: contentType,
                    context: { id: id as GalleryPartId, title }
                };
                break;
            case CONTENT_TYPES.COLOR:
            case CONTENT_TYPES.DUAL_COLOR:
                panelState = {
                    name: contentType,
                    context: { id: id as ColorPartId, title }
                };
                break;
            case CONTENT_TYPES.TEXT:
                panelState = {
                    name: contentType,
                    context: { id: id as TextPartId, title }
                };
                break;
            default:
                const _exhaustiveCheck: never = contentType;
                throw new Error(`Unhandled content type: ${_exhaustiveCheck}`);
        }
    
        setOpenAccordionOptionMobile(panelState);
    };

    const handleClosePanel = useCallback(() => {
        setOpenAccordionOptionMobile(null);
    }, []);

    useEscapeKey(appContainerRef, handleClosePanel, !!openAccordionOptionMobile);

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

        const onClose = handleClosePanel;

        switch (openAccordionOptionMobile.name) {
            case CONTENT_TYPES.SUMMARY:
                return <SummaryPanel onClose={onClose} headerRef={panelHeaderRef} />;
            case CONTENT_TYPES.BUILD:
                return <BuildPanel context={openAccordionOptionMobile.context} onClose={onClose} headerRef={panelHeaderRef} />;
            case CONTENT_TYPES.GALLERY:
                return <GalleryPanel context={openAccordionOptionMobile.context} onClose={onClose} headerRef={panelHeaderRef} />;
            case CONTENT_TYPES.COLOR:
            case CONTENT_TYPES.DUAL_COLOR:
                return <ColorPanel context={openAccordionOptionMobile.context} onClose={onClose} headerRef={panelHeaderRef} />;
            case CONTENT_TYPES.TEXT:
                return <TextPanel context={openAccordionOptionMobile.context} onClose={onClose} headerRef={panelHeaderRef} />;
            default:
                const exhaustiveCheck: never = openAccordionOptionMobile;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _ = exhaustiveCheck;
                return null;
        }
    };

    const GOLDEN_RATIO_CONSTANT = 1.618;
    const VIZ_PROPORTION = 1 / GOLDEN_RATIO_CONSTANT;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const CONTROLS_PROPORTION = 1 - VIZ_PROPORTION;

    const handleReviewClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // 1. Set the trigger ref, just like handleOpenPanel does
        triggerButtonRef.current = event.currentTarget;  

        // 2. Open the summary panel
        setOpenAccordionOptionMobile({ name: CONTENT_TYPES.SUMMARY });
    };

    return (
        <div ref={appContainerRef} className="flex flex-col lg:relative w-full h-full bg-transparent text-white">
            {/* --- START: 2 of 2 ADDED SECTIONS --- */}
            {/* The ref={mainRef} is the only change in this entire <main> tag. */}
            <main ref={mainRef} className={`p-4 flex flex-col items-center justify-center relative bg-transparent overflow-auto h-full w-full ${isVisualizationExpanded ? 'flex-grow' : 'lg:absolute lg:inset-0'}`} style={!isDesktop && !isVisualizationExpanded ? { flexBasis: 'calc(61.8% - 66px)' } : {}}>
            {/* --- END: 2 of 2 ADDED SECTIONS --- */}
                {!isDesktop && <div className="absolute top-[20px] left-[20px] w-[70px] h-[49px] bg-gray-300 bg-opacity-75 z-10 flex items-center justify-center pointer-events-auto"><p className="font-bold text-xl text-gray-900">LOGO</p></div>}
                <button className="absolute top-[20px] right-[20px] z-20 p-2 hover:bg-gray-800 hover:bg-opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white pointer-events-auto" aria-label="Share configuration" onClick={handleShare}>
                    <ShareIcon />
                </button>
            
                <div className="absolute bottom-4 inset-x-0 h-8 z-10 pointer-events-none" aria-hidden="true">
                    {!isDesktop && (
                        <button
                            className="absolute left-5 bottom-0 p-1 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white pointer-events-auto"
                            onClick={() => setIsVisualizationExpanded(!isVisualizationExpanded)}
                            aria-label={isVisualizationExpanded ? "Collapse visualization" : "Expand visualization"}
                        >
                            {isVisualizationExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </button>
                    )}
                    <div className="flex justify-center items-center h-full">
                        <div className="flex items-center space-x-4 text-xs text-gray-400 pointer-events-auto">
                            <div className="flex items-center space-x-1.5">
                                <DragIcon />
                                <span>Drag to Rotate</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <ZoomIcon />
                                <span>Pinch to Zoom</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {!isVisualizationExpanded && (
                isDesktop ? (
                    <>
                        <AccordionDesktop options={optionsConfig} />
                        <OverviewDesktop />
                    </>
                ) : (
                    <div className="flex flex-col overflow-hidden bg-[#161616] pointer-events-auto" style={{ flexBasis: 'calc(38.2% + 66px)' }}>
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
                            onClosePanel={handleClosePanel}
                            onCompleteOrder={() => alert('Complete Order clicked!')}
                            onReviewClick={handleReviewClick}
                            isDesktop={isDesktop}
                            openAccordionOptionMobile={openAccordionOptionMobile}
                        />
                    </div>
                )
            )}
        </div>
    );
};

const App = () => {
    // NEW: State to hold the SceneManager instance once it's ready.
    const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);

    return (
        <GloveConfiguratorProvider>
            {/* NEW: Provider that makes the sceneManager available to the logic controller */}
            <SceneContext.Provider value={sceneManager}>

                {/* This part remains mostly the same */}
                <div id="app-root" className="relative w-full h-[100dvh] bg-[#161616]">
                    <div id="babylon-container" className="absolute inset-0 z-10">
                        {/* MODIFIED: Pass the onSceneReady callback to get the manager instance */}
                        <BabylonCanvas onSceneReady={setSceneManager} />
                    </div>
                    <div id="ui-container" className="absolute inset-0 z-20 pointer-events-none">
                        <UI />
                    </div>
                </div>

                {/* NEW: The non-visual logic controller that connects UI state to the 3D scene */}
                <GloveLogicController />

            </SceneContext.Provider>
        </GloveConfiguratorProvider>
    );
};

export default App;