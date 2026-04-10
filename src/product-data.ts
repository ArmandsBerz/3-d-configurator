// src/product-data.ts

// ===================================================================
// 1. PRIMITIVES & CONSTANTS
// ===================================================================

export type HexColor = string;
export type ZoneKey = `zone${number}`; // e.g., 'zone1', 'zone2', etc.

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

// ===================================================================
// 2. THE MENU OPTIONS (DEFINITIONS)
// ===================================================================

export const COLOR_OPTIONS = [
    { id: 'rw', name: 'Raw', hex: '#F4EBE0' }, // Lightened to a cleaner, fresh birch/ash look
    { id: 'nt', name: 'Natural', hex: '#ECD8AD' }, // DO NOT TOUCH - Left exactly as is
    { id: 'wf', name: 'Warrior Flame', hex: '#B3411A' }, // Richer, more vibrant burnt orange/copper
    { id: 'ea', name: 'Earth', hex: '#5A3824' }, // Warmer, more saturated walnut brown
    { id: 'tb', name: 'Tobacco', hex: '#3E1E0F' }, // Deepened to a rich, glossy mahogany
    { id: 'bk', name: 'Black', hex: '#111111' }, // Deep, true athletic black (slightly off #000 for paint realism)
    { id: 'sm', name: 'Smoke', hex: '#55565A' }, // Shifted to a standard cool athletic charcoal/away-grey
    { id: 'tc', name: 'Thundercloud', hex: '#8A8D8F' }, // Cleaned up to a crisp, neutral steel grey
    { id: 'nb', name: 'Navajo Bone', hex: '#E5DCCB' }, // Warmer, vintage athletic cream (like throwback uniforms)
    { id: 'wt', name: 'White', hex: '#FFFFFF' }, // Shifted to pure white for those crisp, popping stripes
    { id: 'oc', name: 'Ocean', hex: '#0085CA' }, // Vibrant Carolina/Powder blue
    { id: 'ry', name: 'Royal', hex: '#0033A0' }, // True, vivid collegiate royal blue
    { id: 'nv', name: 'Navy', hex: '#0C2340' }, // Deepened to perfectly match the Auburn/Mariners dark navy in your images
    { id: 'cr', name: 'Crown', hex: '#461D7C' }, // Saturated collegiate purple (think LSU or Washington)
    { id: 'wn', name: 'Wine', hex: '#782F40' }, // Shifted to a true FSU Garnet / ASU Maroon
    { id: 'bd', name: 'Blood', hex: '#CC0000' }, // Brightened to a classic, popping team red
    { id: 'fi', name: 'Fire', hex: '#E8491B' }, // Bright, vivid Auburn/Syracuse athletic orange
    { id: 'sn', name: 'Sun', hex: '#FFC72C' }, // True ASU bright athletic gold/yellow
    { id: 'gs', name: 'Grass', hex: '#00843D' }, // Vibrant, saturated Kelly Green
    { id: 'fo', name: 'Forest', hex: '#18453B' }, // Deep, rich collegiate forest green
    { id: 'gd', name: 'Gold', hex: '#CBA052' }, // Shifted to the "Vegas Gold" seen on the Vandy and FSU bats
    { id: 'sv', name: 'Silver', hex: '#A2AAAD' }  // Crisp, cool metallic silver
] as const;

// --- PALETTE SYSTEM IMPLEMENTATION (COLORS) ---
export const PALETTES = {
    universal: COLOR_OPTIONS
} as const;

export type PaletteId = keyof typeof PALETTES;
export type ColorId = typeof COLOR_OPTIONS[number]['id'];

// ===================================================================
// 2.5 REGISTRIES & PALETTES (THE NEW UNIVERSE)
// ===================================================================

// --- 0. POSITION REGISTRY ---
export const POSITION_REGISTRY = {
    'inf': { label: 'Full Button' } // <--- Renamed so your UI actually says "Bat"
} as const;

export type BuildPositionId = keyof typeof POSITION_REGISTRY;

export const POSITION_PALETTES = {
    universal: ['inf'] // <--- Gutted the rest so the UI dropdown only has one option
} as const satisfies Record<string, readonly BuildPositionId[]>;

export type PositionPaletteId = keyof typeof POSITION_PALETTES;

// --- 0.5. BACK STYLE REGISTRY (NEW) ---
export const BACK_STYLE_REGISTRY = {
    'opn': { label: 'Open' } // <--- Gutted the closed back
} as const;

export type BuildBackStyleId = keyof typeof BACK_STYLE_REGISTRY;

export const BACK_STYLE_PALETTES = {
    universal: ['opn']
} as const satisfies Record<string, readonly BuildBackStyleId[]>;

