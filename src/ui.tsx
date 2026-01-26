// src/ui.tsx

import 'wicg-inert';
import { SceneManager, SceneContext } from './viewer';
import {
    leatherOptions,
    fontOptions,
    COLOR_OPTIONS,
    // buildOptionsData, // REMOVED: Dependency broken per Phase 3
    initialState,
    ZONES,
    HexColor,
    ZoneKey,
    // getModelNameForBuild, // REMOVED per fix
    webTypeOptions,
    getHexById,
    getPaletteIndexById,    // <--- ADDED: Needed for local Controller
    ColorId,
    WebTypeId,
    Font,
    TextPart,
    BuildConfig,
    AppState as ImportedAppState,
    // isApplyToAllEligible, // REMOVED per fix
    colorLookupMap,
    loadConfigurationFromURL,
    generateShareableURL,
    // --- IMPORTED FROM LOGIC (The Brain) ---
    resolveProduct,         // <--- NEW: The Router
    // GloveLogicController, // REMOVED: Now defined locally to fix circular dependency
    sanitize,               // <--- NEW: The Sanitizer (imported for reducer)
    // --- ADDED FOR STEP 3: THE SWITCH IMPLEMENTATION ---
    GloveConfiguration,
    // --- ADDED FOR CLAUDE'S FIX (TRANSLATION) ---
    getPresetConfig,
    PresetId,
    UIPartGroup,
    UIPartGroupGallery,
    UIPartGroupSingle,
    UIPartGroupDual, // <--- ADDED per instructions
    CommerceState,
    resolveBuildGroups, // <--- ADDED: The Resolver Bridge
    // NEW: Imports for strict typing in BuildOption
    BuildPositionId,
    // --- NEW IMPORTS: REGISTRIES FOR TRANSLATION ---
    SIZE_REGISTRY,
    POSITION_REGISTRY,
    THROWING_HAND_REGISTRY,
    STIFFNESS_REGISTRY,
    HAND_OPENING_REGISTRY
} from './logic';
import { updateBuild, BuildLeatherId } from './product-data'; // <--- NEW: Import directly from domain layer
import React, { useState, useRef, useLayoutEffect, useCallback, useEffect, createContext, useContext, useReducer, ReactNode, ReactElement, useMemo } from 'react';
import BabylonCanvas from './viewer';
import { SummaryIcon, BackArrowIcon, CheckmarkIcon, LongArrowRightIcon, CaretRightIcon, CaretDownIcon, CaretUpIcon, ShareIcon, CollapseIcon, ExpandIcon, DragIcon, ZoomIcon, CloseIcon } from './icons';
import { Snackbar } from './snackbar'; 

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

// --- CORE TYPE DEFINITIONS ARE NOW IMPORTED FROM LOGIC.TSX ---

type AppState = ImportedAppState & {
    lastActivatedPartType: 'inner' | 'outer' | 'single' | null;
};

export type GloveAction =
    | { type: typeof ACTION_TYPES.UPDATE_BUILD; payload: Partial<BuildConfig> } // <--- FIX: Allow partial updates
    | {
        type: typeof ACTION_TYPES.UPDATE_ZONE_COLOR;
        payload: {
            zoneKey: ZoneKey;
            colorId: ColorId;
            partType: 'inner' | 'outer' | 'single';
        }
    }
    | { type: typeof ACTION_TYPES.UPDATE_TEXT; payload: { id: 'thumbName' | 'pinkyName'; data: TextPart } }
    | { type: typeof ACTION_TYPES.APPLY_COLOR_TO_ALL; payload: { colorId: ColorId } }
    | { type: typeof ACTION_TYPES.SET_LOADING; payload: boolean }
    | { type: 'RESET_LAST_ACTIVATED_PART_TYPE' }
    | { type: typeof ACTION_TYPES.REPLACE_CONFIGURATION; payload: GloveConfiguration };

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
    REPLACE_CONFIGURATION: 'REPLACE_CONFIGURATION',
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

// --- BRIDGE PROTOCOL & HELPERS ---
const BRIDGE_MESSAGE_TYPES = {
    CUSTOMIZER_STATE: 'CUSTOMIZER_STATE',
    EXIT_APP: 'EXIT_APP',
    COMPLETE_ORDER: 'COMPLETE_ORDER', 
    REQUEST_SHARE: 'REQUEST_SHARE',
    SHARE_COMPLETE: 'SHARE_COMPLETE',
    // SYNC_BACK REMOVED
} as const;

