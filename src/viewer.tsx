import React, { useEffect, useRef } from 'react';
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
    RawTexture, // Added for Step 2
    SubMesh, // Added for Step 6
    AbstractEngine, // Added for bindForSubMesh fix
    // Note: Effect is implicitly used by bindForSubMesh, but not explicitly imported.
} from '@babylonjs/core';
import "@babylonjs/loaders";
import { GLOVE_TO_WEBS_MAP } from './logic';

// --- INTERFACE FOR PLUGIN CONFIGURATION ---
interface ColorSwapConfig {
    baseColors: string[]; // Hex strings
    initialReplacements: Color3[]; // These are the PALETTE colors
}

// --- Helper function for Step 2 & 3 ---
// Encodes a palette index (0-19 ideally) into an RGB color string for canvas drawing
// We store the index in the Red channel.
function encodeIndexAsColor(index: number): string {
    // Clamp index just in case, although checks should prevent out-of-bounds
    const clampedIndex = Math.max(0, Math.min(index, 255));
    return `rgb(${clampedIndex}, 0, 0)`;
}

// --- REFACTORED PLUGIN CODE ---
class ColorSwapPlugin extends MaterialPluginBase {
    // --- START OF STEP 1 MODIFICATION (Corrected Plan) ---
    // --- START OF DEFINITE ASSIGNMENT FIX ---
    private _dataLUT!: DynamicTexture; // Will hold base colors + pointers
    private _paletteLUT!: Texture; // Will hold the swappable palette colors
    // --- END OF DEFINITE ASSIGNMENT FIX ---
    private _zoneCount = 32; // Number of zones/base colors
    private _paletteColorCount = 20; // Number of actual swappable colors (adjust if needed)
    // --- END OF STEP 1 MODIFICATION (Corrected Plan) ---

    public blendRadius = 0.01;
    public blendStrength = 1.5;
    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;
    constructor(material: PBRBaseMaterial, config: ColorSwapConfig) {
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];

        // --- START OF STEP 2 MODIFICATION ---
        // 1. Determine Actual Sizes & Validate Config
        if (!config || !config.baseColors || !config.initialReplacements) {
            console.error("ColorSwapPlugin: Invalid configuration provided (missing arrays).");
            // Added explicit return to satisfy TypeScript potentially about _dataLUT/_paletteLUT not being assigned
            // although the `!` assertion technically handles this. Better safe.
            return;
        }
        // Use provided lengths, with fallbacks just in case (though validation helps)
        this._zoneCount = config.baseColors.length || 32;
        this._paletteColorCount = config.initialReplacements.length || 20;

        if (this._zoneCount === 0 || this._paletteColorCount === 0) {
             console.error("ColorSwapPlugin: Config arrays cannot be empty.");
             return; // Need at least one of each
        }
        if (this._paletteColorCount > 255) {
            console.error("ColorSwapPlugin: Cannot support more than 255 palette colors with current encoding.");
             return;
        }

        const scene = material.getScene(); // Get scene reference

        // 2. Create _dataLUT (Dynamic Texture - zoneCount x 2)
        this._dataLUT = new DynamicTexture("dataLUT", { width: this._zoneCount, height: 2 }, scene, false);
        this._dataLUT.updateSamplingMode(Constants.TEXTURE_NEAREST_SAMPLINGMODE); // Critical: Nearest for exact data
        this._dataLUT.gammaSpace = false; // Critical: Treat as linear data, not sRGB color
        // --- START OF CLAMP ADDRESS MODE (per ChatGPT suggestion) ---
        this._dataLUT.wrapU = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        this._dataLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        // --- END OF CLAMP ADDRESS MODE ---


        // 3. Create _paletteLUT (Static Texture - paletteColorCount x 1)
        const paletteBufferSize = this._paletteColorCount * 3; // 3 bytes per RGB color
        const paletteBuffer = new Uint8Array(paletteBufferSize);
        let bufferIndex = 0;
        for (const color of config.initialReplacements) {
            // --- START OF GAMMA CORRECTION (per ChatGPT suggestion) ---
            paletteBuffer[bufferIndex++] = Math.round(color.r * 255); // Use linear .r
            paletteBuffer[bufferIndex++] = Math.round(color.g * 255); // Use linear .g
            paletteBuffer[bufferIndex++] = Math.round(color.b * 255); // Use linear .b
            // --- END OF GAMMA CORRECTION ---
        }

