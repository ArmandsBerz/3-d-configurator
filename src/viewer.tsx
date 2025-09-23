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
    Material,
    Texture,
    PBRMaterial,
    MaterialPluginBase,
    PBRBaseMaterial,
    MaterialDefines,
    UniformBuffer,
    Constants,
    Color3,
    DynamicTexture
} from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import "@babylonjs/loaders";
// --- CORRECTED --- Import only what's necessary
import { GLOVE_TO_WEBS_MAP } from './logic';

// --- INTERFACE FOR PLUGIN CONFIGURATION ---
interface ColorSwapConfig {
    baseColors: string[]; // Hex strings
    initialReplacements: Color3[];
}

// --- REFACTORED PLUGIN CODE ---
class ColorSwapPlugin extends MaterialPluginBase {
    private _baseColors: Color3[] = [];
    private _replacements: Color3[] = [];
    public blendRadius = 0.01;
    public blendStrength = 1.5;
    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;
    constructor(material: PBRBaseMaterial, config: ColorSwapConfig) {
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];
        if (!config || !config.baseColors || !config.initialReplacements || config.baseColors.length !== config.initialReplacements.length) {
            console.error("ColorSwapPlugin: Invalid configuration provided.");
            return;
        }
        this._replacements = [...config.initialReplacements];
        for (const hex of config.baseColors) {
            const linearColor = Color3.FromHexString(hex).toLinearSpace();
            this._baseColors.push(linearColor);
        }
        this.isEnabled = true;
    }
    public updateColor(index: number, newColor: Color3) {
        if (index < 0 || index >= this._replacements.length) {
            console.warn(`ColorSwapPlugin: Invalid color index provided: ${index}`);
            return;
        }
        this._replacements[index] = newColor;
    }
    public dispose() {
        this._baseColors = [];
        this._replacements = [];
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
        const arraySize = this._baseColors?.length > 0 ? this._baseColors.length : 10;
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
            const replacementsArray = new Float32Array(this._replacements.length * 3);
            const baseColorsArray = new Float32Array(this._baseColors.length * 3);
            for (let i = 0; i < this._replacements.length; i++) {
                replacementsArray.set(this._replacements[i].asArray(), i * 3);
                baseColorsArray.set(this._baseColors[i].asArray(), i * 3);
            }
            uniformBuffer.updateArray("replacements", [...replacementsArray]);
            uniformBuffer.updateArray("baseColors", [...baseColorsArray]);
            uniformBuffer.updateFloat("blendRadius", this.blendRadius);
            uniformBuffer.updateFloat("blendStrength", this.blendStrength);
        }
    }
    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            const arraySize = this._baseColors?.length > 0 ? this._baseColors.length : 10;
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
    private colorPlugin: ColorSwapPlugin | null = null;
    private isSceneReady = false;
    private textTextures = new Map<string, DynamicTexture>();

    // --- NEW --- Properties to store and manage loaded models
    private gloveShells = new Map<string, Mesh>();
    private webs = new Map<string, Mesh>();
    private activeShellName: string | null = null;

    constructor(canvas: HTMLCanvasElement, onReady: (manager: SceneManager) => void) {
        this.engine = new Engine(canvas, true, { alpha: true });
        this.scene = new Scene(this.engine);
        this.assetManager = new AssetManager(this.scene);
        this.scene.clearColor = new Color4(0, 0, 0, 0);
        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), this.scene);
        camera.minZ = 0.01;
        camera.wheelDeltaPercentage = 0.002;
        camera.attachControl(canvas, true);
        new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        // --- UPDATED --- Load only the initial assets required for startup
        this.loadInitialAssets(onReady);

        this.createUI();

        this.engine.runRenderLoop(() => this.scene.render());
        this.resizeObserver = new ResizeObserver(() => this.engine.resize());
        this.resizeObserver.observe(canvas);
    }

    // --- STEP 1: Created the new "recipe" function ---
    private _setupGloveMaterial(gloveMaterial: PBRMaterial, modelName: string) {
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;
        
        // --- STEP 2: Made texture loading dynamic ---
        const colorIdTexture = new Texture(`${rootUrl}${modelName}.png`, this.scene, true, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);
        gloveMaterial.albedoTexture = colorIdTexture;

        const detailTexture = new Texture(`${rootUrl}details.png`, this.scene);
        detailTexture.coordinatesIndex = 0;
        detailTexture.uScale = 4;
        detailTexture.vScale = 4;
        gloveMaterial.detailMap.isEnabled = true;
        gloveMaterial.detailMap.normalBlendMethod = 1;
        gloveMaterial.detailMap.texture = detailTexture;
        gloveMaterial.detailMap.diffuseBlendLevel = 0;
        gloveMaterial.detailMap.roughnessBlendLevel = 0;
        gloveMaterial.detailMap.bumpLevel = .6;

        const gloveConfig: ColorSwapConfig = {
             baseColors: ["#FF0000", "#00FFFF", "#80FF00", "#7F00FF", "#FFBF00", "#0040FF", "#00FF40", "#FF00BF", "#FF6000", "#FF0060"],
             initialReplacements: [new Color3(1.0, 0.0, 1.0), new Color3(1.0, 1.0, 0.0), new Color3(0.0, 1.0, 1.0), new Color3(1.0, 0.5, 0.0), new Color3(0.5, 0.0, 1.0), new Color3(0.5, 0.0, 1.0), new Color3(0.2, 0.0, 0.2), new Color3(0.1, 0.5, 0.9), new Color3(1.0, 1.0, 1.0), new Color3(0.0, 1.0, 0.0)]
        };

        // --- STEP 3: Dispose of the old plugin to prevent leaks ---
        this.colorPlugin?.dispose();
        this.colorPlugin = new ColorSwapPlugin(gloveMaterial, gloveConfig);
    }

    private async loadInitialAssets(onReady: (manager: SceneManager) => void) {
        const initialGloveName = 'openBack';
        const container = await this.assetManager.getAsset(initialGloveName);
        
        container.addAllToScene();
        const gloveMesh = container.meshes.find(m => m.name === initialGloveName) as Mesh;
        if (gloveMesh) {
            this.gloveShells.set(initialGloveName, gloveMesh);
        }

        const gloveMaterial = container.materials.find(m => m.name === 'glove') as PBRMaterial;
        if (gloveMaterial) {
            // --- STEP 4 (Initial Load): Call the new function ---
            this._setupGloveMaterial(gloveMaterial, initialGloveName);
        }

        this.gloveShells.forEach(mesh => mesh.setEnabled(false));

        this.isSceneReady = true;
        onReady(this);
    }
    
    // Debug buttons remain for testing
    private createUI() { /* ... unchanged ... */ }
    
    public isReady = (): boolean => this.isSceneReady;
    
    public updateColor = (index: number, color: Color3) => {
        this.colorPlugin?.updateColor(index, color);
    };
    
    public async updateBuild(modelName: string): Promise<void> {
        if (!modelName) return;

        // 1. Load the shell model on-demand if it's not already in our collection
        if (!this.gloveShells.has(modelName)) {
            const container = await this.assetManager.getAsset(modelName);
            const mesh = container.meshes.find(m => m.name === modelName) as Mesh;
            if (mesh) {
                container.addAllToScene();
                this.gloveShells.set(modelName, mesh);

                // --- STEP 4 (On-Demand Load): Find and set up the new material ---
                const gloveMaterial = container.materials.find(m => m.name === 'glove') as PBRMaterial;
                if (gloveMaterial) {
                    this._setupGloveMaterial(gloveMaterial, modelName);
                }
            }
        }
        
        // 2. Set the active shell and hide all others
        this.activeShellName = modelName;
        this.gloveShells.forEach((mesh, name) => {
            mesh.setEnabled(name === modelName);
        });

        // 3. Trigger background pre-loading for this shell's compatible webs
        const websToPreload = GLOVE_TO_WEBS_MAP[modelName as keyof typeof GLOVE_TO_WEBS_MAP];
        if (websToPreload) {
            this.assetManager.preloadAssets(Object.values(websToPreload));
        }
    }

    public async updateWeb(webType: string): Promise<void> {
        if (!webType) return;
        
        if (!this.webs.has(webType)) {
            const container = await this.assetManager.getAsset(webType);
            const mesh = container.meshes.find(m => m.name === webType) as Mesh;
            if (mesh) {
                container.addAllToScene();
                this.webs.set(webType, mesh);
            }
        }

        this.webs.forEach((mesh, name) => {
            mesh.setEnabled(name === webType);
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
        this.colorPlugin?.dispose();
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
