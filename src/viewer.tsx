// src/viewer.tsx

import React, { useEffect, useRef, createContext, useContext } from 'react';
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    Animation,
    CubicEase,
    EasingFunction,
    HemisphericLight,
    Mesh,
    Color4,
    AssetContainer,
    SceneLoader,
    PBRMaterial,
    MaterialPluginBase,
    PBRBaseMaterial,
    MaterialDefines,
    UniformBuffer,
    Constants,
    Color3,
    DynamicTexture,
    Texture,
    RawTexture,
    SubMesh,
    AbstractMesh,
    CubeTexture,
} from '@babylonjs/core';
import "@babylonjs/loaders";
import { 
    COLOR_OPTIONS, 
    FONT_REGISTRY, 
    Font,
    resolveVisualState,      // <--- ADD THIS
    getPaletteIndexById,     // <--- ADD THIS
    ProductDefinition,       // <--- ADD THIS (for typing)
    GloveConfiguration,      // <--- ADD THIS (for typing)
    ZoneKey                  // <--- ADD THIS
 } from './product-data';

// --- INTERFACE FOR PLUGIN CONFIGURATION ---
interface ColorSwapConfig {
    baseColors: string[];
    initialReplacements: Color3[];
}

// --- Helper function for Step 2 & 3 ---
function encodeIndexAsColor(index: number): string {
    const clampedIndex = Math.max(0, Math.min(index, 255));
    return `rgb(${clampedIndex}, 0, 0)`;
}

// --- REFACTORED PLUGIN CODE ---
class ColorSwapPlugin extends MaterialPluginBase {
    private _baseLUT!: RawTexture;
    private _pointerLUT!: RawTexture;
    private _pointerBuf!: Uint8Array;
    private _paletteLUT!: Texture;
    private _zoneCount = 32;
    private _paletteColorCount = 20;

    public blendRadius = 1.01;
    public blendStrength = 1.5;
    public enableSdf = 1.0;
    
    // --- NEW: Added for Clear Coat Tint Multiplier ---
    public tintRatio = 1; 

    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;

    private _sdfTex?: Texture;
    public setSDFTexture(t: Texture) { this._sdfTex = t; }

    // --- NEW: Custom sampler for ID Map so Albedo can hold the wood grain ---
    private _idTex?: Texture;
    public setIDTexture(t: Texture) { this._idTex = t; }

    constructor(material: PBRBaseMaterial, config: ColorSwapConfig) {
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];

        if (!config || !config.baseColors || !config.initialReplacements) {
            console.error("ColorSwapPlugin: Invalid configuration provided.");
            return;
        }
        this._zoneCount = config.baseColors.length || 32;
        this._paletteColorCount = config.initialReplacements.length || 20;

        if (this._zoneCount === 0 || this._paletteColorCount === 0) return;
        if (this._paletteColorCount > 255) return;

        const scene = material.getScene();

        // baseLUT
        const baseBuf = new Uint8Array(this._zoneCount * 3);
        {
            let o = 0;
            for (let i = 0; i < this._zoneCount; i++) {
                const hex = config.baseColors[i] ?? "#000000";
                const lin = Color3.FromHexString(hex).toLinearSpace();
                baseBuf[o++] = Math.round(lin.r * 255);
                baseBuf[o++] = Math.round(lin.g * 255);
                baseBuf[o++] = Math.round(lin.b * 255);
            }
            this._baseLUT = RawTexture.CreateRGBTexture(
                baseBuf,
                this._zoneCount,
                1,
                scene,
                true,
                false,
                Constants.TEXTURE_NEAREST_SAMPLINGMODE,
                Constants.TEXTURETYPE_UNSIGNED_BYTE
            );
            this._baseLUT.gammaSpace = false;
            this._baseLUT.wrapU = this._baseLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        }

        // pointerLUT
        this._pointerBuf = new Uint8Array(this._zoneCount * 3);
        {
            let o = 0;
            for (let i = 0; i < this._zoneCount; i++) {
                const idx = i % this._paletteColorCount;
                this._pointerBuf[o++] = idx;
                this._pointerBuf[o++] = 0;
                this._pointerBuf[o++] = 0;
            }
            this._pointerLUT = RawTexture.CreateRGBTexture(
                this._pointerBuf,
                this._zoneCount,
                1,
                scene,
                true,
                false,
                Constants.TEXTURE_NEAREST_SAMPLINGMODE,
                Constants.TEXTURETYPE_UNSIGNED_BYTE
            );
            this._pointerLUT.gammaSpace = false;
            this._pointerLUT.wrapU = this._pointerLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        }

        // paletteLUT
        const paletteBufferSize = this._paletteColorCount * 3;
        const paletteBuffer = new Uint8Array(paletteBufferSize);
        let bufferIndex = 0;
        for (const color of config.initialReplacements) {
            paletteBuffer[bufferIndex++] = Math.round(color.r * 255);
            paletteBuffer[bufferIndex++] = Math.round(color.g * 255);
            paletteBuffer[bufferIndex++] = Math.round(color.b * 255);
        }

        this._paletteLUT = RawTexture.CreateRGBTexture(
            paletteBuffer,
            this._paletteColorCount,
            1,
            scene,
            false,
            false,
            Constants.TEXTURE_NEAREST_SAMPLINGMODE,
            Constants.TEXTURETYPE_UNSIGNED_BYTE
        );
        this._paletteLUT.gammaSpace = false;
        this._paletteLUT.wrapU = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        this._paletteLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;

