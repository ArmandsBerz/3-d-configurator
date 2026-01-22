// src/logic.tsx

import * as fflate from 'fflate';
// REMOVED: import { useGloveConfigurator } from './ui'; 
import VARIANTS_MAP from './variants-map.json'; // <--- NEW: Import the Map

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
    resolveProduct, 
    ProductDefinition, 
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
    UIPartGroupDual, // <--- ADDED per instructions
    CommerceState,
    // --- IMPORTED MOVED LOGIC ---
    colorIndexById,
    getPaletteIndexById,
    colorLookupMap,
    getHexById,
    sanitize,
    getPresetConfig,
    serialize,
    deserialize,
    cloneInitialConfig,
    // --- NEW IMPORTS PHASE 2 ---
    POSITION_REGISTRY, // <--- ADDED per instructions
    POSITION_PALETTES, // <--- ADDED per instructions
    LEATHER_REGISTRY, // <--- ADDED per instructions
    LEATHER_PALETTES, // <--- ADDED per instructions
    SIZE_REGISTRY,
    SIZE_PALETTES,
    STIFFNESS_REGISTRY,
    STIFFNESS_PALETTES,
    HAND_OPENING_REGISTRY,
    HAND_OPENING_PALETTES,
    THROWING_HAND_REGISTRY,
    THROWING_HAND_PALETTES,
    BACK_STYLE_REGISTRY, // <--- ADDED per instructions
    BACK_STYLE_PALETTES, // <--- ADDED per instructions
    WEB_REGISTRY // <--- ADDED per instructions
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
    UIPartGroupDual, // <--- ADDED per instructions
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
    resolveProduct,
    // Re-export moved logic for compatibility
    colorIndexById,
    getPaletteIndexById,
    colorLookupMap,
    getHexById,
    sanitize,
    getPresetConfig,
    // Export new resolver
    resolveBuildGroups
};

// --- LOGIC CONTROLLER REMOVED ---
// GloveLogicController has been removed to break the circular dependency. 
// It should be implemented in the UI layer (ui.tsx) where the context resides.

// ===================================================================
// --- BUILD GROUP RESOLVER (PHASE 2) ---
// ===================================================================

// FIX FOR GOTCHA A: Explicit Interface to prevent Union inference
export interface UIBuildGroup {
    id: string;
    title: string;
    options: readonly { id: string; label: string }[];
    layout: string;
}