        // Create the texture from the raw byte data
        this._paletteLUT = RawTexture.CreateRGBTexture(
            paletteBuffer,
            this._paletteColorCount, // width
            1, // height
            scene,
            false, // noMipmap
            false, // invertY
            Constants.TEXTURE_NEAREST_SAMPLINGMODE, // Critical: Nearest sampling
            Constants.TEXTUREFORMAT_RGB // Specify RGB format
        );
        this._paletteLUT.gammaSpace = false; // Critical: Treat as linear data
        // --- START OF CLAMP ADDRESS MODE (per ChatGPT suggestion) ---
        this._paletteLUT.wrapU = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        this._paletteLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        // --- END OF CLAMP ADDRESS MODE ---

        // 4. Populate _dataLUT
        const ctx = this._dataLUT.getContext();
        for (let i = 0; i < this._zoneCount; i++) {
            ctx.fillStyle = config.baseColors[i] || '#000000'; // Default to black if missing
            ctx.fillRect(i, 0, 1, 1);

            const initialPaletteIndex = i % this._paletteColorCount;
            ctx.fillStyle = encodeIndexAsColor(initialPaletteIndex);
            ctx.fillRect(i, 1, 1, 1);
        }

        // 5. Update _dataLUT to send initial data to GPU
        this._dataLUT.update();

        // --- END OF STEP 2 MODIFICATION ---