        this.isEnabled = true;
    }

    public updateZonePaletteIndex(zoneIndex: number, paletteIndex: number): void {
        if (zoneIndex < 0 || zoneIndex >= this._zoneCount) return;
        if (paletteIndex < 0 || paletteIndex >= this._paletteColorCount) return;

        const o = zoneIndex * 3;
        this._pointerBuf[o] = paletteIndex;
        this._pointerLUT.update(this._pointerBuf);
    }

    public dispose() {
        this._baseLUT?.dispose();
        this._pointerLUT?.dispose();
        this._paletteLUT?.dispose();
        super.dispose();
    }

    get isEnabled() { return this._isEnabled; }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled) return;
        this._isEnabled = enabled;
        this._markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    public getSamplers(samplers: string[]) {
        samplers.push("baseLUT");
        samplers.push("pointerLUT");
        samplers.push("paletteLUT");
        samplers.push("sdfTex");
        samplers.push("idTex"); // <--- NEW: Request ID texture sampler
    }

    prepareDefines(defines: MaterialDefines) {
        defines["COLOR_SWAP"] = this._isEnabled;
    }

    getUniforms() {
        return {
            ubo: [
                { name: "blendRadius", size: 1, type: "float" },
                { name: "blendStrength", size: 1, type: "float" },
                { name: "u_enableSdf", size: 1, type: "float" },
                { name: "tintRatio", size: 1, type: "float" }, // <--- NEW: Send slider to GPU
            ],
            fragment: `
#ifdef COLOR_SWAP
uniform float blendRadius;
uniform float blendStrength;
uniform float u_enableSdf;
uniform float tintRatio;
#endif
`
        };
    }

    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine, subMesh: SubMesh) {
        if (this._isEnabled && this._baseLUT && this._pointerLUT && this._paletteLUT) {
            uniformBuffer.updateFloat("blendRadius", this.blendRadius);
            uniformBuffer.updateFloat("blendStrength", this.blendStrength);
            uniformBuffer.updateFloat("u_enableSdf", this.enableSdf);
            uniformBuffer.updateFloat("tintRatio", this.tintRatio); // <--- NEW: Bind slider value

            const effect = this._material?.getEffect();
            if (effect) {
                effect.setTexture("baseLUT", this._baseLUT);
                effect.setTexture("pointerLUT", this._pointerLUT);
                effect.setTexture("paletteLUT", this._paletteLUT);
                if (this._sdfTex) effect.setTexture("sdfTex", this._sdfTex);
                if (this._idTex) effect.setTexture("idTex", this._idTex); // <--- NEW: Bind ID texture
            }
        }
    }

    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            const definitionsGLSL = `
                const int ZONE_COUNT = ${this._zoneCount};
                const int PALETTE_COUNT = ${this._paletteColorCount};

                #ifdef COLOR_SWAP
                uniform sampler2D baseLUT;
                uniform sampler2D pointerLUT;
                uniform sampler2D paletteLUT;
                uniform sampler2D sdfTex;
                uniform sampler2D idTex; 

                int decodeIndex(vec4 c) { return int(c.r * 255.0 + 0.5); }

                #ifdef WEBGL2
                    #define FETCH_BASE(ix)    texelFetch(baseLUT,    ivec2(ix, 0), 0)
                    #define FETCH_POINTER(ix) texelFetch(pointerLUT, ivec2(ix, 0), 0)
                    #define FETCH_PALETTE(ix) texelFetch(paletteLUT, ivec2(ix, 0), 0)
                #else
                    vec2 uv1D(int ix, int W){ return (vec2(float(ix)+0.5, 0.5) / vec2(float(W), 1.0)); }
                    #define FETCH_BASE(ix)    texture2D(baseLUT,    uv1D(ix, ZONE_COUNT))
                    #define FETCH_POINTER(ix) texture2D(pointerLUT, uv1D(ix, ZONE_COUNT))
                    #define FETCH_PALETTE(ix) texture2D(paletteLUT, uv1D(ix, PALETTE_COUNT))
                #endif

                vec3 srgbToLinear(vec3 c){
                  vec3 lo = c / 12.92;
                  vec3 hi = pow((c + 0.055) / 1.055, vec3(2.4));
                  return mix(lo, hi, step(vec3(0.04045), c));
                }

                int closestZone(vec3 idColor) {
                  int bestI = 0;
                  float bestD = 1e9;
                  for (int i = 0; i < ZONE_COUNT; ++i) {
                    vec3 b = FETCH_BASE(i).rgb;
                    vec3 d = idColor - b;
                    float dd = dot(d, d);
                    if (dd < bestD) { bestD = dd; bestI = i; }
                  }
                  return bestI;
                }

                int findZone(vec3 idColor) {
                  const float ID_TOL = 0.5 / 255.0;
                  for (int i = 0; i < ZONE_COUNT; ++i) {
                    vec3 b = FETCH_BASE(i).rgb;
                    if (all(lessThan(abs(idColor - b), vec3(ID_TOL)))) {
                      return i;
                    }
                  }
                  return closestZone(idColor);
                }

                vec3 zoneToPalette(int zone) {
                  int p = decodeIndex(FETCH_POINTER(zone));
                  return FETCH_PALETTE(p).rgb;
                }
                #endif
            `;

            const updateAlbedoGLSL = `
#ifdef COLOR_SWAP
if (u_enableSdf > 0.5) {
  // --- ADVANCED UV-SPACE SDF LOGIC ---
  float sd = texture2D(sdfTex, vMainUV1).r;
  float texel = 1.0 / 2048.0;

  // 1. Calculate TRUE gradient purely in UV Space 
  // We sample the SDF at an offset to see which way the "hill" goes
  float sdU = texture2D(sdfTex, vMainUV1 + vec2(texel, 0.0)).r;
  float sdV = texture2D(sdfTex, vMainUV1 + vec2(0.0, texel)).r;
  
  vec2 uvGrad = vec2(sdU - sd, sdV - sd);
  float glen = max(length(uvGrad), 1e-6);
  vec2 uvDir = uvGrad / glen; 

  // 2. Calculate dynamic step size based on screen fwidth
  float screenPx = max(fwidth(vMainUV1.x) + fwidth(vMainUV1.y), 1e-5);
  float minStep = texel * 1.5; 
  float samplingStep = max(screenPx, minStep); 

  // 3. Step INWARD and OUTWARD along the gradient to find the two zones
  vec2 duv = uvDir * samplingStep;
  vec3 idIn  = srgbToLinear(texture2D(idTex, vMainUV1 + duv).rgb);
  vec3 idOut = srgbToLinear(texture2D(idTex, vMainUV1 - duv).rgb);

  vec3 palIn  = zoneToPalette(findZone(idIn));
  vec3 palOut = zoneToPalette(findZone(idOut));

  // 4. Smoothstep blend based on the SDF value (0.5 is the edge)
  float sd_fwidth = fwidth(sd);
  float wMin = 0.8 * screenPx; 
  float w    = max(max(sd_fwidth * blendStrength, 1e-6), wMin);
  float t = smoothstep(0.5 - blendRadius * w, 0.5 + blendRadius * w, sd);
  
  // 5. Apply the swapped color to the Albedo (Multiply for wood/leather detail)
  surfaceAlbedo.rgb *= mix(palOut, palIn, t);

} else {
  // --- HIGH QUALITY FALLBACK (4-TAP GAUSSIAN BLUR) ---
  vec3  id0 = srgbToLinear(texture2D(idTex, vMainUV1).rgb);
  float L0  = dot(id0, vec3(0.299, 0.587, 0.114));
  vec2  g   = vec2(dFdx(L0), dFdy(L0));
  float glen = max(length(g), 1e-6);
  vec2  dir  = g / glen;

  float screenFp = max(fwidth(vMainUV1.x) + fwidth(vMainUV1.y), 1e-5);
  float minFp = (1.0 / 2048.0) * 1.5;
  float samplingFp = max(screenFp, minFp);
  
  vec2  duv = dir * samplingFp;

  vec3 idS0 = srgbToLinear(texture2D(idTex, vMainUV1 - 1.5 * duv).rgb);
  vec3 idS1 = srgbToLinear(texture2D(idTex, vMainUV1 - 0.5 * duv).rgb);
  vec3 idS2 = srgbToLinear(texture2D(idTex, vMainUV1 + 0.5 * duv).rgb);
  vec3 idS3 = srgbToLinear(texture2D(idTex, vMainUV1 + 1.5 * duv).rgb);

  vec3 accum = (zoneToPalette(findZone(idS0)) * 0.2) +
               (zoneToPalette(findZone(idS1)) * 0.3) +
               (zoneToPalette(findZone(idS2)) * 0.3) +
               (zoneToPalette(findZone(idS3)) * 0.2);

  surfaceAlbedo.rgb *= accum;
}
#endif
`;
            return {
                "CUSTOM_FRAGMENT_DEFINITIONS": definitionsGLSL,
                "CUSTOM_FRAGMENT_UPDATE_ALBEDO": updateAlbedoGLSL
            };
        }
        return null;
    }
}

