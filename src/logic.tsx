import { useEffect, createContext, useContext } from 'react';
import { Color3 } from '@babylonjs/core';
import { useGloveConfigurator, GloveConfiguration, AppState, HexColor, ColorablePart, Font, WebPart } from './ui';
import { SceneManager } from './viewer';

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
    { id: 'MOD_TRAP', title: 'MOD TRAP' }, { id: 'ONE_PIECE', title: 'ONE PIECE' }, { id: 'TWO_PIECE', title: 'TWO PIECE' }, { id: 'DUAL_HINGE', title: 'DUAL HINGE' }, { id: 'FRAMED_MOD_TRAP', title: 'FRAMED MOD TRAP' }, { id: 'CLOSED_V', title: 'CLOSED V' }, { id: 'BASKET', title: 'BASKET' }, { id: 'BASKET_LACE', title: 'BASKET LACE' }, { id: 'SEALING', title: 'SEALING' }, { id: 'LACE_SEALING', title: 'LACE SEALING' }
];

// --- DEFAULT BLUEPRINT ---

export const initialState: AppState = {
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

// --- DATA TRANSFORMATION LOGIC ---

interface GetColorDisplayOptions {
    format?: (typeof FORMAT_TYPES)[keyof typeof FORMAT_TYPES];
}

export const getColorDisplay = (colorValue: ColorablePart | HexColor, options: GetColorDisplayOptions = {}): string => {
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

export const getActiveColor = (
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


// --- WIRING AND CONTROLLER LOGIC ---

export const SceneContext = createContext<SceneManager | null>(null);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) {
        throw new Error('useScene must be used within a SceneProvider');
    }
    return context;
};

const PART_TO_SHADER_INDEX_MAP = {
    thumb_inner: 0,
    thumb_outer: 1,
    index: 2,
    middle_inner: 3,
    middle_outer: 4,
    ring_inner: 5,
    ring_outer: 6,
    pinky_inner: 7,
    pinky_outer: 8,
    web: 9,
};

export const GloveLogicController = () => {
    const { state } = useGloveConfigurator();
    const sceneManager = useContext(SceneContext);

    useEffect(() => {
        if (!sceneManager || !sceneManager.isReady()) {
            return;
        }

        const { configuration } = state;

        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.thumb_inner, Color3.FromHexString(configuration.thumb.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.thumb_outer, Color3.FromHexString(configuration.thumb.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.index, Color3.FromHexString(configuration.index.color));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.middle_inner, Color3.FromHexString(configuration.middle.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.middle_outer, Color3.FromHexString(configuration.middle.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.ring_inner, Color3.FromHexString(configuration.ring.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.ring_outer, Color3.FromHexString(configuration.ring.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.pinky_inner, Color3.FromHexString(configuration.pinky.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.pinky_outer, Color3.FromHexString(configuration.pinky.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.web, Color3.FromHexString(configuration.web.color));

        sceneManager.updateBuild(configuration.build);

    }, [state, state.configuration, sceneManager]);

    return null;
};
