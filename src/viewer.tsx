// src/viewer.tsx

import React, { useEffect, useRef, createContext, useContext } from 'react';
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
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
    AbstractMesh, // Added AbstractMesh
} from '@babylonjs/core';
import "@babylonjs/loaders";
import { COLOR_OPTIONS, FONT_REGISTRY, Font } from './product-data';

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
                uniform sampler2D idTex; // <--- NEW: ID Map sampler

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

            // --- REWRITTEN: Now reads from idTex instead of albedoSampler, and uses Multiply mix ---
            const updateAlbedoGLSL = `
#ifdef COLOR_SWAP
if (u_enableSdf > 0.5) {
  float sd = texture2D(sdfTex, vAlbedoUV).r;
  float sd_fwidth = fwidth(sd);
  vec2 g  = vec2(dFdx(sd), dFdy(sd));
  float glen = max(length(g), 1e-6);
  vec2 dir = g / glen;

  float px = max(fwidth(vAlbedoUV.x) + fwidth(vAlbedoUV.y), 1e-5);
  vec2 duv = dir * px * 3.0;

  vec3 idA = srgbToLinear(texture2D(idTex, vAlbedoUV - duv).rgb); // Changed to idTex
  vec3 idB = srgbToLinear(texture2D(idTex, vAlbedoUV + duv).rgb); // Changed to idTex

  int  zA = findZone(idA);
  int  zB = findZone(idB);
  vec3 palA = zoneToPalette(zA);
  vec3 palB = zoneToPalette(zB);

  float wMin = 0.8 * px;
  float w    = max(max(sd_fwidth * blendStrength, 1e-6), wMin);
  float t = smoothstep(0.5 - 3.0 * w, 0.5 + 3.0 * w, sd);
  vec3 targetColor = mix(palB, palA, t);
  
  // Step 1: Deep Stain
  vec3 stainedWood = surfaceAlbedo.rgb * targetColor;
  // Step 2: Tinted Glaze (25% solid, 75% stain)
  vec3 hybridColor = mix(stainedWood, targetColor, 0.5);
  // Step 3: Final Slider
  surfaceAlbedo.rgb = mix(surfaceAlbedo.rgb, hybridColor, tintRatio);

} else {
  vec3  id0 = srgbToLinear(texture2D(idTex, vAlbedoUV).rgb); // Changed to idTex
  float L0  = dot(id0, vec3(0.299, 0.587, 0.114));
  vec2  g   = vec2(dFdx(L0), dFdy(L0));
  float glen = max(length(g), 1e-6);
  vec2  dir  = g / glen;

  float fp = max(fwidth(vAlbedoUV.x) + fwidth(vAlbedoUV.y), 1e-5);
  vec2  duv = dir * fp;

  vec2 off0 = -1.5 * duv;
  vec2 off1 = -0.5 * duv;
  vec2 off2 =  0.5 * duv;
  vec2 off3 =  1.5 * duv;

  float w0 = 0.2;
  float w1 = 0.3;
  float w2 = 0.3;
  float w3 = 0.2;

  vec3 accum = vec3(0.0);
  float sumw = 0.0;

  vec3 idS0 = srgbToLinear(texture2D(idTex, vAlbedoUV + off0).rgb); // Changed to idTex
  int  z0   = findZone(idS0);
  vec3 pal0 = zoneToPalette(z0);
  accum += pal0 * w0;
  sumw  += w0;

  vec3 idS1 = srgbToLinear(texture2D(idTex, vAlbedoUV + off1).rgb); // Changed to idTex
  int  z1   = findZone(idS1);
  vec3 pal1 = zoneToPalette(z1);
  accum += pal1 * w1;
  sumw  += w1;

  vec3 idS2 = srgbToLinear(texture2D(idTex, vAlbedoUV + off2).rgb); // Changed to idTex
  int  z2   = findZone(idS2);
  vec3 pal2 = zoneToPalette(z2);
  accum += pal2 * w2;
  sumw  += w2;

  vec3 idS3 = srgbToLinear(texture2D(idTex, vAlbedoUV + off3).rgb); // Changed to idTex
  int  z3   = findZone(idS3);
  vec3 pal3 = zoneToPalette(z3);
  accum += pal3 * w3;
  sumw  += w3;

  vec3 targetColor = accum / sumw;
  
  // Step 1: Deep Stain
  vec3 stainedWood = surfaceAlbedo.rgb * targetColor;
  // Step 2: Tinted Glaze (25% solid, 75% stain)
  vec3 hybridColor = mix(stainedWood, targetColor, 0.5);
  // Step 3: Final Slider
  surfaceAlbedo.rgb = mix(surfaceAlbedo.rgb, hybridColor, tintRatio);
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
    plugin: ColorSwapPlugin;
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
    private _opacityDTs = new Map<string, DynamicTexture>();
    private _normalDTs = new Map<string, DynamicTexture>();
    private _lastText = new Map<string, string>();

    constructor(canvas: HTMLCanvasElement, onReady: (manager: SceneManager) => void, initialModelName: string) {
        this.engine = new Engine(canvas, true, { alpha: true });
        this.scene = new Scene(this.engine);
        this.scene.useRightHandedSystem = true; // <-- THE CORE FIX FOR RIGHT-HANDED SCENE
        this.assetManager = new AssetManager(this.scene);
        this.scene.clearColor = new Color4(0, 0, 0, 0);

        this.camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 3, Vector3.Zero(), this.scene);
        this.camera.minZ = 0.1;
        this.camera.attachControl(canvas, true);
        new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        this.camera.fov = 0.3;
        this.camera.lowerRadiusLimit = 1.5;
        this.camera.upperRadiusLimit = 4;
        this.camera.panningSensibility = 0;
        this.camera.wheelPrecision = 150;

        this._bitmapFontReady = this._initBitmapFonts();

        this.loadInitialAssets(onReady, initialModelName);

        this.engine.runRenderLoop(() => {
            // --- PIXEL BUDGET LOGIC (SDF TOGGLE) ---
            if (this.activeShellBundle && this.activeShellName) {
                const shellMesh = this.activeShellBundle.parts.get('shell');
                if (shellMesh) {
                    shellMesh.computeWorldMatrix(true);

                    const localCorners = shellMesh.getBoundingInfo().boundingBox.vectors;
                    const worldMatrix = shellMesh.getWorldMatrix();
                    const transformMatrix = this.scene.getTransformMatrix();
                    const viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());

                    let minY = Infinity;
                    let maxY = -Infinity;
                    let validPixels = 0;

                    for (const corner of localCorners) {
                        const screenPos = Vector3.Project(corner, worldMatrix, transformMatrix, viewport);
                        if (screenPos.z > 0 && screenPos.z < 1) {
                            minY = Math.min(minY, screenPos.y);
                            maxY = Math.max(maxY, screenPos.y);
                            validPixels++;
                        }
                    }

                    let enableSdf = 1.0;
                    if (validPixels > 0) {
                        const pixelHeight = maxY - minY;
                        const SDF_PIXEL_HEIGHT_THRESHOLD = 1070.0;
                        enableSdf = (pixelHeight > SDF_PIXEL_HEIGHT_THRESHOLD) ? 1.0 : 0.0;
                    } else {
                        enableSdf = 0.0;
                    }

                    this.activeShellBundle.plugin.enableSdf = enableSdf;
                    if (this.activeWebPlugin) {
                        this.activeWebPlugin.enableSdf = enableSdf;
                    }
                }
            }
            // --- END PIXEL BUDGET LOGIC ---

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

        // --- NEW: Enable Babylon Native Clear Coat ---
        material.clearCoat.isEnabled = true;
        material.clearCoat.isTintEnabled = true;
        material.clearCoat.tintThickness = 1.0;

        // --- REMOVED: material.albedoTexture = colorIdTexture; ---
        // (We leave the Albedo alone so the GLB's wood grain stays visible)

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

        // Find material
        const material = container.materials.find(m => m.name === 'gloveMat') as PBRMaterial;
        if (!material) {
            console.error(`Material 'gloveMat' not found for ${modelName}.`);
            return null;
        }

        // Setup plugin (only once per bundle)
        const plugin = this._setupMaterialWithPlugin(material, modelName);

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
            plugin,
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

    public updateShellZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeShellBundle?.plugin.updateZonePaletteIndex(zoneIndex, paletteIndex);
    }

    public updateWebZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeWebPlugin?.updateZonePaletteIndex(zoneIndex, paletteIndex);
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

        let fontData = this._fonts.get(font as FontId) || this._fonts.get('LOBSTER' as FontId) || Array.from(this._fonts.values())[0];
        if (!fontData) return;

        const { image: img, common, chars, kern } = fontData;

        let opacityDT = this._opacityDTs.get(zone);
        let normalDT = this._normalDTs.get(zone);
        const texW = 512, texH = 256; 
        if (!opacityDT) {
            opacityDT = new DynamicTexture(`${zone}_opacity`, { width: texW, height: texH }, this.scene, false);
            opacityDT.hasAlpha = true;
            this._opacityDTs.set(zone, opacityDT);
        }
        if (!normalDT) {
            normalDT = new DynamicTexture(`${zone}_normal`, { width: texW, height: texH }, this.scene, false);
            normalDT.hasAlpha = true;
            this._normalDTs.set(zone, normalDT);
        }

        textMat.opacityTexture = opacityDT;
        textMat.bumpTexture = normalDT;
        textMat.bumpTexture.level = 1.0;
        textMat.useAlphaFromAlbedoTexture = false;
        textMat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
        textMat.unlit = false;
        textMat.metallic = 0;
        textMat.roughness = 0.1;
        
        try {
            textMat.albedoColor = Color3.FromHexString(color);
        } catch {
            textMat.albedoColor = new Color3(1, 1, 1);
        }

        const signature = `${font}:${text}`;
        const last = this._lastText.get(zone) ?? "";
        if (last === signature) return;
        this._lastText.set(zone, signature);

        const ctxA = opacityDT.getContext();
        const ctxN = normalDT.getContext();
        ctxA.clearRect(0, 0, texW, texH);
        ctxN.clearRect(0, 0, texW, texH);

        if (!text) {
            opacityDT.update(false);
            normalDT.update(false);
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
                ctxA.drawImage(img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
                ctxN.drawImage(img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
            }

            penX += g.xadvance * scale;
            prevCode = code;
        }

        opacityDT.update(false);
        normalDT.update(false);
    };

    public dispose() {
        // Updated dispose logic for bundles
        this.shellBundles.forEach(bundle => {
            bundle.plugin.dispose();
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

interface BabylonCanvasProps {
    onSceneReady: (sceneManager: SceneManager) => void;
    initialModelName: string;
}

const BabylonCanvas = ({ onSceneReady, initialModelName }: BabylonCanvasProps) => {
    const reactCanvas = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const { current: canvas } = reactCanvas;
        if (!canvas) return;

        const sceneManager = new SceneManager(canvas, onSceneReady, initialModelName);

        return () => {
            sceneManager.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onSceneReady]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export const SceneContext = createContext<SceneManager | null>(null);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) { throw new Error('useScene must be used within a SceneProvider'); }
    return context;
};

export default BabylonCanvas;