export type BackStylePaletteId = keyof typeof BACK_STYLE_PALETTES;

// --- 0.7. FINGER PROTECTION REGISTRY (NEW) ---
export const FINGER_PROTECTION_REGISTRY = {
    'non': { label: 'None', meshName: null },
    'ixp': { label: 'Index Pad', meshName: 'indexPad' },
    'mdp': { label: 'Middle Pad', meshName: 'middlePad' },
    'ixh': { label: 'Index Hood', meshName: 'indexHood' },
    'mdh': { label: 'Middle Hood', meshName: 'middleHood' }
} as const;

export type FingerProtectionId = keyof typeof FINGER_PROTECTION_REGISTRY;

// Narrowing: Define the literal types for the meshes
export type FingerProtectionMeshName = Exclude<typeof FINGER_PROTECTION_REGISTRY[FingerProtectionId]['meshName'], null>;

export const FINGER_PROTECTION_PALETTES = {
    openBack: ['non', 'ixp', 'mdp', 'ixh', 'mdh'],
    noneOnly: ['non'] // For Catcher, First Base, and Close Back
} as const satisfies Record<string, readonly FingerProtectionId[]>;

export type FingerProtectionPaletteId = keyof typeof FINGER_PROTECTION_PALETTES;


// --- 1. LEATHER REGISTRY ---
export const LEATHER_REGISTRY = {
    'imgOpt1': { label: 'Pinhole Mesh' },
    'imgOpt2': { label: 'DriFit' }
} as const;

export type BuildLeatherId = keyof typeof LEATHER_REGISTRY;

export const LEATHER_PALETTES = {
    universal: ['imgOpt1', 'imgOpt2'], // Added imgOpt3 for Fielding Gloves
    mitts: ['imgOpt1', 'imgOpt2'] // Original 2 options for Mitts
} as const satisfies Record<string, readonly BuildLeatherId[]>; //

export type LeatherPaletteId = keyof typeof LEATHER_PALETTES;


// --- 2. SIZE REGISTRY ---
export const SIZE_REGISTRY = {
    '3100': { label: 'S' },
    '3200': { label: 'M' },
    '3250': { label: 'L' },
    '3300': { label: 'XL' },
    '3350': { label: 'XXL' }
} as const;

export type BuildSizeId = keyof typeof SIZE_REGISTRY;

export const SIZE_PALETTES = {
    openBack: ['3100', '3200', '3250', '3300', '3350'], // Updated sizes
} as const satisfies Record<string, readonly BuildSizeId[]>; //

export type SizePaletteId = keyof typeof SIZE_PALETTES;


// --- 4. STIFFNESS REGISTRY ---
export const STIFFNESS_REGISTRY = {
    'stf': { label: '-3oz' },
    'std': { label: '-2oz' },
    'sft': { label: '-1oz' }
} as const;

export type BuildStiffnessId = keyof typeof STIFFNESS_REGISTRY;

export const STIFFNESS_PALETTES = {
    universal: ['stf', 'std', 'sft']
} as const satisfies Record<string, readonly BuildStiffnessId[]>; //

export type StiffnessPaletteId = keyof typeof STIFFNESS_PALETTES;

// --- 5.1 STAIN STYLE REGISTRY (NEW) ---
export const STAIN_STYLE_REGISTRY = {
    'fd': { label: 'Full Dip' },
    'hd': { label: 'Half Dip' },
    'wt': { label: 'Wartip' },
    'dd': { label: 'Double Dip' }
} as const;

export type StainStyleId = keyof typeof STAIN_STYLE_REGISTRY;

export const STAIN_STYLE_PALETTES = {
    universal: ['fd', 'hd', 'wt', 'dd']
} as const satisfies Record<string, readonly StainStyleId[]>;

export type StainStylePaletteId = keyof typeof STAIN_STYLE_PALETTES;

// --- 5.5 PERSONALIZATION LABELS (THE CART DICTIONARY) ---
export const CART_LABELS = {
    THUMB_TEXT: "Custom Engraving",
    THUMB_FONT: "Engraving Font",
    THUMB_COLOR: "Engraving Color",
    PINKY_TEXT: "Secondary Engraving",   // <--- ADD THESE
    PINKY_FONT: "Secondary Font",        // <--- ADD THESE
    PINKY_COLOR: "Secondary Color",
} as const;


// --- LEGACY SUPPORT (Derived from Registries) ---
// This ensures UI components importing these still work until Phase 3 migration.
export const leatherOptions = Object.entries(LEATHER_REGISTRY).map(([id, data]) => ({ id, title: data.label }));

export const FONT_REGISTRY = [
  { id: 'LOBSTER', label: 'Lobster', baseName: 'lobsterType', targetLineFactor: 1.5 },
  { id: 'ROBOTO', label: 'Roboto', baseName: 'robotoType', targetLineFactor: 1.4 },
] as const;

