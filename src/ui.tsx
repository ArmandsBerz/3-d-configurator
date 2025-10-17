import { SceneManager } from './viewer';
import {
    SceneContext,
    GloveLogicController,
    leatherOptions,
    fontOptions,
    // MODIFICATION: Import COLOR_OPTIONS instead of colorSwatches
    COLOR_OPTIONS,
    buildOptionsData,
    initialState,
    ZONES,
    HexColor,
    ZoneKey,
    getModelNameForBuild,
    webTypeOptions,
    // MODIFICATION: Import getHexById and the new ColorId type
    getHexById,
    ColorId,
    WebTypeId,
    Font,
    TextPart,
    BuildConfig,
    AppState as ImportedAppState,
    isApplyToAllEligible,
    // MODIFICATION: Import the lookup map for display names
    colorLookupMap,
    loadConfigurationFromURL,
    generateShareableURL
} from './logic';
import React, { useState, useRef, useLayoutEffect, useCallback, useEffect, createContext, useContext, useReducer, ReactNode, ReactElement, useMemo } from 'react';
import BabylonCanvas from './viewer';
import { SummaryIcon, BackArrowIcon, CheckmarkIcon, LongArrowRightIcon, CaretRightIcon, CaretDownIcon, CaretUpIcon, ShareIcon, CollapseIcon, ExpandIcon, DragIcon, ZoomIcon } from './icons';

// --- START: NEW SCROLL GRADIENT HOOK ---
export const useScrollGradients = (scrollableRef: React.RefObject<HTMLElement | null>) => {
    const [isTopGradientVisible, setIsTopGradientVisible] = useState(false);
    const [isBottomGradientVisible, setIsBottomGradientVisible] = useState(false);

    const checkGradients = useCallback(() => {
        const element = scrollableRef.current;
        if (!element) return;

        const hasOverflow = element.scrollHeight > element.clientHeight;
        setIsTopGradientVisible(hasOverflow && element.scrollTop > 0);
        setIsBottomGradientVisible(hasOverflow && Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) >= NUMERIC_CONSTANTS.SCROLL_THRESHOLD);
    }, [scrollableRef]);

    useLayoutEffect(() => {
        checkGradients();
    }, [checkGradients]);

    useEffect(() => {
        const element = scrollableRef.current;
        const handler = checkGradients;

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
    }, [scrollableRef, checkGradients]);

    return { isTopGradientVisible, isBottomGradientVisible };
};
// --- END: NEW SCROLL GRADIENT HOOK ---


// --- NEW PRESENTATION TYPES (from Step 1) ---
export interface UIPartGroupSingle {
    id: string;
    type: 'single';
    title: string;
    zoneKey: ZoneKey;
}

export interface UIPartGroupDual {
    id: string;
    type: 'dual';
    title: string;
    outerZoneKey: ZoneKey;
    innerZoneKey: ZoneKey;
}

export interface UIPartGroupGallery {
    id: string;
    type: 'gallery';
    title: string;
}

export type UIPartGroup = UIPartGroupSingle | UIPartGroupDual | UIPartGroupGallery;

export interface UIPresentationConfig {
    [shellName: string]: UIPartGroup[]; // A dictionary of UI groups per shell
}

// --- CORE TYPE DEFINITIONS ARE NOW IMPORTED FROM LOGIC.TSX ---

// --- MODIFIED PER PLAN ---
type AppState = ImportedAppState & {
    lastActivatedPartType: 'inner' | 'outer' | 'single' | null;
};

export type GloveAction =
    | { type: typeof ACTION_TYPES.UPDATE_BUILD; payload: BuildConfig }
    | {
        type: typeof ACTION_TYPES.UPDATE_ZONE_COLOR;
        payload: {
            zoneKey: ZoneKey;
            // MODIFICATION: Use colorId
            colorId: ColorId;
            partType: 'inner' | 'outer' | 'single';
        }
    }
    | { type: typeof ACTION_TYPES.UPDATE_TEXT; payload: { id: 'thumbName' | 'pinkyName'; data: TextPart } }
    // MODIFICATION: Use colorId
    | { type: typeof ACTION_TYPES.APPLY_COLOR_TO_ALL; payload: { colorId: ColorId } }
    | { type: typeof ACTION_TYPES.SET_LOADING; payload: boolean }
    | { type: 'RESET_LAST_ACTIVATED_PART_TYPE' };
// --- END MODIFICATION ---

// --- END: Core Type Definitions ---

// --- START: ADD NEW PANEL PROP TYPES (Refactored) ---
type TextPartId = 'thumbName' | 'pinkyName';

interface BuildPanelProps {
    onClose: () => void;
    headerRef: React.RefObject<HTMLButtonElement | null>;
}
interface ColorPanelProps {
    context: UIPartGroup;
    onClose: () => void;
    headerRef: React.RefObject<HTMLButtonElement | null>;
}
interface TextPanelProps {
    context: { id: TextPartId; title: string };
    onClose: () => void;
    headerRef: React.RefObject<HTMLButtonElement | null>;
}
interface GalleryPanelProps {
    context: UIPartGroupGallery;
    onClose: () => void;
    headerRef: React.RefObject<HTMLButtonElement | null>;
}

// --- END: ADD NEW PANEL PROP TYPES ---

// --- START: Application-Wide Constants ---

export const CONTENT_TYPES = {
    BUILD: 'build',
    COLOR: 'color',
    TEXT: 'text',
    SUMMARY: 'summary',
    GALLERY: 'gallery',
} as const;

