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
    // --- ADDED IMPORTS for Plugin and GUI ---
    MaterialPluginBase,
    PBRBaseMaterial,
    MaterialDefines,
    UniformBuffer,
    Constants,
    Color3
} from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui'; // GUI Imports
import "@babylonjs/loaders/glTF";


// --- INTERFACE FOR PLUGIN CONFIGURATION ---
interface ColorSwapConfig {
    baseColors: string[]; // Hex strings
    initialReplacements: Color3[];
}


// --- REFACTORED PLUGIN CODE ---
class ColorSwapPlugin extends MaterialPluginBase {
    // --- PRIVATE INTERNAL STATE ---
    private _baseColors: Color3[] = [];
    private _replacements: Color3[] = [];
    private _specialBaseColor!: Color3; // For the neighbor-mixing logic
    // _material is inherited from MaterialPluginBase and should not be re-declared.


    // Public properties for shader uniforms
    public blendRadius = 0.01;
    public blendStrength = 1.5;


    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;


    // --- CONSTRUCTOR ACCEPTS CONFIGURATION ---
    constructor(material: PBRBaseMaterial, config: ColorSwapConfig) {
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        // The super() call handles assigning the material to this._material
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];


        // --- VALIDATE AND INITIALIZE FROM CONFIG ---
        if (!config || !config.baseColors || !config.initialReplacements || config.baseColors.length !== config.initialReplacements.length) {
            console.error("ColorSwapPlugin: Invalid configuration provided.");
            return;
        }


        this._replacements = [...config.initialReplacements];


        // Convert hex base colors to linear Color3 objects
        for (const hex of config.baseColors) {
            const linearColor = Color3.FromHexString(hex).toLinearSpace();
            this._baseColors.push(linearColor);
            // Identify and store the special color for the neighbor logic
            if (hex === "#FF0060") {
                this._specialBaseColor = linearColor;
            }
        }
        
        if (!this._specialBaseColor) {
             console.warn("ColorSwapPlugin: Special base color #FF0060 not found in config.");
             // Assign a fallback to prevent crashes
             this._specialBaseColor = new Color3(1.0, 0.0, 0.376); 
        }

        this.isEnabled = true;
    }


    // --- CONTROLLED PUBLIC API FOR UPDATES ---
    public updateColor(index: number, newColor: Color3) {
        if (index < 0 || index >= this._replacements.length) {
            console.warn(`ColorSwapPlugin: Invalid color index provided: ${index}`);
            return;
        }
        this._replacements[index] = newColor;
    }


    // --- DISPOSE METHOD FOR CLEANUP ---
    public dispose() {
        // Clean up this plugin's specific properties
        this._baseColors = [];
        this._replacements = [];
        // Call the base class dispose method for its cleanup
        super.dispose();
    }


    get isEnabled() { return this._isEnabled; }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled) return;
        this._isEnabled = enabled;
        this._markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }


    // Tells the engine that our plugin needs access to this sampler
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
                { name: "specialBaseColor", size: 3, type: "vec3"}
            ],
            fragment: `
#ifdef COLOR_SWAP
uniform vec3 replacements[${arraySize}];
uniform vec3 baseColors[${arraySize}];
uniform float blendRadius;
uniform float blendStrength;
uniform vec3 specialBaseColor;
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
            uniformBuffer.updateColor3("specialBaseColor", this._specialBaseColor);
        }
    }


    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            const arraySize = this._baseColors?.length > 0 ? this._baseColors.length : 10;
            return {
                "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
#ifdef COLOR_SWAP
vec3 finalPixelColor = surfaceAlbedo.rgb;

// --- NON-EXHAUSTIVE SEARCH FOR CURRENT PIXEL ---
const float MATCH_TOLERANCE = 0.05;
int bestIndex = -1; // -1 is the initial "no match found" state.

for (int i = 0; i < ${arraySize}; i++) {
    float dist = distance(finalPixelColor, baseColors[i]);
    if (dist < MATCH_TOLERANCE) {
        bestIndex = i;
        break; // The crucial kill switch: the loop terminates immediately.
    }
}

// --- CONDITIONAL LOGIC FOR MAIN VS. BORDER ZONES ---
// If the pixel is the special pink border color...
if (distance(finalPixelColor, specialBaseColor) < MATCH_TOLERANCE) {
    // --- Isolated Neighbor Sampling ---
    vec2 texelSize = 1.0 / vec2(textureSize(albedoSampler, 0));
    vec3 neighbors[4];
    neighbors[0] = texture(albedoSampler, vAlbedoUV + vec2(0.0, texelSize.y)).rgb; // Up
    neighbors[1] = texture(albedoSampler, vAlbedoUV + vec2(0.0, -texelSize.y)).rgb; // Down
    neighbors[2] = texture(albedoSampler, vAlbedoUV + vec2(-texelSize.x, 0.0)).rgb; // Left
    neighbors[3] = texture(albedoSampler, vAlbedoUV + vec2(texelSize.x, 0.0)).rgb; // Right

    // --- Comprehensive Filtered Collection ---
    
    // 1. INITIALIZATION: Array can now hold up to 4 indices.
    int validIndices[4];
    validIndices[0] = -1;
    validIndices[1] = -1;
    validIndices[2] = -1;
    validIndices[3] = -1;
    int foundCount = 0;
    
    // 2. COMPREHENSIVE SEARCH: Loop now checks ALL 4 neighbors.
    for (int j = 0; j < 4; j++) {
        
        // 3. REUSED "KILL SWITCH" IDENTIFICATION:
        // This efficient search is now used for each neighbor.
        int neighborBestIndex = -1;
        for (int i = 0; i < ${arraySize}; i++) {
            float dist = distance(neighbors[j], baseColors[i]);
            if (dist < MATCH_TOLERANCE) {
                neighborBestIndex = i;
                break; // Stop as soon as a match is found.
            }
        }
    
        // 4. SIMPLIFIED FILTERING & COLLECTION:
        // The tolerance check is now part of the identification itself.
        if (neighborBestIndex != -1 && neighborBestIndex != 9) {
            validIndices[foundCount] = neighborBestIndex;
            foundCount++;
        }
    }
    
    // The flexible mixing logic would go here, using the 'validIndices' and 'foundCount' results.
    // For now, we are not mixing. We can use a placeholder to visualize.
    finalPixelColor = vec3(0.0, 0.0, 1.0); // Blue placeholder: collection is complete.

}
// ELSE, for all other non-pink colors...
else {
    // --- MAIN COLOR SWAPPING LOGIC ---
    if (bestIndex != -1) {
        finalPixelColor = replacements[bestIndex];
    }
}

surfaceAlbedo.rgb = finalPixelColor;
#endif
`
            };
        }
        return null;
    }
}