export const fontOptions = FONT_REGISTRY.map(font => ({ id: font.id, label: font.label }));
export type Font = (typeof FONT_REGISTRY)[number]['id'];

// --- 6. WEB REGISTRY (Refactored from Array) ---
export const WEB_REGISTRY = {
    'bsk': { label: 'Uncupped' },
    'bsl': { label: 'Cupped' },
    'clv': { label: 'Closed V' },
    'dhn': { label: 'Dual Hinge' },
    'fmt': { label: 'Framed Mod Trap' },
    'hwb': { label: 'H-Web' },
    'iwb': { label: 'I-Web' },
    'lch': { label: 'Laced H-Web' },
    'lcs': { label: 'Lace Sealing' },
    'mtp': { label: 'Mod Trap' },
    '1pc': { label: 'One Piece' },
    'pst': { label: 'Post' },
    'slg': { label: 'Sealing' },
    'sp':  { label: 'Single Post' },
    'spl': { label: 'Single Post Lace' },
    'trp': { label: 'Trap' },
    '2pc': { label: 'Two Piece' },
} as const;

// FIX A: Derive Type DIRECTLY from Registry Keys
export type WebTypeId = keyof typeof WEB_REGISTRY;

// Legacy Support (Derived): Cast ID to WebTypeId to satisfy the compiler
export const webTypeOptions = Object.entries(WEB_REGISTRY).map(([id, data]) => ({ 
    id: id as WebTypeId, 
    title: data.label 
}));

// Derived Types
// export type BuildPositionId = typeof buildOptionsData[0]['options'][number]['id']; // REPLACED BY REGISTRY
export type BuildBackId = 'opn';

// --- STRICT SCHEMA: DISCRIMINATED UNION ---
interface BuildConfigBase {
    palette: PaletteId;
    imageSelection: 'imgOpt1' | 'imgOpt2'; // Added imgOpt3
    size: BuildSizeId;
    stiffness: BuildStiffnessId;
    webType: WebTypeId;
    fingerProtection: FingerProtectionId;
    stainStyle: StainStyleId; // <--- ADD THIS LINE
}

// SINGLE SCHEMA: Bat configuration
export interface BuildConfig extends BuildConfigBase {
    position: 'inf';
    backStyle?: 'opn'; // Kept optional so logic.tsx doesn't throw "property undefined" errors
}

export interface TextPart {
    type: 'text';
    text: string;
    font: Font;
    colorId: ColorId;
    outlineColorId: ColorId; // <--- ADDED OUTLINE
}

export interface SingleColorState {
    colorId: ColorId;
}

export type GloveConfiguration = {
    build: BuildConfig;
    thumbName: TextPart;
    pinkyName: TextPart;
} & Record<ZoneKey, SingleColorState>;

export interface CommerceState {
    variantId: string | null;
    quantity: number;
}

export interface AppState {
    configuration: GloveConfiguration;
    commerce: CommerceState;
    isLoading: boolean;
    lastActivatedPartType: 'inner' | 'outer' | 'single' | null;
}

// ===================================================================
// 3. THE SCHEMA CONTRACT (INTERFACES)
// ===================================================================

export interface ZoneDefinition {
    shaderIndex: number;
    displayName: string;
    materialTarget: 'shell' | 'web' | 'both';
    // COLOCATION: Rules live on the object
    allowApplyToAll: boolean; 
    defaultColor?: ColorId;
}

export interface UIPartGroupSingle { id: string; type: 'single'; title: string; zoneKey: ZoneKey; }
export interface UIPartGroupDual { id: string; type: 'dual'; title: string; outerZoneKey: ZoneKey; innerZoneKey: ZoneKey; }
export interface UIPartGroupGallery { id: string; type: 'gallery'; title: string; }
export type UIPartGroup = UIPartGroupSingle | UIPartGroupDual | UIPartGroupGallery;

export interface ProductDefinition {
    id: string; // e.g. 'catcher'
    
    // A. ASSETS (3D Source of Truth)
    assets: {
        shellModel: string; // 'catcher.glb'
        // STRICT MAP: Only the webs that exist for this shell
        validWebs: Record<string, string>; 
        // 1. Interface Alignment: Narrowing meshes to registry literals
        protectionMeshes: FingerProtectionMeshName[];
    };

    // B. STRUCTURE (Physics Source of Truth)
    // A zone ONLY exists if it is in this record.
    zones: Record<string, ZoneDefinition>;

    // C. UI (Menu Source of Truth)
    uiGroups: UIPartGroup[];

