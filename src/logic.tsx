import { useEffect, createContext, useContext } from 'react';
// Removed Color3 import as it's no longer needed here after the change
import { useGloveConfigurator } from './ui';
import { SceneManager } from './viewer';
import * as fflate from 'fflate';

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

// ===================================================================
// --- SERIALIZATION LAYER REPLACEMENT ---
// ===================================================================

// The dictionary of long keys to short keys for the URL
export const URL_KEY_MAP: { [key in ZoneKey | keyof Omit<GloveConfiguration, ZoneKey> | keyof BuildConfig]?: string } = {
    // Top-level
    thumbName: 'tn',
    pinkyName: 'pn',
    // BuildConfig
    imageSelection: 'is',
    position: 'po',
    size: 'sz',
    handOpeningSize: 'ho',
    stiffness: 'sf',
    throwingHand: 'th',
    backStyle: 'bs',
    webType: 'wt',
    // Zones (dynamically generated: zone1 -> z1, etc.)
    ...Object.fromEntries(Object.values(ZONES).map(zone => [zone, zone.replace('zone', 'z')]))
};

// A reverse map for deserializing, created automatically to stay in sync
const REVERSE_URL_KEY_MAP: { [key: string]: string } = Object.fromEntries(
    Object.entries(URL_KEY_MAP).map(([key, value]) => [value as string, key])
);

// Helper to encode text to a URL-safe Base64 string
const encodeText = (text: string): string => {
    // btoa can have issues with unicode, this is a robust way to handle it.
    const utf8Bytes = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    // Make it URL-safe: replace +, /, = which are not URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Helper to decode text from a URL-safe Base64 string
const decodeText = (encoded: string): string => {
    try {
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '=' until length is a multiple of 4
        while (base64.length % 4) {
            base64 += '=';
        }
        const binaryString = atob(base64);
        const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        // If decoding fails (e.g., old link or malformed), return the original string
        return encoded;
    }
};

export const serialize = (config: GloveConfiguration): string => {
    const pairs: string[] = [];

    // 1. Serialize Build Configuration
    for (const [key, value] of Object.entries(config.build)) {
        const shortKey = URL_KEY_MAP[key as keyof typeof URL_KEY_MAP];
        if (shortKey) {
            pairs.push(`${shortKey}-${value}`);
        }
    }

    // 2. Serialize Text Parts (hyper-compact format: key-text~font~color)
    const { thumbName, pinkyName } = config;
    const encodedThumbText = encodeText(thumbName.text);
    pairs.push(`${URL_KEY_MAP.thumbName}-${encodedThumbText}~${thumbName.font}~${thumbName.colorId}`);

    const encodedPinkyText = encodeText(pinkyName.text);
    pairs.push(`${URL_KEY_MAP.pinkyName}-${encodedPinkyText}~${pinkyName.font}~${pinkyName.colorId}`);

    // 3. Serialize Zone Colors
    for (const key in config) {
        if (key.startsWith('zone')) {
            const zoneKey = key as ZoneKey;
            const shortKey = URL_KEY_MAP[zoneKey];
            if (shortKey) {
                pairs.push(`${shortKey}-${config[zoneKey].colorId}`);
            }
        }
    }

    return pairs.join('_');
};

export const deserialize = (encodedString: string): GloveConfiguration => {
    // Start with a deep copy of the default state to ensure a valid object
    const config = JSON.parse(JSON.stringify(initialState.configuration));
    const pairs = encodedString.split('_');

    for (const pair of pairs) {
        const separatorIndex = pair.indexOf('-');
        if (separatorIndex === -1) continue; // Skip malformed pairs

        const key = pair.substring(0, separatorIndex);
        const value = pair.substring(separatorIndex + 1);

        const longKey = REVERSE_URL_KEY_MAP[key];
        if (!longKey) continue;

        // Handle Text Parts (hyper-compact format)
        if (longKey === 'thumbName' || longKey === 'pinkyName') {
            const [text, font, colorId] = value.split('~');
            if (text !== undefined) config[longKey].text = decodeText(text);
            if (font !== undefined) config[longKey].font = font as Font;
            if (colorId !== undefined) config[longKey].colorId = colorId as ColorId;
            continue;
        }

        // Handle Zone Colors
        if (longKey.startsWith('zone')) {
            config[longKey as ZoneKey] = { colorId: value as ColorId };
        }
        // Handle Build Config
        else if (longKey in config.build) {
            // @ts-ignore - This is safe due to the check above
            config.build[longKey] = value;
        }
    }

    return config;
};

// --- MODIFIED PER PLAN ---
// Create the Lookup Mechanism
export const colorLookupMap = new Map(COLOR_OPTIONS.map(option => [option.id, option]));
export const getHexById = (id: ColorId): HexColor => colorLookupMap.get(id)?.hex || '#FFFFFF'; // Default to white
// --- END MODIFICATION ---

// --- URL LOGIC (MODIFIED TO USE NEW SERIALIZER) ---

const CONFIG_VERSION = 'v1';

/**
 * Creates a versioned, shareable URL from the app state using the new custom string format.
 */
export const generateShareableURL = (config: GloveConfiguration): string => {
  const serializedString = serialize(config);

  const stringAsBytes = fflate.strToU8(serializedString);
  const compressed = fflate.deflateSync(stringAsBytes);
  const processedData = btoa(fflate.strFromU8(compressed, true))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const versionedPayload = `${CONFIG_VERSION}:${processedData}`;
  const baseURL = window.location.origin + window.location.pathname;
  return `${baseURL}?config=${versionedPayload}`;
};

// --- MODIFICATION: Define new return type ---
export type LoadStatus = 'success' | 'failed' | 'empty';

export interface LoadResult {
    configuration: GloveConfiguration;
    variantId?: string | null; // ✅ NEW: Carry variant hint from URL
    status: LoadStatus;
}
// --- END MODIFICATION ---

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

// --- MODIFICATION: Update function signature and return statements ---
export const loadConfigurationFromURL = (): LoadResult => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const versionedPayload = urlParams.get('config');

    // --- NEW: Step 5 logic (Entry Context) ---
    if (!versionedPayload) {
      const entryFamily  = urlParams.get('entry_family');
      const entryVariant = urlParams.get('entry_variant');

      // If no entry_* at all, behave like before
      if (!entryFamily && !entryVariant) {
        return { configuration: initialState.configuration, status: 'empty' };
      }

      const config = cloneInitialConfig();

      if (entryFamily) {
        config.build.position = mapEntryFamilyToPosition(entryFamily);

        // Apply defaults based on family
        if (config.build.position === 'out' || config.build.position === 'pit') {
          config.build.backStyle = 'opn';
        }
        // Add other defaults as needed...
      }

      return { 
          configuration: config, 
          variantId: entryVariant || null, // ✅ Pass this back!
          status: 'success' 
      };
    }
    // --- END NEW BRANCH ---

    const [version, data] = versionedPayload.split(':', 2);

    if (version !== CONFIG_VERSION) {
      throw new Error(`Unsupported config version: ${version}`);
    }

    if (!data) {
        throw new Error('No data in payload');
    }

    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const compressed = fflate.strToU8(atob(base64), true);
    const serializedString = fflate.strFromU8(fflate.inflateSync(compressed));

    if (!serializedString) {
      throw new Error('Processing failed');
    }

    // Success!
    return { configuration: deserialize(serializedString), status: 'success' };

  } catch (error) {
    console.warn('Could not load config from URL. Using default.', error);
    return { configuration: initialState.configuration, status: 'failed' };
  }
};
// --- END MODIFICATION ---

