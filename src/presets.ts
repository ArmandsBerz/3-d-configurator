// --- NEW CORE TYPES (from Step 1) ---
export type HexColor = string;
export type ZoneKey = `zone${number}`; // e.g., 'zone1', 'zone2', etc.

// --- MODIFIED PER PLAN ---
export const COLOR_OPTIONS = [
    { id: 'rd', name: 'Red', hex: '#C62828' }, { id: 'pk', name: 'Pink', hex: '#AD1457' }, { id: 'pu', name: 'Purple', hex: '#6A1B9A' }, { id: 'in', name: 'Indigo', hex: '#4527A0' }, { id: 'ry', name: 'Royal', hex: '#283593' }, { id: 'bl', name: 'Blue', hex: '#1565C0' }, { id: 'lb', name: 'Light Blue', hex: '#0277BD' }, { id: 'tl', name: 'Teal', hex: '#00838F' }, { id: 'gn', name: 'Green', hex: '#00695C' }, { id: 'fr', name: 'Forest', hex: '#2E7D32' }, { id: 'lm', name: 'Lime', hex: '#558B2F' }, { id: 'ol', name: 'Olive', hex: '#9E9D24' }, { id: 'gd', name: 'Gold', hex: '#F9A825' }, { id: 'or', name: 'Orange', hex: '#FF8F00' }, { id: 'bo', name: 'Burnt Orange', hex: '#EF6C00' }, { id: 'ro', name: 'Red Orange', hex: '#D84315' }, { id: 'br', name: 'Brown', hex: '#4E342E' }, { id: 'ch', name: 'Charcoal', hex: '#424242' }, { id: 'gy', name: 'Grey', hex: '#BDBDBD' }, { id: 'sl', name: 'Slate', hex: '#37474F' },
] as const;
export type ColorId = typeof COLOR_OPTIONS[number]['id'];

// --- START OF SUGGESTION A: Add id -> index lookup ---
export const colorIndexById = new Map<ColorId, number>(
  COLOR_OPTIONS.map((opt, idx) => [opt.id, idx])
);
export const getPaletteIndexById = (id: ColorId): number =>
  colorIndexById.get(id) ?? 0; // Default to index 0 (Red) if ID not found
// --- END OF SUGGESTION A ---


export interface SingleColorState {
  colorId: ColorId;
}
// --- END MODIFICATION ---

export interface PartConfig {
  shaderIndex: number; // This remains the ZONE index (0-31)
  displayName: string;
}

// --- START OF PHASE 1.1 & 1.2 ---
export const FONT_REGISTRY = [
  {
    id: 'LOBSTER',        // <- internal Font id
    label: 'Lobster',     // <- what the dropdown shows
    baseName: 'lobsterType',
    targetLineFactor: 0.51,
  },
  {
    id: 'ROBOTO',
    label: 'Roboto',
    baseName: 'robotoType',
    targetLineFactor: 0.51,
  },
  // Add more fonts here later...
] as const;

export type Font = (typeof FONT_REGISTRY)[number]['id'];
// --- END OF PHASE 1.1 & 1.2 ---

// --- MODIFIED PER PLAN ---
export interface TextPart {
    type: 'text';
    text: string;
    font: Font;
    colorId: ColorId;
}
// --- END MODIFICATION ---

// --- MODIFIED PER PLAN: DEFINE ID TYPES FIRST ---
// This requires moving buildOptionsData and webTypeOptions up before BuildConfig
export const buildOptionsData = [
    { id: 'position', title: 'Position', options: [{id: 'inf', label: 'INFIELD'}, {id: 'out', label: 'OUTFIELD'}, {id: 'pit', label: 'PITCHER'}, {id: 'cat', label: 'CATCHER'}, {id: 'fb', label: 'FIRST BASE'}], layout: 'grid-cols-3' },
    { id: 'size', title: 'Size', options: [{id: '1100', label: '11"'}, {id: '1125', label: '11.25"'}, {id: '1150', label: '11.5"'}, {id: '1175', label: '11.75"'}, {id: '1200', label: '12"'}], layout: 'grid-cols-3' },
    { id: 'handOpeningSize', title: 'Hand Opening Size', options: [{id: 'adt', label: 'ADULT'}, {id: 'yth', label: 'YOUTH'}], layout: 'grid-cols-2' },
    { id: 'stiffness', title: 'Stiffness', options: [{id: 'stf', label: 'STIFF'}, {id: 'std', label: 'STANDARD'}, {id: 'sft', label: 'SOFT'}], layout: 'grid-cols-3' },
    { id: 'throwingHand', title: 'Throwing Hand', options: [{id: 'rh', label: 'RIGHT HAND'}, {id: 'lh', label: 'LEFT HAND'}], layout: 'grid-cols-2' }
];

export const webTypeOptions = [
    { id: 'bsk', title: 'Basket' }, { id: 'bsl', title: 'Basket Lace' }, { id: 'clv', title: 'Closed V' }, { id: 'dhn', title: 'Dual Hinge' }, { id: 'fmt', title: 'Framed Mod Trap' }, { id: 'hwb', title: 'H-Web' }, { id: 'iwb', title: 'I-Web' }, { id: 'lch', title: 'Laced H-Web' }, { id: 'lcs', title: 'Lace Sealing' }, { id: 'mtp', title: 'Mod Trap' }, { id: '1pc', title: 'One Piece' }, { id: 'pst', title: 'Post' }, { id: 'slg', title: 'Sealing' }, { id: 'sp', title: 'Single Post' }, { id: 'spl', title: 'Single Post Lace' }, { id: 'trp', title: 'Trap' }, { id: '2pc', title: 'Two Piece' },
];