    // D. CONSTRAINTS (Business Rules)
    constraints: {
        validPalette: string[]; // Whitelist of color IDs
        validSizes: string[]; // Whitelist of size IDs
    };

    // E. CAPABILITIES (Palette IDs)
    sizePaletteId: SizePaletteId;
    leatherPaletteId: LeatherPaletteId;
    stiffnessPaletteId: StiffnessPaletteId;
    positionPaletteId: PositionPaletteId;
    backStylePaletteId?: BackStylePaletteId; // <--- NEW: Optional!
    fingerProtectionPaletteId: FingerProtectionPaletteId;
    stainStylePaletteId: StainStylePaletteId; // <--- ADD THIS LINE
}

// ===================================================================
// 4. THE COMPILER (FACTORY & VALIDATOR)
// ===================================================================

// A. MOCK ASSET MANIFEST (The "File System" Truth)
// In a real app, this might be generated by a script scanning your /public/assets folder.
// For now, we hardcode the known valid files to enforce "Check B".
const ASSET_MANIFEST: Set<string> = new Set([
    'openBack', // <--- This is physically your bat now
    'basketOB', 'basketLaceOB'
]);

// Universal Parts (The "Base Class")
const UNIVERSAL_PARTS: Record<string, ZoneDefinition> = {
    [ZONES.WEB]:        { shaderIndex: 30, displayName: 'Cup', materialTarget: 'web', allowApplyToAll: true },
    [ZONES.WRIST]:      { shaderIndex: 26, displayName: 'Wrist', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.LACE]:       { shaderIndex: 29, displayName: 'Lace', materialTarget: 'both', allowApplyToAll: true },
    [ZONES.STITCHING]:  { shaderIndex: 31, displayName: 'Stitching', materialTarget: 'both', allowApplyToAll: false }, // Rule colocated!
    [ZONES.BINDING]:    { shaderIndex: 25, displayName: 'Binding', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.WELTING]:    { shaderIndex: 24, displayName: 'Welting', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.PALM]:       { shaderIndex: 27, displayName: 'Palm', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.LINER]:      { shaderIndex: 28, displayName: 'Liner', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.WRIST_STRAP]:{ shaderIndex: 19, displayName: 'Wrist Strap', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.PAD_HOOD]:   { shaderIndex: 20, displayName: 'Pad/Hood', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.THUMB_OUTER]:{ shaderIndex: 0, displayName: 'Outer Thumb', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.PINKY_INNER]:{ shaderIndex: 7, displayName: 'Inner Pinky', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.PINKY_OUTER]:{ shaderIndex: 8, displayName: 'Outer Pinky', materialTarget: 'shell', allowApplyToAll: true },
    [ZONES.WRIST_LOGO]: { shaderIndex: 22, displayName: 'Wrist Logo', materialTarget: 'shell', allowApplyToAll: false },
    [ZONES.WRIST_LOGO_OUTLINE]: { shaderIndex: 23, displayName: 'Wrist Logo Outline', materialTarget: 'shell', allowApplyToAll: false },
    [ZONES.FINGER_LOGO]: { shaderIndex: 21, displayName: 'Logo', materialTarget: 'shell', allowApplyToAll: false },
};

interface ProductBlueprint {
    id: string;
    shellModel: string;
    validWebs: Record<string, string>;
    specificZones: Record<string, Partial<ZoneDefinition>>; // Overrides
    uiGroups: UIPartGroup[];
    // NEW: Palette ID References
    sizePalette: SizePaletteId;
    leatherPalette?: LeatherPaletteId;
    stiffnessPalette?: StiffnessPaletteId;
    backStylePalette?: BackStylePaletteId; // <--- NEW: Optional!
    fingerProtectionPalette: FingerProtectionPaletteId;
    stainStylePalette?: StainStylePaletteId; // <--- ADD THIS LINE
}

// Simple Deep Freeze Implementation
const deepFreeze = <T extends object>(obj: T): T => {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(obj);

    const rec = obj as Record<string, unknown>;

    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = rec[name];
        if (value && typeof value === "object") {
            deepFreeze(value as object);
        }
    }

    return Object.freeze(obj);
};