// --- MODIFIED PER PLAN: GLOVE_TO_WEBS_MAP uses new webtype IDs as keys ---
export const GLOVE_TO_WEBS_MAP = {
    openBack: { bsk: 'basketOB', bsl: 'basketLaceOB', clv: 'closedVOB', dhn: 'dualHingeOB', fmt: 'framedModTrapOB', hwb: 'hOB', iwb: 'iOB', lch: 'lacedHOB', lcs: 'laceSealingOB', mtp: 'modTrapOB', '1pc': 'onePieceOB', slg: 'sealingOB', sp: 'singlePostOB', spl: 'singlePostLaceOB', trp: 'trapOB', '2pc': 'twoPieceOB', },
    closeBack: { bsk: 'basketCB', clv: 'closedVCB', dhn: 'dualHingeCB', fmt: 'framedModTrapCB', hwb: 'hCB', lch: 'lacedHCB', lcs: 'laceSealingCB', mtp: 'modTrapCB', '1pc': 'onePieceCB', slg: 'sealingCB', trp: 'trapCB', },
    firstBase: { pst: 'postFB', '2pc': 'twoPieceFB', },
    catchers: { '2pc': 'twoPieceCM', }
};
// --- END MODIFICATION ---

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
// --- END MODIFICATION ---


export const getModelNameForBuild = (buildConfig: BuildConfig): string => {
    switch (buildConfig.position) {
        case 'inf': return 'openBack';
        case 'out': case 'pit': return buildConfig.backStyle === 'cls' ? 'closeBack' : 'openBack';
        case 'cat': return 'catchers';
        case 'fb': return 'firstBase';
        default: return 'openBack';
    }
};

// Variant mapping infrastructure (to be implemented later)
export type VariantKey = string; // e.g. 'openBack|3300|adt|std|rh|imgOpt2|cls|mtp'
// export const VARIANT_MAP: Record<VariantKey, string> = {};

export const resolveVariantId = (build: BuildConfig): string | null => {
    // TODO (later step): look up in variants-map.json or API
    // For now, return null as a safe placeholder.
    return null;
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
        [ZONES.WEB]:                { shaderIndex: 30, displayName: 'Web', materialTarget: 'web' }, // Note: shaderIndex 30 might be out of 0-31 range? Check base colors.
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

                    // --- START OF SUGGESTION A: Use palette index ---
                    const paletteIndex = getPaletteIndexById(colorState.colorId);
                    if (config.materialTarget === 'shell' || config.materialTarget === 'both') {
                        sceneManager.updateShellZonePointer(config.shaderIndex, paletteIndex);
                    }
                    if (config.materialTarget === 'web' || config.materialTarget === 'both') {
                        sceneManager.updateWebZonePointer(config.shaderIndex, paletteIndex);
                    }
                    // --- END OF SUGGESTION A ---
                }

                // Loop 2: Shell-Specific Parts
                const shellParts = GLOVE_PARTS_CONFIG.shellSpecific[activeShell];
                if (shellParts) {
                    for (const [zoneKey, config] of Object.entries(shellParts)) {
                        const colorState = configuration[zoneKey as ZoneKey];
                        if (!colorState || !config) continue;

                        // --- START OF SUGGESTION A: Use palette index ---
                        const paletteIndex = getPaletteIndexById(colorState.colorId);
                        sceneManager.updateShellZonePointer(config.shaderIndex, paletteIndex);
                        // --- END OF SUGGESTION A ---
                    }
                }

                // Text updates also need to use the lookup.
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
                // --- END MODIFICATION ---

            } catch (error) {
                console.error("Failed to update scene:", error);
            }
        };

        updateSceneAsync();

    }, [state, sceneManager]);

    return null;
};