// --- AssetManager Class ---
class AssetManager {
    private cache = new Map<string, Promise<AssetContainer>>();
    constructor(private scene: Scene) { }
    private _handlePreloadError(assetName: string, error: unknown): void {
        if (process.env.NODE_ENV === 'development') {
            const message = error instanceof Error ? error.message : String(error);
            console.debug(`[AssetManager] Preload failed for "${assetName}":`, message);
        }
    }
    public async getAsset(name: string): Promise<AssetContainer> {
        if (this.cache.has(name)) {
            return this.cache.get(name)!;
        }
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;
        const loadPromise = SceneLoader.LoadAssetContainerAsync(rootUrl, `${name}.glb`, this.scene);
        this.cache.set(name, loadPromise);
        return loadPromise;
    }
    public preloadAssets(names: string[]): void {
        for (const name of names) {
            this.getAsset(name).catch((error) => this._handlePreloadError(name, error));
        }
    }
}

// --- Bitmap font types & registry ---
type FontId = Font;

interface BitmapFontGlyph {
    x: number; y: number; w: number; h: number;
    xoffset: number; yoffset: number; xadvance: number; page: number;
}

interface BitmapFontCommon {
    lineHeight: number; base: number; scaleW: number; scaleH: number;
    targetLineFactor?: number;
}

interface BitmapFontData {
    image: HTMLImageElement;
    common: BitmapFontCommon;
    chars: Map<number, BitmapFontGlyph>;
    kern: Map<string, number>;
}

const FONT_CONFIG = Object.fromEntries(
    FONT_REGISTRY.map(font => [
        font.id,
        {
            baseName: font.baseName,
            targetLineFactor: font.targetLineFactor,
        },
    ])
) as Record<FontId, { baseName: string; targetLineFactor?: number }>;

// --- NEW: ShellBundle Interface ---
interface ShellBundle {
    container: AssetContainer;
    material: PBRMaterial;
    plugins: ColorSwapPlugin[]; // <--- Changed to an array
    // Map of specific parts by role ("shell", "thumbName", "indexHood", etc.)
    parts: Map<string, AbstractMesh>;
}

// --- UPDATED SceneManager Class ---
export class SceneManager {
    private engine: Engine;
    private scene: Scene;
    private camera: ArcRotateCamera;
    private resizeObserver: ResizeObserver;
    private assetManager: AssetManager;
    private isSceneReady = false;

    // --- REFACTORED STORAGE: Bundles instead of loose Maps ---
    private shellBundles = new Map<string, ShellBundle>();
    private activeShellBundle: ShellBundle | null = null;
    
    // Web logic remains simpler for now (webs are simpler meshes)
    private webMaterialsCache = new Map<string, { material: PBRMaterial, plugin: ColorSwapPlugin }>();
    private webs = new Map<string, Mesh>();
    private activeWebPlugin: ColorSwapPlugin | null = null;