        this.isEnabled = true;
    }

    // --- START OF STEP 3 MODIFICATION ---
    // Added new method to update the pointer for a specific zone:
    public updateZonePaletteIndex(zoneIndex: number, paletteIndex: number): void {
        if (zoneIndex < 0 || zoneIndex >= this._zoneCount) {
            console.warn(`ColorSwapPlugin: Invalid zone index provided: ${zoneIndex}`);
            return;
        }
        if (paletteIndex < 0 || paletteIndex >= this._paletteColorCount) {
             console.warn(`ColorSwapPlugin: Invalid palette index provided: ${paletteIndex}`);
             return;
        }
        if (!this._dataLUT) return;

        const ctx = this._dataLUT.getContext();
        ctx.fillStyle = encodeIndexAsColor(paletteIndex);
        ctx.fillRect(zoneIndex, 1, 1, 1);
        this._dataLUT.update();
    }
    // --- END OF STEP 3 MODIFICATION ---


    // --- START OF DISPOSE FIX ---
    public dispose() {
        this._dataLUT?.dispose(); // Dispose the LUTs if they exist
        this._paletteLUT?.dispose();
        // Removed old broken assignments:
        // this._baseColors = [];
        // this._replacements = [];
        super.dispose();
    }
    // --- END OF DISPOSE FIX ---

    get isEnabled() { return this._isEnabled; }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled) return;
        this._isEnabled = enabled;
        this._markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    // --- START OF STEP 5 MODIFICATION ---
    public getSamplers(samplers: string[]) {
        samplers.push("dataLUT");
        samplers.push("paletteLUT");
    }
    // --- END OF STEP 5 MODIFICATION ---

    prepareDefines(defines: MaterialDefines) {
        defines["COLOR_SWAP"] = this._isEnabled;
    }

    // --- START OF STEP 4 MODIFICATION ---
    getUniforms() {
        return {
            ubo: [
                { name: "blendRadius", size: 1, type: "float" },
                { name: "blendStrength", size: 1, type: "float" },
            ],
            fragment: `
#ifdef COLOR_SWAP
uniform sampler2D dataLUT;
uniform sampler2D paletteLUT;
uniform float blendRadius;
uniform float blendStrength;
#endif
`
        };
    }
    // --- END OF STEP 4 MODIFICATION ---

    // --- START OF STEP 6 MODIFICATION ---
    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: AbstractEngine, subMesh: SubMesh) {
        if (this._isEnabled && this._dataLUT && this._paletteLUT) {
            uniformBuffer.updateFloat("blendRadius", this.blendRadius);
            uniformBuffer.updateFloat("blendStrength", this.blendStrength);

            // --- START OF BIND TEXTURE FIX ---
            // Use this._material.getEffect() instead of subMesh.getEffect()
            const effect = this._material?.getEffect(); // Access via the material plugin's internal _material property
            // --- END OF BIND TEXTURE FIX ---
            if (effect) {
                effect.setTexture("dataLUT", this._dataLUT);
                effect.setTexture("paletteLUT", this._paletteLUT);
            }
        }
    }
    // --- END OF STEP 6 MODIFICATION ---

    // --- START OF STEP 7 MODIFICATION ---
    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            const definitionsGLSL = `
                const int ZONE_COUNT = ${this._zoneCount};
                const int DATA_LUT_H = 2;
                const int PALETTE_COUNT = ${this._paletteColorCount};

                int decodeColorToIndex(vec4 pointerColor) {
                    return int(pointerColor.r * 255.0 + 0.5);
                }

                #ifdef WEBGL2
                    #define FETCH_DATA(ix, iy) texelFetch(dataLUT, ivec2(ix, iy), 0)
                    #define FETCH_PALETTE(ix)  texelFetch(paletteLUT, ivec2(ix, 0), 0)
                #else
                    vec2 uvDataLUT(int ix, int iy){
                        return (vec2(float(ix)+0.5, float(iy)+0.5) / vec2(float(ZONE_COUNT), float(DATA_LUT_H)));
                    }
                    vec2 uvPalette(int ix){
                        return (vec2(float(ix)+0.5, 0.5) / vec2(float(PALETTE_COUNT), 1.0));
                    }
                    #define FETCH_DATA(ix, iy) texture2D(dataLUT, uvDataLUT(ix, iy))
                    #define FETCH_PALETTE(ix)  texture2D(paletteLUT, uvPalette(ix))
                #endif
            `;

            return {
                "CUSTOM_FRAGMENT_DEFINITIONS": definitionsGLSL,
                "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
#ifdef COLOR_SWAP
    vec3 idColor = surfaceAlbedo.rgb;
    int zoneIndex = -1;
    int paletteIndex = 0;

    for (int i = 0; i < ZONE_COUNT; i++) {
        vec3 baseColor = FETCH_DATA(i, 0).rgb;
        if (distance(idColor, baseColor) < 0.01) {
            zoneIndex = i;
            break;
        }
    }

    if (zoneIndex != -1) {
        vec4 pointerColor = FETCH_DATA(zoneIndex, 1);
        paletteIndex = decodeColorToIndex(pointerColor);
        paletteIndex = clamp(paletteIndex, 0, PALETTE_COUNT - 1);
    }

    vec3 finalColor = FETCH_PALETTE(paletteIndex).rgb;
    surfaceAlbedo.rgb = finalColor;

#endif
`
            };
        }
        return null;
    }
    // --- END OF STEP 7 MODIFICATION ---
}

// --- AssetManager Class ---
class AssetManager {
    private cache = new Map<string, Promise<AssetContainer>>();
    constructor(private scene: Scene) { }
    private _handlePreloadError(assetName: string, error: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[AssetManager] Preload failed for "${assetName}":`, error);
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


// --- UPDATED SceneManager Class ---
export class SceneManager {
    private engine: Engine;
    private scene: Scene;
    private resizeObserver: ResizeObserver;
    private assetManager: AssetManager;
    private isSceneReady = false;
    private textTextures = new Map<string, DynamicTexture>();

    private activeShellMaterial: PBRMaterial | null = null;
    private activeShellPlugin: ColorSwapPlugin | null = null;
    private activeWebMaterial: PBRMaterial | null = null;
    private activeWebPlugin: ColorSwapPlugin | null = null;

    private shellMaterialsCache = new Map<string, { material: PBRMaterial, plugin: ColorSwapPlugin }>();
    private gloveShells = new Map<string, Mesh>();
    private webMaterialsCache = new Map<string, { material: PBRMaterial, plugin: ColorSwapPlugin }>();
    private webs = new Map<string, Mesh>();
    private activeShellName: string | null = null;

