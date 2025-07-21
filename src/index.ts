// Import the model URL
import modelUrl from './assets/cube.glb';

// Enable the GLTF loader
import "@babylonjs/loaders/glTF";

// Core BabylonJS imports, with new ones added for the plugin
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
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui';

// Basic scene setup
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// --- Albedo Tinting Plugin ---
// This modifies the albedo color before lighting calculations
class AlbedoTintPluginMaterial extends MaterialPluginBase {
    // The color to replace the albedo with
    replacementColor = new Color3(1.0, 0.4, 0.8); // A bright pink color

    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;

    constructor(material: PBRBaseMaterial) {
        // The last parameter are the #defines used in the shader.
        super(material, "AlbedoTint", 200, { "ALBEDO_TINT": false });
        
        // This callback tells the material it needs to re-compile its shader
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];

        // We can enable the plugin by default if we want
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
        defines["ALBEDO_TINT"] = this._isEnabled;
    }

    // This declares the uniforms our shader will use
    getUniforms() {
        return {
            "ubo": [
                { name: "replacementColor", size: 3, type: "vec3" },
            ],
            "fragment":
                `#ifdef ALBEDO_TINT
                    uniform vec3 replacementColor;
                #endif`,
        };
    }

    // This sends our JavaScript replacement color value to the shader uniform
    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine, subMesh: SubMesh) {
        if (this._isEnabled) {
            uniformBuffer.updateColor3("replacementColor", this.replacementColor);
        }
    }

    // This injects our custom code into the PBR fragment shader
    // We target the albedo after it's been calculated but before lighting
    getCustomCode(shaderType: string) {
        return shaderType === "fragment" ? {
            // This hook happens after albedo calculation but before lighting
            "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
                #ifdef ALBEDO_TINT
                    // Simply replace the albedo with our pink color
                    surfaceAlbedo.rgb = replacementColor;
                #endif
            `,
        } : null;
    }
}

const createScene = async () => {
    // Set a background color and a basic light
    scene.clearColor = Color4.FromHexString('#161616');
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    // Load the GLB model
    const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);

    // Find the cube's mesh and its material
    const yourCube = result.meshes[1];
    if (yourCube && yourCube.material) {
        // Inject the albedo tint plugin into the cube's existing material
        const plugin = new AlbedoTintPluginMaterial(yourCube.material as PBRBaseMaterial);

        // --- ADDED BUTTON CODE ---
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const button = Button.CreateSimpleButton("colorButton", "Randomize Colors");
        button.width = "200px";
        button.height = "40px";
        button.color = "white";
        button.background = "green";
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        button.paddingBottom = "20px";
        
        // Add a click event to randomize the plugin's color
        button.onPointerUpObservable.add(() => {
            plugin.replacementColor = new Color3(Math.random(), Math.random(), Math.random());
        });

        advancedTexture.addControl(button);
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