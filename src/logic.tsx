import { useEffect, createContext, useContext } from 'react';
import { Color3 } from '@babylonjs/core';
import { useGloveConfigurator, GloveConfiguration, AppState, ColorablePart, Font, WebPart, ACTION_TYPES, BuildConfig } from './ui';
import { SceneManager } from './viewer';

// --- NEW CORE TYPES (from Step 1) ---
export type HexColor = string;
export type ZoneKey = `zone${number}`; // e.g., 'zone1', 'zone2', etc.

export interface SingleColorState {
  type: 'single';
  color: HexColor;
}

export interface PartConfig {
  shaderIndex: number;
  displayName: string;
}

// --- CORE DATA CONSTANTS (MOVED FROM UI) ---

export const DUAL_COLOR_SUB_PARTS = {
    INNER: 'inner',
    OUTER: 'outer',
} as const;

export const FORMAT_TYPES = {
    DEFAULT: 'default',
    HEADER: 'header',
    SUMMARY: 'summary',
} as const;

// --- DATABASE OF OPTIONS ---

export const leatherOptions = [
    { id: 'imgOpt1', title: 'Japanese Kip' },
    { id: 'imgOpt2', title: 'American Steerhide' }
];

export const fontOptions: { id: Font, label: string }[] = [
    { id: 'SCRIPT', label: 'SCRIPT' },
    { id: 'BLOCK', label: 'BLOCK' }
];

export const colorSwatches: { name: string, hex: HexColor }[] = [
    { name: 'Red', hex: '#C62828' }, { name: 'Pink', hex: '#AD1457' }, { name: 'Purple', hex: '#6A1B9A' }, { name: 'Indigo', hex: '#4527A0' }, { name: 'Royal', hex: '#283593' }, { name: 'Blue', hex: '#1565C0' }, { name: 'Light Blue', hex: '#0277BD' }, { name: 'Teal', hex: '#00838F' }, { name: 'Green', hex: '#00695C' }, { name: 'Forest', hex: '#2E7D32' }, { name: 'Lime', hex: '#558B2F' }, { name: 'Olive', hex: '#9E9D24' }, { name: 'Gold', hex: '#F9A825' }, { name: 'Orange', hex: '#FF8F00' }, { name: 'Burnt Orange', hex: '#EF6C00' }, { name: 'Red Orange', hex: '#D84315' }, { name: 'Brown', hex: '#4E342E' }, { name: 'Charcoal', hex: '#424242' }, { name: 'Grey', hex: '#BDBDBD' }, { name: 'Slate', hex: '#37474F' },
];

export const buildOptionsData = [
    { id: 'position', title: 'Position', options: [{id: 'INFIELD', label: 'INFIELD'}, {id: 'OUTFIELD', label: 'OUTFIELD'}, {id: 'PITCHER', label: 'PITCHER'}, {id: 'CATCHER', label: 'CATCHER'}, {id: 'FIRST BASE', label: 'FIRST BASE'}], layout: 'grid-cols-3' }, { id: 'size', title: 'Size', options: [{id: '11"', label: '11"'}, {id: '11.25"', label: '11.25"'}, {id: '11.5"', label: '11.5"'}, {id: '11.75"', label: '11.75"'}, {id: '12"', label: '12"'}], layout: 'grid-cols-3' }, { id: 'handOpeningSize', title: 'Hand Opening Size', options: [{id: 'ADULT', label: 'ADULT'}, {id: 'YOUTH', label: 'YOUTH'}], layout: 'grid-cols-2' }, { id: 'stiffness', title: 'Stiffness', options: [{id: 'STIFF', label: 'STIFF'}, {id: 'STANDARD', label: 'STANDARD'}, {id: 'SOFT', label: 'SOFT'}], layout: 'grid-cols-3' }, { id: 'throwingHand', title: 'Throwing Hand', options: [{id: 'RIGHT HAND', label: 'RIGHT HAND'}, {id: 'LEFT HAND', label: 'LEFT HAND'}], layout: 'grid-cols-2' }
];

