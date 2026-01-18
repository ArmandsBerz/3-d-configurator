// src/logic.tsx

import * as fflate from 'fflate';
// REMOVED: import { useGloveConfigurator } from './ui'; 

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
    SIZE_REGISTRY,
    SIZE_PALETTES,
    STIFFNESS_REGISTRY,
    STIFFNESS_PALETTES,
    HAND_OPENING_REGISTRY,
    HAND_OPENING_PALETTES,
    THROWING_HAND_REGISTRY,
    THROWING_HAND_PALETTES
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
    // 1. Position Group (Explicitly First)
    const positionGroup = {
        id: 'position',
        title: 'Position',
        options: [
            {id: 'inf', label: 'INFIELD'},
            {id: 'out', label: 'OUTFIELD'},
            {id: 'pit', label: 'PITCHER'},
            {id: 'cat', label: 'CATCHER'},
            {id: 'fb', label: 'FIRST BASE'}
        ],
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
        positionGroup,
        sizeGroup,
        handGroup,
        stiffnessGroup,
        throwingGroup
    ];
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