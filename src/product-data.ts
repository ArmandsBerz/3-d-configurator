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
    { id: 'rd', name: 'Red', hex: '#C62828' },
    { id: 'pk', name: 'Pink', hex: '#AD1457' },
    { id: 'pu', name: 'Purple', hex: '#6A1B9A' },
    { id: 'in', name: 'Indigo', hex: '#4527A0' },
    { id: 'ry', name: 'Royal', hex: '#283593' },
    { id: 'bl', name: 'Blue', hex: '#1565C0' },
    { id: 'lb', name: 'Light Blue', hex: '#0277BD' },
    { id: 'tl', name: 'Teal', hex: '#00838F' },
    { id: 'gn', name: 'Green', hex: '#00695C' },
    { id: 'fr', name: 'Forest', hex: '#2E7D32' },
    { id: 'lm', name: 'Lime', hex: '#558B2F' },
    { id: 'ol', name: 'Olive', hex: '#9E9D24' },
    { id: 'gd', name: 'Gold', hex: '#F9A825' },
    { id: 'or', name: 'Orange', hex: '#FF8F00' },
    { id: 'bo', name: 'Burnt Orange', hex: '#EF6C00' },
    { id: 'ro', name: 'Red Orange', hex: '#D84315' },
    { id: 'br', name: 'Brown', hex: '#4E342E' },
    { id: 'ch', name: 'Charcoal', hex: '#424242' },
    { id: 'gy', name: 'Grey', hex: '#BDBDBD' },
    { id: 'sl', name: 'Slate', hex: '#37474F' },
    { id: 'bk', name: 'Black', hex: '#111111' }, // Added Black if missing
    { id: 'wt', name: 'White', hex: '#FFFFFF' }, // Added White if missing
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
    'inf': { label: 'Standard Bat' } // <--- Renamed so your UI actually says "Bat"
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
    'imgOpt1': { label: 'Japanese Kip' },
    'imgOpt2': { label: 'American Steerhide' },
    'imgOpt3': { label: 'Cowhide' } // Added Cowhide
} as const;

export type BuildLeatherId = keyof typeof LEATHER_REGISTRY;

export const LEATHER_PALETTES = {
    universal: ['imgOpt1', 'imgOpt2', 'imgOpt3'], // Added imgOpt3 for Fielding Gloves
    mitts: ['imgOpt1', 'imgOpt2'] // Original 2 options for Mitts
} as const satisfies Record<string, readonly BuildLeatherId[]>; //

export type LeatherPaletteId = keyof typeof LEATHER_PALETTES;


// --- 2. SIZE REGISTRY ---
export const SIZE_REGISTRY = {
    '1100': { label: '11"' },
    '1125': { label: '11.25"' },
    '1150': { label: '11.5"' },
    '1175': { label: '11.75"' },
    '1200': { label: '12"' },
    '1225': { label: '12.25"' },
    '1250': { label: '12.5"' },
    '1275': { label: '12.75"' },
    '1300': { label: '13"' },
    '3200': { label: '32"' },
    '3300': { label: '33"' },
    '3400': { label: '34"' }
} as const;

export type BuildSizeId = keyof typeof SIZE_REGISTRY;

export const SIZE_PALETTES = {
    openBack: ['1100', '1125', '1150', '1175', '1200', '1225', '1250', '1275'], // Updated sizes
    closeBack: ['1200', '1225', '1250', '1275', '1300'],
    firstBase: ['1300'], // Updated to only 13"
    catcher: ['3200', '3300', '3400']
} as const satisfies Record<string, readonly BuildSizeId[]>; //

export type SizePaletteId = keyof typeof SIZE_PALETTES;


// --- 3. HAND OPENING REGISTRY ---
export const HAND_OPENING_REGISTRY = {
    'adt': { label: 'Adult' },
    'yth': { label: 'Youth' }
} as const;

export type BuildHandId = keyof typeof HAND_OPENING_REGISTRY;

export const HAND_OPENING_PALETTES = {
    universal: ['adt', 'yth']
} as const satisfies Record<string, readonly BuildHandId[]>; //