export const webTypeOptions = [
    { id: 'BASKET', title: 'Basket' },
    { id: 'BASKET_LACE', title: 'Basket Lace' },
    { id: 'CLOSED_V', title: 'Closed V' },
    { id: 'DUAL_HINGE', title: 'Dual Hinge' },
    { id: 'FRAMED_MOD_TRAP', title: 'Framed Mod Trap' },
    { id: 'H_WEB', title: 'H-Web' },
    { id: 'I_WEB', title: 'I-Web' },
    { id: 'LACED_H', title: 'Laced H-Web' },
    { id: 'LACE_SEALING', title: 'Lace Sealing' },
    { id: 'MOD_TRAP', title: 'Mod Trap' },
    { id: 'ONE_PIECE', title: 'One Piece' },
    { id: 'POST', title: 'Post' },
    { id: 'SEALING', title: 'Sealing' },
    { id: 'SINGLE_POST', title: 'Single Post' },
    { id: 'SINGLE_POST_LACE', title: 'Single Post Lace' },
    { id: 'TRAP', title: 'Trap' },
    { id: 'TWO_PIECE', title: 'Two Piece' },
];

export const GLOVE_TO_WEBS_MAP = {
    openBack: { BASKET: 'basketOB', BASKET_LACE: 'basketLaceOB', CLOSED_V: 'closedVOB', DUAL_HINGE: 'dualHingeOB', FRAMED_MOD_TRAP: 'framedModTrapOB', H_WEB: 'hOB', I_WEB: 'iOB', LACED_H: 'lacedHOB', LACE_SEALING: 'laceSealingOB', MOD_TRAP: 'modTrapOB', ONE_PIECE: 'onePieceOB', SEALING: 'sealingOB', SINGLE_POST: 'singlePostOB', SINGLE_POST_LACE: 'singlePostLaceOB', TRAP: 'trapOB', TWO_PIECE: 'twoPieceOB', },
    closeBack: { BASKET: 'basketCB', CLOSED_V: 'closedVCB', DUAL_HINGE: 'dualHingeCB', FRAMED_MOD_TRAP: 'framedModTrapCB', H_WEB: 'hCB', LACED_H: 'lacedHCB', LACE_SEALING: 'laceSealingCB', MOD_TRAP: 'modTrapCB', ONE_PIECE: 'onePieceCB', SEALING: 'sealingCB', TRAP: 'trapCB', },
    firstBase: { POST: 'postFB', TWO_PIECE: 'twoPieceFB', },
    catchers: { TWO_PIECE: 'twoPieceCM', }
};

const isValidShell = (shell: string): shell is keyof typeof GLOVE_TO_WEBS_MAP => {
    return shell in GLOVE_TO_WEBS_MAP;
};

// @ts-nocheck
// NOTE: The AppState and GloveConfiguration types are temporarily incompatible with this new initialState.
// They will be updated in a future step to use the new zone-based structure.
export const initialState: AppState = {
    configuration: {
        build: { imageSelection: 'imgOpt1', position: 'INFIELD', size: '11"', handOpeningSize: 'ADULT', stiffness: 'STANDARD', throwingHand: 'RIGHT HAND', backStyle: 'OPEN' },
        
        // --- UNIVERSAL PARTS ---
        web: { color: '#00FFCF' },
        wrist: { color: '#00FF10' },
        wristStrap: { color: '#AF00FF' },
        padHood: { color: '#FFEF00' },
        thumbOuter: { color: '#FF0000' },
        pinkyInner: { color: '#FF00BF' },
        pinkyOuter: { color: '#FF6000' },
        palm: { color: '#FF00EF' },
        liner: { color: '#AFFF00' },
        binding: { color: '#0070FF' },
        welting: { color: '#FF8F00' },
        lace: { color: '#5000FF' },
        stitching: { color: '#FF0030' },
        wristLogo: { color: '#00FF70' },
        wristLogoOutline: { color: '#FF008F' },
        fingerLogo: { color: '#0010FF' },
        thumbName: { text: 'Thumb', font: 'SCRIPT', color: '#BDBDBD' },
        pinkyName: { text: 'Pinky', font: 'BLOCK', color: '#FFFFFF' },

        // --- REPURPOSABLE ZONES (A flat list of simple color objects) ---
        zone1: { color: '#00FFFF' }, // Represents thumbInner / primaryUPiece
        zone2: { color: '#80FF00' }, // Represents index / shellBack
        zone3: { color: '#7F00FF' }, // Represents middleInner / shellBase
        zone4: { color: '#FFBF00' }, // Represents middleOuter / middleOuterRingInner / rails
        zone5: { color: '#0040FF' }, // Represents ringInner
        zone6: { color: '#00FF40' }, // Represents ringOuter / ringOuterPinkyInner
    },
    isLoading: false,
};

