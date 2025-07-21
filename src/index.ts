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
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 4, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// --- Multi-Color Swap Plugin ---
// This plugin finds pure red, green, or blue and replaces each with a unique color.
class ColorSwapPluginMaterial extends MaterialPluginBase {
    // --- Define replacement colors for each channel ---
    redReplacement = new Color3(1.0, 0.0, 1.0);   // Replace Red with Magenta
    greenReplacement = new Color3(1.0, 1.0, 0.0); // Replace Green with Yellow
    blueReplacement = new Color3(0.0, 1.0, 1.0);  // Replace Blue with Cyan

    // A small threshold to catch colors that are "close enough"
    threshold = 0.2;

    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;

    constructor(material: PBRBaseMaterial) {
        // The last parameter are the #defines used in the shader.
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];
        this.isEnabled = true;
    }

    // This property allows us to turn the plugin on or off
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled) {
            return;
        }
        this._isEnabled = enabled;
        this._markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    // This tells the shader compiler to activate our #ifdef block
    prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh) {
        defines["COLOR_SWAP"] = this._isEnabled;
    }

    // This declares the uniforms our shader will use
    getUniforms() {
        return {
            "ubo": [
                { name: "redReplacement", size: 3, type: "vec3" },
                { name: "greenReplacement", size: 3, type: "vec3" },
                { name: "blueReplacement", size: 3, type: "vec3" },
                { name: "threshold", size: 1, type: "float" },
            ],
            "fragment":
                `#ifdef COLOR_SWAP
                    uniform vec3 redReplacement;
                    uniform vec3 greenReplacement;
                    uniform vec3 blueReplacement;
                    uniform float threshold;
                #endif`,
        };
    }

    // This sends our JavaScript values to the shader uniforms
    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine, subMesh: SubMesh) {
        if (this._isEnabled) {
            uniformBuffer.updateColor3("redReplacement", this.redReplacement);
            uniformBuffer.updateColor3("greenReplacement", this.greenReplacement);
            uniformBuffer.updateColor3("blueReplacement", this.blueReplacement);
            uniformBuffer.updateFloat("threshold", this.threshold);
        }
    }

    // This injects our custom code into the PBR fragment shader
    getCustomCode(shaderType: string) {
        return shaderType === "fragment" ? {
            // This hook happens after albedo calculation but before lighting
            "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
                #ifdef COLOR_SWAP
                    // Check for Red
                    if (distance(surfaceAlbedo.rgb, vec3(1.0, 0.0, 0.0)) < threshold) {
                        surfaceAlbedo.rgb = redReplacement;
                    }
                    // Check for Green
                    else if (distance(surfaceAlbedo.rgb, vec3(0.0, 1.0, 0.0)) < threshold) {
                        surfaceAlbedo.rgb = greenReplacement;
                    }
                    // Check for Blue
                    else if (distance(surfaceAlbedo.rgb, vec3(0.0, 0.0, 1.0)) < threshold) {
                        surfaceAlbedo.rgb = blueReplacement;
                    }
                #endif
            `,
        } : null;
    }
}

const createScene = async () => {
    // Set a background color and a basic light
    scene.clearColor = Color4.FromHexString('#161616');
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    // Load the GLB model. NOTE: The model must have pure red, green, and blue sections for this to work.
    const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);

    // Find the cube's mesh and its material
    const yourCube = result.meshes[1];
    if (yourCube && yourCube.material) {
        // Inject the color swap plugin into the cube's existing material
        const plugin = new ColorSwapPluginMaterial(yourCube.material as PBRBaseMaterial);
        
        // --- GUI to control each color ---
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const panel = new StackPanel();
        panel.isVertical = false;
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        panel.spacing = 10;
        panel.paddingBottom = "20px";
        advancedTexture.addControl(panel);

        // Button for Red
        const redButton = Button.CreateSimpleButton("redButton", "Randomize Red");
        redButton.width = "150px";
        redButton.height = "40px";
        redButton.color = "white";
        redButton.background = "red";
        redButton.onPointerUpObservable.add(() => {
            plugin.redReplacement = new Color3(Math.random(), Math.random(), Math.random());
        });
        panel.addControl(redButton);

        // Button for Green
        const greenButton = Button.CreateSimpleButton("greenButton", "Randomize Green");
        greenButton.width = "150px";
        greenButton.height = "40px";
        greenButton.color = "white";
        greenButton.background = "green";
        greenButton.onPointerUpObservable.add(() => {
            plugin.greenReplacement = new Color3(Math.random(), Math.random(), Math.random());
        });
        panel.addControl(greenButton);

        // Button for Blue
        const blueButton = Button.CreateSimpleButton("blueButton", "Randomize Blue");
        blueButton.width = "150px";
        blueButton.height = "40px";
        blueButton.color = "white";
        blueButton.background = "blue";
        blueButton.onPointerUpObservable.add(() => {
            plugin.blueReplacement = new Color3(Math.random(), Math.random(), Math.random());
        });
        panel.addControl(blueButton);
    }
};

// Create the scene
createScene();

// Run the engine
engine.runRenderLoop(() => {
    scene.render();
});

// Handle window resizing
window.addEventListener('resize', () => {
    engine.resize();
});