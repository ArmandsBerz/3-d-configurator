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

// --- 5-Color Swap Plugin ---
// This plugin finds specific colors and replaces each with a unique, controllable color.
class ColorSwapPluginMaterial extends MaterialPluginBase {
    // --- Define replacement colors for each channel ---
    redReplacement = new Color3(1.0, 0.0, 1.0);   // Default: Magenta
    greenReplacement = new Color3(1.0, 1.0, 0.0); // Default: Yellow
    blueReplacement = new Color3(0.0, 1.0, 1.0);  // Default: Cyan
    yellowReplacement = new Color3(1.0, 0.5, 0.0); // Default: Orange
    cyanReplacement = new Color3(0.5, 0.0, 1.0);   // Default: Purple

    // A small threshold to catch colors that are "close enough"
    threshold = 0.2;

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
            "ubo": [
                { name: "redReplacement", size: 3, type: "vec3" },
                { name: "greenReplacement", size: 3, type: "vec3" },
                { name: "blueReplacement", size: 3, type: "vec3" },
                { name: "yellowReplacement", size: 3, type: "vec3" },
                { name: "cyanReplacement", size: 3, type: "vec3" },
                { name: "threshold", size: 1, type: "float" },
            ],
            "fragment":
                `#ifdef COLOR_SWAP
                    uniform vec3 redReplacement;
                    uniform vec3 greenReplacement;
                    uniform vec3 blueReplacement;
                    uniform vec3 yellowReplacement;
                    uniform vec3 cyanReplacement;
                    uniform float threshold;
                #endif`,
        };
    }

    bindForSubMesh(uniformBuffer: UniformBuffer) {
        if (this._isEnabled) {
            uniformBuffer.updateColor3("redReplacement", this.redReplacement);
            uniformBuffer.updateColor3("greenReplacement", this.greenReplacement);
            uniformBuffer.updateColor3("blueReplacement", this.blueReplacement);
            uniformBuffer.updateColor3("yellowReplacement", this.yellowReplacement);
            uniformBuffer.updateColor3("cyanReplacement", this.cyanReplacement);
            uniformBuffer.updateFloat("threshold", this.threshold);
        }
    }

    getCustomCode(shaderType: string) {
        return shaderType === "fragment" ? {
            "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
                #ifdef COLOR_SWAP
                    // Check for Red (1, 0, 0)
                    if (distance(surfaceAlbedo.rgb, vec3(1.0, 0.0, 0.0)) < threshold) {
                        surfaceAlbedo.rgb = redReplacement;
                    }
                    // Check for Green (0, 1, 0)
                    else if (distance(surfaceAlbedo.rgb, vec3(0.0, 1.0, 0.0)) < threshold) {
                        surfaceAlbedo.rgb = greenReplacement;
                    }
                    // Check for Blue (0, 0, 1)
                    else if (distance(surfaceAlbedo.rgb, vec3(0.0, 0.0, 1.0)) < threshold) {
                        surfaceAlbedo.rgb = blueReplacement;
                    }
                    // Check for Yellow (1, 1, 0)
                    else if (distance(surfaceAlbedo.rgb, vec3(1.0, 1.0, 0.0)) < threshold) {
                        surfaceAlbedo.rgb = yellowReplacement;
                    }
                    // Check for Cyan (0, 1, 1)
                    else if (distance(surfaceAlbedo.rgb, vec3(0.0, 1.0, 1.0)) < threshold) {
                        surfaceAlbedo.rgb = cyanReplacement;
                    }
                #endif
            `,
        } : null;
    }
}

const createScene = async () => {
    scene.clearColor = Color4.FromHexString('#161616');
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
    const yourCube = result.meshes[1];

    if (yourCube && yourCube.material) {
        const plugin = new ColorSwapPluginMaterial(yourCube.material as PBRBaseMaterial);
        
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
            plugin.redReplacement = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Green", "green", () => {
            plugin.greenReplacement = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Blue", "blue", () => {
            plugin.blueReplacement = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Yellow", "yellow", () => {
            plugin.yellowReplacement = new Color3(Math.random(), Math.random(), Math.random());
        });
        createButton("Randomize Cyan", "cyan", () => {
            plugin.cyanReplacement = new Color3(Math.random(), Math.random(), Math.random());
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
