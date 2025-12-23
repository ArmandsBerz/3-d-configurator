import { createContext, useContext } from 'react';
import { SceneManager } from './viewer';
import * as fflate from 'fflate';

// --- IMPORT THE DATABASE (The "Universe" of the Glove) ---
import {
    ZONES,
    COLOR_OPTIONS,
    buildOptionsData,
    webTypeOptions,
    leatherOptions, // <--- Added this
    fontOptions,    // <--- Added this
    FONT_REGISTRY,  // <--- Added this (for viewer.tsx)
    initialState,
    PRESETS,        // <--- ADDED: Import PRESETS
    PresetId,       // <--- ADDED: Import PresetId
    GLOVE_PARTS_CONFIG,
    GLOVE_TO_WEBS_MAP,
    getModelNameForBuild,
    UI_PRESENTATION_CONFIG, // <--- ADDED: The Data
    // Types
    AppState,
    GloveConfiguration,
    BuildConfig,
    ColorId,
    Font,
    ZoneKey,
    HexColor,
    WebTypeId,
    BuildPositionId,
    BuildSizeId,
    BuildHandId,
    BuildStiffnessId,
    BuildThrowingId,
    BuildBackId,
    TextPart,
    UIPresentationConfig, // <--- The Type
    UIPartGroup,
    UIPartGroupGallery,
    UIPartGroupSingle,
    CommerceState
} from './product-data';

// --- RE-EXPORT EVERYTHING FOR CONSUMERS (UI.TSX, VIEWER.TSX) ---
export type {
    AppState,
    GloveConfiguration,
    BuildConfig,
    ColorId,
    Font,
    ZoneKey,
    HexColor,
    WebTypeId,
    BuildPositionId,
    BuildSizeId,
    BuildHandId,
    BuildStiffnessId,
    BuildThrowingId,
    BuildBackId,
    TextPart,
    UIPresentationConfig,
    UIPartGroup,
    UIPartGroupGallery,
    UIPartGroupSingle,
    CommerceState,
    PresetId // <--- ADDED: Re-export PresetId
};

export {
    ZONES,
    COLOR_OPTIONS,
    buildOptionsData,
    webTypeOptions,
    leatherOptions, // <--- Re-exporting
    fontOptions,    // <--- Re-exporting
    FONT_REGISTRY,  // <--- Re-exporting
    initialState,
    PRESETS,        // <--- ADDED: Re-export PRESETS
    GLOVE_PARTS_CONFIG,
    GLOVE_TO_WEBS_MAP,
    getModelNameForBuild,
    UI_PRESENTATION_CONFIG // <--- ADDED: Exporting to the world
};

// --- HELPER: Index Lookup for 3D Performance ---
export const colorIndexById = new Map<ColorId, number>(
    COLOR_OPTIONS.map((opt, idx) => [opt.id, idx])
);

export const getPaletteIndexById = (id: ColorId): number =>
    colorIndexById.get(id) ?? 0;

// --- HELPER: Hex Lookup for UI/Canvas ---
export const colorLookupMap = new Map(COLOR_OPTIONS.map(option => [option.id, option]));

export const getHexById = (id: ColorId): HexColor =>
    colorLookupMap.get(id)?.hex || '#FFFFFF';

// --- HELPER: Business Logic for UI Rules ---
const THREAD_BASED_ZONES = new Set<ZoneKey>([
    ZONES.STITCHING,
    ZONES.WRIST_LOGO,
    ZONES.WRIST_LOGO_OUTLINE,
    ZONES.FINGER_LOGO,
]);

export const isApplyToAllEligible = (zoneKey: ZoneKey): boolean => {
    return !THREAD_BASED_ZONES.has(zoneKey);
};

// ===================================================================
// --- PRESET HANDLING LOGIC (THE "DELIVERY TRUCK") ---
// ===================================================================

const deepCopy = <T,>(obj: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
};