// --- DATA TRANSFORMATION LOGIC (UNCHANGED) ---

interface GetColorDisplayOptions { format?: (typeof FORMAT_TYPES)[keyof typeof FORMAT_TYPES]; }
export const getColorDisplay = (colorValue: ColorablePart | HexColor, options: GetColorDisplayOptions = {}): string => {
    const { format = FORMAT_TYPES.DEFAULT } = options;
    const getColorName = (hex: HexColor) => colorSwatches.find(c => c.hex === hex)?.name || hex;
    if (typeof colorValue === 'string') { return getColorName(colorValue); }
    switch (format) {
        case FORMAT_TYPES.HEADER: if (colorValue.type === 'dual') return `${getColorName(colorValue.inner)} · ${getColorName(colorValue.outer)}`; return getColorName(colorValue.color);
        case FORMAT_TYPES.SUMMARY: if (colorValue.type === 'dual') return `Inner: ${getColorName(colorValue.inner)}, Outer: ${getColorName(colorValue.outer)}`; if (colorValue.type === 'text') return getColorName(colorValue.color); if (colorValue.type === 'single' || colorValue.type === 'web') return `Color: ${getColorName(colorValue.color)}`; const exhaustiveCheck: never = colorValue; return 'N/A';
        default: return JSON.stringify(colorValue);
    }
};

export const getActiveColor = (colorValue: ColorablePart | null | undefined, activeSubPart: AppState['activeDualColorPart']): HexColor | undefined => {
    if (!colorValue || typeof colorValue !== 'object') return undefined;
    switch (colorValue.type) {
        case 'web': case 'single': case 'text': return colorValue.color;
        case 'dual': return colorValue[activeSubPart];
        default: return undefined;
    }
};

export const getModelNameForBuild = (buildConfig: BuildConfig): string => {
    switch (buildConfig.position) {
        case 'INFIELD': return 'openBack';
        case 'OUTFIELD': case 'PITCHER': return buildConfig.backStyle === 'CLOSE' ? 'closeBack' : 'openBack';
        case 'CATCHER': return 'catchers';
        case 'FIRST BASE': return 'firstBase';
        default: return 'openBack';
    }
};

export const SceneContext = createContext<SceneManager | null>(null);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) { throw new Error('useScene must be used within a SceneProvider'); }
    return context;
};