    private activeShellName: string | null = null;

    private _bitmapFontReady: Promise<void> | null = null;
    private _fonts = new Map<FontId, BitmapFontData>();
    private _textDTs = new Map<string, DynamicTexture>(); // Single atlas holding ID (RGB) + Cutout (Alpha)
    private _textPlugins = new Map<string, ColorSwapPlugin>(); // Tracks shader instances for text
    private _lastText = new Map<string, string>();

    // --- ADD THE NEW GETTER RIGHT HERE ---
    public get fontsReady(): Promise<void> | null {
        return this._bitmapFontReady;
    }
    // -------------------------------------

    constructor(canvas: HTMLCanvasElement, onReady: (manager: SceneManager) => void, initialModelName: string) {
        this.engine = new Engine(canvas, true, { alpha: true });
        this.scene = new Scene(this.engine);
        this.scene.useRightHandedSystem = true; // <-- THE CORE FIX FOR RIGHT-HANDED SCENE
        this.assetManager = new AssetManager(this.scene);
        this.scene.clearColor = new Color4(0, 0, 0, 0);

        this.camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 2.4, Vector3.Zero(), this.scene);
        this.camera.minZ = 0.1;
        this.camera.attachControl(canvas, true);
        
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this.scene);

// Turn the strength down (dimmer)
hemiLight.intensity = 0.8;

        const degreesToRotate = 45; 
        const envTexture = CubeTexture.CreateFromPrefilteredData(
    `${process.env.PUBLIC_URL || ''}/assets/environment.envMap`, 
    this.scene,
    ".env" // <-- THIS IS THE OVERRIDE. It tells Babylon "Treat this as a .env format even though the server thinks it's a .envMap"
);

        this.camera.fov = 0.3;
        this.camera.lowerRadiusLimit = 1;
        this.camera.upperRadiusLimit = 3;
        this.camera.panningSensibility = 0;
        this.camera.wheelPrecision = 200;
        // 1. Rotate it slightly
        envTexture.rotationY = degreesToRotate * (Math.PI / 180); 

        // 2. Assign the texture to the scene
        this.scene.environmentTexture = envTexture;

        // 3. Increase the overall lighting strength slightly (Default is 1.0)
        this.scene.environmentIntensity = 1.6;

        
        this._bitmapFontReady = this._initBitmapFonts();

        this.loadInitialAssets(onReady, initialModelName);

        this.engine.runRenderLoop(() => {
    // 1. Force the exact-pixel read 100% of the time to kill the sparkles
    if (this.activeShellBundle) {
        this.activeShellBundle.plugins.forEach(plugin => {
            plugin.enableSdf = 1.0; 
        });
    }
    if (this.activeWebPlugin) {
        this.activeWebPlugin.enableSdf = 1.0;
    }

    // 2. Render the scene
    this.scene.render();
});

        this.resizeObserver = new ResizeObserver(() => this.engine.resize());
        this.resizeObserver.observe(canvas);
    }

    private _setupMaterialWithPlugin(material: PBRMaterial, modelName: string): ColorSwapPlugin {
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;

        const colorIdTexture = new Texture(`${rootUrl}${modelName}.png`, this.scene, true, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);
        colorIdTexture.gammaSpace = true;
        colorIdTexture.wrapU = colorIdTexture.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        colorIdTexture.hasAlpha = false;

        const detailTexture = new Texture(`${rootUrl}details.png`, this.scene);
        detailTexture.uScale = 10;  // Tiles the pattern 3 times horizontally
        detailTexture.vScale = 10;  // Tiles the pattern 3 times vertically
        
        material.detailMap.isEnabled = true;
        material.detailMap.texture = detailTexture;
        material.detailMap.normalBlendMethod = 1; // 1 = RNM (High-quality normal blending)
        
        // CRITICAL FIX: These tell Babylon to read the channels you packed
        material.detailMap.diffuseBlendLevel = 0.3;   // Reads RED channel (Teardrops)
        material.detailMap.roughnessBlendLevel = 1; // Reads BLUE channel (Roughness)
        material.detailMap.bumpLevel = 0.5;

        // WHITE BASE TRICK: Pure white so detail map variation passes through cleanly,
        // then the plugin multiplies the palette color on top.
        material.albedoTexture = RawTexture.CreateRGBTexture(
            new Uint8Array([255, 255, 255]),
            1,
            1,
            this.scene
        );

        const paletteColorsFromLogic: Color3[] =
            COLOR_OPTIONS.map(({ hex }) => Color3.FromHexString(hex).toLinearSpace())
                .slice(0, 22);

        const gloveConfig: ColorSwapConfig = {
            baseColors: [
                "#FF0000", "#00FFFF", "#80FF00", "#7F00FF", "#FFBF00", "#0040FF", "#00FF40", "#FF00BF",
                "#FF6000", "#009FFF", "#20FF00", "#DF00FF", "#DFFF00", "#2000FF", "#00FF9F", "#FF0060",
                "#FF3000", "#00CFFF", "#50FF00", "#AF00FF", "#FFEF00", "#0010FF", "#00FF70", "#FF008F",
                "#FF8F00", "#0070FF", "#00FF10", "#FF00EF", "#AFFF00", "#5000FF", "#00FFCF", "#FF0030"
            ],
            initialReplacements: paletteColorsFromLogic
        };

        const plugin = new ColorSwapPlugin(material, gloveConfig);

        const sdfTexture = new Texture(
            `${rootUrl}${modelName}SDF.png`,
            this.scene,
            false,
            false,
            Constants.TEXTURE_TRILINEAR_SAMPLINGMODE
        );
        sdfTexture.gammaSpace = false;
        sdfTexture.wrapU = sdfTexture.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        
        plugin.setSDFTexture(sdfTexture);
        plugin.setIDTexture(colorIdTexture); // <--- NEW: Give the plugin the ID map secretly

        return plugin;
    }

    // --- NEW HELPER: Load and Index a Bundle ---
    private async _createBundle(modelName: string): Promise<ShellBundle | null> {
        const container = await this.assetManager.getAsset(modelName);
        
        // Find main shell mesh (using the model name as the key)
        const shellMesh = container.meshes.find(m => m.name === modelName);
        if (!shellMesh) {
            console.error(`Shell mesh '${modelName}' not found in asset container.`);
            return null;
        }

        const plugins: ColorSwapPlugin[] = [];

        // Find material
        const material = container.materials.find(m => m.name === 'gloveMat') as PBRMaterial;
        if (!material) {
            console.error(`Material 'gloveMat' not found for ${modelName}.`);
            return null;
        }

        // 1. Grab Main Material
        if (material) {
            plugins.push(this._setupMaterialWithPlugin(material, modelName));
        }

        // 2. Grab Logo Materials
        const logo1Mat = container.materials.find(m => m.name === 'logo1') as PBRMaterial;
        if (logo1Mat) {
            plugins.push(this._setupMaterialWithPlugin(logo1Mat, 'logo1'));
        }

        const logo2Mat = container.materials.find(m => m.name === 'logo2') as PBRMaterial;
        if (logo2Mat) {
            plugins.push(this._setupMaterialWithPlugin(logo2Mat, 'logo2'));
        }

        // Index the parts (Optional meshes)
        // We look for them by name. If they exist, we store them.
        const parts = new Map<string, AbstractMesh>();
        parts.set('shell', shellMesh); // Always have the shell

        // List of optional part names to look for
        const optionalParts = [
            'thumbName', 
            'pinkyName', 
            'indexHood', 
            'middleHood', 
            'indexPad', 
            'middlePad'
        ];
        
        for (const partName of optionalParts) {
            const mesh = container.meshes.find(m => m.name === partName);
            if (mesh) {
                parts.set(partName, mesh);
            }
        }

        return {
            container,
            material,
            plugins, // <--- Return the array
            parts
        };
    }

    private async loadInitialAssets(onReady: (manager: SceneManager) => void, modelName: string) {
        await this.updateBuild(modelName);
        this.isSceneReady = true;
        onReady(this);
    }

    public isReady = (): boolean => this.isSceneReady;

    // --- START NEW CODE: THE RENDER GATE ---
    public waitForRender(): Promise<void> {
        return new Promise((resolve) => {
            // Babylon's built-in check: waits for shaders to compile and textures to be ready
            this.scene.executeWhenReady(() => {
                resolve();
            });
        });
    }
    // --- END NEW CODE ---

    // ==========================================
    // ADD THIS NEW METHOD HERE
    // ==========================================
    public updateCameraForView(isDesktop: boolean) {
        if (!this.camera) return;

        if (isDesktop) {
            // DESKTOP: Tighter radius
            this.camera.radius = 2.4;
        } else {
            // MOBILE: Pulled back radius so the whole glove fits
            this.camera.radius = 5; 
        }
    }
    // ==========================================

    public focusOnLocator(locatorName: string, animate: boolean = true): void {
        if (!this.camera || !this.scene) return;

        const targetNode = this.scene.getTransformNodeByName(locatorName);
        
        if (!targetNode) {
            console.warn(`[SceneManager] Could not find locator: ${locatorName}`);
            return; 
        }

        // --- EXTRACT IDEAL ROTATION FROM EMPTY ---
        const direction = targetNode.forward.scale(-1); 
        const idealAlpha = Math.atan2(direction.z, direction.x);
        const clampedY = Math.max(-1.0, Math.min(1.0, direction.y));
        const idealBeta = Math.acos(clampedY);

        let targetAlpha = this.camera.alpha;
        let targetBeta = this.camera.beta;
        let targetRadius = this.camera.radius;

        // --- SPLIT LOGIC BASED ON LOCATOR ---
        if (locatorName === 'focus1') {
            // MACRO VIEW
            const MIN_SAFE_ZOOM = 1.4; 
            targetRadius = Math.max(this.camera.radius, MIN_SAFE_ZOOM);

            // Calculate the shortest path difference
            const alphaDiff = Math.atan2(
                Math.sin(idealAlpha - this.camera.alpha), 
                Math.cos(idealAlpha - this.camera.alpha)
            );
            const betaDiff = Math.atan2(
                Math.sin(idealBeta - this.camera.beta), 
                Math.cos(idealBeta - this.camera.beta)
            );

            // NUDGE ROTATION: Apply only 30% of the difference
            const blendFactor = 0.2; 
            targetAlpha = this.camera.alpha + (alphaDiff * blendFactor);
            targetBeta = this.camera.beta + (betaDiff * blendFactor);

        } else {
            // DETAIL VIEW (focus2)
            // Calculate the shortest path difference
            const alphaDiff = Math.atan2(
                Math.sin(idealAlpha - this.camera.alpha), 
                Math.cos(idealAlpha - this.camera.alpha)
            );
            const betaDiff = Math.atan2(
                Math.sin(idealBeta - this.camera.beta), 
                Math.cos(idealBeta - this.camera.beta)
            );

            // STRICT ROTATION: Apply 100% of the difference
            targetAlpha = this.camera.alpha + alphaDiff;
            targetBeta = this.camera.beta + betaDiff;
            
            targetRadius = 1.2; 
        }

        // --- EXECUTE THE MOVE ---
        if (animate) {
            const ease = new CubicEase();
            ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

            Animation.CreateAndStartAnimation("animTarget", this.camera, "target", 60, 36, this.camera.target, targetNode.absolutePosition, 2, ease);
            Animation.CreateAndStartAnimation("animAlpha", this.camera, "alpha", 60, 36, this.camera.alpha, targetAlpha, 2, ease);
            Animation.CreateAndStartAnimation("animBeta", this.camera, "beta", 60, 36, this.camera.beta, targetBeta, 2, ease);
            Animation.CreateAndStartAnimation("animRadius", this.camera, "radius", 60, 36, this.camera.radius, targetRadius, 2, ease);
        } else {
            // SNAP INSTANTLY ON INITIAL LOAD
            this.camera.target = targetNode.absolutePosition.clone();
            // On initial load, give them the 100% perfect angle, not the 30% blended one
            this.camera.alpha = idealAlpha;
            this.camera.beta = idealBeta;
            this.camera.radius = targetRadius;
        }
    }

    public updateShellZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeShellBundle?.plugins.forEach(plugin => {
            plugin.updateZonePaletteIndex(zoneIndex, paletteIndex);
        });
    }

    public updateWebZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeWebPlugin?.updateZonePaletteIndex(zoneIndex, paletteIndex);
    }

    public syncConfiguration(config: GloveConfiguration, product: ProductDefinition): void {
        if (!this.activeShellBundle) return;

        // 1. Get the "Resolved" visual truth from the brain we just built
        const activeColors = resolveVisualState(config);

        // 2. Loop through every zone defined for this specific bat
        Object.entries(product.zones).forEach(([zoneKey, zoneDef]) => {
            const colorId = activeColors[zoneKey as ZoneKey];
            
            if (colorId) {
                const paletteIndex = getPaletteIndexById(colorId);
                
                // Update the Shell Plugin (The Bat)
                if (zoneDef.materialTarget === 'shell' || zoneDef.materialTarget === 'both') {
                    this.updateShellZonePointer(zoneDef.shaderIndex, paletteIndex);
                }
                
                // Update the Web Plugin (If applicable)
                if (zoneDef.materialTarget === 'web' || zoneDef.materialTarget === 'both') {
                    this.updateWebZonePointer(zoneDef.shaderIndex, paletteIndex);
                }
            }
        });
    }

    // Add this method inside class SceneManager in viewer.tsx
    public setPartVisibility(partName: string, isVisible: boolean): void {
        if (!this.activeShellBundle) return;
        const part = this.activeShellBundle.parts.get(partName);
        if (part) {
            part.setEnabled(isVisible);
        }
    }

    // --- REWRITTEN: CLEAN SWAP LOGIC ---
    public async updateBuild(modelName: string): Promise<void> {
        if (!modelName || this.activeShellName === modelName) return;

        // 1. Get or Load the Bundle
        let bundle = this.shellBundles.get(modelName);
        if (!bundle) {
            const newBundle = await this._createBundle(modelName);
            if (!newBundle) return; // Failed to load
            this.shellBundles.set(modelName, newBundle);
            bundle = newBundle;
        }

        // 2. "Clean the Room" - Remove current bundle explicitly
        if (this.activeShellBundle) {
            this.activeShellBundle.container.removeAllFromScene();
        }

        // 3. "Bring in the New" - Add new bundle
        bundle.container.addAllToScene();

        // 4. "Apply State" - Set Initial Visibility
        // A. Shell: Visible
        const shell = bundle.parts.get('shell');
        if (shell) shell.setEnabled(true);

        // B. Text: Visible by default (user requirement)
        const thumbName = bundle.parts.get('thumbName');
        if (thumbName) thumbName.setEnabled(true);
        
        const pinkyName = bundle.parts.get('pinkyName');
        if (pinkyName) pinkyName.setEnabled(true);

        // C. Optional Parts: HIDDEN by default (until UI logic added)
        // This is where we handle the "Index Hood" toggle in the future.
        // For now, we force them OFF to prove control.
        const optionalToggles = ['indexHood', 'middleHood', 'indexPad', 'middlePad'];
        for (const partName of optionalToggles) {
            const part = bundle.parts.get(partName);
            if (part) part.setEnabled(false);
        }

        // 5. Update Active References
        this.activeShellBundle = bundle;
        this.activeShellName = modelName;

        // 6. Set the Default Camera Focus
        this.focusOnLocator('focus1', false);
    }


    public async updateWeb(webModelName: string): Promise<void> {
        if (!webModelName) {
            this.webs.forEach(mesh => mesh.setEnabled(false));
            this.activeWebPlugin = null;
            return;
        }

        if (this.webMaterialsCache.has(webModelName)) {
            const cached = this.webMaterialsCache.get(webModelName)!;
            this.activeWebPlugin = cached.plugin;
        } else {
            const container = await this.assetManager.getAsset(webModelName);
            const mesh = container.meshes.find(m => m.name === webModelName) as Mesh;
            if (mesh) {
                container.addAllToScene();
                this.webs.set(webModelName, mesh);

                const webMaterial = container.materials.find(m => m.name === 'webMat') as PBRMaterial;
                if (webMaterial) {
                    const webPlugin = this._setupMaterialWithPlugin(webMaterial, webModelName);
                    this.activeWebPlugin = webPlugin;
                    this.webMaterialsCache.set(webModelName, { material: webMaterial, plugin: webPlugin });
                }
            }
        }

        this.webs.forEach((mesh, name) => {
            mesh.setEnabled(name === webModelName);
        });
    }

    public updateText = (options: { zone: string; text: string; font: Font; color: string; }) => {
        const { zone, text, font, color } = options;
        if (!this.activeShellName) return;
        
        // Ensure we are looking for the material on the ACTIVE model
        // Note: Since we use container.addAllToScene, the material is present in the scene.
        const materialName = `${zone}${this.activeShellName.charAt(0).toUpperCase() + this.activeShellName.slice(1)}`;
        const textMat = this.scene.getMaterialByName(materialName) as PBRMaterial;
        if (!textMat) {
            // It is expected that some models might NOT have text zones (e.g. Catcher might behave differently)
            // Just warn loosely or ignore.
            // console.warn(`Text material "${materialName}" not found on active model.`);
            return;
        }

        if (!this._bitmapFontReady) return;
        if (this._fonts.size === 0) return;

        // 1. Try to get the specific font, or fallback to LOBSTER
        let fontData = this._fonts.get(font as FontId) || this._fonts.get('LOBSTER' as FontId);
        
        // 2. If neither exist, safely grab the very first loaded font
        if (!fontData && this._fonts.size > 0) {
            fontData = Array.from(this._fonts.values())[0];
        }

        if (!fontData) return;

        const { image: img, common, chars, kern } = fontData;
let textDT = this._textDTs.get(zone);
        const texW = 2048, texH = 1024; 
        if (!textDT) {
            textDT = new DynamicTexture(`${zone}_id_map`, { width: texW, height: texH }, this.scene, false);
            textDT.hasAlpha = true;
            this._textDTs.set(zone, textDT);
        }

        textMat.opacityTexture = textDT; // Uses the Alpha channel from the canvas
        textMat.bumpTexture = null; // Kill the normal map
        textMat.useAlphaFromAlbedoTexture = false;
        textMat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHATEST; 
        textMat.alphaCutOff = 0.4; 
        
        textMat.unlit = false;
        textMat.metallic = 0;
        textMat.roughness = 0.45;
        
        // Pure white base so the shader multiplies the palette color cleanly
        textMat.albedoColor = new Color3(1, 1, 1);
        
        // --- HOOK INTO THE SHADER ---
        let plugin = this._textPlugins.get(zone);
        if (!plugin) {
            const paletteColorsFromLogic = COLOR_OPTIONS
                .map(({ hex }) => Color3.FromHexString(hex).toLinearSpace())
                .slice(0, 22);

            // Using your standard 32-zone color array
            const textConfig: ColorSwapConfig = {
                baseColors: [
                    "#FF0000", "#00FFFF", "#80FF00", "#7F00FF", "#FFBF00", "#0040FF", "#00FF40", "#FF00BF",
                    "#FF6000", "#009FFF", "#20FF00", "#DF00FF", "#DFFF00", "#2000FF", "#00FF9F", "#FF0060",
                    "#FF3000", "#00CFFF", "#50FF00", "#AF00FF", "#FFEF00", "#0010FF", "#00FF70", "#FF008F",
                    "#FF8F00", "#0070FF", "#00FF10", "#FF00EF", "#AFFF00", "#5000FF", "#00FFCF", "#FF0030"
                ],
                initialReplacements: paletteColorsFromLogic
            };

            plugin = new ColorSwapPlugin(textMat, textConfig);
            plugin.setIDTexture(textDT); // Give the shader our canvas
            plugin.enableSdf = 0.0; // Turn OFF SDF distance field logic for text (fallback to blur/sharp)
            
            this._textPlugins.set(zone, plugin);
            
            if (this.activeShellBundle && !this.activeShellBundle.plugins.includes(plugin)) {
                this.activeShellBundle.plugins.push(plugin);
            }
        }

        // Swap Zone 0 (Pure Red #FF0000 in your font atlas) to the user's chosen text color
        const paletteIndex = getPaletteIndexById(color as any);
        plugin.updateZonePaletteIndex(0, paletteIndex); 
        
        // NOTE: If you add an outline to your font atlas in pure Cyan (#00FFFF), 
        // you would control it here like this: 
        // plugin.updateZonePaletteIndex(1, someOtherPaletteIndex);


        const signature = `${font}:${text}`;
        const last = this._lastText.get(zone) ?? "";
        if (last === signature) return;
        this._lastText.set(zone, signature);

        const ctxT = textDT.getContext();
        ctxT.clearRect(0, 0, texW, texH);

        if (!text) {
            textDT.update(false);
            return;
        }

        const targetLineFactor = common.targetLineFactor ?? 0.51;
        const targetLine = texH * targetLineFactor;
        const scale = targetLine / Math.max(common.lineHeight, 1);
        const lineAdvance = common.lineHeight * scale;
// --- 1. PRE-PASS: MEASURE TOTAL WIDTH ---
        let totalWidth = 0;
        let measurePrevCode = -1;
        for (const ch of text) {
            const code = ch.codePointAt(0)!;
            if (measurePrevCode >= 0) {
                totalWidth += (kern.get(`${measurePrevCode},${code}`) ?? 0) * scale;
            }
            const g = chars.get(code);
            if (g) {
                totalWidth += g.xadvance * scale;
            } else {
                const space = chars.get(32);
                totalWidth += (space ? space.xadvance : common.lineHeight * 0.35) * scale;
            }
            measurePrevCode = code;
        }

        // --- 2. CALCULATE CENTERED STARTING POSITIONS ---
        // (texW - totalWidth) / 2 centers the text horizontally
        let penX = (texW - totalWidth) * 0.5; 

        const lineTopY = (texH - lineAdvance) * 0.5;
        let penY = lineTopY + common.base * scale;

        // --- 3. DRAWING LOOP ---
        let prevCode = -1;
        for (const ch of text) {
            if (ch === '\n') {
                penX = (texW - totalWidth) * 0.5; 
                penY += lineAdvance;
                prevCode = -1;
                continue;
            }
            const code = ch.codePointAt(0)!;

            if (prevCode >= 0) {
                const k = kern.get(`${prevCode},${code}`) ?? 0;
                penX += k * scale;
            }

            const g = chars.get(code);
            if (!g || g.w === 0 || g.h === 0) {
                const space = chars.get(32);
                penX += (space ? space.xadvance : common.lineHeight * 0.35) * scale;
                prevCode = code;
                continue;
            }

            const srcX = g.x;
            const srcY = g.y;
            const srcW = g.w;
            const srcH = g.h;

            const dstX = Math.round(penX + g.xoffset * scale);
            const dstY = Math.round(lineTopY + g.yoffset * scale);
            const dstW = Math.max(1, Math.round(srcW * scale));
            const dstH = Math.max(1, Math.round(srcH * scale));

            if (dstX < texW && dstY < texH && dstX + dstW > 0 && dstY + dstH > 0) {
                ctxT.drawImage(img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
            }

            penX += g.xadvance * scale;
            prevCode = code;
        }

        textDT.update(false);
    };

    public dispose() {
        this._textDTs.forEach(dt => dt.dispose());
        this._textDTs.clear();
        this._textPlugins.forEach(plugin => plugin.dispose());
        this._textPlugins.clear();

        // Updated dispose logic for bundles
        this.shellBundles.forEach(bundle => {
            bundle.plugins.forEach(plugin => plugin.dispose()); // <--- Loop dispose
            // Container dispose is optional but good practice if you want to free memory completely
            // bundle.container.dispose(); 
        });
        this.shellBundles.clear();
        
        this.webMaterialsCache.forEach(cached => cached.plugin.dispose());
        this.webMaterialsCache.clear();
        this.resizeObserver.disconnect();
        this.scene.dispose();
        this.engine.dispose();
    }

    private async _initBitmapFonts(): Promise<void> {
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;

        const fontIds = Object.keys(FONT_CONFIG) as FontId[];

        const loadFont = async (fontId: FontId): Promise<void> => {
            const { baseName, targetLineFactor } = FONT_CONFIG[fontId];

            try {
                const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const im = new Image();
                    im.crossOrigin = 'anonymous';
                    im.onload = () => resolve(im);
                    im.onerror = reject;
                    im.src = `${rootUrl}${baseName}.png`;
                });

                const fntResponse = await fetch(`${rootUrl}${baseName}.fnt`);
                if (!fntResponse.ok) {
                    throw new Error(`Failed to load font description for ${baseName}`);
                }
                const fntText = await fntResponse.text();

                const num = (s: string | undefined) => Number(s ?? 0);
                let scaleW = 0, scaleH = 0, lineHeight = 0, base = 0;

                const chars = new Map<number, BitmapFontGlyph>();
                const kern = new Map<string, number>();

                const parseKV = (line: string) =>
                    Object.fromEntries(
                        line.split(/\s+/)
                            .slice(1)
                            .filter(Boolean)
                            .map(pair => {
                                const [k, vRaw] = pair.split('=');
                                const v = vRaw?.replace(/^"/, '').replace(/"$/, '');
                                return [k, v];
                            })
                    );

                for (const raw of fntText.split(/\r?\n/)) {
                    const line = raw.trim();
                    if (!line) continue;

                    if (line.startsWith('common ')) {
                        const kv = parseKV(line);
                        lineHeight = num(kv.lineHeight);
                        base = num(kv.base);
                        scaleW = num(kv.scaleW);
                        scaleH = num(kv.scaleH);
                        continue;
                    }

                    if (line.startsWith('char ')) {
                        const kv = parseKV(line);
                        const id = num(kv.id);
                        if (isNaN(id)) continue;
                        chars.set(id, {
                            x: num(kv.x),
                            y: num(kv.y),
                            w: num(kv.width ?? kv.w),
                            h: num(kv.height ?? kv.h),
                            xoffset: num(kv.xoffset),
                            yoffset: num(kv.yoffset),
                            xadvance: num(kv.xadvance),
                            page: num(kv.page),
                        });
                        continue;
                    }

                    if (line.startsWith('kerning ')) {
                        const kv = parseKV(line);
                        const first = num(kv.first);
                        const second = num(kv.second);
                        const amount = num(kv.amount);
                        if (!isNaN(first) && !isNaN(second)) {
                            kern.set(`${first},${second}`, amount);
                        }
                        continue;
                    }
                }

                const common: BitmapFontCommon = {
                    lineHeight,
                    base,
                    scaleW,
                    scaleH,
                    targetLineFactor,
                };

                const fontData: BitmapFontData = {
                    image,
                    common,
                    chars,
                    kern,
                };

                this._fonts.set(fontId, fontData);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`[BitmapFont] Failed to load font "${fontId}" (${baseName})`, error);
                }
            }
        };

        await Promise.all(fontIds.map(loadFont));
    }
}

