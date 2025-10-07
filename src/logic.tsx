import { useEffect, createContext, useContext } from 'react';
import { Color3 } from '@babylonjs/core';
import { useGloveConfigurator, GloveConfiguration, AppState, ColorablePart, Font, WebPart, ACTION_TYPES, BuildConfig } from './ui';
import { SceneManager } from './viewer';

// --- NEW CORE TYPES (from Step 1) ---
export type HexColor = string;
export type ZoneKey = `zone${number}`; // e.g., 'zone1', 'zone2', etc.

export interface SingleColorState {
  color: HexColor;
}

export interface PartConfig {
  shaderIndex: number;
  displayName: string;
}

// --- NEW ZONE REGISTRY (Step 3 - "Pure Zone" Model) ---
export const ZONES = {
    // Repurposable Zones
    THUMB_INNER: 'zone1',
    INDEX: 'zone2',
    MIDDLE_INNER: 'zone3',
    MIDDLE_OUTER: 'zone4',
    RING_INNER: 'zone5',
    RING_OUTER: 'zone6',

    // Universal Parts (as Zones)
    WEB: 'zone7',
    WRIST: 'zone8',
    WRIST_STRAP: 'zone9',
    PAD_HOOD: 'zone10',
    THUMB_OUTER: 'zone11',
    PINKY_INNER: 'zone12',
    PINKY_OUTER: 'zone13',
    PALM: 'zone14',
    LINER: 'zone15',
    BINDING: 'zone16',
    WELTING: 'zone17',
    LACE: 'zone18',
    STITCHING: 'zone19',
    WRIST_LOGO: 'zone20',
    WRIST_LOGO_OUTLINE: 'zone21',
    FINGER_LOGO: 'zone22',
} as const;


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
        
        // --- TEXT PARTS ---
        thumbName: { text: 'Thumb', font: 'SCRIPT', color: '#BDBDBD' },
        pinkyName: { text: 'Pinky', font: 'BLOCK', color: '#FFFFFF' },

        // --- PURE ZONES (for all colorable parts) ---
        zone1: { color: '#00FFFF' }, // Repurposable: thumbInner / primaryUPiece
        zone2: { color: '#80FF00' }, // Repurposable: index / shellBack
        zone3: { color: '#7F00FF' }, // Repurposable: middleInner / shellBase
        zone4: { color: '#FFBF00' }, // Repurposable: middleOuter / middleOuterRingInner / rails
        zone5: { color: '#0040FF' }, // Repurposable: ringInner
        zone6: { color: '#00FF40' }, // Repurposable: ringOuter / ringOuterPinkyInner
        zone7: { color: '#00FFCF' }, // Universal: web
        zone8: { color: '#00FF10' }, // Universal: wrist
        zone9: { color: '#AF00FF' }, // Universal: wristStrap
        zone10: { color: '#FFEF00' }, // Universal: padHood
        zone11: { color: '#FF0000' }, // Universal: thumbOuter
        zone12: { color: '#FF00BF' }, // Universal: pinkyInner
        zone13: { color: '#FF6000' }, // Universal: pinkyOuter
        zone14: { color: '#FF00EF' }, // Universal: palm
        zone15: { color: '#AFFF00' }, // Universal: liner
        zone16: { color: '#0070FF' }, // Universal: binding
        zone17: { color: '#FF8F00' }, // Universal: welting
        zone18: { color: '#5000FF' }, // Universal: lace
        zone19: { color: '#FF0030' }, // Universal: stitching
        zone20: { color: '#00FF70' }, // Universal: wristLogo
        zone21: { color: '#FF008F' }, // Universal: wristLogoOutline
        zone22: { color: '#0010FF' }, // Universal: fingerLogo
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
// --- NEW "TRANSLATOR" CONFIGURATION OBJECT (Step 4) ---
// ===================================================================
export const GLOVE_PARTS_CONFIG: {
    universal: { [key: string]: PartConfig & { materialTarget: string } };
    shellSpecific: { [shellName: string]: { [key in ZoneKey]?: PartConfig } };
} = {
    universal: {
        [ZONES.WEB]:                { shaderIndex: 30, displayName: 'Web', materialTarget: 'web' },
        [ZONES.WRIST]:              { shaderIndex: 26, displayName: 'Wrist', materialTarget: 'shell' },
        [ZONES.WRIST_STRAP]:        { shaderIndex: 19, displayName: 'Wrist Strap', materialTarget: 'shell' },
        [ZONES.PAD_HOOD]:           { shaderIndex: 20, displayName: 'Pad/Hood', materialTarget: 'shell' },
        [ZONES.THUMB_OUTER]:        { shaderIndex: 0, displayName: 'Outer Thumb', materialTarget: 'shell' },
        [ZONES.PINKY_INNER]:        { shaderIndex: 7, displayName: 'Inner Pinky', materialTarget: 'shell' },
        [ZONES.PINKY_OUTER]:        { shaderIndex: 8, displayName: 'Outer Pinky', materialTarget: 'shell' },
        [ZONES.PALM]:               { shaderIndex: 27, displayName: 'Palm', materialTarget: 'shell' },
        [ZONES.LINER]:              { shaderIndex: 28, displayName: 'Liner', materialTarget: 'shell' },
        [ZONES.BINDING]:            { shaderIndex: 25, displayName: 'Binding', materialTarget: 'shell' },
        [ZONES.WELTING]:            { shaderIndex: 24, displayName: 'Welting', materialTarget: 'shell' },
        [ZONES.LACE]:               { shaderIndex: 29, displayName: 'Lace', materialTarget: 'both' },
        [ZONES.STITCHING]:          { shaderIndex: 31, displayName: 'Stitching', materialTarget: 'both' },
        [ZONES.WRIST_LOGO]:         { shaderIndex: 22, displayName: 'Wrist Logo', materialTarget: 'shell' },
        [ZONES.WRIST_LOGO_OUTLINE]: { shaderIndex: 23, displayName: 'Wrist Logo Outline', materialTarget: 'shell' },
        [ZONES.FINGER_LOGO]:        { shaderIndex: 21, displayName: 'Finger Logo', materialTarget: 'shell' },
    },
    shellSpecific: {
        openBack: {
            [ZONES.THUMB_INNER]:    { shaderIndex: 1, displayName: 'Inner Thumb' },
            [ZONES.INDEX]:          { shaderIndex: 2, displayName: 'Index Finger' },
            [ZONES.MIDDLE_INNER]:   { shaderIndex: 3, displayName: 'Inner Middle' },
            [ZONES.MIDDLE_OUTER]:   { shaderIndex: 4, displayName: 'Outer Middle' },
            [ZONES.RING_INNER]:     { shaderIndex: 5, displayName: 'Inner Ring' },
            [ZONES.RING_OUTER]:     { shaderIndex: 6, displayName: 'Outer Ring' },
        },
        closeBack: {
            [ZONES.THUMB_INNER]:    { shaderIndex: 1, displayName: 'Primary U-Piece' },
            [ZONES.MIDDLE_OUTER]:   { shaderIndex: 4, displayName: 'Middle Outer/Ring Inner' },
            [ZONES.RING_OUTER]:     { shaderIndex: 6, displayName: 'Ring Outer/Pinky Inner' },
        },
        firstBase: {
            [ZONES.THUMB_INNER]:    { shaderIndex: 1, displayName: 'Primary U-Piece' },
            [ZONES.INDEX]:          { shaderIndex: 2, displayName: 'Shell Back' },
        },
        catchers: {
            [ZONES.INDEX]:          { shaderIndex: 2, displayName: 'Shell Back' },
            [ZONES.MIDDLE_INNER]:   { shaderIndex: 3, displayName: 'Shell Base' },
            [ZONES.MIDDLE_OUTER]:   { shaderIndex: 4, displayName: 'Rails' },
        }
    }
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