// Helper types derived from the data constants
export type BuildPositionId = typeof buildOptionsData[0]['options'][number]['id'];
export type BuildSizeId = typeof buildOptionsData[1]['options'][number]['id'];
export type BuildHandId = typeof buildOptionsData[2]['options'][number]['id'];
export type BuildStiffnessId = typeof buildOptionsData[3]['options'][number]['id'];
export type BuildThrowingId = typeof buildOptionsData[4]['options'][number]['id'];
export type BuildBackId = 'opn' | 'cls';
export type WebTypeId = typeof webTypeOptions[number]['id'];

export interface BuildConfig {
    imageSelection: 'imgOpt1' | 'imgOpt2';
    position: BuildPositionId;
    size: BuildSizeId;
    handOpeningSize: BuildHandId;
    stiffness: BuildStiffnessId;
    throwingHand: BuildThrowingId;
    backStyle: BuildBackId;
    webType: WebTypeId;
}
// --- END MODIFICATION ---

export type GloveConfiguration = {
    build: BuildConfig;
    thumbName: TextPart;
    pinkyName: TextPart;
} & Record<ZoneKey, SingleColorState>;

// --- NEW: Commerce state for Shopify integration ---
export interface CommerceState {
    variantId: string | null;
    quantity: number;
}

export interface AppState {
    configuration: GloveConfiguration;
    commerce: CommerceState; // 👈 new
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

// --- START OF PHASE 1.2 ---
export const fontOptions = FONT_REGISTRY.map(font => ({
  id: font.id,      // 'LOBSTER' | 'ROBOTO' | ...
  label: font.label // 'Lobster', 'Roboto', ...
}));
// --- END OF PHASE 1.2 ---

/**
 * Safely decodes the URL from the browser's address bar.
 * If the URL is missing, invalid, or corrupted, it returns the default state
 * along with a status indicating why.
 */

// Helper: deep clone initial config (to avoid mutating initialState)
const cloneInitialConfig = (): GloveConfiguration =>
    JSON.parse(JSON.stringify(initialState.configuration));

const mapEntryFamilyToPosition = (entryFamily: string): BuildConfig['position'] => {
    // TODO: adapt this mapping to your real product.type handles
    switch (entryFamily) {
        case 'infield':
        case 'infielder':
            return 'inf';
        case 'outfield':
        case 'outfielder':
            return 'out';
        case 'pitcher':
            return 'pit';
        case 'catcher':
            return 'cat';
        case 'first-base':
        case 'first-baseman':
            return 'fb';
        default:
            return initialState.configuration.build.position;
    }
};

// --- MODIFIED PER PLAN ---
export const initialState: AppState = {
    configuration: {
        build: { imageSelection: 'imgOpt1', position: 'inf', size: '1100', handOpeningSize: 'adt', stiffness: 'std', throwingHand: 'rh', backStyle: 'opn', webType: 'mtp' },

        // --- START OF PHASE 1.3 ---
        thumbName: { type: 'text', text: 'Thumb', font: 'LOBSTER', colorId: 'gy' },
        pinkyName: { type: 'text', text: 'Pinky', font: 'ROBOTO', colorId: 'sl' },
        // --- END OF PHASE 1.3 ---

        [ZONES.THUMB_INNER]:    { colorId: 'rd' },
        [ZONES.INDEX]:          { colorId: 'bl' },
        [ZONES.MIDDLE_INNER]:   { colorId: 'fr' },
        [ZONES.MIDDLE_OUTER]:   { colorId: 'rd' },
        [ZONES.RING_INNER]:     { colorId: 'gd' },
        [ZONES.RING_OUTER]:     { colorId: 'pu' },
        [ZONES.WEB]:            { colorId: 'rd' },
        [ZONES.WRIST]:          { colorId: 'sl' },
        [ZONES.WRIST_STRAP]:    { colorId: 'sl' },
        [ZONES.PAD_HOOD]:       { colorId: 'br' },
        [ZONES.THUMB_OUTER]:    { colorId: 'fr' },
        [ZONES.PINKY_INNER]:    { colorId: 'pu' },
        [ZONES.PINKY_OUTER]:    { colorId: 'gd' },
        [ZONES.PALM]:           { colorId: 'br' },
        [ZONES.LINER]:          { colorId: 'ch' },
        [ZONES.BINDING]:        { colorId: 'br' },
        [ZONES.WELTING]:        { colorId: 'br' },
        [ZONES.LACE]:           { colorId: 'br' },
        [ZONES.STITCHING]:      { colorId: 'gd' },
        [ZONES.WRIST_LOGO]:     { colorId: 'gd' },
        [ZONES.WRIST_LOGO_OUTLINE]: { colorId: 'sl' },
        [ZONES.FINGER_LOGO]:    { colorId: 'gd' },
    },
    commerce: {
        variantId: null, // “doesn’t know yet” at startup
        quantity: 1,     // default 1
    },
    isLoading: false,
    lastActivatedPartType: null,
};