// FIX FOR GOTCHA A: Explicit Return Type (: UIBuildGroup[])
const resolveBuildGroups = (def: ProductDefinition): UIBuildGroup[] => {
    // 0. Leather Group (Added per instructions)
    const leatherPaletteId = def.leatherPaletteId;
    const leatherIds = LEATHER_PALETTES[leatherPaletteId];
    // Map IDs to Labels via Registry
    const leatherOptionsMapped = leatherIds.map(id => ({
        id,
        label: LEATHER_REGISTRY[id].label
    }));
    const leatherGroup = {
        id: 'imageSelection',
        title: 'Glove Leather',
        options: leatherOptionsMapped,
        layout: 'grid-cols-2'
    };

    // 1. Position Group (Explicitly First)
    const positionPaletteId = def.positionPaletteId;
    const positionIds = POSITION_PALETTES[positionPaletteId];
    // Map IDs to Labels via Registry
    const positionOptions = positionIds.map(id => ({
        id,
        label: POSITION_REGISTRY[id].label
    }));
    
    const positionGroup = {
        id: 'position',
        title: 'Position',
        options: positionOptions,
        layout: 'grid-cols-3'
    };

    // 1.5 Back Style Group (Conditional)
    let backStyleGroup: UIBuildGroup | null = null;
    
    if (def.backStylePaletteId) {
        const backStyleIds = BACK_STYLE_PALETTES[def.backStylePaletteId];
        const backStyleOptions = backStyleIds.map(id => ({
            id,
            label: BACK_STYLE_REGISTRY[id].label
        }));

        backStyleGroup = {
            id: 'backStyle',
            title: 'Back Style',
            options: backStyleOptions,
            layout: 'grid-cols-2'
        };
    }

    // 1.7 Web Type Group (Dynamic from Assets)
    // The "Palette" for webs is strictly the keys of the validWebs map.
    const validWebIds = Object.keys(def.assets.validWebs);
    
    const webOptions = validWebIds.map(id => ({
        id,
        // @ts-ignore - Safe because schema validation ensures validWebs only contains valid IDs
        label: WEB_REGISTRY[id]?.label || id 
    }));

    const webGroup = {
        id: 'webType',
        title: 'Web Type',
        options: webOptions,
        layout: 'grid-cols-3'
    };

    // 2. Size Group
    const sizePaletteId = def.sizePaletteId;
    const sizeIds = SIZE_PALETTES[sizePaletteId];
    // Map IDs to Labels via Registry
    const sizeOptions = sizeIds.map(id => ({ 
        id, 
        label: SIZE_REGISTRY[id].label 
    }));
    const sizeGroup = { 
        id: 'size', 
        title: 'Size', 
        options: sizeOptions, 
        layout: 'grid-cols-3' // Inject Layout
    };

    // 3. Hand Opening Group
    const handPaletteId = def.handOpeningPaletteId;
    const handIds = HAND_OPENING_PALETTES[handPaletteId];
    const handOptions = handIds.map(id => ({ 
        id, 
        label: HAND_OPENING_REGISTRY[id].label 
    }));
    const handGroup = { 
        id: 'handOpeningSize', 
        title: 'Hand Opening Size', 
        options: handOptions, 
        layout: 'grid-cols-2' 
    };

    // 4. Stiffness Group
    const stiffnessPaletteId = def.stiffnessPaletteId;
    const stiffnessIds = STIFFNESS_PALETTES[stiffnessPaletteId];
    const stiffnessOptions = stiffnessIds.map(id => ({ 
        id, 
        label: STIFFNESS_REGISTRY[id].label 
    }));
    const stiffnessGroup = { 
        id: 'stiffness', 
        title: 'Stiffness', 
        options: stiffnessOptions, 
        layout: 'grid-cols-3' 
    };

    // 5. Throwing Hand Group
    const throwingPaletteId = def.throwingHandPaletteId;
    const throwingIds = THROWING_HAND_PALETTES[throwingPaletteId];
    const throwingOptions = throwingIds.map(id => ({ 
        id, 
        label: THROWING_HAND_REGISTRY[id].label 
    }));
    const throwingGroup = { 
        id: 'throwingHand', 
        title: 'Throwing Hand', 
        options: throwingOptions, 
        layout: 'grid-cols-2' 
    };

    return [
        leatherGroup, // Added to return array
        positionGroup,
        backStyleGroup, // Added to return array (conditional)
        sizeGroup,
        webGroup, // <--- Add it to the list!
        handGroup,
        stiffnessGroup,
        throwingGroup
    ].filter((g): g is UIBuildGroup => g !== null); // Filter out nulls
};

// ===================================================================
// --- URL LOGIC ---
// ===================================================================

const CONFIG_VERSION = 'v1';

export type LoadStatus = 'success' | 'failed' | 'empty';

export interface LoadResult {
    configuration: GloveConfiguration;
    variantId?: string | null;
    status: LoadStatus;
}

// Helper: Convert Config -> Shell Key (The "1st part" of your map)
const getShellKey = (build: BuildConfig): string => {
    if (build.position === 'cat') return 'catcher';
    if (build.position === 'fb') return 'first-base';
    // Logic for 'out' or 'pit' depends on back style
    if (build.position === 'out' || build.position === 'pit') {
        // We assume 'cls' maps to close-back, everything else to open-back
        return build.backStyle === 'cls' ? 'close-back' : 'open-back';
    }
    // Default fallback for infield (or anything else) is open-back
    return 'open-back';
};