/**
* AssetManager remains unchanged.
*/
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
        const loadPromise = SceneLoader.LoadAssetContainerAsync(
            rootUrl,
            `${name}.glb`,
            this.scene
        );


        this.cache.set(name, loadPromise);
        return loadPromise;
    }


    public preloadAssets(names: string[]): void {
        for (const name of names) {
            this.getAsset(name).catch((error) => this._handlePreloadError(name, error));
        }
    }
}


/**
* SceneManager now creates the GUI button and attaches the plugin.
*/
class SceneManager {
    private engine: Engine;
    private scene: Scene;
    private resizeObserver: ResizeObserver;
    private assetManager: AssetManager;

    private colorPlugin: ColorSwapPlugin | null = null;
    public box: Mesh | null = null;


    constructor(canvas: HTMLCanvasElement) {
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
            const mainMesh = container.meshes.find(m => m.geometry) as Mesh;
            if (mainMesh) {
                this.box = mainMesh;
            }

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


                // --- CONFIGURATION IS NOW CENTRALIZED HERE ---
                const gloveConfig: ColorSwapConfig = {
                    baseColors: [
                        "#FF0000", "#00FFFF", "#80FF00", "#7F00FF", "#FFBF00",
                        "#0040FF", "#00FF40", "#FF00BF", "#FF6000", "#FF0060"
                    ],
                    initialReplacements: [
                        new Color3(1.0, 0.0, 1.0), new Color3(1.0, 1.0, 0.0), new Color3(0.0, 1.0, 1.0),
                        new Color3(1.0, 0.5, 0.0), new Color3(0.5, 0.0, 1.0), new Color3(0.5, 0.0, 1.0),
                        new Color3(0.2, 0.0, 0.2), new Color3(0.1, 0.5, 0.9), new Color3(1.0, 1.0, 1.0),
                        new Color3(0.0, 1.0, 0.0) // Added a corresponding replacement to maintain array length
                    ]
                };


                // --- INSTANTIATE PLUGIN WITH CONFIG ---
                this.colorPlugin = new ColorSwapPlugin(gloveMaterial, gloveConfig);
            }


            Promise.resolve().then(() => {
                this.assetManager.preloadAssets(['closeBack']);
            });
        });


        this.createUI();

        engine.runRenderLoop(() => {
            scene.render();
        });


        this.resizeObserver = new ResizeObserver(() => {
            engine.resize();
        });
        this.resizeObserver.observe(canvas);
    }


    private createUI() {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");


        for (let i = 0; i < 9; i++) { // Assuming 9 for static UI creation
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
                    // --- USE THE NEW, SAFE API METHOD ---
                    this.colorPlugin.updateColor(i, randomColor);
                    console.log(`Updated color at index ${i} to ${randomColor.toHexString()}`);
                }
            });


            advancedTexture.addControl(button);
        }
    }


    public dispose() {
        // --- CALL PLUGIN'S DISPOSE METHOD ---
        this.colorPlugin?.dispose();
        this.resizeObserver.disconnect();
        this.engine.dispose();
    }
}


let sceneManager: SceneManager | null = null;


export function updateBoxColor(hexColor: string) {
    // Legacy function, not connected to the shader plugin
}


const BabylonCanvas = () => {
    const reactCanvas = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const { current: canvas } = reactCanvas;
        if (!canvas) return;


        sceneManager = new SceneManager(canvas);


        return () => {
            sceneManager?.dispose();
            sceneManager = null;
        };
    }, []);


    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;

};



export default BabylonCanvas;