export type HandOpeningPaletteId = keyof typeof HAND_OPENING_PALETTES;


// --- 4. STIFFNESS REGISTRY ---
export const STIFFNESS_REGISTRY = {
    'stf': { label: 'Stiff' },
    'std': { label: 'Standard' },
    'sft': { label: 'Soft' }
} as const;

export type BuildStiffnessId = keyof typeof STIFFNESS_REGISTRY;

export const STIFFNESS_PALETTES = {
    universal: ['stf', 'std', 'sft']
} as const satisfies Record<string, readonly BuildStiffnessId[]>; //

export type StiffnessPaletteId = keyof typeof STIFFNESS_PALETTES;


// --- 5. THROWING HAND REGISTRY ---
export const THROWING_HAND_REGISTRY = {
    'rh': { label: 'Right Hand' },
    'lh': { label: 'Left Hand' }
} as const;

export type BuildThrowingId = keyof typeof THROWING_HAND_REGISTRY;

export const THROWING_HAND_PALETTES = {
    universal: ['rh', 'lh']
} as const satisfies Record<string, readonly BuildThrowingId[]>; //

export type ThrowingHandPaletteId = keyof typeof THROWING_HAND_PALETTES;

// --- 5.5 PERSONALIZATION LABELS (THE CART DICTIONARY) ---
export const CART_LABELS = {
    THUMB_TEXT: "Thumb Name",
    THUMB_FONT: "Thumb Name Font",
    THUMB_COLOR: "Thumb Name Color",
    PINKY_TEXT: "Pinky Name",
    PINKY_FONT: "Pinky Name Font",
    PINKY_COLOR: "Pinky Name Color",
} as const;


// --- LEGACY SUPPORT (Derived from Registries) ---
// This ensures UI components importing these still work until Phase 3 migration.
export const leatherOptions = Object.entries(LEATHER_REGISTRY).map(([id, data]) => ({ id, title: data.label }));

export const FONT_REGISTRY = [
  { id: 'LOBSTER', label: 'Lobster', baseName: 'lobsterType', targetLineFactor: 0.51 },
  { id: 'ROBOTO', label: 'Roboto', baseName: 'robotoType', targetLineFactor: 0.51 },
] as const;

export const fontOptions = FONT_REGISTRY.map(font => ({ id: font.id, label: font.label }));
export type Font = (typeof FONT_REGISTRY)[number]['id'];