const compileProduct = (blueprint: ProductBlueprint): ProductDefinition => {
    // 1. VALIDATION PHASE (Fail Fast)
    
    // Check A: Asset Completeness (The "404 Prevention")
    // Ensure the shell model exists
    if (!ASSET_MANIFEST.has(blueprint.shellModel)) {
        throw new Error(`[Compiler Error] Product '${blueprint.id}' references missing SHELL asset: '${blueprint.shellModel}'`);
    }

    // Ensure every web asset exists
    Object.entries(blueprint.validWebs).forEach(([webId, filename]) => {
        if (!ASSET_MANIFEST.has(filename)) {
            throw new Error(`[Compiler Error] Product '${blueprint.id}' references missing WEB asset: '${filename}' (for webType: ${webId})`);
        }
    });

    // Check B: Duplicate Zone Keys (The "Collision" Check)
    // We strictly disallow redefining a Universal Zone in Specific Zones.
    const universalKeys = new Set(Object.keys(UNIVERSAL_PARTS));
    const duplicateKeys = Object.keys(blueprint.specificZones).filter(key => universalKeys.has(key));

    if (duplicateKeys.length > 0) {
        throw new Error(`[Compiler Error] Product '${blueprint.id}' attempts to redefine UNIVERSAL zones: ${duplicateKeys.join(', ')}. Overrides are forbidden to prevent state collisions.`);
    }

    // 2. CONSTRUCTION PHASE (Composition)
    // Since we passed validation, we can safely merge knowing keys are unique.
    const finalZones: Record<string, ZoneDefinition> = { ...UNIVERSAL_PARTS };

    Object.entries(blueprint.specificZones).forEach(([key, override]) => {
        // We know 'key' is unique now, so we just add it.
        // We ensure mandatory fields are present by merging with a base (or strict typing).
        // Since override is Partial, we assume the Blueprint author provided the required 'shaderIndex'.
        // In a stricter system, we would check for missing required fields here too.
        finalZones[key] = { 
            allowApplyToAll: true, 
            materialTarget: 'shell', 
            displayName: 'Unknown', 
            shaderIndex: -1, // Sentinel
            ...override 
        } as ZoneDefinition;

        if (finalZones[key].shaderIndex === -1) {
             throw new Error(`[Compiler Error] Product '${blueprint.id}' defines zone '${key}' without a valid shaderIndex.`);
        }
    });

    // Check C: UI Integrity
    // Do all UI groups point to existing zones?
    blueprint.uiGroups.forEach(group => {
        if (group.type === 'single' && !finalZones[group.zoneKey]) {
            throw new Error(`[Compiler Error] Product '${blueprint.id}' UI refers to missing zone: ${group.zoneKey}`);
        }
        if (group.type === 'dual') {
            if (!finalZones[group.outerZoneKey]) throw new Error(`[Compiler Error] Product '${blueprint.id}' missing outer: ${group.outerZoneKey}`);
            if (!finalZones[group.innerZoneKey]) throw new Error(`[Compiler Error] Product '${blueprint.id}' missing inner: ${group.innerZoneKey}`);
        }
    });

    // 3. Mapping Logic Fix & Type Guard Refinement
    // TASK 2 FIX: Always include ALL potential protection meshes in the assets list
    // so the controller can hide/clean them when state switches or model swaps.
    const derivedMeshes: FingerProtectionMeshName[] = ['indexPad', 'middlePad', 'indexHood', 'middleHood'];

    // 3. DEEP FREEZE (Immutability)
    const cartridge: ProductDefinition = {
        id: blueprint.id,
        assets: {
            shellModel: blueprint.shellModel,
            validWebs: blueprint.validWebs,
            protectionMeshes: derivedMeshes
        },
        zones: finalZones,
        uiGroups: blueprint.uiGroups,
        constraints: {
            validPalette: COLOR_OPTIONS.map(c => c.id),
            // FIX: Removed .map(s => s.id) because the palette is now ALREADY a list of IDs.
            validSizes: [...SIZE_PALETTES[blueprint.sizePalette]] 
        },
        // NEW: Assign Palettes (Default to universal if not specified)
        sizePaletteId: blueprint.sizePalette,
        leatherPaletteId: blueprint.leatherPalette || 'universal',
        stiffnessPaletteId: blueprint.stiffnessPalette || 'universal',
        positionPaletteId: 'universal',
        backStylePaletteId: blueprint.backStylePalette, // <--- Pass through!
        fingerProtectionPaletteId: blueprint.fingerProtectionPalette,
        stainStylePaletteId: blueprint.stainStylePalette || 'universal', // <--- ADD THIS LINE
    };

    return deepFreeze(cartridge);
};

// ===================================================================
// 5. THE REGISTRY (COMPILED CARTRIDGES)
// ===================================================================