// --- NEW: PHASE 2 EXIT HELPER (The "Throw") ---
// Use this in ui.tsx to resolve the ID before syncing back
export const getVariantIdForConfig = (config: GloveConfiguration): string | null => {
    const shell = getShellKey(config.build);
    const leather = config.build.imageSelection;
    const size = config.build.size;

    // HIERARCHICAL MATCHING (Level 3 -> Level 2 -> Level 1)
    
    // 1. Try "shell|leather|size" (Level 3 Precision)
    const keyLevel3 = `${shell}|${leather}|${size}`;
    // @ts-ignore
    if (VARIANTS_MAP.map[keyLevel3]) return String(VARIANTS_MAP.map[keyLevel3]);

    // 2. Try "shell|leather" (Level 2 Precision)
    const keyLevel2 = `${shell}|${leather}`;
    // @ts-ignore
    if (VARIANTS_MAP.map[keyLevel2]) return String(VARIANTS_MAP.map[keyLevel2]);

    // 3. Try "shell" (Level 1 Precision)
    const keyLevel1 = shell;
    // @ts-ignore
    if (VARIANTS_MAP.map[keyLevel1]) return String(VARIANTS_MAP.map[keyLevel1]);

    // 4. Default ID (If provided in JSON)
    // @ts-ignore
    return VARIANTS_MAP.default ? String(VARIANTS_MAP.default) : null;
};

export const loadConfigurationFromURL = (): LoadResult => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const versionedPayload = urlParams.get('config');

        // 1. Handle Empty/New Load
        if (!versionedPayload) {
            const entryHint = urlParams.get('entry');
            const entryVariant = urlParams.get('entry_variant');

            // --- NEW: PHASE 1 ENTRY LOGIC (The "Catch") ---
            // If we have a specific Variant ID, try to reverse-lookup it
            if (entryVariant) {
                // 1. Reverse Search the Map
                // @ts-ignore - Object.entries on JSON module's map property
                const mapEntry = Object.entries(VARIANTS_MAP.map).find(([k, v]) => String(v) === entryVariant);
                
                if (mapEntry) {
                    const keyString = mapEntry[0]; // e.g., "open-back|imgOpt1|1100" or "catcher"
                    const parts = keyString.split('|');
                    
                    // We only parse what is present. 
                    // Part 0 = Shell
                    // Part 1 = Leather (Optional)
                    // Part 2 = Size (Optional)
                    
                    if (parts.length > 0) {
                        const shell = parts[0];
                        const leather = parts[1];
                        const size = parts[2];

                        // 3. STRICT VALIDATION (Family Check)
                        let isCompatible = true;
                        
                        if (entryHint && entryHint in PRESETS) {
                            const presetConfig = getPresetConfig(entryHint as PresetId);
                            const presetShell = getShellKey(presetConfig.build);
                            
                            // If the Map says "catcher" but the user clicked "Infield" (open-back), BLOCK IT.
                            if (presetShell !== shell) {
                                console.warn(`Security: Blocked variant injection. Variant Family (${shell}) does not match Entry Preset (${presetShell} / ${entryHint}).`);
                                isCompatible = false;
                            }
                        }

                        if (isCompatible) {
                            // 4. Apply Config Safe & Sound
                            // We ONLY inject the properties that exist in the key.
                            // Everything else (web, colors, etc) stays at default.
                            const config = cloneInitialConfig();

                            // Inject Shell Logic (Position mapping)
                            if (shell === 'catcher') config.build.position = 'cat';
                            else if (shell === 'first-base') config.build.position = 'fb';
                            else if (shell === 'close-back') {
                                // Close back usually implies Outfield or Pitcher in this system
                                // We default to Outfield for safety if injecting 'close-back'
                                config.build.position = 'out'; 
                                // (Note: updateBuild factory in product-data will handle setting backStyle='cls' automatically if needed)
                            }
                            else if (shell === 'open-back') {
                                config.build.position = 'inf';
                            }

                            // Inject Leather
                            if (leather) {
                                // @ts-ignore - Cast string to ID
                                config.build.imageSelection = leather;
                            }

                            // Inject Size
                            if (size) {
                                // @ts-ignore - Cast string to ID
                                config.build.size = size;
                            }
                            
                            // 5. Sanitize to ensure the injection resulted in a valid build
                            const cleanConfig = sanitize(config);

                            return { 
                                configuration: cleanConfig, 
                                variantId: entryVariant, 
                                status: 'success' 
                            };
                        }
                    }
                }
            }
            // -----------------------------------------------

            // Standard Preset Load
            if (entryHint && entryHint in PRESETS) {
                 return { 
                    configuration: getPresetConfig(entryHint as PresetId), 
                    status: 'success' 
                };
            }
            return { configuration: cloneInitialConfig(), status: 'empty' };
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
        .replace(/\=/g, '');

    const versionedPayload = `${CONFIG_VERSION}:${processedData}`;
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?config=${versionedPayload}`;
};