// Helper to ensure a loaded preset has all necessary fields by merging with default
const fillMissing = (incoming: Partial<GloveConfiguration>): GloveConfiguration => {
    const base = deepCopy(PRESETS.default);
    
    // We do a shallow merge of the top-level keys. 
    // Note: For deep nested objects like 'build', simple spread might overwrite nested defaults if incoming is partial.
    // However, our presets are currently full objects. 
    // To be safer for future partial updates, we can explicitly merge critical subsections if needed.
    
    return {
        ...base,
        ...incoming,
        build: {
            ...base.build,
            ...(incoming.build || {})
        }
    };
};

export const getPresetConfig = (id: PresetId): GloveConfiguration => {
    const rawPreset = PRESETS[id];
    // Safety 1 & 2: Deep Copy + Fill Missing
    return fillMissing(rawPreset);
};

// ===================================================================
// --- SERIALIZATION LAYER (URL HANDLING) ---
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

// A reverse map for deserializing
const REVERSE_URL_KEY_MAP: { [key: string]: string } = Object.fromEntries(
    Object.entries(URL_KEY_MAP).map(([key, value]) => [value as string, key])
);

// Helper to encode text to a URL-safe Base64 string
const encodeText = (text: string): string => {
    const utf8Bytes = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Helper to decode text from a URL-safe Base64 string
const decodeText = (encoded: string): string => {
    try {
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const binaryString = atob(base64);
        const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
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

    // 2. Serialize Text Parts
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
    // USE THE SAFER FILL MISSING LOGIC HERE TOO!
    // Instead of raw JSON.parse of initialState, we use our helper to get a fresh base.
    const config = deepCopy(initialState.configuration); 
    
    const pairs = encodedString.split('_');

    for (const pair of pairs) {
        const separatorIndex = pair.indexOf('-');
        if (separatorIndex === -1) continue;

        const key = pair.substring(0, separatorIndex);
        const value = pair.substring(separatorIndex + 1);

        const longKey = REVERSE_URL_KEY_MAP[key];
        if (!longKey) continue;

        if (longKey === 'thumbName' || longKey === 'pinkyName') {
            const [text, font, colorId] = value.split('~');
            if (text !== undefined) config[longKey].text = decodeText(text);
            if (font !== undefined) config[longKey].font = font as Font;
            if (colorId !== undefined) config[longKey].colorId = colorId as ColorId;
            continue;
        }

        if (longKey.startsWith('zone')) {
            config[longKey as ZoneKey] = { colorId: value as ColorId };
        } else if (longKey in config.build) {
            // @ts-ignore
            config.build[longKey] = value;
        }
    }

    return config;
};

// --- URL LOGIC ---

const CONFIG_VERSION = 'v1';

export type LoadStatus = 'success' | 'failed' | 'empty';

export interface LoadResult {
    configuration: GloveConfiguration;
    variantId?: string | null;
    status: LoadStatus;
}

const cloneInitialConfig = (): GloveConfiguration =>
    deepCopy(initialState.configuration); // Swapped to deepCopy helper

export const loadConfigurationFromURL = (): LoadResult => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const versionedPayload = urlParams.get('config');

        if (!versionedPayload) {
            const entryFamily = urlParams.get('entry_family');
            const entryVariant = urlParams.get('entry_variant');

            if (!entryFamily && !entryVariant) {
                return { configuration: initialState.configuration, status: 'empty' };
            }

            const config = cloneInitialConfig();

            // Note: entry_family Logic removed as per instruction (Translation Layer Deleted)

            return {
                configuration: config,
                variantId: entryVariant || null,
                status: 'success'
            };
        }

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

        return { configuration: deserialize(serializedString), status: 'success' };

    } catch (error) {
        console.warn('Could not load config from URL. Using default.', error);
        return { configuration: initialState.configuration, status: 'failed' };
    }
};

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

export const SceneContext = createContext<SceneManager | null>(null);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) { throw new Error('useScene must be used within a SceneProvider'); }
    return context;
};