const PRODUCT_REGISTRY = {
    'open-back': compileProduct({
        id: 'open-back',
        shellModel: 'openBack', // <--- Your bat!
        sizePalette: 'openBack', 
        leatherPalette: 'universal', 
        fingerProtectionPalette: 'noneOnly',
        validWebs: { 
            bsk: 'basketOB', 
            bsl: 'basketLaceOB' 
        },
        specificZones: {
            [ZONES.THUMB_INNER]:    { shaderIndex: 1, displayName: 'Inner Thumb', materialTarget: 'both' },
            [ZONES.INDEX]:          { shaderIndex: 2, displayName: 'Index Finger' },
            // ---> CHANGED Inner Middle to Stripe <---
            [ZONES.MIDDLE_INNER]:   { shaderIndex: 3, displayName: 'Placket', materialTarget: 'both' }, 
            [ZONES.MIDDLE_OUTER]:   { shaderIndex: 4, displayName: 'Outer Middle' },
            [ZONES.RING_INNER]:     { shaderIndex: 5, displayName: 'Inner Ring', materialTarget: 'both' },
            [ZONES.RING_OUTER]:     { shaderIndex: 6, displayName: 'Outer Ring' },
        },
        uiGroups: [
            { id: 'thumbGroup', type: 'single', title: 'Inner Thumb', zoneKey: ZONES.THUMB_INNER },
            { id: 'indexGroup', type: 'single', title: 'Index Finger', zoneKey: ZONES.INDEX },
            { id: 'outerThumbGroup', type: 'single', title: 'Outer Thumb', zoneKey: ZONES.THUMB_OUTER },
            // ---> ADD STRIPE UI MAPPED TO MIDDLE INNER <---
            { id: 'stripeGroup', type: 'single', title: 'Placket', zoneKey: ZONES.MIDDLE_INNER },
            { id: 'fingerLogoGroup', type: 'single', title: 'Logo', zoneKey: ZONES.FINGER_LOGO },
        ]
    })
};

// ===================================================================
// 6. THE RESOLVER API (THE ROUTER)
// ===================================================================

export const resolveProduct = (build: BuildConfig): ProductDefinition => {
    // 1. Default Route: Always return the bat configuration
    return PRODUCT_REGISTRY['open-back'];
};

// ===================================================================
// 7. THE PRESETS (DEFAULT STATES)
// ===================================================================

export const PRESETS = {
    'open-back': {
        build: { palette: 'universal', imageSelection: 'imgOpt1', position: 'inf', size: '3100', stiffness: 'std', webType: 'bsk', fingerProtection: 'non', stainStyle: 'dd' },
        thumbName: { type: 'text', text: '3', font: 'ROBOTO', colorId: 'sn', outlineColorId: 'bk' }, 
        pinkyName: { type: 'text', text: 'Name', font: 'ROBOTO', colorId: 'sn', outlineColorId: 'bk' },

        // KEEP ONLY YOUR 6 ZONES + WEB
        [ZONES.WEB]:            { colorId: 'nt' }, // Natural
        [ZONES.THUMB_INNER]:    { colorId: 'bk' }, // Raw
        [ZONES.INDEX]:          { colorId: 'bd' }, // Black
        [ZONES.THUMB_OUTER]:    { colorId: 'nt' }, // <--- ADD THIS LINE (Handle defaults to Black)
        [ZONES.MIDDLE_INNER]:   { colorId: 'wt' }, // White
        [ZONES.MIDDLE_OUTER]:   { colorId: 'ea' }, // Earth
        [ZONES.RING_INNER]:     { colorId: 'tb' }, // Tobacco
        [ZONES.RING_OUTER]:     { colorId: 'sm' }, // Smoke
        [ZONES.FINGER_LOGO]:    { colorId: 'bk' },
    } as GloveConfiguration,
} as const;

export type PresetId = keyof typeof PRESETS;

// ===================================================================
// 8. HELPERS & DOMAIN LOGIC
// ===================================================================

// --- Index Lookup for 3D Performance ---
export const colorIndexById = new Map<ColorId, number>(
    COLOR_OPTIONS.map((opt, idx) => [opt.id, idx])
);

export const getPaletteIndexById = (id: ColorId): number =>
    colorIndexById.get(id) ?? 0;

// --- Hex Lookup for UI/Canvas ---
export const colorLookupMap = new Map(COLOR_OPTIONS.map(option => [option.id, option]));

export const getHexById = (id: ColorId): HexColor =>
    colorLookupMap.get(id)?.hex || '#FFFFFF';


// --- THE NEW VISUAL RESOLVER ---
/**
 * Intercepts the raw user state and returns the ACTUAL colors the 3D model 
 * should render based on the active stain style.
 */

