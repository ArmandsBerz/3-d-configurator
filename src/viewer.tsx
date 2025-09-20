// src/viewer.tsx
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
    Color3
} from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';
import "@babylonjs/loaders";

// --- INTERFACE FOR PLUGIN CONFIGURATION ---
// No changes here
interface ColorSwapConfig {
    baseColors: string[]; // Hex strings
    initialReplacements: Color3[];
}

// --- REFACTORED PLUGIN CODE ---
// No changes here
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
// No changes here
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


// --- MODIFIED SceneManager Class ---
// This is now exported and has public methods for our logic to call.
export class SceneManager {
    private engine: Engine;
    private scene: Scene;
    private resizeObserver: ResizeObserver;
    private assetManager: AssetManager;
    private colorPlugin: ColorSwapPlugin | null = null;
    private isSceneReady = false; // <-- CHANGE #2: Added a ready flag

    constructor(canvas: HTMLCanvasElement, onReady: (manager: SceneManager) => void) {
        const engine = new Engine(canvas, true, { alpha: true });
        this.engine = engine;
        const scene = new Scene(engine);
        this.scene = scene;
        this.assetManager = new AssetManager(this.scene);
        scene.clearColor = new Color4(0, 0, 0, 0);
        const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
        camera.minZ = 0.01;
        camera.wheelDeltaPercentage = 0.002;
        camera.attachControl(canvas, true);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

        this.assetManager.getAsset('openBack').then(container => {
            container.addAllToScene();
            const gloveMaterial = container.materials.find(m => m.name === 'glove');

            if (gloveMaterial && gloveMaterial instanceof PBRMaterial) {
                const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;
                const colorIdTexture = new Texture(`${rootUrl}openBack.png`, this.scene, true, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);
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
                this.colorPlugin = new ColorSwapPlugin(gloveMaterial, gloveConfig);
            }
            
            // --- CHANGE #2 & #4 ---
            // Set the ready flag and call the callback to notify React
            this.isSceneReady = true;
            onReady(this);

            Promise.resolve().then(() => this.assetManager.preloadAssets(['closeBack']));
        });
        
        // This remains untouched as requested.
        this.createUI();

        engine.runRenderLoop(() => scene.render());
        this.resizeObserver = new ResizeObserver(() => engine.resize());
        this.resizeObserver.observe(canvas);
    }

    // Your testing UI - no changes made here.
    private createUI() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        for (let i = 0; i < 10; i++) {
            const button = Button.CreateSimpleButton(`randomBtn_${i}`, `Randomize Color ${i + 1}`);
            button.width = "200px";
            button.height = "40px";
            button.color = "white";
            button.background = "#555555";
            button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            button.paddingRight = "20px";
            button.top = `${20 + (i * 50)}px`;
            button.onPointerUpObservable.add(() => {
                if (this.colorPlugin) {
                    const randomColor = new Color3(Math.random(), Math.random(), Math.random());
                    this.colorPlugin.updateColor(i, randomColor);
                }
            });
            advancedTexture.addControl(button);
        }
    }

    // --- CHANGE #2 & #3: NEW PUBLIC METHODS ---
    public isReady = (): boolean => this.isSceneReady;

    public updateColor = (index: number, color: Color3) => {
        this.colorPlugin?.updateColor(index, color);
    };

    public updateBuild = (buildConfig: any) => {
        console.log("SceneManager received build update:", buildConfig.imageSelection);
        // Future logic for swapping 3D models will go here.
    };

    public dispose() {
        this.colorPlugin?.dispose();
        this.resizeObserver.disconnect();
        this.engine.dispose();
    }
}

// --- MODIFIED BabylonCanvas COMPONENT ---
interface BabylonCanvasProps {
    onSceneReady: (sceneManager: SceneManager) => void;
}

const BabylonCanvas = ({ onSceneReady }: BabylonCanvasProps) => {
    const reactCanvas = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const { current: canvas } = reactCanvas;
        if (!canvas) return;

        // The SceneManager is now created and its instance is passed up via the callback
        const sceneManager = new SceneManager(canvas, onSceneReady);

        return () => {
            sceneManager.dispose();
        };
    }, [onSceneReady]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default BabylonCanvas;