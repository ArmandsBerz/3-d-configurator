// Import the model URL
import modelUrl from './assets/cube.glb';

// Enable the GLTF loader
import "@babylonjs/loaders/glTF";

// Core BabylonJS imports
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Color4,
    SceneLoader,
    Color3,
    MaterialPluginBase,
    PBRBaseMaterial,
    AbstractMesh,
    MaterialDefines,
    SubMesh,
    UniformBuffer,
    Constants
} from '@babylonjs/core';

// Import GUI components
import { AdvancedDynamicTexture, Button, Control, StackPanel } from '@babylonjs/gui';

// Basic scene setup
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Enhanced Color Swap Plugin with Gradient Blending
class GradientColorSwapPlugin extends MaterialPluginBase {
    // Store replacements in array for easier uniform handling
    replacements = [
        new Color3(1.0, 0.0, 1.0),   // Red replacement
        new Color3(1.0, 1.0, 0.0),   // Green replacement
        new Color3(0.0, 1.0, 1.0),   // Blue replacement
        new Color3(1.0, 0.5, 0.0),   // Yellow replacement
        new Color3(0.5, 0.0, 1.0),   // Cyan replacement
        new Color3(1.0, 1.0, 1.0)    // Magenta replacement (default: white)
    ];
    
    // Base colors we're targeting
    baseColors = [
        new Color3(1.0, 0.0, 0.0),   // Red
        new Color3(0.0, 1.0, 0.0),   // Green
        new Color3(0.0, 0.0, 1.0),   // Blue
        new Color3(1.0, 1.0, 0.0),   // Yellow
        new Color3(0.0, 1.0, 1.0),   // Cyan
        new Color3(1.0, 0.0, 1.0)    // Magenta
    ];
    
    // Controls the blend smoothness (higher = smoother)
    blendRadius = 0.3;
    
    // Controls how much the replacement colors blend with original
    blendStrength = 0.8;

    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;

    constructor(material: PBRBaseMaterial) {
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];
        this.isEnabled = true;
    }

    get isEnabled() { return this._isEnabled; }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled) return;
        this._isEnabled = enabled;
        this._markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    prepareDefines(defines: MaterialDefines) {
        defines["COLOR_SWAP"] = this._isEnabled;
    }

    getUniforms() {
        return {
            ubo: [
                { name: "replacements", size: 3, type: "vec3", arraySize: 6 },
                { name: "baseColors", size: 3, type: "vec3", arraySize: 6 },
                { name: "blendRadius", size: 1, type: "float" },
                { name: "blendStrength", size: 1, type: "float" }
            ],
            fragment: `
                #ifdef COLOR_SWAP
                    uniform vec3 replacements[6];
                    uniform vec3 baseColors[6];
                    uniform float blendRadius;
                    uniform float blendStrength;
                #endif
            `
        };
    }

        bindForSubMesh(uniformBuffer: UniformBuffer) {
        if (this._isEnabled) {
            // Manually flatten the Color3 arrays into a single Float32Array
            const replacementsArray = new Float32Array(this.replacements.length * 3);
            const baseColorsArray = new Float32Array(this.baseColors.length * 3);

            for (let i = 0; i < this.replacements.length; i++) {
                replacementsArray.set(this.replacements[i].asArray(), i * 3);
                baseColorsArray.set(this.baseColors[i].asArray(), i * 3);
            }

            // Use the spread operator [...] to convert the Float32Array to a number[]
            uniformBuffer.updateArray("replacements", [...replacementsArray]);
            uniformBuffer.updateArray("baseColors", [...baseColorsArray]);
            
            uniformBuffer.updateFloat("blendRadius", this.blendRadius);
            uniformBuffer.updateFloat("blendStrength", this.blendStrength);
        }
    }

    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            return {
                "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
                    #ifdef COLOR_SWAP
                        vec3 original = surfaceAlbedo.rgb;
                        vec3 accumulatedColor = vec3(0.0);
                        float totalInfluence = 0.0;
                        
                        // Use a safe radius to avoid division by zero
                        float safeRadius = max(blendRadius, 0.0001);
                        float radiusSq = 2.0 * safeRadius * safeRadius;
                        
                        for (int i = 0; i < 6; i++) {
                            // Calculate distance to base color
                            float dist = distance(original, baseColors[i]);
                            
                            // Calculate influence using Gaussian falloff
                            float influence = exp(-(dist * dist) / radiusSq);
                            
                            // Accumulate color influence
                            accumulatedColor += replacements[i] * influence;
                            totalInfluence += influence;
                        }
                        
                        // Normalize and apply blended color
                        if (totalInfluence > 0.001) {
                           vec3 finalColor = accumulatedColor / totalInfluence;
                           surfaceAlbedo.rgb = mix(original, finalColor, min(totalInfluence * blendStrength, 1.0));
                        }
                    #endif
                `
            };
        }
        return null;
    }
}


const createScene = async () => {
    scene.clearColor = Color4.FromHexString('#161616');
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
    const yourCube = result.meshes[1];

    if (yourCube && yourCube.material) {
        const plugin = new GradientColorSwapPlugin(yourCube.material as PBRBaseMaterial);
        
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const panel = new StackPanel();
        panel.isVertical = true; // Changed to vertical for better spacing
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        panel.width = "200px";
        panel.paddingRight = "20px";
        advancedTexture.addControl(panel);

        const createButton = (text, color, onClick) => {
            const button = Button.CreateSimpleButton(text, text);
            button.width = "180px";
            button.height = "40px";
            button.color = "white";
            button.background = color;
            button.paddingTop = "10px";
            button.onPointerUpObservable.add(onClick);
            panel.addControl(button);
        };

        createButton("Randomize Red", "red", () => {
            plugin.replacements[0] = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Green", "green", () => {
            plugin.replacements[1] = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Blue", "blue", () => {
            plugin.replacements[2] = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Yellow", "yellow", () => {
            plugin.replacements[3] = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Cyan", "cyan", () => {
            plugin.replacements[4] = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Magenta", "magenta", () => {
            plugin.replacements[5] = new Color3(Math.random(), Math.random(), Math.random());
        });
    }
};

createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});