export const ACTION_TYPES = {
    UPDATE_BUILD: 'UPDATE_BUILD',
    UPDATE_ZONE_COLOR: 'UPDATE_ZONE_COLOR',
    UPDATE_TEXT: 'UPDATE_TEXT',
    APPLY_COLOR_TO_ALL: 'APPLY_COLOR_TO_ALL',
    SET_LOADING: 'SET_LOADING',
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

// --- NEW SHELL-SPECIFIC UI PRESENTATION CONFIG (Step 5) ---
const UI_PRESENTATION_CONFIG: UIPresentationConfig = {
    openBack: [
        { id: 'web', type: 'gallery', title: 'Web' },
        { id: 'thumbGroup', type: 'dual', title: 'Thumb Color', outerZoneKey: ZONES.THUMB_OUTER, innerZoneKey: ZONES.THUMB_INNER },
        { id: 'indexGroup', type: 'single', title: 'Index Color', zoneKey: ZONES.INDEX },
        { id: 'middleGroup', type: 'dual', title: 'Middle Color', outerZoneKey: ZONES.MIDDLE_OUTER, innerZoneKey: ZONES.MIDDLE_INNER },
        { id: 'ringGroup', type: 'dual', title: 'Ring Color', outerZoneKey: ZONES.RING_OUTER, innerZoneKey: ZONES.RING_INNER },
        { id: 'pinkyGroup', type: 'dual', title: 'Pinky Color', outerZoneKey: ZONES.PINKY_OUTER, innerZoneKey: ZONES.PINKY_INNER },
        { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
        { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
        { id: 'weltingGroup', type: 'single', title: 'Welting Color', zoneKey: ZONES.WELTING },
        { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
        { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
        { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
        { id: 'padHoodGroup', type: 'single', title: 'Pad/Hood Color', zoneKey: ZONES.PAD_HOOD },
        { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
        { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
        { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
    ],
    closeBack: [
        { id: 'web', type: 'gallery', title: 'Web' },
        { id: 'thumbOuterGroup', type: 'single', title: 'Outer Thumb Color', zoneKey: ZONES.THUMB_OUTER },
        { id: 'primaryUPieceGroup', type: 'single', title: 'Primary U-Piece Color', zoneKey: ZONES.THUMB_INNER },
        { id: 'middleOuterRingInnerGroup', type: 'single', title: 'Middle/Ring Inner Color', zoneKey: ZONES.MIDDLE_OUTER },
        { id: 'ringOuterPinkyInnerGroup', type: 'single', title: 'Ring/Pinky Inner Color', zoneKey: ZONES.RING_OUTER },
        { id: 'pinkyOuterGroup', type: 'single', title: 'Outer Pinky Color', zoneKey: ZONES.PINKY_OUTER },
        { id: 'wristStrapGroup', type: 'single', title: 'Wrist Strap Color', zoneKey: ZONES.WRIST_STRAP },
        { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
        { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
        { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
        { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
        { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
        { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
        { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
        { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
    ],
    firstBase: [
        { id: 'web', type: 'gallery', title: 'Web' },
        { id: 'thumbOuterGroup', type: 'single', title: 'Outer Thumb Color', zoneKey: ZONES.THUMB_OUTER },
        { id: 'primaryUPieceGroup', type: 'single', title: 'Primary U-Piece Color', zoneKey: ZONES.THUMB_INNER },
        { id: 'shellBackGroup', type: 'single', title: 'Shell Back Color', zoneKey: ZONES.INDEX },
        { id: 'wristGroup', type: 'single', title: 'Wrist Color', zoneKey: ZONES.WRIST },
        { id: 'padHoodGroup', type: 'single', title: 'Pad/Hood Color', zoneKey: ZONES.PAD_HOOD },
        { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
        { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
        { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
        { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
        { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
        { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
        { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
        { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
    ],
    catchers: [
        { id: 'web', type: 'gallery', title: 'Web' },
        { id: 'shellBackGroup', type: 'single', title: 'Shell Back Color', zoneKey: ZONES.INDEX },
        { id: 'shellBaseGroup', type: 'single', title: 'Shell Base Color', zoneKey: ZONES.MIDDLE_INNER },
        { id: 'railsGroup', type: 'single', title: 'Rails Color', zoneKey: ZONES.MIDDLE_OUTER },
        { id: 'wristGroup', type: 'single', title: 'Wrist Color', zoneKey: ZONES.WRIST },
        { id: 'padHoodGroup', type: 'single', title: 'Pad/Hood Color', zoneKey: ZONES.PAD_HOOD },
        { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
        { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
        { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
        { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
        { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
        { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
        { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
        { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
    ]
};

// --- Centralized State Management ---

// --- MODIFIED PER PLAN ---
const gloveConfigReducer = (state: AppState, action: GloveAction): AppState => {
    switch (action.type) {
        case ACTION_TYPES.UPDATE_BUILD:
            return { ...state, configuration: { ...state.configuration, build: action.payload } };
        case ACTION_TYPES.UPDATE_ZONE_COLOR:
            return {
                ...state,
                configuration: {
                    ...state.configuration,
                    // MODIFICATION: Use colorId
                    [action.payload.zoneKey]: { colorId: action.payload.colorId },
                },
                lastActivatedPartType: action.payload.partType,
            };
        case 'RESET_LAST_ACTIVATED_PART_TYPE':
            return {
                ...state,
                lastActivatedPartType: null
            };
        case ACTION_TYPES.UPDATE_TEXT:
            return { ...state, configuration: { ...state.configuration, [action.payload.id]: action.payload.data } };
        case ACTION_TYPES.APPLY_COLOR_TO_ALL: {
            // MODIFICATION: Use colorId
            const { colorId } = action.payload;
            if (!colorId) return state;

            const newConfiguration = { ...state.configuration };
            // Loop through all defined zone keys and update their color
            Object.values(ZONES).forEach((zoneKey: ZoneKey) => {
                // MODIFICATION: Use the helper to respect exclusion rules
                if (isApplyToAllEligible(zoneKey)) {
                    // MODIFICATION: Use colorId
                    newConfiguration[zoneKey] = { colorId: colorId };
                }
            });

            return { ...state, configuration: newConfiguration };
        }
        case ACTION_TYPES.SET_LOADING:
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
};
// --- END MODIFICATION ---

const GloveConfiguratorContext = createContext<{ state: AppState; dispatch: React.Dispatch<GloveAction> } | undefined>(undefined);

interface GloveConfiguratorProviderProps {
    children: ReactNode;
}

// --- UPDATE APP INITIALIZATION ---

// 1. Get the starting configuration by reading the URL ONCE.
const startingConfiguration = loadConfigurationFromURL();

// 2. Update your provider to use this starting configuration.
const GloveConfiguratorProvider = ({ children }: GloveConfiguratorProviderProps) => {
    const [state, dispatch] = useReducer(gloveConfigReducer, {
        ...initialState,
        configuration: startingConfiguration
    });

    return (
        <GloveConfiguratorContext.Provider value={{ state, dispatch }}>
            {children}
        </GloveConfiguratorContext.Provider>
    );
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

// --- MODIFIED PER PLAN ---
const ColorIndicator = ({ colorId }: { colorId: ColorId }) => (
    <span
        className="w-5 h-5 rounded-full border border-white/20"
        style={{ backgroundColor: getHexById(colorId) }}
    ></span>
);
// --- END MODIFICATION ---

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
            {isSelected && <div className="absolute top-0 right-0 w-[28px] h-[28px] bg-white flex items-center justify-center"><CheckmarkIcon className="text-black" /></div>}
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

// --- MODIFIED PER PLAN ---
interface ColorSwatchGridProps {
    swatches: Readonly<Array<{ id: ColorId, name: string, hex: HexColor }>>;
    selectedColorId: ColorId | undefined;
    onColorSelect: (colorId: ColorId) => void;
}
const ColorSwatchGrid = ({ swatches, selectedColorId, onColorSelect }: ColorSwatchGridProps) => {
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
                const isSelected = selectedColorId === swatch.id;
                return (
                    <ColorSwatch
                        key={swatch.id}
                        elRef={itemRefsCasted.current[index]}
                        color={swatch.hex}
                        name={swatch.name}
                        isSelected={isSelected}
                        onSelect={() => {
                            onColorSelect(swatch.id);
                            setActiveIndex(index);
                        }}
                        tabIndex={index === activeIndex ? 0 : -1}
                    />
                );
            })}
        </div>
    );
};
// --- END MODIFICATION ---

// --- DEBOUNCE UTILITY (WITH BETTER TYPES) ---
function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}


// --- URL SYNC CONTROLLER (REFACTORED WITH useMemo) ---
const URLSyncController = () => {
    const { state } = useGloveConfigurator();

    // useMemo ensures the debounced function is stable and not re-created on every render.
    const debouncedUpdateURL = useMemo(
        () => debounce((newUrl: string) => {
            window.history.replaceState({}, '', newUrl);
        }, 300),
        [] // Empty dependency array means this is created only once.
    );

    useEffect(() => {
        const newUrl = generateShareableURL(state.configuration);
        debouncedUpdateURL(newUrl);
        // It's now safe to include debouncedUpdateURL because useMemo guarantees it's stable.
    }, [state.configuration, debouncedUpdateURL]);

    return null; // This component renders nothing.
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
    const { isTopGradientVisible, isBottomGradientVisible } = useScrollGradients(scrollContainerRef);

    const handleReactiveScrollFix = (event: React.FocusEvent<HTMLDivElement>) => {
        const parentGroup = (event.target as HTMLElement).closest('.option-group-container');
        if (parentGroup) {
            parentGroup.scrollIntoView({
                behavior: 'auto',
                block: 'nearest'
            });
        }
    };

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

// --- MODIFIED PER PLAN ---
interface SingleColorPickerProps {
    zoneKey: ZoneKey;
}
const SingleColorPicker = ({ zoneKey }: SingleColorPickerProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const colorId = state.configuration[zoneKey]?.colorId;

    const handleChange = (newColorId: ColorId) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_ZONE_COLOR,
            payload: { zoneKey, colorId: newColorId, partType: 'single' }
        });
    };

    return <ColorSwatchGrid swatches={COLOR_OPTIONS} selectedColorId={colorId} onColorSelect={handleChange} />;
};

interface DualColorPickerProps {
    outerZoneKey: ZoneKey;
    innerZoneKey: ZoneKey;
}
const DualColorPicker = ({ outerZoneKey, innerZoneKey }: DualColorPickerProps) => {
    const { state, dispatch } = useGloveConfigurator();
    const outerColorId = state.configuration[outerZoneKey]?.colorId;
    const innerColorId = state.configuration[innerZoneKey]?.colorId;

    const handleOuterChange = (newColorId: ColorId) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_ZONE_COLOR,
            payload: { zoneKey: outerZoneKey, colorId: newColorId, partType: 'outer' }
        });
    };
    const handleInnerChange = (newColorId: ColorId) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_ZONE_COLOR,
            payload: { zoneKey: innerZoneKey, colorId: newColorId, partType: 'inner' }
        });
    };
    // --- END MODIFICATION ---

    return (
        <div className="space-y-4">
            <div className="option-group-container">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Outer</h3>
                <ColorSwatchGrid swatches={COLOR_OPTIONS} selectedColorId={outerColorId} onColorSelect={handleOuterChange} />
            </div>
            <div className="option-group-container">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Inner</h3>
                <ColorSwatchGrid swatches={COLOR_OPTIONS} selectedColorId={innerColorId} onColorSelect={handleInnerChange} />
            </div>
        </div>
    );
};


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

    const positionGroup = buildOptionsData.find((g: { id: string; }) => g.id === 'position');
    const otherGroups = buildOptionsData.filter((g: { id: string; }) => g.id !== 'position');

    return (
        <div className={`space-y-6 ${!isDesktop ? 'pb-4' : ''}`}>
            <ImageGroup
                title="Glove Leather"
                layout="grid-cols-2"
                options={leatherOptions}
                selectedOption={buildConfig.imageSelection}
                onSelectOption={(value) => onBuildConfigChange({ ...buildConfig, imageSelection: value as 'imgOpt1' | 'imgOpt2' })}
            />
            {positionGroup && (
                <OptionGroup
                    key={positionGroup.id}
                    title={positionGroup.title}
                    options={positionGroup.options}
                    layout={positionGroup.layout}
                    selectedOption={buildConfig.position}
                    onSelectOption={(value) => {
                        const newConfig = { ...buildConfig, position: value as BuildConfig['position'] };
                        // When user selects Outfield or Pitcher, default them to an OPEN back
                        if (['out', 'pit'].includes(value)) {
                            (newConfig as any).backStyle = 'opn';
                        }
                        onBuildConfigChange(newConfig);
                    }}
                />
            )}

            {/* Conditionally render the Back Style selector */}
            {['out', 'pit'].includes(buildConfig.position) && (
                <OptionGroup
                    title="Back Style"
                    options={[{ id: 'opn', label: 'OPEN' }, { id: 'cls', label: 'CLOSE' }]}
                    layout="grid-cols-2"
                    selectedOption={(buildConfig as any).backStyle}
                    onSelectOption={(value) => onBuildConfigChange({
                        ...buildConfig,
                        backStyle: value as 'opn' | 'cls'
                    } as any)}
                />
            )}

            {otherGroups.map((group: { id: string; title: string; options: { id: string, label: string }[]; layout: string; }) => (
                <OptionGroup
                    key={group.id}
                    title={group.title}
                    options={group.options}
                    layout={group.layout}
                    selectedOption={buildConfig[group.id as keyof Omit<BuildConfig, 'imageSelection' | 'position' | 'backStyle' | 'webType'>]}
                    onSelectOption={(value) => onBuildConfigChange({ ...buildConfig, [group.id]: value })}
                />
            ))}
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
                    {fontOptions.map((font: { id: Font; label: string; }, index: number) => (
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
                {/* MODIFICATION: Use colorId */}
                <ColorSwatchGrid swatches={COLOR_OPTIONS} selectedColorId={value.colorId} onColorSelect={(colorId) => onChange({ ...value, colorId: colorId })} />
            </div>
        </div>
    );
};

// --- MODIFIED PER PLAN ---
const WebOptions = () => {
    const { state, dispatch } = useGloveConfigurator();
    const { build: buildConfig } = state.configuration;

    const handleWebTypeChange = (newWebType: WebTypeId) => {
        const newBuildConfig = { ...state.configuration.build, webType: newWebType };
        dispatch({ type: ACTION_TYPES.UPDATE_BUILD, payload: newBuildConfig });
    };

    return (
        <div className="space-y-6">
            <ImageGroup
                title="Web Type"
                layout="grid-cols-3"
                options={webTypeOptions}
                selectedOption={buildConfig.webType}
                onSelectOption={handleWebTypeChange}
            />
            <div className="option-group-container">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Web Color</h3>
                <SingleColorPicker zoneKey={ZONES.WEB} />
            </div>
        </div>
    );
};
// --- END MODIFICATION ---

// --- Panel Components ---

const SummaryPanel = ({ onClose, headerRef }: { onClose: () => void, headerRef: React.RefObject<HTMLButtonElement | null> }) => <OverviewMobile onClose={onClose} headerRef={headerRef} />;

const BuildPanel = ({ onClose, headerRef }: BuildPanelProps) => (
    <AccordionOptionMobile title="Build Options" onClose={onClose} headerRef={headerRef}>
        <BuildOption isDesktop={false} />
    </AccordionOptionMobile>
);

// --- MODIFIED PER PLAN ---
const ColorPanel = ({ context, onClose, headerRef }: ColorPanelProps) => {
    return (
        <AccordionOptionMobile title={context.title} onClose={onClose} headerRef={headerRef}>
            {context.type === 'dual' ? (
                <DualColorPicker
                    outerZoneKey={context.outerZoneKey}
                    innerZoneKey={context.innerZoneKey}
                />
            ) : (
                <SingleColorPicker
                    zoneKey={(context as UIPartGroupSingle).zoneKey}
                />
            )}
        </AccordionOptionMobile>
    );
};

const GalleryPanel = ({ context, onClose, headerRef }: GalleryPanelProps) => (
    <AccordionOptionMobile title={context.title} onClose={onClose} headerRef={headerRef}>
        <WebOptions />
    </AccordionOptionMobile>
);
// --- END MODIFICATION ---

const TextPanel = ({ context, onClose, headerRef }: TextPanelProps) => {
    return (
        <AccordionOptionMobile title={context.title} onClose={onClose} headerRef={headerRef}>
            <TextOption contextId={context.id} />
        </AccordionOptionMobile>
    );
};

// --- Other UI Components ---

// --- MODIFIED PER PLAN ---
const OrderSummaryInfo = () => {
    const { state } = useGloveConfigurator();
    const { configuration } = state;
    const { build, thumbName, pinkyName } = configuration;
    const activeShell = getModelNameForBuild(build);
    const uiGroups = UI_PRESENTATION_CONFIG[activeShell] || [];

    const getBuildLabel = (key: string, value: string): string => {
        if (key === 'imageSelection') return leatherOptions.find((opt: { id: string }) => opt.id === value)?.title || value;
        if (key === 'webType') return webTypeOptions.find((opt: { id: string }) => opt.id === value)?.title || value;
        const group = buildOptionsData.find((g: { id: string }) => g.id === key);
        return group?.options.find((o: { id: string }) => o.id === value)?.label || value;
    };
    const getBuildTitle = (key: string): string => {
        if (key === 'imageSelection') return "Glove Leather";
        if (key === 'webType') return "Web Type";
        return buildOptionsData.find((g: { id: string }) => g.id === key)?.title || key;
    };

    // Helper to get color name from ID
    const getColorName = (colorId: ColorId) => colorLookupMap.get(colorId)?.name || 'Unknown';

    return (
        <div className="text-base text-gray-300 space-y-4 p-1">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Glove Foundation</h3>
                <div className="space-y-1 pl-2">
                    {Object.entries(build).map(([key, value]) => <p key={key}><span className="font-semibold text-gray-400">{getBuildTitle(key)}:</span> {getBuildLabel(key, value as string)}</p>)}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Color Scheme</h3>
                <div className="space-y-1 pl-2">
                    {uiGroups.map((group: UIPartGroup) => {
                        if (group.type === 'single' || group.type === 'gallery') {
                            const zone = group.type === 'gallery' ? ZONES.WEB : group.zoneKey;
                            const colorId = configuration[zone]?.colorId;
                            return <p key={group.id}><span className="font-semibold text-gray-400">{group.title.replace(' Color', '')}:</span> {getColorName(colorId)}</p>;
                        }
                        if (group.type === 'dual') {
                            const outerColorId = configuration[group.outerZoneKey]?.colorId;
                            const innerColorId = configuration[group.innerZoneKey]?.colorId;
                            return <p key={group.id}><span className="font-semibold text-gray-400">{group.title.replace(' Color', '')}:</span> Inner: {getColorName(innerColorId)}, Outer: {getColorName(outerColorId)}</p>;
                        }
                        return null;
                    })}
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Personalization</h3>
                <div className="space-y-1 pl-2">
                    <p><span className="font-semibold text-gray-400">Thumb Name:</span> "{thumbName.text}" ({thumbName.font}, {getColorName(thumbName.colorId)})</p>
                    <p><span className="font-semibold text-gray-400">Pinky Name:</span> "{pinkyName.text}" ({pinkyName.font}, {getColorName(pinkyName.colorId)})</p>
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
// --- END MODIFICATION ---

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
    | { name: 'SUMMARY' }
    | { name: 'BUILD' }
    | { name: 'COLOR'; context: UIPartGroup }
    | { name: 'GALLERY'; context: UIPartGroupGallery }
    | { name: 'TEXT'; context: { id: TextPartId, title: string } }
    | null;


interface FooterMobileProps {
    openPanelName?: string | null;
    onClosePanel: () => void;
    onReviewClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onCompleteOrder: () => void;
    // MODIFICATION: Use colorId
    activeColor?: ColorId;
    // --- NEW PROP TO CONTROL BUTTON VISIBILITY ---
    showApplyToAllButton: boolean;
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


const FooterMobile = ({ openPanelName, onClosePanel, onReviewClick, onCompleteOrder, activeColor, showApplyToAllButton }: FooterMobileProps) => {
    const { dispatch } = useGloveConfigurator();

    // MODIFICATION: Use colorId
    const onApplyColorToAll = (colorId?: ColorId) => {
        if (colorId) dispatch({ type: ACTION_TYPES.APPLY_COLOR_TO_ALL, payload: { colorId } });
    };

    const isSummaryOpen = openPanelName === 'SUMMARY';

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
        case 'COLOR':
        case 'GALLERY':
            if (showApplyToAllButton) {
                panelSpecificFooter = (
                    <div className="w-full grid grid-cols-[1fr_1.618fr] gap-[10px]">
                        <SecondaryButton label="Apply to All" onClick={() => onApplyColorToAll(activeColor)} variant={VARIANTS.THEME.DARK} icon={<CheckmarkIcon />} disabled={!activeColor} />
                        <SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={<CheckmarkIcon />} />
                    </div>
                );
            } else {
                panelSpecificFooter = (
                    <SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={<CheckmarkIcon />} />
                );
            }
            break;

        case 'BUILD':
        case 'TEXT':
            panelSpecificFooter = (
                <SecondaryButton label="Continue" onClick={onClosePanel} variant={VARIANTS.THEME.LIGHT} icon={<CheckmarkIcon />} />
            );
            break;

        default:
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
        <div className="absolute inset-0 flex items-center justify-center pt-[10px] bg-black bg-opacity-65 z-10 pointer-events-none">
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
const AccordionDesktop = ({ openAccordion, setOpenAccordion, colorForApplyAll }: {
    openAccordion: string | null;
    setOpenAccordion: (id: string | null) => void;
    // MODIFICATION: Use colorId
    colorForApplyAll?: ColorId;
}) => {
    const { state, dispatch } = useGloveConfigurator();
    const { configuration } = state;
    const activeShell = getModelNameForBuild(configuration.build);
    const accordionContainerRef = useRef<HTMLDivElement>(null);
    const desktopAccordionContainerRef = useRef<HTMLDivElement>(null);
    const { isTopGradientVisible, isBottomGradientVisible } = useScrollGradients(accordionContainerRef);
    const isScrolled = isTopGradientVisible; // Derived state

    const closeAccordion = useCallback(() => setOpenAccordion(null), [setOpenAccordion]);
    useEscapeKey(desktopAccordionContainerRef, closeAccordion, !!openAccordion);

    const currentUiGroups = useMemo(() => UI_PRESENTATION_CONFIG[activeShell] || [], [activeShell]);
    const buildGroup = { id: 'build', title: 'Build Options' };
    // --- MODIFICATION: Define personalization panels separately ---
    const personalizationGroups = [
        { id: 'thumbName' as TextPartId, title: 'Thumb Name' },
        { id: 'pinkyName' as TextPartId, title: 'Pinky Name' },
    ];

    const handleAccordionToggle = (accordionId: string) => {
        if (openAccordion !== accordionId) {
            dispatch({ type: 'RESET_LAST_ACTIVATED_PART_TYPE' } as any);
        }
        setOpenAccordion(openAccordion === accordionId ? null : accordionId);
    };

    // MODIFICATION: Use colorId and lookup map
    const renderHeaderAccessory = (group: UIPartGroup) => {
        const isAccordionOpen = openAccordion === group.id;
        if (group.type === 'single' || group.type === 'gallery') {
            const zone = group.type === 'gallery' ? ZONES.WEB : group.zoneKey;
            const colorId = configuration[zone]?.colorId;
            const colorName = colorLookupMap.get(colorId)?.name;
            return isAccordionOpen ? <span className="text-sm text-gray-400 font-semibold">{colorName}</span> : <ColorIndicator colorId={colorId} />;
        }
        if (group.type === 'dual') {
            const innerColorId = configuration[group.innerZoneKey]?.colorId;
            const outerColorId = configuration[group.outerZoneKey]?.colorId;
            const innerColorName = colorLookupMap.get(innerColorId)?.name;
            const outerColorName = colorLookupMap.get(outerColorId)?.name;
            return isAccordionOpen ? <span className="text-sm text-gray-400 font-semibold">{`${innerColorName} · ${outerColorName}`}</span> : <div className="flex items-center space-x-2.5"><ColorIndicator colorId={innerColorId} /><ColorIndicator colorId={outerColorId} /></div>;
        }
        return null;
    };

    return (
        <div ref={desktopAccordionContainerRef} className="absolute top-0 left-0 bottom-0 w-[440px] z-10 bg-[#161616] p-10 pointer-events-none">
            <div className="absolute z-20 w-[70px] h-[49px] bg-gray-300 bg-opacity-75 flex items-center justify-center pointer-events-auto"><p className="font-bold text-xl text-gray-900">LOGO</p></div>
            <div className={`absolute ${isScrolled ? 'top-[82px]' : 'top-[142px]'} bottom-4 left-[40px] w-[400px] pointer-events-auto transition-all duration-30 ease-in-out overflow-hidden`}>
                <ScrollGradient position={POSITIONS.TOP} isVisible={isTopGradientVisible} />
                <div ref={accordionContainerRef} className="h-full overflow-y-auto space-y-4 focus:outline-none">
                    <AccordionOptionDesktop
                        key={buildGroup.id}
                        title={buildGroup.title}
                        isOpen={openAccordion === buildGroup.id}
                        onToggle={() => handleAccordionToggle(buildGroup.id)}
                        headerContent={null}
                    >
                        <BuildOption isDesktop={true} />
                    </AccordionOptionDesktop>

                    {currentUiGroups.map((group: UIPartGroup) => {
                        // --- MODIFICATION: Conditional button logic ---
                        let actionButton: ReactElement | null = null;
                        let isEligible = false;
                        if (group.type === 'single') {
                            isEligible = isApplyToAllEligible(group.zoneKey);
                        } else if (group.type === 'dual' || group.type === 'gallery') {
                            isEligible = true; // Leather and web parts are always eligible
                        }

                        if (isEligible) {
                            actionButton = (
                                <SecondaryButton
                                    label="Apply to All"
                                    onClick={() => {
                                        if (colorForApplyAll) {
                                            dispatch({ type: ACTION_TYPES.APPLY_COLOR_TO_ALL, payload: { colorId: colorForApplyAll } });
                                        }
                                    }}
                                    icon={<CheckmarkIcon />}
                                    disabled={!colorForApplyAll}
                                />
                            );
                        }

                        return (
                            <AccordionOptionDesktop
                                key={group.id}
                                title={group.title}
                                isOpen={openAccordion === group.id}
                                onToggle={() => handleAccordionToggle(group.id)}
                                headerContent={renderHeaderAccessory(group)}
                                actionButton={actionButton}
                            >
                                {(() => {
                                    switch (group.type) {
                                        case 'gallery':
                                            return <WebOptions />;
                                        case 'dual':
                                            return <DualColorPicker outerZoneKey={group.outerZoneKey} innerZoneKey={group.innerZoneKey} />;
                                        case 'single':
                                            return <SingleColorPicker zoneKey={group.zoneKey} />;
                                        default:
                                            return null;
                                    }
                                })()}
                            </AccordionOptionDesktop>
                        );
                    })}

                    {/* --- MODIFICATION: Render personalization panels separately --- */}
                    {personalizationGroups.map(group => (
                        <AccordionOptionDesktop
                            key={group.id}
                            title={group.title}
                            isOpen={openAccordion === group.id}
                            onToggle={() => handleAccordionToggle(group.id)}
                            headerContent={<span className="text-sm text-gray-400 truncate max-w-[100px]">{configuration[group.id].text}</span>}
                            actionButton={null} // No action button for text panels
                        >
                            <TextOption contextId={group.id} />
                        </AccordionOptionDesktop>
                    ))}
                </div>
                <ScrollGradient position={POSITIONS.BOTTOM} isVisible={isBottomGradientVisible} />
            </div>
        </div>
    );
};

const AccordionMobile = ({ onOpenPanel, openAccordionOptionMobile }: {
    onOpenPanel: (group: UIPartGroup | { id: 'build' | TextPartId, title: string }) => void;
    openAccordionOptionMobile: MobileAccordionState;
}) => {
    const { state } = useGloveConfigurator();
    const { configuration } = state;
    const activeShell = getModelNameForBuild(configuration.build);
    const listRef = useRef<HTMLElement>(null);
    const { isTopGradientVisible, isBottomGradientVisible } = useScrollGradients(listRef);

    const currentUiGroups = useMemo(() => UI_PRESENTATION_CONFIG[activeShell] || [], [activeShell]);
    const buildGroup = { id: 'build' as const, title: 'Build Options' };
    // --- MODIFICATION: Define personalization panels separately ---
    const personalizationGroups = [
        { id: 'thumbName' as TextPartId, title: 'Thumb Name' },
        { id: 'pinkyName' as TextPartId, title: 'Pinky Name' },
    ];

    // MODIFICATION: Use colorId and lookup map
    const renderAccessory = (group: UIPartGroup) => {
        if (group.type === 'single' || group.type === 'gallery') {
            const zone = group.type === 'gallery' ? ZONES.WEB : group.zoneKey;
            const colorId = configuration[zone]?.colorId;
            return <ColorIndicator colorId={colorId} />;
        }
        if (group.type === 'dual') {
            const innerColorId = configuration[group.innerZoneKey]?.colorId;
            const outerColorId = configuration[group.outerZoneKey]?.colorId;
            return <div className="flex items-center space-x-2"><ColorIndicator colorId={innerColorId} /><ColorIndicator colorId={outerColorId} /></div>;
        }
        return null;
    };

    return (
        <section ref={listRef} className={`px-4 bg-[#161616] h-full overflow-y-auto ${openAccordionOptionMobile ? 'opacity-50 pointer-events-none' : ''}`} tabIndex={-1}>
            <ScrollGradient position={POSITIONS.TOP} isVisible={isTopGradientVisible} />
            <button key={buildGroup.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => onOpenPanel(buildGroup)}>
                <div className="flex items-center">
                    <CaretRightIcon className="h-4 w-auto mr-3" />
                    <span className="text-lg">{buildGroup.title}</span>
                </div>
            </button>

            {currentUiGroups.map((group: UIPartGroup) => (
                <button key={group.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => onOpenPanel(group)}>
                    <div className="flex items-center">
                        <CaretRightIcon className="h-4 w-auto mr-3" />
                        <span className="text-lg">{group.title}</span>
                    </div>
                    {renderAccessory(group)}
                </button>
            ))}

            {/* --- MODIFICATION: Render personalization panels separately --- */}
            {personalizationGroups.map(group => (
                <button key={group.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={() => onOpenPanel(group)}>
                    <div className="flex items-center">
                        <CaretRightIcon className="h-4 w-auto mr-3" />
                        <span className="text-lg">{group.title}</span>
                    </div>
                    <span className="text-sm text-gray-400 truncate max-w-[100px]">{configuration[group.id].text}</span>
                </button>
            ))}

            <ScrollGradient position={POSITIONS.BOTTOM} isVisible={isBottomGradientVisible} />
        </section>
    );
};


// --- Main UI Component ---
const UI = () => {
    const isDesktop = useBreakpoint();
    const { state, dispatch } = useGloveConfigurator();
    const { configuration, isLoading, lastActivatedPartType } = state as AppState; // Cast to our extended AppState
    const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
    const [openAccordionOptionMobile, setOpenAccordionOptionMobile] = useState<MobileAccordionState>(null);
    const appContainerRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);

    // For Desktop state
    const [openAccordion, setOpenAccordion] = useState<string | null>('build');

    const activeShell = getModelNameForBuild(configuration.build);
    const currentUiGroups = useMemo(() => UI_PRESENTATION_CONFIG[activeShell] || [], [activeShell]);

    // --- MODIFICATION: Use helper to determine button eligibility ---
    const colorForApplyAll = useMemo((): ColorId | undefined => {
        let openPanelContext: UIPartGroup | null = null;
        if (isDesktop) {
            openPanelContext = currentUiGroups.find(g => g.id === openAccordion) || null;
        } else if (openAccordionOptionMobile && 'context' in openAccordionOptionMobile && 'type' in (openAccordionOptionMobile.context as any)) {
            openPanelContext = openAccordionOptionMobile.context as UIPartGroup;
        }

        if (!openPanelContext) return undefined;

        let representativeZoneKey: ZoneKey;
        if (openPanelContext.type === 'single') {
            representativeZoneKey = openPanelContext.zoneKey;
        } else if (openPanelContext.type === 'dual') {
            representativeZoneKey = openPanelContext.innerZoneKey;
        } else { // gallery
            representativeZoneKey = ZONES.WEB;
        }

        if (!isApplyToAllEligible(representativeZoneKey)) {
            return undefined; // If not eligible, no color is available.
        }

        // Default logic: If no interaction yet, default to the most relevant color of the open panel
        if (!lastActivatedPartType) {
            if (openPanelContext?.type === 'dual') {
                return configuration[openPanelContext.innerZoneKey]?.colorId;
            }
            if (openPanelContext?.type === 'single') {
                return configuration[openPanelContext.zoneKey]?.colorId;
            }
            if (openPanelContext?.type === 'gallery') {
                return configuration[ZONES.WEB]?.colorId;
            }
            return undefined;
        }

        if (openPanelContext.type === 'dual') {
            if (lastActivatedPartType === 'inner') {
                return configuration[openPanelContext.innerZoneKey]?.colorId;
            }
            if (lastActivatedPartType === 'outer') {
                return configuration[openPanelContext.outerZoneKey]?.colorId;
            }
        }

        if (openPanelContext.type === 'single' && lastActivatedPartType === 'single') {
            return configuration[openPanelContext.zoneKey]?.colorId;
        }

        if (openPanelContext.type === 'gallery' && lastActivatedPartType === 'single') {
            return configuration[ZONES.WEB]?.colorId;
        }

        return undefined;
    }, [isDesktop, openAccordion, openAccordionOptionMobile, currentUiGroups, configuration, lastActivatedPartType]);

    // --- NEW PROP FOR MOBILE FOOTER ---
    const showApplyToAllButton = useMemo((): boolean => {
        if (isDesktop || !openAccordionOptionMobile || !('context' in openAccordionOptionMobile)) return false;

        const context = openAccordionOptionMobile.context as any;
        if ('type' in context) { // It's a UIPartGroup
            if (context.type === 'single') return isApplyToAllEligible(context.zoneKey);
            if (context.type === 'dual') return true;
            if (context.type === 'gallery') return isApplyToAllEligible(ZONES.WEB);
        }
        return false;
    }, [isDesktop, openAccordionOptionMobile]);
    // --- END MODIFICATION ---

    useEffect(() => {
        const babylonContainer = document.getElementById('babylon-container');
        const mainEl = mainRef.current;

        if (!babylonContainer || !mainEl) {
            return;
        }

        const observer = new ResizeObserver(entries => {
            window.requestAnimationFrame(() => {
                for (let entry of entries) {
                    const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
                    babylonContainer.style.width = `${width}px`;
                    babylonContainer.style.height = `${height}px`;
                }
            });
        });

        observer.observe(mainEl);

        return () => {
            observer.disconnect();
        };
    }, []);
    useEffect(() => { /* ... focus trap logic ... */ }, [isDesktop, openAccordionOptionMobile]);

    const panelHeaderRef = useRef<HTMLButtonElement | null>(null);

    const handleOpenPanel = (group: UIPartGroup | { id: 'build' | TextPartId, title: string }) => {
        if (group.id === 'build') {
            setOpenAccordionOptionMobile({ name: 'BUILD' });
        } else if ('type' in group && group.type === 'gallery') {
            setOpenAccordionOptionMobile({ name: 'GALLERY', context: group });
        } else if ('zoneKey' in group || 'outerZoneKey' in group) {
            setOpenAccordionOptionMobile({ name: 'COLOR', context: group as UIPartGroup });
        } else {
            // --- MODIFICATION: Handle Text parts ---
            if (group.id === 'thumbName' || group.id === 'pinkyName') {
                setOpenAccordionOptionMobile({ name: 'TEXT', context: { id: group.id, title: group.title } });
            }
        }
    };

    const handleClosePanel = useCallback(() => {
        dispatch({ type: 'RESET_LAST_ACTIVATED_PART_TYPE' } as any);
        setOpenAccordionOptionMobile(null);
    }, [dispatch]);

    useEscapeKey(appContainerRef, handleClosePanel, !!openAccordionOptionMobile);

    const handleShare = useCallback(async () => {
        // 1. Generate the correct, up-to-the-minute URL from the state.
        const configUrl = generateShareableURL(state.configuration);

        // 2. IMPORTANT: Force the browser's address bar to update IMMEDIATELY.
        try {
            window.history.replaceState({}, '', configUrl);
        } catch (err) {
            console.error('Could not update browser URL', err); // Log the error but don't stop the function
        }

        // 3. Now, share that same URL.
        const shareData = { title: 'My Custom Glove', text: 'Check out the glove I designed!', url: configUrl };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.log('Share failed', err); }
        } else {
            try { await navigator.clipboard.writeText(configUrl); alert('Sharable link copied to clipboard!'); } catch (err) { alert('Failed to copy link.'); }
        }
    }, [state.configuration]);

    const renderMobilePanel = () => {
        if (!openAccordionOptionMobile) return null;

        switch (openAccordionOptionMobile.name) {
            case 'SUMMARY':
                return <SummaryPanel onClose={handleClosePanel} headerRef={panelHeaderRef} />;
            case 'BUILD':
                return <BuildPanel onClose={handleClosePanel} headerRef={panelHeaderRef} />;
            case 'COLOR':
                return <ColorPanel context={openAccordionOptionMobile.context} onClose={handleClosePanel} headerRef={panelHeaderRef} />;
            case 'GALLERY':
                return <GalleryPanel context={openAccordionOptionMobile.context} onClose={handleClosePanel} headerRef={panelHeaderRef} />;
            case 'TEXT':
                return <TextPanel context={openAccordionOptionMobile.context} onClose={handleClosePanel} headerRef={panelHeaderRef} />;
            default:
                return null;
        }
    };

    const handleReviewClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setOpenAccordionOptionMobile({ name: 'SUMMARY' });
    };

    return (
        <div ref={appContainerRef} className="flex flex-col lg:relative w-full h-full bg-transparent text-white">

            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 pointer-events-auto">
                    <p className="text-white text-xl animate-pulse">Loading...</p>
                </div>
            )}

            <main ref={mainRef} className={`p-4 flex flex-col items-center justify-center relative bg-transparent overflow-auto h-full w-full ${isVisualizationExpanded ? 'flex-grow' : 'lg:absolute lg:inset-0'}`} style={!isDesktop && !isVisualizationExpanded ? { flexBasis: 'calc(61.8% - 66px)' } : {}}>
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
                        <AccordionDesktop
                            openAccordion={openAccordion}
                            setOpenAccordion={setOpenAccordion}
                            colorForApplyAll={colorForApplyAll}
                        />
                        <OverviewDesktop />
                    </>
                ) : (
                    <div className="flex flex-col overflow-hidden bg-[#161616] pointer-events-auto" style={{ flexBasis: 'calc(38.2% + 66px)' }}>
                        <div className="relative flex-grow overflow-hidden">
                            <AccordionMobile
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
                            activeColor={colorForApplyAll}
                            showApplyToAllButton={showApplyToAllButton}
                        />
                    </div>
                )
            )}
        </div>
    );
};

// 3. Update your main App component to include the controller.
const App = () => {
    const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);

    return (
        <GloveConfiguratorProvider>
            <SceneContext.Provider value={sceneManager}>

                <div id="app-root" className="relative w-full h-[100dvh] bg-[#161616]">
                    <div id="babylon-container" className="absolute inset-0 z-10">
                        <BabylonCanvas onSceneReady={setSceneManager} />
                    </div>
                    <div id="ui-container" className="absolute inset-0 z-20 pointer-events-none">
                        <UI />
                    </div>
                </div>

                <GloveLogicController />

                {/* This component will now automatically sync the state to the URL */}
                <URLSyncController />

            </SceneContext.Provider>
        </GloveConfiguratorProvider>
    );
};

export default App;