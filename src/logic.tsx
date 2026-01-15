// src/logic.tsx

import { createContext, useContext, useEffect } from 'react';
import { SceneManager } from './viewer';
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
    cloneInitialConfig
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
    resolveProduct,
    // Re-export moved logic for compatibility
    colorIndexById,
    getPaletteIndexById,
    colorLookupMap,
    getHexById,
    sanitize,
    getPresetConfig
};

// --- LOGIC CONTROLLER REMOVED ---
// GloveLogicController has been removed to break the circular dependency. 
// It should be implemented in the UI layer (ui.tsx) where the context resides.

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

export const SceneContext = createContext<SceneManager | null>(null);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) { throw new Error('useScene must be used within a SceneProvider'); }
    return context;
};