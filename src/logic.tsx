import { useEffect, createContext, useContext } from 'react';
import { Color3 } from '@babylonjs/core';
import { useGloveConfigurator } from './ui';
import { SceneManager } from './viewer';

// --- NEW CORE TYPES (from Step 1) ---
export type HexColor = string;
export type ZoneKey = `zone${number}`; // e.g., 'zone1', 'zone2', etc.

// --- MODIFIED PER PLAN ---
export const COLOR_NAMES = ['Red', 'Pink', 'Purple', 'Indigo', 'Royal', 'Blue', 'Light Blue', 'Teal', 'Green', 'Forest', 'Lime', 'Olive', 'Gold', 'Orange', 'Burnt Orange', 'Red Orange', 'Brown', 'Charcoal', 'Grey', 'Slate'] as const;
export type ColorName = typeof COLOR_NAMES[number];

export const colorSwatches: { name: ColorName, hex: HexColor }[] = [
    { name: 'Red', hex: '#C62828' }, { name: 'Pink', hex: '#AD1457' }, { name: 'Purple', hex: '#6A1B9A' }, { name: 'Indigo', hex: '#4527A0' }, { name: 'Royal', hex: '#283593' }, { name: 'Blue', hex: '#1565C0' }, { name: 'Light Blue', hex: '#0277BD' }, { name: 'Teal', hex: '#00838F' }, { name: 'Green', hex: '#00695C' }, { name: 'Forest', hex: '#2E7D32' }, { name: 'Lime', hex: '#558B2F' }, { name: 'Olive', hex: '#9E9D24' }, { name: 'Gold', hex: '#F9A825' }, { name: 'Orange', hex: '#FF8F00' }, { name: 'Burnt Orange', hex: '#EF6C00' }, { name: 'Red Orange', hex: '#D84315' }, { name: 'Brown', hex: '#4E342E' }, { name: 'Charcoal', hex: '#424242' }, { name: 'Grey', hex: '#BDBDBD' }, { name: 'Slate', hex: '#37474F' },
];

export interface SingleColorState {
  colorName: ColorName;
}
// --- END MODIFICATION ---

export interface PartConfig {
  shaderIndex: number;
  displayName: string;
}

// --- NEW, CORRECTED CORE TYPES TO ACHIEVE TYPE SAFETY ---
export type Font = 'SCRIPT' | 'BLOCK';

// --- MODIFIED PER PLAN ---
export interface TextPart {
    type: 'text';
    text: string;
    font: Font;
    colorName: ColorName;
}
// --- END MODIFICATION ---

export interface BuildConfig {
    imageSelection: 'imgOpt1' | 'imgOpt2';
    position: 'INFIELD' | 'OUTFIELD' | 'PITCHER' | 'CATCHER' | 'FIRST BASE';
    size: '11"' | '11.25"' | '11.5"' | '11.75"' | '12"';
    handOpeningSize: 'ADULT' | 'YOUTH';
    stiffness: 'STIFF' | 'STANDARD' | 'SOFT';
    throwingHand: 'RIGHT HAND' | 'LEFT HAND';
    backStyle: 'OPEN' | 'CLOSE';
    webType: string;
}

export type GloveConfiguration = {
    build: BuildConfig;
    thumbName: TextPart;
    pinkyName: TextPart;
} & Record<ZoneKey, SingleColorState>;

