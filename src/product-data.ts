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

// --- PALETTE SYSTEM IMPLEMENTATION ---
export const PALETTES = {
    universal: COLOR_OPTIONS
} as const;

export type PaletteId = keyof typeof PALETTES;
export type ColorId = typeof COLOR_OPTIONS[number]['id'];

export const FONT_REGISTRY = [
  { id: 'LOBSTER', label: 'Lobster', baseName: 'lobsterType', targetLineFactor: 0.51 },
  { id: 'ROBOTO', label: 'Roboto', baseName: 'robotoType', targetLineFactor: 0.51 },
] as const;

export const fontOptions = FONT_REGISTRY.map(font => ({ id: font.id, label: font.label }));
export type Font = (typeof FONT_REGISTRY)[number]['id'];

// Build Options Data
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

export const leatherOptions = [
    { id: 'imgOpt1', title: 'Japanese Kip' },
    { id: 'imgOpt2', title: 'American Steerhide' }
];

// Derived Types
export type BuildPositionId = typeof buildOptionsData[0]['options'][number]['id'];
export type BuildSizeId = typeof buildOptionsData[1]['options'][number]['id'];
export type BuildHandId = typeof buildOptionsData[2]['options'][number]['id'];
export type BuildStiffnessId = typeof buildOptionsData[3]['options'][number]['id'];
export type BuildThrowingId = typeof buildOptionsData[4]['options'][number]['id'];
export type BuildBackId = 'opn' | 'cls';
export type WebTypeId = typeof webTypeOptions[number]['id'];

export interface BuildConfig {
    palette: PaletteId;
    imageSelection: 'imgOpt1' | 'imgOpt2';
    position: BuildPositionId;
    size: BuildSizeId;
    handOpeningSize: BuildHandId;
    stiffness: BuildStiffnessId;
    throwingHand: BuildThrowingId;
    backStyle: BuildBackId;
    webType: WebTypeId;
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
    id: string; // e.g. 'catchers'
    
    // A. ASSETS (3D Source of Truth)
    assets: {
        shellModel: string; // 'catchers.glb'
        // STRICT MAP: Only the webs that exist for this shell
        validWebs: Record<string, string>; 
    };

    // B. STRUCTURE (Physics Source of Truth)
    // A zone ONLY exists if it is in this record.
    zones: Record<string, ZoneDefinition>;

    // C. UI (Menu Source of Truth)
    uiGroups: UIPartGroup[];

    // D. CONSTRAINTS (Business Rules)
    constraints: {
        forcedBackStyle?: 'opn' | 'cls';
        validPalette: string[]; // Whitelist of color IDs
    };
}

// ===================================================================
// 4. THE COMPILER (FACTORY & VALIDATOR)
// ===================================================================

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
    forcedBackStyle?: 'opn' | 'cls';
}

// Simple Deep Freeze Implementation
const deepFreeze = <T>(obj: T): T => {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(obj);

    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = (obj as any)[name];
        if (value && typeof value === "object") {
            deepFreeze(value);
        }
    }

    return Object.freeze(obj);
};

const compileProduct = (blueprint: ProductBlueprint): ProductDefinition => {
    // 1. Merge Zones (Composition)
    const finalZones: Record<string, ZoneDefinition> = { ...UNIVERSAL_PARTS };

    Object.entries(blueprint.specificZones).forEach(([key, override]) => {
        // If it exists in universal, merge it. If not, add it.
        const base = finalZones[key] || { 
            allowApplyToAll: true, 
            materialTarget: 'shell', 
            shaderIndex: 0, 
            displayName: 'Unknown' 
        };
        finalZones[key] = { ...base, ...override };
    });

    // 2. VALIDATION (Fail Fast)
    // Check A: Do all UI groups point to existing zones?
    blueprint.uiGroups.forEach(group => {
        if (group.type === 'single' && !finalZones[group.zoneKey]) {
            throw new Error(`[Registry Error] Product '${blueprint.id}' UI refers to missing zone: ${group.zoneKey}`);
        }
        if (group.type === 'dual') {
            if (!finalZones[group.outerZoneKey]) throw new Error(`[Registry Error] Product '${blueprint.id}' missing outer: ${group.outerZoneKey}`);
            if (!finalZones[group.innerZoneKey]) throw new Error(`[Registry Error] Product '${blueprint.id}' missing inner: ${group.innerZoneKey}`);
        }
    });

    // Check B: Asset Completeness (The "404 Prevention")
    // Note: In a real app, you might validate 'validWebs' against a known list of GLB files.
    // For now, we trust the keys provided in the blueprint are correct filenames.

    // 3. DEEP FREEZE (Immutability)
    const cartridge: ProductDefinition = {
        id: blueprint.id,
        assets: {
            shellModel: blueprint.shellModel,
            validWebs: blueprint.validWebs
        },
        zones: finalZones,
        uiGroups: blueprint.uiGroups,
        constraints: {
            forcedBackStyle: blueprint.forcedBackStyle,
            validPalette: COLOR_OPTIONS.map(c => c.id) // Default to all colors
        }
    };

    return deepFreeze(cartridge);
};