type BridgeMessage =
    | { type: typeof BRIDGE_MESSAGE_TYPES.CUSTOMIZER_STATE; query: string }
    | { type: typeof BRIDGE_MESSAGE_TYPES.EXIT_APP }
    | {
        // --- GOLD MASTER v3 UPDATE: Secure Host Payload Structure ---
        type: typeof BRIDGE_MESSAGE_TYPES.COMPLETE_ORDER;
        payload: {
            config: {
                shell: string;
                imageSelection: string;
                size: string;
            };
            quantity: number;
            properties: Record<string, string>;
        };
    }
    | {
        type: typeof BRIDGE_MESSAGE_TYPES.REQUEST_SHARE;
        payload: { config: string };
    }
    | {
        type: typeof BRIDGE_MESSAGE_TYPES.SHARE_COMPLETE;
        success: boolean;
        errorMessage?: string;
    };
    // SYNC_BACK REMOVED from Union

const isInIframe = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.parent && window.parent !== window;
};

// --- SAFE POST TO PARENT (PROCESS.ENV REMOVED) ---
const postToParent = (message: BridgeMessage) => {
    if (typeof window === 'undefined') return;

    if (!isInIframe()) {
        console.log('[Bridge Outgoing]', message);
        return;
    }

    try {
        // --- FINAL SECURITY DECISION: Use Wildcard ('*') for maximum reliability ---
        // This ensures the button works on www, non-www, myshopify, and staging domains.
        // Security is handled by the RECEIVER (Shopify Host Script) via origin check.
        window.parent.postMessage(message, '*');
    } catch (err) {
        console.warn('[Bridge] postMessage failed', err, message);
    }
};

// --- END: Application-Wide Constants ---

// --- Centralized State Management ---