export const resolveVisualState = (config: GloveConfiguration): Record<ZoneKey, ColorId> => {
    const stainStyle = config.build.stainStyle;
    
    // 1. Copy EVERY zone's current color from the state so no clicks are lost
    const visualColors = {} as Record<ZoneKey, ColorId>;
    for (const key of Object.keys(config)) {
        if (key.startsWith('zone')) {
            visualColors[key as ZoneKey] = config[key as ZoneKey].colorId;
        }
    }

    // 2. Map the exact 3 Bat parts based on your UI
    const handleZone = ZONES.THUMB_OUTER;
    const barrelZone = ZONES.INDEX;
    const wartipZone = ZONES.THUMB_INNER;

    // 3. APPLY YOUR EXACT 4 RULES
    if (stainStyle === 'fd') {
        // FULL DIP: UI shows 'Bat Color' (Barrel). Handle and Tip must follow Barrel.
        visualColors[handleZone] = visualColors[barrelZone];
        visualColors[wartipZone] = visualColors[barrelZone];

    } else if (stainStyle === 'hd') {
        // HALF DIP: UI shows Handle and Barrel. Tip must follow Barrel.
        visualColors[wartipZone] = visualColors[barrelZone];

    } else if (stainStyle === 'wt') {
        // WARTIP: UI shows Bat Color (Barrel) and Tip Color. Handle must follow Barrel.
        visualColors[handleZone] = visualColors[barrelZone];

    } else if (stainStyle === 'dd') {
        // DOUBLE DIP: All 3 are independent. We do nothing.
    }

    return visualColors;
};

// ===================================================================
// 9. SANITIZATION LOGIC (THE "BOUNCER")
// ===================================================================

/**
 * Safely transitions from one build state to another, strictly enforcing 
 * the existence or non-existence of 'backStyle' based on the new position.
 */
export const updateBuild = (current: BuildConfig, updates: Partial<BuildConfig>): BuildConfig => {
    // Extract common keys directly. Back style is ignored and stripped if it exists.
    const base: BuildConfigBase = {
        palette: updates.palette ?? current.palette,
        imageSelection: updates.imageSelection ?? current.imageSelection,
        size: updates.size ?? current.size,
        stiffness: updates.stiffness ?? current.stiffness,
        webType: updates.webType ?? current.webType,
        fingerProtection: updates.fingerProtection ?? current.fingerProtection,
        stainStyle: updates.stainStyle ?? current.stainStyle, // <--- ADD THIS LINE
    };

    // Return the clean base and strictly lock the position to 'inf' (Bat)
    return {
        ...base,
        position: 'inf'
    } as BuildConfig;
};

export const deepCopy = <T,>(obj: T): T => {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
};

export const sanitize = (config: GloveConfiguration): GloveConfiguration => {
    let nextConfig = deepCopy(config);
    
    // 1. STRUCTURAL REPAIR (The Factory)
    // Running this ensures the object shape matches the Union, 
    // effectively stripping invalid keys from URL/Storage loads.
    // We pass empty updates {} effectively saying "rebuild yourself strictly".
    nextConfig.build = updateBuild(nextConfig.build, {});

    // 2. RE-RESOLVE LOOP (For dependent constraints)
    // Since forcedBackStyle is gone, this loop handles other future constraints.
    let iterations = 0;
    const MAX_ITERATIONS = 3; 
    while (iterations < MAX_ITERATIONS) {
        const def = resolveProduct(nextConfig.build);
        let changed = false;
        // (Add future constraints here if needed)
        if (!changed) break; 
        iterations++;
    }

    const def = resolveProduct(nextConfig.build);

    // 3. SANITIZE WEB TYPE
    if (!def.assets.validWebs[nextConfig.build.webType]) {
        // IMPROVEMENT: Cast keys to WebTypeId[] for safety now that the type is correct
        const validWebKeys = Object.keys(def.assets.validWebs) as WebTypeId[];
        if (validWebKeys.length > 0) {
            nextConfig.build.webType = validWebKeys[0];
        }
    }

    // --- NEW: SANITIZE BUILD OPTIONS ---
    // Validate Size
    if (!def.constraints.validSizes.includes(nextConfig.build.size)) {
        // Fallback to first valid size
        nextConfig.build.size = def.constraints.validSizes[0] as BuildSizeId;
    }

    // Validate Stiffness
    const validStiffnesses = STIFFNESS_PALETTES[def.stiffnessPaletteId];
    if (!validStiffnesses.includes(nextConfig.build.stiffness)) {
        nextConfig.build.stiffness = validStiffnesses[0];
    }

    // Validate Leather
    const validLeathers: readonly BuildLeatherId[] = LEATHER_PALETTES[def.leatherPaletteId];
    if (!validLeathers.includes(nextConfig.build.imageSelection)) {
        nextConfig.build.imageSelection = validLeathers[0];
    }

    // Validate Finger Protection
    const validProtections: readonly FingerProtectionId[] = FINGER_PROTECTION_PALETTES[def.fingerProtectionPaletteId];
    if (!validProtections.includes(nextConfig.build.fingerProtection)) {
        nextConfig.build.fingerProtection = validProtections[0];
    }

    // Validate Stain Style (NEW)
    const validStainStyles: readonly StainStyleId[] = STAIN_STYLE_PALETTES[def.stainStylePaletteId];
    if (!validStainStyles.includes(nextConfig.build.stainStyle)) {
        nextConfig.build.stainStyle = validStainStyles[0]; // Restored to keep TS valid
    }
    // -----------------------------------

    // 4. SANITIZE ZONES (Color Validation)
    const validColorIds = new Set(def.constraints.validPalette);
    const fallbackColor = def.constraints.validPalette[0] as ColorId;

    for (const key of Object.keys(nextConfig)) {
        if (key.startsWith('zone')) {
            const zoneKey = key as ZoneKey;
            const zoneState = nextConfig[zoneKey];
            if (zoneState && !validColorIds.has(zoneState.colorId)) {
                const zoneDef = def.zones[zoneKey];
                const newColor = zoneDef?.defaultColor || fallbackColor;
                nextConfig[zoneKey] = { colorId: newColor };
            }
        }
    }
    
    // Text Color Validation
    if (!validColorIds.has(nextConfig.thumbName.colorId)) {
        nextConfig.thumbName.colorId = fallbackColor;
    }
    if (!validColorIds.has(nextConfig.pinkyName.colorId)) { 
        nextConfig.pinkyName.colorId = fallbackColor;
    }

    // --- 5. ENFORCE STAIN STYLE HARD-SYNC ---
    // This physically overwrites the hidden state zones so that when you switch
    // between dip styles in the UI, the state doesn't hold onto conflicting "ghost" colors.
    const style = nextConfig.build.stainStyle;
    const handle = ZONES.THUMB_OUTER;
    const barrel = ZONES.INDEX;
    const tip = ZONES.THUMB_INNER;

    if (style === 'fd') {
        nextConfig[handle].colorId = nextConfig[barrel].colorId;
        nextConfig[tip].colorId = nextConfig[barrel].colorId;
    } else if (style === 'hd') {
        nextConfig[tip].colorId = nextConfig[barrel].colorId;
    } else if (style === 'wt') {
        nextConfig[handle].colorId = nextConfig[barrel].colorId;
    }

    return nextConfig;
};

