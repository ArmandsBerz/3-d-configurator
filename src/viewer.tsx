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
    // Note: SubMesh is implicitly used by bindForSubMesh, but not explicitly imported.
    // This was in your original code, so I am preserving it.
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
    // Removed: private _baseColors: Color3[] = [];
    // Removed: private _replacements: Color3[] = [];
    private _dataLUT: DynamicTexture; // Will hold base colors + pointers
    private _paletteLUT: Texture; // Will hold the swappable palette colors
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
            return; // Early exit if config is fundamentally broken
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
            // You'd need a more complex encoding (using G and B channels) for more colors.
            return;
        }

        const scene = material.getScene(); // Get scene reference

        // 2. Create _dataLUT (Dynamic Texture - zoneCount x 2)
        this._dataLUT = new DynamicTexture("dataLUT", { width: this._zoneCount, height: 2 }, scene, false);
        this._dataLUT.updateSamplingMode(Constants.TEXTURE_NEAREST_SAMPLINGMODE); // Critical: Nearest for exact data
        this._dataLUT.gammaSpace = false; // Critical: Treat as linear data, not sRGB color

        // 3. Create _paletteLUT (Static Texture - paletteColorCount x 1)
        const paletteBufferSize = this._paletteColorCount * 3; // 3 bytes per RGB color
        const paletteBuffer = new Uint8Array(paletteBufferSize);
        let bufferIndex = 0;
        for (const color of config.initialReplacements) {
            // Convert Color3 (linear, 0-1) to sRGB bytes (0-255) for RawTexture
            // RawTexture.CreateRGBTexture expects sRGB bytes by default
            const gammaColor = color.toGammaSpace(); // Convert back to gamma space
            paletteBuffer[bufferIndex++] = Math.round(gammaColor.r * 255);
            paletteBuffer[bufferIndex++] = Math.round(gammaColor.g * 255);
            paletteBuffer[bufferIndex++] = Math.round(gammaColor.b * 255);
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

        // 4. Populate _dataLUT
        const ctx = this._dataLUT.getContext();
        for (let i = 0; i < this._zoneCount; i++) {
            // Draw the baseColor (Hex string from config) onto Row 0
            // Need to handle potential missing base colors if array is somehow shorter
            ctx.fillStyle = config.baseColors[i] || '#000000'; // Default to black if missing
            ctx.fillRect(i, 0, 1, 1);

            // Draw the Initial Pointer onto Row 1
            // Maps Zone 'i' to Palette Index 'i % paletteColorCount'
            const initialPaletteIndex = i % this._paletteColorCount;
            ctx.fillStyle = encodeIndexAsColor(initialPaletteIndex);
            ctx.fillRect(i, 1, 1, 1);
        }

        // 5. Update _dataLUT to send initial data to GPU
        this._dataLUT.update();

        // Removed old broken assignments:
        // this._replacements = [...config.initialReplacements];
        // for (const hex of config.baseColors) { ... this._baseColors.push(linearColor); ... }

        // --- END OF STEP 2 MODIFICATION ---

        this.isEnabled = true;
    }
    public updateColor(index: number, newColor: Color3) {
        if (index < 0 || index >= this._replacements.length) { // <-- This line is now broken (as expected)
            // console.warn(`ColorSwapPlugin: Invalid color index provided: ${index}`);
            return;
        }
        this._replacements[index] = newColor; // <-- This line is now broken (as expected)
    }
    public dispose() {
        // --- TODO: Also dispose the textures when Step 3+ are done ---
        // this._dataLUT?.dispose();
        // this._paletteLUT?.dispose();
        this._baseColors = []; // <-- This line is now broken (as expected)
        this._replacements = []; // <-- This line is now broken (as expected)
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
        samplers.push("albedoSampler");
    }
    prepareDefines(defines: MaterialDefines) {
        defines["COLOR_SWAP"] = this._isEnabled;
    }
    getUniforms() {
        const arraySize = this._baseColors?.length > 0 ? this._baseColors.length : 32; // <-- This line is now broken (as expected)
        return {
            ubo: [
                { name: "replacements", size: 3, type: "vec3", arraySize },
                { name: "baseColors", size: 3, type: "vec3", arraySize },
                { name: "blendRadius", size: 1, type: "float" },
                { name: "blendStrength", size: 1, type: "float" },
            ],
            fragment: `
#ifdef COLOR_SWAP
uniform vec3 replacements[${arraySize}];
uniform vec3 baseColors[${arraySize}];
uniform float blendRadius;
uniform float blendStrength;
uniform sampler2D albedoSampler;
varying vec2 vAlbedoUV;
#endif
`
        };
    }
    bindForSubMesh(uniformBuffer: UniformBuffer) {
        if (this._isEnabled) {
            const replacementsArray = new Float32Array(this._replacements.length * 3); // <-- This line is now broken (as expected)
            const baseColorsArray = new Float32Array(this._baseColors.length * 3); // <-- This line is now broken (as expected)
            for (let i = 0; i < this._replacements.length; i++) { // <-- This line is now broken (as expected)
                replacementsArray.set(this._replacements[i].asArray(), i * 3); // <-- This line is now broken (as expected)
                baseColorsArray.set(this._baseColors[i].asArray(), i * 3); // <-- This line is now broken (as expected)
            }
            uniformBuffer.updateArray("replacements", [...replacementsArray]);
            uniformBuffer.updateArray("baseColors", [...baseColorsArray]);
            uniformBuffer.updateFloat("blendRadius", this.blendRadius);
            uniformBuffer.updateFloat("blendStrength", this.blendStrength);
        }
    }
    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            const arraySize = this._baseColors?.length > 0 ? this._baseColors.length : 32; // <-- This line is now broken (as expected)
            return {
                "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
#ifdef COLOR_SWAP
vec3 finalPixelColor = surfaceAlbedo.rgb;
const float MATCH_TOLERANCE = 0.05;
int bestIndex = -1;
for (int i = 0; i < ${arraySize}; i++) {
    float dist = distance(finalPixelColor, baseColors[i]);
    if (dist < MATCH_TOLERANCE) {
        bestIndex = i;
        break;
    }
}
if (bestIndex != -1) {
    finalPixelColor = replacements[bestIndex];
}
surfaceAlbedo.rgb = finalPixelColor;
#endif
`
            };
        }
        return null;
    }
}

// --- AssetManager Class ---
// (No changes below this line, except for the typo fix)
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

    // --- Properties for the two-material system ---
    private activeShellMaterial: PBRMaterial | null = null;
    private activeShellPlugin: ColorSwapPlugin | null = null;
    private activeWebMaterial: PBRMaterial | null = null;
    private activeWebPlugin: ColorSwapPlugin | null = null;

    // --- Caches for efficiency ---
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

        // --- CAMERA CONFIGURATION UPDATED ---
        const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 3, Vector3.Zero(), this.scene);
        camera.minZ = 0.1;
        camera.attachControl(canvas, true);
        new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        // --- APPLYING THE EXACT SETTINGS HERE ---
        camera.fov = 0.3; // Narrows the field of view like a telephoto lens.
        camera.lowerRadiusLimit = 1.5; // Prevents zooming in too close.
        camera.upperRadiusLimit = 4; // Prevents zooming out too far.
        camera.panningSensibility = 0; // Disables camera panning (click and drag).
        camera.wheelPrecision = 150; // Controls zoom speed.

        this.loadInitialAssets(onReady);

        this.engine.runRenderLoop(() => this.scene.render());
        this.resizeObserver = new ResizeObserver(() => this.engine.resize());
        this.resizeObserver.observe(canvas);
    }

    // --- NEW: Reusable "recipe" function to set up any material ---
    private _setupMaterialWithPlugin(material: PBRMaterial, modelName: string): ColorSwapPlugin {
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;

        // Set unique Color ID texture for this model
        const colorIdTexture = new Texture(`${rootUrl}${modelName}.png`, this.scene, true, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);

        // --- START OF CHATGPT WARNING 5 (Gamma) ---
        // This is where you would apply the gammaSpace = false rule.
        // It's applied to the colorIdTexture, not just the LUT.
        colorIdTexture.gammaSpace = false;
        // --- END OF CHATGPT WARNING 5 (Gamma) ---

        material.albedoTexture = colorIdTexture;

        // NOTE: Here you would also set the unique normal map for the model
        // const normalTexture = new Texture(`${rootUrl}${modelName}_normal.png`, this.scene);
        // material.bumpTexture = normalTexture;

        // Add other shared textures like the detail map
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

        // Create the color swap plugin instance with the full color palette
        const gloveConfig: ColorSwapConfig = {
            baseColors: [
                "#FF0000", "#00FFFF", "#80FF00", "#7F00FF", "#FFBF00", "#0040FF", "#00FF40", "#FF00BF",
                "#FF6000", "#009FFF", "#20FF00", "#DF00FF", "#DFFF00", "#2000FF", "#00FF9F", "#FF0060",
                "#FF3000", "#00CFFF", "#50FF00", "#AF00FF", "#FFEF00", "#0010FF", "#00FF70", "#FF008F",
                "#FF8F00", "#0070FF", "#00FF10", "#FF00EF", "#AFFF00", "#5000FF", "#00FFCF", "#FF0030"
            ],
            // NOTE: This initialReplacements should now ideally match the actual palette size (e.g., 20)
            initialReplacements: Array(32).fill(0).map(() => new Color3(Math.random(), Math.random(), Math.random()))
        };

        const plugin = new ColorSwapPlugin(material, gloveConfig);
        return plugin;
    }

    private async loadInitialAssets(onReady: (manager: SceneManager) => void) {
        const initialGloveName = 'openBack';
        await this.updateBuild(initialGloveName); // Use the new updateBuild to handle initial setup
        this.isSceneReady = true;
        onReady(this);
    }

    public isReady = (): boolean => this.isSceneReady;

    // --- NEW: Specific update methods for shell and web ---
    public updateShellColor(index: number, color: Color3): void {
        this.activeShellPlugin?.updateColor(index, color);
    }

    public updateWebColor(index: number, color: Color3): void {
        this.activeWebPlugin?.updateColor(index, color);
    }

    // --- REFACTORED: updateBuild now uses the caching pattern ---
    public async updateBuild(modelName: string): Promise<void> {
        if (!modelName || this.activeShellName === modelName) return;

        // 1. Check if the shell's material setup is already in the cache.
        if (this.shellMaterialsCache.has(modelName)) {
            // --- CACHE HIT (It's been loaded before) ---
            const cached = this.shellMaterialsCache.get(modelName)!;
            this.activeShellMaterial = cached.material; // Point to the cached material
            this.activeShellPlugin = cached.plugin;   // Point to the cached plugin
        } else {
            // --- CACHE MISS (First time loading this shell) ---
            const container = await this.assetManager.getAsset(modelName);
            const mesh = container.meshes.find(m => m.name === modelName) as Mesh;
            if (mesh) {
                container.addAllToScene();
                this.gloveShells.set(modelName, mesh);

                const gloveMaterial = container.materials.find(m => m.name === 'gloveMat') as PBRMaterial;
                if (gloveMaterial) {
                    // Create the setup ONCE using your factory function
                    const newPlugin = this._setupMaterialWithPlugin(gloveMaterial, modelName);

                    // Point the active properties to this new setup
                    this.activeShellMaterial = gloveMaterial;
                    this.activeShellPlugin = newPlugin;

                    // CRITICAL: Save the new setup into the cache for next time
                    this.shellMaterialsCache.set(modelName, { material: gloveMaterial, plugin: newPlugin });
                }
            }
        }

        // This logic below remains the same
        this.activeShellName = modelName;
        this.gloveShells.forEach((mesh, name) => {
            mesh.setEnabled(name === modelName);
        });

        const websToPreload = GLOVE_TO_WEBS_MAP[modelName as keyof typeof GLOVE_TO_WEBS_MAP];
        if (websToPreload) {
            this.assetManager.preloadAssets(Object.values(websToPreload));
        }
    }

    // --- OVERHAULED: updateWeb now manages its own material and plugin ---
    public async updateWeb(webModelName: string): Promise<void> {
        // If no web is selected, hide them all and clear active material/plugin
        if (!webModelName) {
            this.webs.forEach(mesh => mesh.setEnabled(false));
            this.activeWebMaterial = null;
            this.activeWebPlugin = null;
            return;
        }

        // Check if we've already configured this web's material
        if (this.webMaterialsCache.has(webModelName)) {
            const cached = this.webMaterialsCache.get(webModelName)!;
            this.activeWebMaterial = cached.material;
            this.activeWebPlugin = cached.plugin;
        } else {
            // If not cached, load the asset and set up its material for the first time
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

        // Finally, ensure only the correct web mesh is visible
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
        this.activeShellPlugin?.dispose();
        this.shellMaterialsCache.forEach(cached => cached.plugin.dispose());
        this.shellMaterialsCache.clear();
        this.webMaterialsCache.forEach(cached => cached.plugin.dispose());
        this.webMaterialsCache.clear();
        this.resizeObserver.disconnect();
        this.engine.dispose();
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