    constructor(canvas: HTMLCanvasElement, onReady: (manager: SceneManager) => void) {
        this.engine = new Engine(canvas, true, { alpha: true });
        this.scene = new Scene(this.engine);
        this.assetManager = new AssetManager(this.scene);
        this.scene.clearColor = new Color4(0, 0, 0, 0);

        const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 3, Vector3.Zero(), this.scene);
        camera.minZ = 0.1;
        camera.attachControl(canvas, true);
        new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        camera.fov = 0.3;
        camera.lowerRadiusLimit = 1.5;
        camera.upperRadiusLimit = 4;
        camera.panningSensibility = 0;
        camera.wheelPrecision = 150;

        this.loadInitialAssets(onReady);

        this.engine.runRenderLoop(() => this.scene.render());
        this.resizeObserver = new ResizeObserver(() => this.engine.resize());
        this.resizeObserver.observe(canvas);
    }

    private _setupMaterialWithPlugin(material: PBRMaterial, modelName: string): ColorSwapPlugin {
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;

        const colorIdTexture = new Texture(`${rootUrl}${modelName}.png`, this.scene, true, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);
        colorIdTexture.gammaSpace = false;
        material.albedoTexture = colorIdTexture;

        const detailTexture = new Texture(`${rootUrl}details.png`, this.scene);
        detailTexture.coordinatesIndex = 0;
        detailTexture.uScale = 3;
        detailTexture.vScale = 3;
        material.detailMap.isEnabled = true;
        material.detailMap.normalBlendMethod = 1;
        material.detailMap.texture = detailTexture;
        material.detailMap.diffuseBlendLevel = 0;
        material.detailMap.roughnessBlendLevel = 0;
        material.detailMap.bumpLevel = .35;

        // --- START OF PALETTE SIZE MISMATCH FIX ---
        // Ensure initialReplacements matches _paletteColorCount (assumed to be 20 from logic.tsx)
        const paletteColorsFromLogic = GLOVE_TO_WEBS_MAP.COLOR_OPTIONS // Assuming COLOR_OPTIONS is exported from logic.tsx
            .map(opt => Color3.FromHexString(opt.hex).toLinearSpace()) // Convert hex to linear Color3
            .slice(0, 20); // Take only the first 20

        const gloveConfig: ColorSwapConfig = {
            baseColors: [ // Ensure this still has 32 colors
                "#FF0000", "#00FFFF", "#80FF00", "#7F00FF", "#FFBF00", "#0040FF", "#00FF40", "#FF00BF",
                "#FF6000", "#009FFF", "#20FF00", "#DF00FF", "#DFFF00", "#2000FF", "#00FF9F", "#FF0060",
                "#FF3000", "#00CFFF", "#50FF00", "#AF00FF", "#FFEF00", "#0010FF", "#00FF70", "#FF008F",
                "#FF8F00", "#0070FF", "#00FF10", "#FF00EF", "#AFFF00", "#5000FF", "#00FFCF", "#FF0030"
            ],
            initialReplacements: paletteColorsFromLogic // Use the actual 20 palette colors
        };
        // --- END OF PALETTE SIZE MISMATCH FIX ---

        const plugin = new ColorSwapPlugin(material, gloveConfig);
        return plugin;
    }

    private async loadInitialAssets(onReady: (manager: SceneManager) => void) {
        const initialGloveName = 'openBack';
        await this.updateBuild(initialGloveName);
        this.isSceneReady = true;
        onReady(this);
    }

    public isReady = (): boolean => this.isSceneReady;

    // --- START OF SCENEMANAGER UPDATE FIX ---
    // Renamed methods and updated calls to use the new plugin method
    public updateShellZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeShellPlugin?.updateZonePaletteIndex(zoneIndex, paletteIndex);
    }

    public updateWebZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeWebPlugin?.updateZonePaletteIndex(zoneIndex, paletteIndex);
    }
    // --- END OF SCENEMANAGER UPDATE FIX ---


    public async updateBuild(modelName: string): Promise<void> {
        if (!modelName || this.activeShellName === modelName) return;

        if (this.shellMaterialsCache.has(modelName)) {
            const cached = this.shellMaterialsCache.get(modelName)!;
            this.activeShellMaterial = cached.material;
            this.activeShellPlugin = cached.plugin;
        } else {
            const container = await this.assetManager.getAsset(modelName);
            const mesh = container.meshes.find(m => m.name === modelName) as Mesh;
            if (mesh) {
                container.addAllToScene();
                this.gloveShells.set(modelName, mesh);

                const gloveMaterial = container.materials.find(m => m.name === 'gloveMat') as PBRMaterial;
                if (gloveMaterial) {
                    const newPlugin = this._setupMaterialWithPlugin(gloveMaterial, modelName);
                    this.activeShellMaterial = gloveMaterial;
                    this.activeShellPlugin = newPlugin;
                    this.shellMaterialsCache.set(modelName, { material: gloveMaterial, plugin: newPlugin });
                }
            }
        }

        this.activeShellName = modelName;
        this.gloveShells.forEach((mesh, name) => {
            mesh.setEnabled(name === modelName);
        });

        const websToPreload = GLOVE_TO_WEBS_MAP[modelName as keyof typeof GLOVE_TO_WEBS_MAP];
        if (websToPreload) {
            this.assetManager.preloadAssets(Object.values(websToPreload));
        }
    }

    public async updateWeb(webModelName: string): Promise<void> {
        if (!webModelName) {
            this.webs.forEach(mesh => mesh.setEnabled(false));
            this.activeWebMaterial = null;
            this.activeWebPlugin = null;
            return;
        }

        if (this.webMaterialsCache.has(webModelName)) {
            const cached = this.webMaterialsCache.get(webModelName)!;
            this.activeWebMaterial = cached.material;
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
                    this.activeWebMaterial = webMaterial;
                    this.activeWebPlugin = webPlugin;
                    this.webMaterialsCache.set(webModelName, { material: webMaterial, plugin: webPlugin });
                }
            }
        }

        this.webs.forEach((mesh, name) => {
            mesh.setEnabled(name === webModelName);
        });
    }

    public updateText = (options: { zone: string; text: string; font: string; color: string; }) => {
        const { zone, text, font, color } = options;
        if (!this.activeShellName) return;
        const materialName = `${zone}${this.activeShellName.charAt(0).toUpperCase() + this.activeShellName.slice(1)}`;
        const textMat = this.scene.getMaterialByName(materialName) as PBRMaterial;
        if (textMat) {
            let texture = this.textTextures.get(zone);
            if (!texture) {
                texture = new DynamicTexture(zone, { width: 512, height: 256 }, this.scene);
                texture.hasAlpha = true;
                textMat.albedoTexture = texture;
                textMat.useAlphaFromAlbedoTexture = true;
                textMat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
                textMat.unlit = true;
                this.textTextures.set(zone, texture);
            }
            const fontSize = text ? 70 : 90;
            const fontString = `bold ${fontSize}px "${font}"`;
            const ctx = texture.getContext();
            ctx.clearRect(0, 0, texture.getSize().width, texture.getSize().height);
            if (text) {
                texture.drawText(text, null, null, fontString, color, 'transparent', false);
            }
        } else {
             console.warn(`Text material "${materialName}" not found on active model.`);
        }
    };

    public dispose() {
        this.shellMaterialsCache.forEach(cached => cached.plugin.dispose()); // Dispose plugins in cache
        this.shellMaterialsCache.clear();
        this.webMaterialsCache.forEach(cached => cached.plugin.dispose()); // Dispose plugins in cache
        this.webMaterialsCache.clear();
        // Removed potential double-dispose: this.activeShellPlugin?.dispose();
        // Removed potential double-dispose: this.activeWebPlugin?.dispose();
        this.resizeObserver.disconnect();
        this.scene.dispose(); // Dispose scene resources
        this.engine.dispose(); // Dispose engine
    }
}

interface BabylonCanvasProps {
    onSceneReady: (sceneManager: SceneManager) => void;
}

const BabylonCanvas = ({ onSceneReady }: BabylonCanvasProps) => {
    const reactCanvas = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const { current: canvas } = reactCanvas;
        if (!canvas) return;

        const sceneManager = new SceneManager(canvas, onSceneReady);

        return () => {
            sceneManager.dispose();
        };
    }, [onSceneReady]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default BabylonCanvas;