// ===================================================================
// 10. PRESET HANDLING LOGIC
// ===================================================================

const fillMissing = (incoming: Partial<GloveConfiguration>): GloveConfiguration => {
    const base = deepCopy(PRESETS['open-back']);
    
    // Use Factory to merge safely. This prevents 'backStyle' from leaking 
    // from the base preset into a 'catcher' incoming config.
    const safeBuild = updateBuild(base.build, incoming.build || {});

    return {
        ...base,
        ...incoming,
        build: safeBuild
    };
};

export const getPresetConfig = (id: PresetId): GloveConfiguration => {
    const rawPreset = PRESETS[id];
    
    if (!rawPreset) {
        return deepCopy(PRESETS['open-back']);
    }

    return sanitize(fillMissing(rawPreset));
};

// ===================================================================
// 11. SERIALIZATION LAYER (URL HANDLING)
// ===================================================================

export const URL_KEY_MAP: { [key in ZoneKey | keyof Omit<GloveConfiguration, ZoneKey> | keyof BuildConfig]?: string } = {
    thumbName: 'tn',
    pinkyName: 'pn',
    palette: 'pa',
    imageSelection: 'is',
    position: 'po',
    size: 'sz',
    stiffness: 'sf',
    backStyle: 'bs',
    webType: 'wt',
    fingerProtection: 'fp', // <--- Add this
    stainStyle: 'ss', // <--- ADD THIS LINE
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
        // Object.entries on a Discriminated Union will ONLY iterate keys that actually exist.
        // So if backStyle was deleted by sanitize, it won't be here.
        const shortKey = URL_KEY_MAP[key as keyof typeof URL_KEY_MAP];
        if (shortKey) {
            pairs.push(`${shortKey}-${value}`);
        }
    }

    // 2. Serialize Text Parts
    const { thumbName, pinkyName } = config; // <--- Extract pinkyName
    
    const encodedThumbText = encodeText(thumbName.text);
    pairs.push(`${URL_KEY_MAP.thumbName}-${encodedThumbText}~${thumbName.font}~${thumbName.colorId}`);

    const encodedPinkyText = encodeText(pinkyName.text); // <--- ADD THIS BLOCK
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

        if (longKey === 'thumbName' || longKey === 'pinkyName') { // <--- CHANGE THIS LINE
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

    return sanitize(config);
};

export const cloneInitialConfig = (): GloveConfiguration =>
    deepCopy(initialState.configuration);

export const initialState: AppState = {
    configuration: PRESETS['open-back'],
    commerce: {
        variantId: null,
        quantity: 1,
    },
    isLoading: false,
    lastActivatedPartType: null,
};