// Add isDesktop to the props interface
interface BabylonCanvasProps {
    onSceneReady: (sceneManager: SceneManager) => void;
    initialModelName: string;
    isDesktop: boolean; // <--- ADD THIS
}

const BabylonCanvas = ({ onSceneReady, initialModelName, isDesktop }: BabylonCanvasProps) => { // <--- ADD isDesktop HERE
    const reactCanvas = useRef<HTMLCanvasElement | null>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null); // <--- ADD THIS REF to hold the instance

    // 1. Initial Setup Effect
    useEffect(() => {
        const { current: canvas } = reactCanvas;
        if (!canvas) return;

        // Store the instance in the ref so we can access it later
        sceneManagerRef.current = new SceneManager(canvas, (manager) => {
            // Set initial camera instantly on load
            manager.updateCameraForView(isDesktop);
            onSceneReady(manager);
        }, initialModelName);

        return () => {
            sceneManagerRef.current?.dispose();
            sceneManagerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onSceneReady]);

    // 2. The Clean Break Effect
    // Fires ONLY when isDesktop changes (resize between mobile/desktop)
    useEffect(() => {
        if (sceneManagerRef.current) {
            sceneManagerRef.current.updateCameraForView(isDesktop);
        }
    }, [isDesktop]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export const SceneContext = createContext<SceneManager | null>(null);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) { throw new Error('useScene must be used within a SceneProvider'); }
    return context;
};

export default BabylonCanvas;