export interface AppState {
    configuration: GloveConfiguration;
    isLoading: boolean;
    lastActivatedPartType: 'inner' | 'outer' | 'single' | null;
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

// --- NEW BUSINESS LOGIC FOR UX RULES ---
const THREAD_BASED_ZONES = new Set<ZoneKey>([
    ZONES.STITCHING,
    ZONES.WRIST_LOGO,
    ZONES.WRIST_LOGO_OUTLINE,
    ZONES.FINGER_LOGO,
]);

export const isApplyToAllEligible = (zoneKey: ZoneKey): boolean => {
    return !THREAD_BASED_ZONES.has(zoneKey);
};
// --- END NEW BUSINESS LOGIC ---


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

// --- MODIFIED PER PLAN ---
// Create the Lookup Mechanism
const colorMap = new Map(colorSwatches.map(swatch => [swatch.name, swatch.hex]));
export const getHexByName = (name: ColorName): HexColor => colorMap.get(name) || '#FFFFFF'; // Default to white
// --- END MODIFICATION ---

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

// --- MODIFIED PER PLAN ---
export const initialState: AppState = {
    configuration: {
        build: { imageSelection: 'imgOpt1', position: 'INFIELD', size: '11"', handOpeningSize: 'ADULT', stiffness: 'STANDARD', throwingHand: 'RIGHT HAND', backStyle: 'OPEN', webType: 'MOD_TRAP' },

        thumbName: { type: 'text', text: 'Thumb', font: 'SCRIPT', colorName: 'Grey' },
        pinkyName: { type: 'text', text: 'Pinky', font: 'BLOCK', colorName: 'Slate' }, // Assuming white is not in the palette, using a valid name

        // A cohesive, valid initial state using only available color names
        [ZONES.THUMB_INNER]:    { colorName: 'Red' },
        [ZONES.INDEX]:          { colorName: 'Blue' },
        [ZONES.MIDDLE_INNER]:   { colorName: 'Forest' },
        [ZONES.MIDDLE_OUTER]:   { colorName: 'Red' },
        [ZONES.RING_INNER]:     { colorName: 'Gold' },
        [ZONES.RING_OUTER]:     { colorName: 'Purple' },
        [ZONES.WEB]:            { colorName: 'Red' },
        [ZONES.WRIST]:          { colorName: 'Slate' },
        [ZONES.WRIST_STRAP]:    { colorName: 'Slate' },
        [ZONES.PAD_HOOD]:       { colorName: 'Brown' },
        [ZONES.THUMB_OUTER]:    { colorName: 'Forest' },
        [ZONES.PINKY_INNER]:    { colorName: 'Purple' },
        [ZONES.PINKY_OUTER]:    { colorName: 'Gold' },
        [ZONES.PALM]:           { colorName: 'Brown' },
        [ZONES.LINER]:          { colorName: 'Charcoal' },
        [ZONES.BINDING]:        { colorName: 'Brown' },
        [ZONES.WELTING]:        { colorName: 'Brown' },
        [ZONES.LACE]:           { colorName: 'Brown' },
        [ZONES.STITCHING]:      { colorName: 'Gold' },
        [ZONES.WRIST_LOGO]:     { colorName: 'Gold' },
        [ZONES.WRIST_LOGO_OUTLINE]: { colorName: 'Slate' },
        [ZONES.FINGER_LOGO]:    { colorName: 'Gold' },
    },
    isLoading: false,
    lastActivatedPartType: null,
};
// --- END MODIFICATION ---


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
// --- REFACTORED LOGIC CONTROLLER (Step 7) ---
// ===================================================================
export const GloveLogicController = () => {
    const { state } = useGloveConfigurator();
    const sceneManager = useContext(SceneContext);

    useEffect(() => {
        const updateSceneAsync = async () => {
            if (!sceneManager || !sceneManager.isReady()) {
                return;
            }

            try {
                const { configuration } = state;
                const activeShell = getModelNameForBuild(configuration.build);

                // Update 3D models for shell and web
                await sceneManager.updateBuild(activeShell);

                const compatibleWebsForShell = GLOVE_TO_WEBS_MAP[activeShell as keyof typeof GLOVE_TO_WEBS_MAP];
                const webModelFilename = compatibleWebsForShell?.[configuration.build.webType as keyof typeof compatibleWebsForShell];

                if (webModelFilename) {
                    await sceneManager.updateWeb(webModelFilename);
                } else {
                    await sceneManager.updateWeb(''); // Hide web if not compatible
                }

                // --- MODIFIED PER PLAN ---
                // Loop 1: Universal Parts
                for (const [zoneKey, config] of Object.entries(GLOVE_PARTS_CONFIG.universal)) {
                    const colorState = configuration[zoneKey as ZoneKey];
                    if (!colorState || !config) continue;

                    const hexColor = getHexByName(colorState.colorName);
                    const color3 = Color3.FromHexString(hexColor);

                    if (config.materialTarget === 'shell' || config.materialTarget === 'both') {
                        sceneManager.updateShellColor(config.shaderIndex, color3);
                    }
                    if (config.materialTarget === 'web' || config.materialTarget === 'both') {
                        sceneManager.updateWebColor(config.shaderIndex, color3);
                    }
                }

                // Loop 2: Shell-Specific Parts
                const shellParts = GLOVE_PARTS_CONFIG.shellSpecific[activeShell];
                if (shellParts) {
                    for (const [zoneKey, config] of Object.entries(shellParts)) {
                        const colorState = configuration[zoneKey as ZoneKey];
                        if (!colorState || !config) continue;

                        const hexColor = getHexByName(colorState.colorName);
                        const color3 = Color3.FromHexString(hexColor);
                        sceneManager.updateShellColor(config.shaderIndex, color3);
                    }
                }

                // Text updates also need to use the lookup.
                sceneManager.updateText({
                    zone: 'thumbName',
                    text: configuration.thumbName.text,
                    font: configuration.thumbName.font,
                    color: getHexByName(configuration.thumbName.colorName),
                });

                sceneManager.updateText({
                    zone: 'pinkyName',
                    text: configuration.pinkyName.text,
                    font: configuration.pinkyName.font,
                    color: getHexByName(configuration.pinkyName.colorName),
                });
                // --- END MODIFICATION ---

            } catch (error) {
                console.error("Failed to update scene:", error);
            }
        };

        updateSceneAsync();

    }, [state, sceneManager]);

    return null;
};