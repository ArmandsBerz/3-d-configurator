import { createContext, useContext, useEffect } from 'react';
import { SceneManager } from './viewer';
import * as fflate from 'fflate';
import { useGloveConfigurator } from './ui'; // Importing from UI to access State

// --- IMPORT THE DATABASE (The "Universe" of the Glove) ---
import {
    ZONES,
    COLOR_OPTIONS,
    buildOptionsData,
    webTypeOptions,
    leatherOptions,
    fontOptions,
    FONT_REGISTRY,
    initialState,
    PRESETS,
    PresetId,
    resolveProduct, // <--- The New Router
    ProductDefinition, // <--- The New Schema
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
    UIPartGroup,
    UIPartGroupGallery,
    UIPartGroupSingle,
    CommerceState,
    PresetId
};

export {
    ZONES,
    COLOR_OPTIONS,
    buildOptionsData,
    webTypeOptions,
    leatherOptions,
    fontOptions,
    FONT_REGISTRY,
    initialState,
    PRESETS,
    resolveProduct // Exporting the resolver
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

// ===================================================================
// --- SANITIZATION LOGIC (THE "BOUNCER") ---
// ===================================================================

const deepCopy = <T,>(obj: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
};

export const sanitize = (config: GloveConfiguration): GloveConfiguration => {
    let nextConfig = deepCopy(config);
    let iterations = 0;
    const MAX_ITERATIONS = 3; // Prevent infinite loops

    // 1. RE-RESOLVE LOOP (The "Infield Paradox" Fix)
    // We loop until the definition is stable with the constraints
    while (iterations < MAX_ITERATIONS) {
        const def = resolveProduct(nextConfig.build);
        let changed = false;

        // Constraint: Forced Back Style (e.g., Catcher must be Open)
        if (def.constraints.forcedBackStyle) {
            if (nextConfig.build.backStyle !== def.constraints.forcedBackStyle) {
                nextConfig.build.backStyle = def.constraints.forcedBackStyle;
                changed = true;
            }
        }

        // If constraints changed the build, we must re-resolve the product
        if (!changed) break; 
        iterations++;
    }

    // 2. GET FINAL DEFINITION
    const def = resolveProduct(nextConfig.build);

    // 3. SANITIZE WEB TYPE (Asset Completeness)
    // Ensure the selected web exists in the active product's validWebs list
    if (!def.assets.validWebs[nextConfig.build.webType]) {
        // Fallback to the first valid web in the list
        const validWebKeys = Object.keys(def.assets.validWebs) as WebTypeId[];
        if (validWebKeys.length > 0) {
            nextConfig.build.webType = validWebKeys[0];
        }
    }

    // 4. SANITIZE ZONES (Palette & Existence)
    // Ensure every zone has a valid color. 
    // Note: We don't delete zones that don't exist in the current def (to preserve state across switches),
    // but the UI and Viewer will strictly ignore them based on the definition.
    
    // (Optional: Enforce validPalette here if we restrict palettes per glove in the future)

    return nextConfig;
};

// ===================================================================
// --- PRESET HANDLING LOGIC ---
// ===================================================================

// Helper to ensure a loaded preset has all necessary fields by merging with default
const fillMissing = (incoming: Partial<GloveConfiguration>): GloveConfiguration => {
    const base = deepCopy(PRESETS['open-back']);
    
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
    
    if (!rawPreset) {
        return deepCopy(PRESETS['open-back']);
    }

    // Run sanitize on presets to ensure they are valid for the current schema
    return sanitize(fillMissing(rawPreset));
};

// ===================================================================
// --- LOGIC CONTROLLER (THE "ENGINE") ---
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

// ===================================================================
// --- SERIALIZATION LAYER (URL HANDLING) ---
// ===================================================================

export const URL_KEY_MAP: { [key in ZoneKey | keyof Omit<GloveConfiguration, ZoneKey> | keyof BuildConfig]?: string } = {
    // Top-level
    thumbName: 'tn',
    pinkyName: 'pn',
    // BuildConfig
    palette: 'pa',
    imageSelection: 'is',
    position: 'po',
    size: 'sz',
    handOpeningSize: 'ho',
    stiffness: 'sf',
    throwingHand: 'th',
    backStyle: 'bs',
    webType: 'wt',
    // Zones (dynamically generated)
    ...Object.fromEntries(Object.values(ZONES).map(zone => [zone, zone.replace('zone', 'z')]))
};

const REVERSE_URL_KEY_MAP: { [key: string]: string } = Object.fromEntries(
    Object.entries(URL_KEY_MAP).map(([key, value]) => [value as string, key])
);

const encodeText = (text: string): string => {
    const utf8Bytes = new TextEncoder().encode(text);
    const base64 = btoa(String.fromCharCode(...utf8Bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

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

    return pairs.join('|');
};

export const deserialize = (encodedString: string): GloveConfiguration => {
    const config = deepCopy(initialState.configuration); 
    
    let pairs = encodedString.split('|');
    if (pairs.length === 1 && encodedString.includes('_')) {
        pairs = encodedString.split('_');
    }

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

    // SANITIZE ON LOAD
    return sanitize(config);
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
    deepCopy(initialState.configuration);

export const loadConfigurationFromURL = (): LoadResult => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const versionedPayload = urlParams.get('config');

        // 1. Handle Empty/New Load
        if (!versionedPayload) {
            const entryFamily = urlParams.get('entry_family');
            const entryVariant = urlParams.get('entry_variant');

            if (!entryFamily && !entryVariant) {
                const entryHint = urlParams.get('entry');
                if (entryHint && entryHint in PRESETS) {
                     return { 
                        configuration: getPresetConfig(entryHint as PresetId), 
                        status: 'success' 
                    };
                }
                return { configuration: cloneInitialConfig(), status: 'empty' };
            }
            
            return { configuration: cloneInitialConfig(), variantId: entryVariant || null, status: 'success' };
        }

        // 2. Handle Config Load
        const [version, data] = versionedPayload.split(':', 2);

        if (version !== CONFIG_VERSION) {
            throw new Error(`Unsupported config version: ${version}`);
        }

        if (!data) {
            throw new Error('No data in payload');
        }

        let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        const compressed = fflate.strToU8(atob(base64), true);
        const serializedString = fflate.strFromU8(fflate.inflateSync(compressed));

        if (!serializedString) {
            throw new Error('Processing failed');
        }

        return { configuration: deserialize(serializedString), status: 'success' };

    } catch (error) {
        console.warn('Config corrupted. Attempting fallback to hint.', error);
        return { configuration: cloneInitialConfig(), status: 'failed' };
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