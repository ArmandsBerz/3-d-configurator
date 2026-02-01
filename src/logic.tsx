// src/logic.tsx

import * as fflate from 'fflate';
// REMOVED: import { useGloveConfigurator } from './ui'; 
// REMOVED: import VARIANTS_MAP from './variants-map.json';

// --- IMPORT THE DATABASE (The "Universe" of the Glove) ---
import {
    ZONES,
    COLOR_OPTIONS,
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
    sanitize as originalSanitize,
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
    WEB_REGISTRY, // <--- ADDED per instructions
    CART_LABELS, // <--- ADDED per instructions
    // --- ADDED PER INSTRUCTIONS ---
    FINGER_PROTECTION_REGISTRY,
    FINGER_PROTECTION_PALETTES,
} from './product-data';
import type { FingerProtectionId } from './product-data'; //

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
    PresetId,
    FingerProtectionId // <--- RE-EXPORTED for UI.tsx consistency
};

export {
    ZONES,
    COLOR_OPTIONS,
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
    getPresetConfig,
    // resolveBuildGroups is now exported directly below

    // --- ADDED: REGISTRIES RE-EXPORTS FOR UI.TSX ---
    SIZE_REGISTRY,
    POSITION_REGISTRY,
    THROWING_HAND_REGISTRY,
    STIFFNESS_REGISTRY,
    HAND_OPENING_REGISTRY,
    CART_LABELS, // <--- ADDED per instructions
    FINGER_PROTECTION_REGISTRY, // <--- ADDED per instructions
    FINGER_PROTECTION_PALETTES, // <--- ADDED per instructions
};

// ===================================================================
// --- SANITIZATION LOGIC ---
// ===================================================================

export const sanitize = (config: GloveConfiguration): GloveConfiguration => {
    // 1. First, run the base sanitization (handles webTypes and position defaults)
    const sanitized = originalSanitize(config);
    
    // 2. Resolve the product based on the current build
    const definition = resolveProduct(sanitized.build);
    
    // 3. FINGER PROTECTION SAFETY VALVE
    // Check if the definition supports finger protection (length > 1 means choice exists beyond 'None')
    const protectionPaletteId = definition.fingerProtectionPaletteId;
    // Widening the array to FingerProtectionId[] to make .includes() type-safe
    const protectionIds: readonly FingerProtectionId[] = FINGER_PROTECTION_PALETTES[protectionPaletteId]; //
    
    if (protectionIds.length <= 1) { //
        // Force state to 'non' if the shell doesn't support pads or hoods
        sanitized.build.fingerProtection = 'non';
    } else if (!protectionIds.includes(sanitized.build.fingerProtection)) { //
        // Even if supported, ensure the current ID is actually in the allowed palette for this shell
        sanitized.build.fingerProtection = 'non';
    }

    return sanitized;
};

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
// TWEAK 1: Named Export directly
export const resolveBuildGroups = (def: ProductDefinition): UIBuildGroup[] => {
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

    // --- 1.6 FINGER PROTECTION GROUP (REMOVED: Stop generating as a build group) ---
    // Waste removed to align with non-foundational accessory logic.

    // 1.7 Web Type Group (Dynamic from Assets)
    // The "Palette" for webs is strictly the keys of the validWebs map.
    // TWEAK 3: Strict filtering using the Registry instead of casting
    const validWebIds = Object.keys(def.assets.validWebs).filter(
        (k): k is WebTypeId => k in WEB_REGISTRY
    );
    
    const webOptions = validWebIds.map(id => ({
        id,
        // TWEAK 3: No @ts-ignore needed, TypeScript knows 'id' is a valid WebTypeId
        label: WEB_REGISTRY[id]?.label ?? id 
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

export const loadConfigurationFromURL = (): LoadResult => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const versionedPayload = urlParams.get('config');

        // 1. Handle Empty/New Load
        if (!versionedPayload) {
            const entryHint = urlParams.get('entry');
            
            // Standard Preset Load
            if (entryHint && entryHint in PRESETS) {
                 // TWEAK 2: Sanitize presets too
                 return { 
                    configuration: sanitize(getPresetConfig(entryHint as PresetId)), 
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

        // IMPROVEMENT: Sanitize the loaded config to ensure it's valid
        const loadedConfig = deserialize(serializedString);
        return { configuration: sanitize(loadedConfig), status: 'success' };

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

// --- NEW: GOLD MASTER SUMMARY HELPER ---
export interface SummaryRow {
    key: string;
    value: string;
}

export const getBuildSummaryRows = (build: BuildConfig, definition: ProductDefinition): SummaryRow[] => {
    const rows: SummaryRow[] = [];

    // 1. Position (Universal)
    if (build.position && POSITION_REGISTRY[build.position]) {
        rows.push({ key: "Position", value: POSITION_REGISTRY[build.position].label });
    }

    // 2. Back Style (Condition: Only if the Definition has a backStylePaletteId)
    if (definition.backStylePaletteId && build.backStyle && BACK_STYLE_REGISTRY[build.backStyle]) {
        rows.push({ key: "Back Style", value: BACK_STYLE_REGISTRY[build.backStyle].label });
    }

    // 3. Size (Universal)
    if (build.size && SIZE_REGISTRY[build.size]) {
        rows.push({ key: "Size", value: SIZE_REGISTRY[build.size].label });
    }

    // 4. Leather (Universal)
    if (build.imageSelection && LEATHER_REGISTRY[build.imageSelection]) {
        rows.push({ key: "Leather", value: LEATHER_REGISTRY[build.imageSelection].label });
    }

    // 5. Web Type (Universal)
    if (build.webType && WEB_REGISTRY[build.webType]) {
        rows.push({ key: "Web Type", value: WEB_REGISTRY[build.webType].label });
    }

    // 6. Stiffness (Universal)
    if (build.stiffness && STIFFNESS_REGISTRY[build.stiffness]) {
        rows.push({ key: "Stiffness", value: STIFFNESS_REGISTRY[build.stiffness].label });
    }

    // 7. Hand Opening (Universal)
    if (build.handOpeningSize && HAND_OPENING_REGISTRY[build.handOpeningSize]) {
        rows.push({ key: "Hand Opening", value: HAND_OPENING_REGISTRY[build.handOpeningSize].label });
    }

    // 8. Throwing Hand (Universal)
    if (build.throwingHand && THROWING_HAND_REGISTRY[build.throwingHand]) {
        rows.push({ key: "Throwing Hand", value: THROWING_HAND_REGISTRY[build.throwingHand].label });
    }

    // 9. Finger Protection (Conditional: Mirrors Text pattern/Accessory logic)
    // Row is included only if it's not 'non' and the product supports more than none.
    const paletteId = definition.fingerProtectionPaletteId;
    // Widening the array to FingerProtectionId[] to make .includes() type-safe
    const allowed: readonly FingerProtectionId[] = FINGER_PROTECTION_PALETTES[paletteId]; //

    if (
        build.fingerProtection !== 'non' &&
        allowed.length > 1 &&
        allowed.includes(build.fingerProtection) //
    ) {
        // Refined protection logic to avoid double-indexing the registry
        const protectionEntry = FINGER_PROTECTION_REGISTRY[build.fingerProtection]; //
        if (protectionEntry) {
            rows.push({
                key: "Pad / Hood",
                value: protectionEntry.label
            });
        }
    }

    return rows;
};