const gloveConfigReducer = (state: AppState, action: GloveAction): AppState => {
    switch (action.type) {
        case ACTION_TYPES.UPDATE_BUILD: {
            // FIX: Use the Factory (updateBuild) to enforce the strict schema
            // This prevents "ghost keys" (like backStyle on Infield gloves) from persisting.
            const nextBuild = updateBuild(state.configuration.build, action.payload);

            const sanitizedConfiguration = sanitize({
                ...state.configuration,
                build: nextBuild
            });

            return {
                ...state,
                configuration: sanitizedConfiguration,
                commerce: {
                    ...state.commerce,
                    variantId: null, 
                },
            };
        }
        case ACTION_TYPES.UPDATE_ZONE_COLOR:
            return {
                ...state,
                configuration: {
                    ...state.configuration,
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
            const { colorId } = action.payload;
            if (!colorId) return state;

            const definition = resolveProduct(state.configuration.build);
            const newConfiguration = { ...state.configuration };
            Object.values(ZONES).forEach((zoneKey: ZoneKey) => {
                if (definition.zones[zoneKey]?.allowApplyToAll) {
                    newConfiguration[zoneKey] = { colorId: colorId };
                }
            });

            return { ...state, configuration: newConfiguration };
        }
        case ACTION_TYPES.SET_LOADING:
            return { ...state, isLoading: action.payload };
        
        case ACTION_TYPES.REPLACE_CONFIGURATION:
            return {
                ...state, 
                configuration: action.payload,
                lastActivatedPartType: null,
            };

        default:
            return state;
    }
};

const GloveConfiguratorContext = createContext<{ state: AppState; dispatch: React.Dispatch<GloveAction> } | undefined>(undefined);

interface GloveConfiguratorProviderProps {
    children: ReactNode;
}

// --- UPDATE APP INITIALIZATION ---
const initialLoadResult = loadConfigurationFromURL(); 

const GloveConfiguratorProvider = ({ children }: GloveConfiguratorProviderProps) => {
    const initialVariantId = initialLoadResult.variantId ?? null;

    const [state, dispatch] = useReducer(gloveConfigReducer, {
        ...initialState,
        configuration: initialLoadResult.configuration,
        commerce: {
            ...initialState.commerce,
            variantId: initialVariantId, 
            quantity: 1
        }
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

const ColorIndicator = ({ colorId }: { colorId: ColorId }) => (
    <span
        className="w-5 h-5 rounded-full border border-white/20"
        style={{ backgroundColor: getHexById(colorId) }}
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

// --- DEBOUNCE UTILITY ---
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


// --- URL SYNC CONTROLLER ---
const URLSyncController = () => {
    const { state } = useGloveConfigurator();

    const debouncedSync = useMemo(
        () =>
            debounce((configuration: AppState['configuration']) => {
                const newUrl = generateShareableURL(configuration);

                try {
                    window.history.replaceState({}, '', newUrl);

                    const urlObj = new URL(newUrl, window.location.origin);
                    const query = urlObj.search.slice(1); 

                    if (query) {
                        postToParent({
                            type: BRIDGE_MESSAGE_TYPES.CUSTOMIZER_STATE,
                            query,
                        });
                    }
                } catch (err) {
                    // process.env check removed to prevent crashes
                    console.warn('[Bridge] URLSyncController failed', err, newUrl);
                }
            }, 300),
        []
    );

    useEffect(() => {
        debouncedSync(state.configuration);
    }, [state.configuration, debouncedSync]);

    return null;
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
        const variantClasses = variant === VARIANTS.LAYOUT.DESKTOP ? "p-4 h-[56px] hover:bg-[#2A2A2A] transition-colors" : "py-3 h-[56px] mb-3 text_white";
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

// --- MODIFICATION: Updated to GENERIC Component <T> ---
interface OptionGroupProps<T extends string> {
    title: string;
    options: readonly { id: T; label: string }[];
    layout: string;
    selectedOption: T;
    onSelectOption: (id: T) => void;
}
const OptionGroup = <T extends string>({ title, options, layout, selectedOption, onSelectOption }: OptionGroupProps<T>) => {
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

// --- MODIFICATION: Updated to GENERIC Component <T> ---
interface ImageGroupProps<T extends string> {
    title: string;
    options: readonly { id: T; title: string }[];
    layout: string;
    selectedOption: T;
    onSelectOption: (id: T) => void;
}
const ImageGroup = <T extends string>({ title, options, layout, selectedOption, onSelectOption }: ImageGroupProps<T>) => {
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
    // --- FIX: Use Partial<BuildConfig> for safer updates ---
    const onBuildConfigChange = (newConfig: Partial<BuildConfig>) => dispatch({ type: ACTION_TYPES.UPDATE_BUILD, payload: newConfig });

    // --- PHASE 3: USE RESOLVER INSTEAD OF GLOBAL LIST ---
    const definition = resolveProduct(buildConfig);
    const buildGroups = resolveBuildGroups(definition);

    // --- NEW: Find leather group specifically ---
    const leatherGroup = buildGroups.find(g => g.id === 'imageSelection');

    // Filter position group explicitly (same behavior as before)
    const positionGroup = buildGroups.find(g => g.id === 'position');
    
    // --- NEW: Filter out 'imageSelection' as well so it doesn't appear twice ---
    const otherGroups = buildGroups.filter(g => g.id !== 'position' && g.id !== 'imageSelection' && g.id !== 'webType');

    return (
        <div className={`space-y-6 ${!isDesktop ? 'pb-4' : ''}`}>
            {/* UPDATED: Generic ImageGroup usage with strict typing */}
            <ImageGroup<BuildLeatherId>
                title="Glove Leather"
                layout="grid-cols-2"
                // --- NEW: Use dynamic options from leatherGroup, casting IDs to Strict Type ---
                options={leatherGroup ? leatherGroup.options.map(o => ({ id: o.id as BuildLeatherId, title: o.label })) : []}
                selectedOption={buildConfig.imageSelection}
                onSelectOption={(value) => onBuildConfigChange({ imageSelection: value })}
            />
            
            {/* UPDATED: Generic OptionGroup usage with strict typing */}
            {positionGroup && (
                <OptionGroup<BuildPositionId>
                    key={positionGroup.id}
                    title={positionGroup.title}
                    options={positionGroup.options.map(o => ({ id: o.id as BuildPositionId, label: o.label }))}
                    layout={positionGroup.layout}
                    selectedOption={buildConfig.position}
                    onSelectOption={(value) => {
                        // --- FIX: SIMPLIFIED HANDLER ---
                        // We no longer manually set backStyle. The Factory 'updateBuild' handles defaults/stripping.
                        onBuildConfigChange({ position: value });
                    }}
                />
            )}

            {/* --- MODIFICATION: Updated map callback to allow readonly options --- */}
            {otherGroups.map((group) => (
                <OptionGroup
                    key={group.id}
                    title={group.title}
                    options={group.options}
                    layout={group.layout}
                    selectedOption={buildConfig[group.id as keyof Omit<BuildConfig, 'imageSelection' | 'position' | 'backStyle' | 'webType'>]}
                    // --- FIX FOR GOTCHA B: TYPE ASSERTION FOR COMPUTED KEY ---
                    onSelectOption={(value) => onBuildConfigChange({ [group.id]: value } as Partial<BuildConfig>)}
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
        dispatch({ type: ACTION_TYPES.UPDATE_BUILD, payload: { webType: newWebType } });
    };

    // --- PHASE 3 FIX: USE RESOLVER ---
    // No more manual filtering! The Logic layer already did the work.
    const definition = resolveProduct(buildConfig);
    const buildGroups = resolveBuildGroups(definition);
    const webGroup = buildGroups.find(g => g.id === 'webType');

    return (
        <div className="space-y-6">
            {/* UPDATED: Using Generic Component <T> to enforce type safety */}
            <ImageGroup<WebTypeId>
                title="Web Type"
                layout="grid-cols-3"
                // Map 'label' to 'title' for ImageGroup, use empty array fallback
                // STRICT TYPE RECOVERY: Casting the generic string ID back to WebTypeId
                options={webGroup ? webGroup.options.map(o => ({ id: o.id as WebTypeId, title: o.label })) : []}
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
    
    // --- RESOLVE PRODUCT ---
    const definition = resolveProduct(build);
    const uiGroups = definition.uiGroups;

    // --- PHASE 3: USE RESOLVER FOR SUMMARY LABELS ---
    const buildGroups = resolveBuildGroups(definition);

    // --- MODIFICATION: Updated helper to allow readonly options ---
    const getBuildLabel = (key: string, value: string): string => {
        if (key === 'imageSelection') return leatherOptions.find((opt: { id: string }) => opt.id === value)?.title || value;
        if (key === 'webType') return webTypeOptions.find((opt: { id: string }) => opt.id === value)?.title || value;
        
        // --- PHASE 3 FIX: USE RESOLVED GROUPS ---
        // This eliminates the TypeScript "Union" error because buildGroups contains standardized objects.
        const group = buildGroups.find(g => g.id === key);
        return group?.options.find(o => o.id === value)?.label || value;
    };
    
    const getBuildTitle = (key: string): string => {
        if (key === 'imageSelection') return "Glove Leather";
        if (key === 'webType') return "Web Type";
        // Also use resolved groups for title lookup for consistency
        return buildGroups.find(g => g.id === key)?.title || key;
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
    | { name: 'TEXT'; context: { id: TextPartId; title: string } }
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
        <footer className="flex-shrink-0 bg-[#161616] flex items-center justify_start pb-[20px] px-[14px] pt-[10px]">
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

    // *** MODIFICATION: Changed items-center to items-start ***
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

const OverviewDesktop = ({ onComplete }: { onComplete: () => void }) => {
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
                    onCompleteClick={onComplete}
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
    
    // --- RESOLVE PRODUCT ---
    const definition = resolveProduct(configuration.build);
    const currentUiGroups = definition.uiGroups;

    const accordionContainerRef = useRef<HTMLDivElement>(null);
    const desktopAccordionContainerRef = useRef<HTMLDivElement>(null);
    const { isTopGradientVisible, isBottomGradientVisible } = useScrollGradients(accordionContainerRef);
    const isScrolled = isTopGradientVisible; // Derived state

    const closeAccordion = useCallback(() => setOpenAccordion(null), [setOpenAccordion]);
    useEscapeKey(desktopAccordionContainerRef, closeAccordion, !!openAccordion);

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
                <div ref={accordionContainerRef} className="h-full overflow-y-auto space-y-4 focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-white focus-visible:outline-offset-[-4px] show-thin-scrollbar">
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
                            isEligible = definition.zones[group.zoneKey]?.allowApplyToAll ?? false;
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

interface AccordionMobileProps {
    onOpenPanel: (group: UIPartGroup | { id: 'build' | TextPartId, title: string }, event: React.MouseEvent<HTMLButtonElement>) => void;
    openAccordionOptionMobile: MobileAccordionState;
}

const AccordionMobile = React.forwardRef<HTMLElement, AccordionMobileProps>(({ onOpenPanel, openAccordionOptionMobile }, ref) => {
    const { state } = useGloveConfigurator();
    const { configuration } = state;
    
    // --- RESOLVE PRODUCT ---
    const definition = resolveProduct(configuration.build);
    const currentUiGroups = definition.uiGroups;

    const { isTopGradientVisible, isBottomGradientVisible } = useScrollGradients(ref as React.RefObject<HTMLElement>);

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
        <section ref={ref} className={`px-4 bg-[#161616] h-full overflow-y-auto ${openAccordionOptionMobile ? 'opacity-50 pointer-events-none' : ''}`} tabIndex={-1}>
            <ScrollGradient position={POSITIONS.TOP} isVisible={isTopGradientVisible} />
            <button key={buildGroup.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={(e) => onOpenPanel(buildGroup, e)}>
                <div className="flex items-center">
                    <CaretRightIcon className="h-4 w-auto mr-3" />
                    <span className="text-lg">{buildGroup.title}</span>
                </div>
            </button>

            {currentUiGroups.map((group: UIPartGroup) => (
                <button key={group.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={(e) => onOpenPanel(group, e)}>
                    <div className="flex items-center">
                        <CaretRightIcon className="h-4 w-auto mr-3" />
                        <span className="text-lg">{group.title}</span>
                    </div>
                    {renderAccessory(group)}
                </button>
            ))}

            {/* --- MODIFICATION: Render personalization panels separately --- */}
            {personalizationGroups.map(group => (
                <button key={group.id} className="w-full h-[56px] bg-[#1C1C1C] flex items-center justify-between px-4 mb-[10px] focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" onClick={(e) => onOpenPanel(group, e)}>
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
});


// --- Main UI Component ---
const UI = () => {
    const isDesktop = useBreakpoint();
    const { state, dispatch } = useGloveConfigurator();
    const { configuration, commerce, isLoading, lastActivatedPartType } = state as AppState; // Cast to our extended AppState
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null); // State for Snackbar message
    const [isVisualizationExpanded, setIsVisualizationExpanded] = useState(false);
    const [openAccordionOptionMobile, setOpenAccordionOptionMobile] = useState<MobileAccordionState>(null);
    const appContainerRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const mobileListRef = useRef<HTMLElement>(null);
    const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

    // For Desktop state
    const [openAccordion, setOpenAccordion] = useState<string | null>('build');

    // Add this near your other refs (around line 1260)
    const phantomUrlRef = useRef<string | null>(null);

    // --- MODIFICATION: Add useEffect for checking initial load status ---
    useEffect(() => {
        if (initialLoadResult.status === 'failed') {
            setSnackbarMessage("Invalid share link. Showing default glove.");
        }
    }, []); // Empty dependency array ensures this runs only once on mount
    // --- END MODIFICATION ---

    // --- NEW: Listen for SHARE_COMPLETE messages from parent (for Snackbar updates) ---
    useEffect(() => {
        const handleParentMessage = (event: MessageEvent) => {
            const data = event.data;
            if (!data || typeof data !== 'object') return;

            // --- FIX FROM DEEPSEEK: SANITY CHECK ---
            // Ensure it is a string and looks like a valid http/https URL
            if (data.type === 'PHANTOM_URL' && typeof data.url === 'string') {
                 if (data.url.startsWith('http')) {
                     phantomUrlRef.current = data.url;
                 }
            }
            // ---------------------------------------

            if (data.type === BRIDGE_MESSAGE_TYPES.SHARE_COMPLETE) {
                if (data.success) {
                    setSnackbarMessage('Share link copied!');
                } else {
                    setSnackbarMessage('Failed to share link.');
                }
            }
        };

        window.addEventListener('message', handleParentMessage);

        return () => {
            window.removeEventListener('message', handleParentMessage);
        };
    }, []);
    // --- END: SHARE_COMPLETE listener ---

    // --- RESOLVE PRODUCT ---
    const definition = resolveProduct(configuration.build);
    const currentUiGroups = definition.uiGroups;

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

        if (!definition.zones[representativeZoneKey]?.allowApplyToAll) {
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
            if (context.type === 'single') return definition.zones[context.zoneKey]?.allowApplyToAll ?? false;
            if (context.type === 'dual') return true;
            if (context.type === 'gallery') return definition.zones[ZONES.WEB]?.allowApplyToAll ?? false;
        }
        return false;
    }, [isDesktop, openAccordionOptionMobile, definition]);
    // --- END MODIFICATION ---

    const handleExitCustomizer = useCallback(() => {
        // ONLY SEND EXIT SIGNAL
        postToParent({
            type: BRIDGE_MESSAGE_TYPES.EXIT_APP,
        });
    }, []);

    // --- MODIFICATION C: handleCompleteOrder UX Guard ---
    const handleCompleteOrder = useCallback(() => {
        // Gold Master v3 Implementation
        const { build, thumbName, pinkyName } = configuration;

        // 1. Map internal state to Map Keys (shell)
        let shellValue = 'open-back'; // Default fallback

        // FIX: Use strict IDs defined in BuildPositionId ('cat', 'fb', 'close')
        // We use string casting to be robust against internal short-code variations (like 'cat' vs 'catch' or 'close' vs 'closed')
        // This ensures the Host Script gets the standard map keys: 'catcher', 'first-base', 'close-back', 'open-back'.
        
        if ((build.position as string) === 'cat') {
            shellValue = 'catcher';
        } else if ((build.position as string) === 'fb') {
            shellValue = 'first-base';
        } else {
            // Infield/Outfield logic relies on backStyle
            // Safe Check: If backStyle contains 'c', treat as closed (covers 'closed', 'close', 'close-back', 'cb')
            const backStyleStr = (build.backStyle as string) || '';
            shellValue = backStyleStr.includes('c') ? 'close-back' : 'open-back';
        }

        // 2. Generate Design Code (Base64/URL)
        const designCode = generateShareableURL(configuration);

        // 3. Resolve Display Names for Properties
        const leatherName = leatherOptions.find(o => o.id === build.imageSelection)?.title || build.imageSelection;
        const webTypeName = webTypeOptions.find(o => o.id === build.webType)?.title || build.webType;

        // --- TRANSLATION FIX START ---
        // Look up human-readable labels from Registries. Fallback to raw code if lookup fails.
        // Using strict property access on BuildConfigBase properties (size, position, throwingHand).
        const sizeLabel = SIZE_REGISTRY[build.size]?.label ?? build.size;
        // build.position is a union of string literals, so it's a valid index for POSITION_REGISTRY
        const positionLabel = POSITION_REGISTRY[build.position]?.label ?? build.position;
        const throwingHandLabel = THROWING_HAND_REGISTRY[build.throwingHand]?.label ?? build.throwingHand;
        
        const stiffnessLabel = STIFFNESS_REGISTRY[build.stiffness]?.label ?? build.stiffness;
        const handOpeningLabel = HAND_OPENING_REGISTRY[build.handOpeningSize]?.label ?? build.handOpeningSize;
        // --- TRANSLATION FIX END ---

        const properties: Record<string, string> = {
            "Leather": leatherName,
            "Web Type": webTypeName,
            // "Design Code" REMOVED from here to move it to the end
            "Thumb Name": thumbName.text,
            "Pinky Name": pinkyName.text,
            "Size": sizeLabel,           // <--- FIXED: Translated
            "Position": positionLabel,   // <--- FIXED: Translated
            "Throwing Hand": throwingHandLabel, // <--- FIXED: Translated
            "Stiffness": stiffnessLabel, // <--- ADDED
            "Hand Opening": handOpeningLabel, // <--- ADDED
        };

        // --- NEW: Add Color Selection for Active Zones ---
        // We iterate through the current configuration to find active zone colors.
        const definition = resolveProduct(build); // Resolve definition to get display names
        
        Object.entries(configuration).forEach(([key, value]) => {
            if (key.startsWith('zone')) {
                const zoneKey = key as ZoneKey;
                const zoneDef = definition.zones[zoneKey];
                
                // Only add if it's a valid zone for this glove type and has a color selection
                if (zoneDef && value && typeof value === 'object' && 'colorId' in value) {
                    const colorName = colorLookupMap.get(value.colorId)?.name || value.colorId;
                    properties[zoneDef.displayName] = colorName;
                }
            }
        });
        
        // --- MOVED TO END: Insert Design Code Last ---
        properties["Design Code"] = designCode;
        // ------------------------------------------------

        // 4. Construct Payload
        postToParent({
            type: BRIDGE_MESSAGE_TYPES.COMPLETE_ORDER,
            payload: {
                // NO variantId here! Host calculates it.
                config: {
                    shell: shellValue,
                    imageSelection: build.imageSelection,
                    size: build.size
                },
                quantity: 1,
                properties: properties
            },
        });
    }, [configuration]);
    // --- END MODIFICATION C ---

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

    const panelHeaderRef = useRef<HTMLButtonElement | null>(null);

    useLayoutEffect(() => {
        const listElement = mobileListRef.current;
        if (!listElement) return;

        if (openAccordionOptionMobile) {
            listElement.setAttribute('inert', '');
            panelHeaderRef.current?.focus();
        } else {
            listElement.removeAttribute('inert');
            if (triggerButtonRef.current) {
                triggerButtonRef.current.focus();
                triggerButtonRef.current = null;
            }
        }
    }, [openAccordionOptionMobile]);

    useEffect(() => {
        const container = appContainerRef.current;
        if (!container) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;
            const focusableElements = Array.from(
                container.querySelectorAll<HTMLElement>(
                    'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter(el => !(el as any).inert && window.getComputedStyle(el).display !== 'none');
            if (focusableElements.length === 0) return;
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
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
    }, [isDesktop, openAccordionOptionMobile, isVisualizationExpanded]);

    const handleOpenPanel = (group: UIPartGroup | { id: 'build' | TextPartId, title: string }, event: React.MouseEvent<HTMLButtonElement>) => {
        triggerButtonRef.current = event.currentTarget;
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
        // 1. Generate the fallback URL (direct link to app)
        const configUrl = generateShareableURL(state.configuration);

        // 2. Determine the URL to share:
        // If we are in an iframe AND we have received a URL from Shopify, use that.
        // Otherwise, use the direct app URL.
        const urlToShare = isInIframe() && phantomUrlRef.current 
            ? phantomUrlRef.current 
            : configUrl;

        // 3. Share Logic (Native Share Sheet or Clipboard)
        // Note: We perform this HERE to preserve the "User Gesture"
        const shareData = { 
            title: 'My Custom Glove', 
            text: 'Check out the glove I designed!', 
            url: urlToShare 
        };

        if (navigator.share) {
            try { 
                await navigator.share(shareData); 
            } catch (err) { 
                console.log('Share failed or cancelled', err); 
            }
        } else {
            try {
                await navigator.clipboard.writeText(urlToShare);
                setSnackbarMessage('Share link copied!'); 
            } catch (err) {
                setSnackbarMessage('Failed to copy link.'); 
            }
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
        triggerButtonRef.current = event.currentTarget;
        setOpenAccordionOptionMobile({ name: 'SUMMARY' });
    };

    return (
        <div ref={appContainerRef} className="flex flex-col lg:relative w-full h-full bg-transparent text-white">

            {/* --- SNACKBAR RENDER --- */}
            {snackbarMessage && (
                <Snackbar
                    message={snackbarMessage}
                    onClose={() => setSnackbarMessage(null)} // Handler to clear the message
                />
            )}
            {/* --- END SNACKBAR RENDER --- */}

            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 pointer-events-auto">
                    <p className="text-white text-xl animate-pulse">Loading...</p>
                </div>
            )}

            <main ref={mainRef} className={`p-4 flex flex-col items-center justify-center relative bg-transparent overflow-auto h-full w-full ${isVisualizationExpanded ? 'flex-grow' : 'lg:absolute lg:inset-0'}`} style={!isDesktop && !isVisualizationExpanded ? { flexBasis: 'calc(61.8% - 66px)' } : {}}>
                {!isDesktop && <div className="absolute top-[20px] left-[20px] w-[70px] h-[49px] bg-gray-300 bg-opacity-75 z-10 flex items-center justify-center pointer-events-auto"><p className="font-bold text-xl text-gray-900">LOGO</p></div>}
                
                {/* --- MODIFICATION: Desktop & Mobile Header Logic --- */}
                {isDesktop ? (
                    <div className="absolute top-[20px] right-[20px] z-20 flex flex-row-reverse items-center gap_[25px] pointer-events-auto">
                        {/* Desktop: Close Button */}
                        <button 
                            className="p-2 hover:bg-gray-800 hover:bg-opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white"
                            aria-label="Close Configuration"
                            onClick={handleExitCustomizer} 
                        >
                            <CloseIcon />
                        </button>
                        
                        {/* Desktop: Share Button */}
                        <button 
                            className="p-2 hover:bg-gray-800 hover:bg-opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white" 
                            aria-label="Share configuration" 
                            onClick={handleShare}
                        >
                            <ShareIcon />
                        </button>
                    </div>
                ) : (
                    /* Mobile: Close Button (Replaces Share in Top Right) - Tab Order #1 */
                    <button 
                        className="absolute top-[20px] right-[20px] z-20 p-2 hover:bg-gray-800 hover:bg-opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white pointer-events-auto" 
                        aria-label="Close Configuration" 
                        onClick={handleExitCustomizer}
                    >
                        <CloseIcon />
                    </button>
                )}
                {/* --- END MODIFICATION --- */}

                <div className="absolute bottom-4 inset-x-0 h-8 z-10 pointer-events-none" aria-hidden="true">
                    {!isDesktop && (
                        <>
                            {/* Mobile: Expand Button (Floater Left) - Tab Order #2 */}
                            <button
                                className="absolute left-5 bottom-0 p-1 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white pointer-events-auto"
                                onClick={() => setIsVisualizationExpanded(!isVisualizationExpanded)}
                                aria-label={isVisualizationExpanded ? "Collapse visualization" : "Expand visualization"}
                            >
                                {isVisualizationExpanded ? <CollapseIcon /> : <ExpandIcon />}
                            </button>

                            {/* Mobile: Share Button (Floater Right) - Tab Order #3 */}
                            {/* Mirroring the Expand button style: p-1, bottom-0, but anchored right-5 (20px) */}
                            <button 
                                className="absolute right-[20px] bottom-0 p-1 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white pointer-events-auto"
                                aria-label="Share configuration"
                                onClick={handleShare}
                            >
                                <ShareIcon />
                            </button>
                        </>
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
                        <OverviewDesktop onComplete={handleCompleteOrder} />
                    </>
                ) : (
                    <div className="flex flex-col overflow-hidden bg-[#161616] pointer-events-auto" style={{ flexBasis: 'calc(38.2% + 66px)' }}>
                        <div className="relative flex-grow overflow-hidden">
                            <AccordionMobile
                                ref={mobileListRef}
                                onOpenPanel={handleOpenPanel}
                                openAccordionOptionMobile={openAccordionOptionMobile}
                            />
                            {renderMobilePanel()}
                        </div>
                        <FooterMobile
                            openPanelName={openAccordionOptionMobile?.name}
                            onClosePanel={handleClosePanel}
                            onCompleteOrder={handleCompleteOrder}
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

// ===================================================================
// --- LOGIC CONTROLLER (THE "ENGINE") ---
// ===================================================================

const GloveLogicController = () => {
    const { state } = useGloveConfigurator();
    const sceneManager = useContext(SceneContext);

    useEffect(() => {
        const updateSceneAsync = async () => {
            if (!sceneManager || !sceneManager.isReady()) {
                return;
            }

            try {
                const { configuration } = state;
                
                // 1. RESOLVE PRODUCT (The Single Source of Truth)
                const definition = resolveProduct(configuration.build);

                // 2. UPDATE SHELL ASSET
                await sceneManager.updateBuild(definition.assets.shellModel);

                // 3. UPDATE WEB ASSET
                // Map the user's generic 'webType' (e.g. 'trp') to the specific GLB (e.g. 'trapOB')
                const webModelFilename = definition.assets.validWebs[configuration.build.webType];

                if (webModelFilename) {
                    await sceneManager.updateWeb(webModelFilename);
                } else {
                    // Should be prevented by sanitizer, but safe guard:
                    await sceneManager.updateWeb(''); 
                }

                // 4. UPDATE ZONES (Definition-Driven)
                // We iterate ONLY the zones defined in the active cartridge.
                for (const [zoneKey, zoneDef] of Object.entries(definition.zones)) {
                    const colorState = configuration[zoneKey as ZoneKey];
                    if (!colorState) continue;

                    const paletteIndex = getPaletteIndexById(colorState.colorId);

                    // Apply to Shell?
                    if (zoneDef.materialTarget === 'shell' || zoneDef.materialTarget === 'both') {
                        sceneManager.updateShellZonePointer(zoneDef.shaderIndex, paletteIndex);
                    }
                    
                    // Apply to Web?
                    if (zoneDef.materialTarget === 'web' || zoneDef.materialTarget === 'both') {
                        sceneManager.updateWebZonePointer(zoneDef.shaderIndex, paletteIndex);
                    }
                }

                // 5. UPDATE TEXT
                // (Text uses the universal lookup helpers for now)
                sceneManager.updateText({
                    zone: 'thumbName',
                    text: configuration.thumbName.text,
                    font: configuration.thumbName.font,
                    color: getHexById(configuration.thumbName.colorId),
                });

                sceneManager.updateText({
                    zone: 'pinkyName',
                    text: configuration.pinkyName.text,
                    font: configuration.pinkyName.font,
                    color: getHexById(configuration.pinkyName.colorId),
                });

            } catch (error) {
                console.error("Failed to update scene:", error);
            }
        };

        updateSceneAsync();

    }, [state, sceneManager]);

    return null;
};

// 3. Update your main App component to include the controller.
const GloveAppContent = () => {
    const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);

    // --- ADDED FOR FIX ---
    const { state } = useGloveConfigurator();
    // Resolve the definition to get the correct initial shell name (GLB filename)
    const definition = resolveProduct(state.configuration.build);
    const initialShellName = definition.assets.shellModel;
    // --------------------

    return (
        <SceneContext.Provider value={sceneManager}>

            <div id="app-root" className="relative w-full h-[100dvh] bg-[#161616]">
                <div id="babylon-container" className="absolute inset-0 z-10">
                    <BabylonCanvas
                        onSceneReady={setSceneManager}
                        initialModelName={initialShellName} // <--- The new instruction
                    />
                </div>
                <div id="ui-container" className="absolute inset-0 z-20 pointer-events-none">
                    <UI />
                </div>
            </div>

            {/* Render the Engine (Logic Controller) which listens to state and updates the Scene */}
            <GloveLogicController />

            {/* This component will now automatically sync the state to the URL */}
            <URLSyncController />

        </SceneContext.Provider>
    );
};

const App = () => {
    return (
        <GloveConfiguratorProvider>
            <GloveAppContent />
        </GloveConfiguratorProvider>
    );
};

export default App;