// ===================================================================
// --- STEP 1: DEFINE THE MASTER CONFIGURATION OBJECT ---
// ===================================================================
export const GLOVE_PARTS_CONFIG = {
    // --- TIER 3: Shell-Specific (for openBack) ---
    'thumb_outer':  { shaderIndex: 0,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Outer Thumb' }},
    'thumb_inner':  { shaderIndex: 1,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Inner Thumb' }},
    'index_finger': { shaderIndex: 2,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Index Finger' }},
    'middle_inner': { shaderIndex: 3,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Inner Middle' }},
    'middle_outer': { shaderIndex: 4,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Outer Middle' }},
    'ring_inner':   { shaderIndex: 5,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Inner Ring' }},
    'ring_outer':   { shaderIndex: 6,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Outer Ring' }},
    'pinky_inner':  { shaderIndex: 7,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Inner Pinky' }},
    'pinky_outer':  { shaderIndex: 8,  materialTarget: 'shell', displayNameByShell: { 'openBack': 'Outer Pinky' }},
  
    // --- TIER 2: Shell Universal (Shell-Only) ---
    'finger_logo':  { shaderIndex: 21, materialTarget: 'shell', displayName: 'Finger Logo' },
    'wrist_logo':   { shaderIndex: 22, materialTarget: 'shell', displayName: 'Wrist Logo' },
    'wrist_logo_2': { shaderIndex: 23, materialTarget: 'shell', displayName: 'Wrist Logo 2' },
    'welting':      { shaderIndex: 24, materialTarget: 'shell', displayName: 'Welting' },
    'binding':      { shaderIndex: 25, materialTarget: 'shell', displayName: 'Binding' },
    'wrist':        { shaderIndex: 26, materialTarget: 'shell', displayName: 'Wrist' },
    'palm':         { shaderIndex: 27, materialTarget: 'shell', displayName: 'Palm' },
    'liner':        { shaderIndex: 28, materialTarget: 'shell', displayName: 'Liner' },
  
    // --- TIER 1: Truly Universal & Web ---
    'lace':         { shaderIndex: 29, materialTarget: 'both',  displayName: 'Lace' },
    'web':          { shaderIndex: 30, materialTarget: 'web',   displayName: 'Web' },
    'stitching':    { shaderIndex: 31, materialTarget: 'both',  displayName: 'Stitching' },
};

// ===================================================================
// --- STEP 2: CREATE THE "SMART" LOOKUP FUNCTION ---
// ===================================================================
export function getPartDetails(partKey: string, activeShell: string) {
    const config = GLOVE_PARTS_CONFIG[partKey as keyof typeof GLOVE_PARTS_CONFIG];
    if (!config) return null;
  
    const displayName = (config as any).displayNameByShell?.[activeShell] || (config as any).displayName;
  
    return {
      shaderIndex: config.shaderIndex,
      materialTarget: config.materialTarget,
      displayName: displayName
    };
}

// Helper to get the correct color from the complex state object based on our internal part key
const getColorFromState = (partKey: string, configuration: GloveConfiguration): HexColor | undefined => {
    switch (partKey) {
        case 'thumb_outer': return configuration.thumb.outer;
        case 'thumb_inner': return configuration.thumb.inner;
        case 'index_finger': return configuration.index.color;
        case 'middle_outer': return configuration.middle.outer;
        case 'middle_inner': return configuration.middle.inner;
        case 'ring_outer': return configuration.ring.outer;
        case 'ring_inner': return configuration.ring.inner;
        case 'pinky_outer': return configuration.pinky.outer;
        case 'pinky_inner': return configuration.pinky.inner;
        case 'web': return configuration.web.color;
        // NOTE: Universal & Shell Universal parts would need to be added to the state object to be customizable.
        // This example only maps the parts currently in the state.
        default: return undefined;
    }
};


// ===================================================================
// --- STEP 3: UPDATE GLOVELOGICCONTROLLER ---
// ===================================================================
export const GloveLogicController = () => {
    const { state, dispatch } = useGloveConfigurator();
    const sceneManager = useContext(SceneContext);

    useEffect(() => {
        const updateSceneAsync = async () => {
            if (!sceneManager || !sceneManager.isReady()) {
                return;
            }
            
            dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
            
            try {
                const { configuration } = state;
                const activeShell = getModelNameForBuild(configuration.build);
                
                // Update 3D models for shell and web
                await sceneManager.updateBuild(activeShell);
                const webModelFilename = isValidShell(activeShell)
                    ? GLOVE_TO_WEBS_MAP[activeShell][configuration.web.webType as keyof typeof GLOVE_TO_WEBS_MAP[typeof activeShell]]
                    : undefined;
    
                if (webModelFilename) {
                    await sceneManager.updateWeb(webModelFilename);
                } else {
                    await sceneManager.updateWeb('');
                }
        
                // --- NEW: Update colors using the master config ---
                for (const partKey in GLOVE_PARTS_CONFIG) {
                    const colorValue = getColorFromState(partKey, configuration);
                    if (!colorValue) continue; // Skip parts not in the current state for now

                    const details = getPartDetails(partKey, activeShell);
                    if (!details) continue;

                    const color3 = Color3.FromHexString(colorValue);

                    if (details.materialTarget === 'shell' || details.materialTarget === 'both') {
                        sceneManager.updateShellColor(details.shaderIndex, color3);
                    }
                    if (details.materialTarget === 'web' || details.materialTarget === 'both') {
                        sceneManager.updateWebColor(details.shaderIndex, color3);
                    }
                }
        
                // Text updates remain the same
                sceneManager.updateText({
                    zone: 'thumbName',
                    text: configuration.thumbName.text,
                    font: configuration.thumbName.font,
                    color: configuration.thumbName.color,
                });
        
                sceneManager.updateText({
                    zone: 'pinkyName',
                    text: configuration.pinkyName.text,
                    font: configuration.pinkyName.font,
                    color: configuration.pinkyName.color,
                });

            } catch (error) {
                console.error("Failed to update scene:", error);
            } finally {
                dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
            }
        };

        updateSceneAsync();

    }, [state.configuration, sceneManager, dispatch]);

    return null;
};