// ===================================================================
// 5. THE REGISTRY (COMPILED CARTRIDGES)
// ===================================================================

const PRODUCT_REGISTRY = {
    'open-back': compileProduct({
        id: 'open-back',
        shellModel: 'openBack',
        validWebs: { 
            bsk: 'basketOB', bsl: 'basketLaceOB', clv: 'closedVOB', dhn: 'dualHingeOB', 
            fmt: 'framedModTrapOB', hwb: 'hOB', iwb: 'iOB', lch: 'lacedHOB', lcs: 'laceSealingOB', 
            mtp: 'modTrapOB', '1pc': 'onePieceOB', slg: 'sealingOB', sp: 'singlePostOB', 
            spl: 'singlePostLaceOB', trp: 'trapOB', '2pc': 'twoPieceOB' 
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
    }),

    'close-back': compileProduct({
        id: 'close-back',
        shellModel: 'closeBack',
        forcedBackStyle: 'cls', // Constraint
        validWebs: { 
            bsk: 'basketCB', clv: 'closedVCB', dhn: 'dualHingeCB', fmt: 'framedModTrapCB', 
            hwb: 'hCB', lch: 'lacedHCB', lcs: 'laceSealingCB', mtp: 'modTrapCB', 
            '1pc': 'onePieceCB', slg: 'sealingCB', trp: 'trapCB' 
        },
        specificZones: {
            [ZONES.THUMB_INNER]:    { shaderIndex: 1, displayName: 'Primary U-Piece' },
            [ZONES.MIDDLE_OUTER]:   { shaderIndex: 4, displayName: 'Middle Outer/Ring Inner' },
            [ZONES.RING_OUTER]:     { shaderIndex: 6, displayName: 'Ring Outer/Pinky Inner' },
            // Fingers merged in this model
        },
        uiGroups: [
            { id: 'web', type: 'gallery', title: 'Web' },
            { id: 'thumbOuterGroup', type: 'single', title: 'Outer Thumb Color', zoneKey: ZONES.THUMB_OUTER },
            { id: 'primaryUPieceGroup', type: 'single', title: 'Primary U-Piece Color', zoneKey: ZONES.THUMB_INNER },
            { id: 'middleOuterRingInnerGroup', type: 'single', title: 'Middle/Ring Inner Color', zoneKey: ZONES.MIDDLE_OUTER },
            { id: 'ringOuterPinkyInnerGroup', type: 'single', title: 'Ring/Pinky Inner Color', zoneKey: ZONES.RING_OUTER },
            { id: 'pinkyOuterGroup', type: 'single', title: 'Outer Pinky Color', zoneKey: ZONES.PINKY_OUTER },
            { id: 'wristStrapGroup', type: 'single', title: 'Wrist Strap Color', zoneKey: ZONES.WRIST_STRAP },
            { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
            { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
            { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
            { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
            { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
            { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
            { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
            { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
        ]
    }),

    'first-base': compileProduct({
        id: 'first-base',
        shellModel: 'firstBase',
        validWebs: { pst: 'postFB', '2pc': 'twoPieceFB' },
        specificZones: {
            [ZONES.THUMB_INNER]:    { shaderIndex: 1, displayName: 'Primary U-Piece' },
            [ZONES.INDEX]:          { shaderIndex: 2, displayName: 'Shell Back' },
        },
        uiGroups: [
            { id: 'web', type: 'gallery', title: 'Web' },
            { id: 'thumbOuterGroup', type: 'single', title: 'Outer Thumb Color', zoneKey: ZONES.THUMB_OUTER },
            { id: 'primaryUPieceGroup', type: 'single', title: 'Primary U-Piece Color', zoneKey: ZONES.THUMB_INNER },
            { id: 'shellBackGroup', type: 'single', title: 'Shell Back Color', zoneKey: ZONES.INDEX },
            { id: 'wristGroup', type: 'single', title: 'Wrist Color', zoneKey: ZONES.WRIST },
            { id: 'padHoodGroup', type: 'single', title: 'Pad/Hood Color', zoneKey: ZONES.PAD_HOOD },
            { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
            { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
            { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
            { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
            { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
            { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
            { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
            { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
        ]
    }),

    'catchers': compileProduct({
        id: 'catchers',
        shellModel: 'catchers',
        forcedBackStyle: 'opn', 
        validWebs: { '2pc': 'twoPieceCM' },
        specificZones: {
            [ZONES.INDEX]: { shaderIndex: 2, displayName: 'Shell Back' },
            [ZONES.MIDDLE_INNER]: { shaderIndex: 3, displayName: 'Shell Base' },
            [ZONES.MIDDLE_OUTER]: { shaderIndex: 4, displayName: 'Rails' },
        },
        uiGroups: [
            { id: 'web', type: 'gallery', title: 'Web' },
            { id: 'shellBackGroup', type: 'single', title: 'Shell Back Color', zoneKey: ZONES.INDEX },
            { id: 'shellBaseGroup', type: 'single', title: 'Shell Base Color', zoneKey: ZONES.MIDDLE_INNER },
            { id: 'railsGroup', type: 'single', title: 'Rails Color', zoneKey: ZONES.MIDDLE_OUTER },
            { id: 'wristGroup', type: 'single', title: 'Wrist Color', zoneKey: ZONES.WRIST },
            { id: 'padHoodGroup', type: 'single', title: 'Pad/Hood Color', zoneKey: ZONES.PAD_HOOD },
            { id: 'laceGroup', type: 'single', title: 'Lace Color', zoneKey: ZONES.LACE },
            { id: 'bindingGroup', type: 'single', title: 'Binding Color', zoneKey: ZONES.BINDING },
            { id: 'stitchingGroup', type: 'single', title: 'Stitching Color', zoneKey: ZONES.STITCHING },
            { id: 'palmGroup', type: 'single', title: 'Palm Color', zoneKey: ZONES.PALM },
            { id: 'linerGroup', type: 'single', title: 'Liner Color', zoneKey: ZONES.LINER },
            { id: 'fingerLogoGroup', type: 'single', title: 'Finger Logo Color', zoneKey: ZONES.FINGER_LOGO },
            { id: 'wristLogoGroup', type: 'single', title: 'Wrist Logo Color', zoneKey: ZONES.WRIST_LOGO },
            { id: 'wristLogoOutlineGroup', type: 'single', title: 'Wrist Logo Outline Color', zoneKey: ZONES.WRIST_LOGO_OUTLINE },
        ]
    }),
};

// ===================================================================
// 6. THE RESOLVER API (THE ROUTER)
// ===================================================================

export const resolveProduct = (build: BuildConfig): ProductDefinition => {
    // 1. Position Routing
    if (build.position === 'cat') return PRODUCT_REGISTRY['catchers'];
    if (build.position === 'fb') return PRODUCT_REGISTRY['first-base'];
    
    // 2. Back Style Routing (Outfield/Pitcher/Infield)
    if (['out', 'pit'].includes(build.position)) {
        return build.backStyle === 'cls' 
            ? PRODUCT_REGISTRY['close-back'] 
            : PRODUCT_REGISTRY['open-back'];
    }
    
    // 3. Default (Infield -> Open Back)
    return PRODUCT_REGISTRY['open-back'];
};

// ===================================================================
// 7. THE PRESETS (DEFAULT STATES)
// ===================================================================

export const PRESETS = {
    'open-back': {
        build: { palette: 'universal', imageSelection: 'imgOpt1', position: 'inf', size: '1100', handOpeningSize: 'adt', stiffness: 'std', throwingHand: 'rh', backStyle: 'opn', webType: 'mtp' },
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

    'close-back': {
        build: { palette: 'universal', imageSelection: 'imgOpt1', position: 'out', size: '1275', handOpeningSize: 'adt', stiffness: 'std', throwingHand: 'rh', backStyle: 'cls', webType: 'hwb' },
        thumbName: { type: 'text', text: 'Close', font: 'LOBSTER', colorId: 'gy' },
        pinkyName: { type: 'text', text: 'Back', font: 'ROBOTO', colorId: 'sl' },
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

    'first-base': {
        build: { palette: 'universal', imageSelection: 'imgOpt1', position: 'fb', size: '1250', handOpeningSize: 'adt', stiffness: 'std', throwingHand: 'rh', backStyle: 'opn', webType: 'pst' },
        thumbName: { type: 'text', text: 'First', font: 'LOBSTER', colorId: 'br' },
        pinkyName: { type: 'text', text: 'Base', font: 'ROBOTO', colorId: 'br' },
        [ZONES.THUMB_INNER]:    { colorId: 'or' },
        [ZONES.INDEX]:          { colorId: 'or' },
        [ZONES.WEB]:            { colorId: 'br' },
        [ZONES.WRIST]:          { colorId: 'or' },
        [ZONES.PAD_HOOD]:       { colorId: 'br' },
        [ZONES.THUMB_OUTER]:    { colorId: 'or' },
        [ZONES.PALM]:           { colorId: 'or' },
        [ZONES.LINER]:          { colorId: 'ch' },
        [ZONES.BINDING]:        { colorId: 'br' },
        [ZONES.WELTING]:        { colorId: 'br' },
        [ZONES.LACE]:           { colorId: 'br' },
        [ZONES.STITCHING]:      { colorId: 'gd' },
        [ZONES.WRIST_LOGO]:     { colorId: 'gd' },
        [ZONES.WRIST_LOGO_OUTLINE]: { colorId: 'br' },
        [ZONES.FINGER_LOGO]:    { colorId: 'gd' },
        [ZONES.MIDDLE_INNER]:   { colorId: 'or' },
        [ZONES.MIDDLE_OUTER]:   { colorId: 'or' },
        [ZONES.RING_INNER]:     { colorId: 'or' },
        [ZONES.RING_OUTER]:     { colorId: 'or' },
        [ZONES.WRIST_STRAP]:    { colorId: 'or' },
        [ZONES.PINKY_INNER]:    { colorId: 'or' },
        [ZONES.PINKY_OUTER]:    { colorId: 'or' },
    } as GloveConfiguration,

    'catchers': {
        build: { palette: 'universal', imageSelection: 'imgOpt1', position: 'cat', size: '1200', handOpeningSize: 'adt', stiffness: 'std', throwingHand: 'rh', backStyle: 'opn', webType: '2pc' },
        thumbName: { type: 'text', text: 'Catcher', font: 'LOBSTER', colorId: 'gd' },
        pinkyName: { type: 'text', text: 'Mitt', font: 'ROBOTO', colorId: 'gd' },
        [ZONES.THUMB_INNER]:    { colorId: 'bl' }, 
        [ZONES.INDEX]:          { colorId: 'bl' }, 
        [ZONES.MIDDLE_INNER]:   { colorId: 'rd' }, 
        [ZONES.MIDDLE_OUTER]:   { colorId: 'rd' }, 
        [ZONES.RING_INNER]:     { colorId: 'bl' },
        [ZONES.RING_OUTER]:     { colorId: 'bl' },
        [ZONES.WEB]:            { colorId: 'bl' },
        [ZONES.WRIST]:          { colorId: 'bl' },
        [ZONES.WRIST_STRAP]:    { colorId: 'bl' },
        [ZONES.PAD_HOOD]:       { colorId: 'rd' },
        [ZONES.THUMB_OUTER]:    { colorId: 'bl' }, 
        [ZONES.PINKY_INNER]:    { colorId: 'bl' },
        [ZONES.PINKY_OUTER]:    { colorId: 'bl' },
        [ZONES.PALM]:           { colorId: 'bl' },
        [ZONES.LINER]:          { colorId: 'gy' },
        [ZONES.BINDING]:        { colorId: 'gd' },
        [ZONES.WELTING]:        { colorId: 'gd' },
        [ZONES.LACE]:           { colorId: 'gd' },
        [ZONES.STITCHING]:      { colorId: 'rd' },
        [ZONES.WRIST_LOGO]:     { colorId: 'rd' },
        [ZONES.WRIST_LOGO_OUTLINE]: { colorId: 'gd' },
        [ZONES.FINGER_LOGO]:    { colorId: 'rd' },
    } as GloveConfiguration
} as const;

export type PresetId = keyof typeof PRESETS;

export const initialState: AppState = {
    configuration: PRESETS['open-back'],
    commerce: {
        variantId: null,
        quantity: 1,
    },
    isLoading: false,
    lastActivatedPartType: null,
};