// --- 6. WEB REGISTRY (Refactored from Array) ---
export const WEB_REGISTRY = {
    'bsk': { label: 'Basket' },
    'bsl': { label: 'Basket Lace' },
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
    imageSelection: 'imgOpt1' | 'imgOpt2' | 'imgOpt3'; // Added imgOpt3
    size: BuildSizeId;
    handOpeningSize: BuildHandId;
    stiffness: BuildStiffnessId;
    throwingHand: BuildThrowingId;
    webType: WebTypeId;
    fingerProtection: FingerProtectionId;
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
    handOpeningPaletteId: HandOpeningPaletteId;
    throwingHandPaletteId: ThrowingHandPaletteId;
    positionPaletteId: PositionPaletteId;
    backStylePaletteId?: BackStylePaletteId; // <--- NEW: Optional!
    fingerProtectionPaletteId: FingerProtectionPaletteId;
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
    [ZONES.WEB]:        { shaderIndex: 30, displayName: 'Web', materialTarget: 'web', allowApplyToAll: true },
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
    [ZONES.FINGER_LOGO]: { shaderIndex: 21, displayName: 'Finger Logo', materialTarget: 'shell', allowApplyToAll: false },
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
    handOpeningPalette?: HandOpeningPaletteId;
    throwingHandPalette?: ThrowingHandPaletteId;
    backStylePalette?: BackStylePaletteId; // <--- NEW: Optional!
    fingerProtectionPalette: FingerProtectionPaletteId;
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
        handOpeningPaletteId: blueprint.handOpeningPalette || 'universal',
        throwingHandPaletteId: blueprint.throwingHandPalette || 'universal',
        positionPaletteId: 'universal',
        backStylePaletteId: blueprint.backStylePalette, // <--- Pass through!
        fingerProtectionPaletteId: blueprint.fingerProtectionPalette,
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
        fingerProtectionPalette: 'openBack',
        validWebs: { 
            bsk: 'basketOB', 
            bsl: 'basketLaceOB' 
        },
        specificZones: {
            [ZONES.THUMB_INNER]:    { shaderIndex: 1, displayName: 'Inner Thumb' },
            [ZONES.INDEX]:          { shaderIndex: 2, displayName: 'Index Finger' },
            [ZONES.MIDDLE_INNER]:   { shaderIndex: 3, displayName: 'Inner Middle' },
            [ZONES.MIDDLE_OUTER]:   { shaderIndex: 4, displayName: 'Outer Middle' },
            [ZONES.RING_INNER]:     { shaderIndex: 5, displayName: 'Inner Ring' },
            [ZONES.RING_OUTER]:     { shaderIndex: 6, displayName: 'Outer Ring' },
        },
        uiGroups: [
            { id: 'web', type: 'gallery', title: 'Web' },
            { id: 'thumbGroup', type: 'dual', title: 'Thumb Color', outerZoneKey: ZONES.THUMB_OUTER, innerZoneKey: ZONES.THUMB_INNER },
            { id: 'indexGroup', type: 'single', title: 'Index Color', zoneKey: ZONES.INDEX },
            { id: 'middleGroup', type: 'dual', title: 'Middle Color', outerZoneKey: ZONES.MIDDLE_OUTER, innerZoneKey: ZONES.MIDDLE_INNER },
            { id: 'ringGroup', type: 'dual', title: 'Ring Color', outerZoneKey: ZONES.RING_OUTER, innerZoneKey: ZONES.RING_INNER },
            { id: 'pinkyGroup', type: 'dual', title: 'Pinky Color', outerZoneKey: ZONES.PINKY_OUTER, innerZoneKey: ZONES.PINKY_INNER },
            { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
            { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
            { id: 'weltingGroup', type: 'single', title: 'Welting Color', zoneKey: ZONES.WELTING },
            { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
            { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
            { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
            { id: 'padHoodGroup', type: 'single', title: 'Pad/Hood Color', zoneKey: ZONES.PAD_HOOD },
            { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
            { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
            { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
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
        build: { palette: 'universal', imageSelection: 'imgOpt1', position: 'inf', size: '1100', handOpeningSize: 'adt', stiffness: 'std', throwingHand: 'rh', webType: 'bsk', fingerProtection: 'non' },
        thumbName: { type: 'text', text: 'Thumb', font: 'LOBSTER', colorId: 'gy' },
        pinkyName: { type: 'text', text: 'Pinky', font: 'ROBOTO', colorId: 'sl' },
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
        handOpeningSize: updates.handOpeningSize ?? current.handOpeningSize,
        stiffness: updates.stiffness ?? current.stiffness,
        throwingHand: updates.throwingHand ?? current.throwingHand,
        webType: updates.webType ?? current.webType,
        fingerProtection: updates.fingerProtection ?? current.fingerProtection,
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

    // Validate Hand Opening
    const validHandOpenings = HAND_OPENING_PALETTES[def.handOpeningPaletteId];
    if (!validHandOpenings.includes(nextConfig.build.handOpeningSize)) {
        nextConfig.build.handOpeningSize = validHandOpenings[0];
    }

    // Validate Throwing Hand
    const validThrowingHands = THROWING_HAND_PALETTES[def.throwingHandPaletteId];
    if (!validThrowingHands.includes(nextConfig.build.throwingHand)) {
        nextConfig.build.throwingHand = validThrowingHands[0];
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
    handOpeningSize: 'ho',
    stiffness: 'sf',
    throwingHand: 'th',
    backStyle: 'bs',
    webType: 'wt',
    fingerProtection: 'fp', // <--- Add this
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