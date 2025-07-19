// Import the model and texture URLs
import modelUrl from './assets/cube.glb';
import colorIdUrl from './assets/colorID.png';

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
    Texture,
    ShaderMaterial,
    Color3
} from '@babylonjs/core';

// Import GUI elements
import {
    AdvancedDynamicTexture,
    Button,
    Control
} from '@babylonjs/gui';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Vertex shader code (no changes needed here)
const vertexShaderCode = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUV;
void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
}
`;

// --- MODIFIED: Fragment shader to handle 6 colors ---
const fragmentShaderCode = `
precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;

// Primary Colors
uniform vec3 colorForRed;
uniform vec3 colorForGreen;
uniform vec3 colorForBlue;

// --- NEW: Uniforms for secondary colors ---
uniform vec3 colorForYellow;
uniform vec3 colorForViolet;
uniform vec3 colorForAqua;

const vec3 defaultColor = vec3(0.1, 0.1, 0.1);

void main(void) {
    // Sample the texture.
    vec4 idColor = texture2D(textureSampler, vUV);

    // --- NEW LOGIC: Calculate masks for each of the 6 colors ---

    // Primary masks: Isolate parts that are purely R, G, or B.
    float redMask = max(0.0, idColor.r - idColor.g - idColor.b);
    float greenMask = max(0.0, idColor.g - idColor.r - idColor.b);
    float blueMask = max(0.0, idColor.b - idColor.r - idColor.g);

    // Secondary masks: Isolate parts that are combinations.
    // Yellow (R+G), Violet (R+B), Aqua (G+B)
    float yellowMask = max(0.0, min(idColor.r, idColor.g) - idColor.b);
    float violetMask = max(0.0, min(idColor.r, idColor.b) - idColor.g);
    float aquaMask = max(0.0, min(idColor.g, idColor.b) - idColor.r);

    // Blend all 6 colors together using their respective masks.
    vec3 blendedColor = redMask * colorForRed +
                        greenMask * colorForGreen +
                        blueMask * colorForBlue +
                        yellowMask * colorForYellow +
                        violetMask * colorForViolet +
                        aquaMask * colorForAqua;

    // Calculate the total influence of all masks combined.
    float totalMask = clamp(idColor.r + idColor.g + idColor.b, 0.0, 1.0);

    // Linearly interpolate between the default dark color and the new blended color.
    vec3 outputColor = mix(defaultColor, blendedColor, totalMask);

    gl_FragColor = vec4(outputColor, 1.0);
}
`;

const createScene = async () => {
    scene.clearColor = Color4.FromHexString('#161616');
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    const shaderMaterial = new ShaderMaterial(
        "colorMaskShader",
        scene,
        {
            vertexSource: vertexShaderCode,
            fragmentSource: fragmentShaderCode,
        },
        {
            attributes: ["position", "uv"],
            // --- MODIFIED: Add new uniforms to the list ---
            uniforms: [
                "worldViewProjection",
                "textureSampler",
                "colorForRed", "colorForGreen", "colorForBlue",
                "colorForYellow", "colorForViolet", "colorForAqua"
            ],
        }
    );

    const idTexture = new Texture(
        colorIdUrl,
        scene,
        true, // noMipmap
        false, // invertY
        Texture.BILINEAR_SAMPLINGMODE // samplingMode
    );
    shaderMaterial.setTexture("textureSampler", idTexture);

    // Set primary colors
    shaderMaterial.setColor3("colorForRed", new Color3(1.0, 0.0, 0.0));
    shaderMaterial.setColor3("colorForGreen", new Color3(0.0, 1.0, 0.0));
    shaderMaterial.setColor3("colorForBlue", new Color3(0.0, 0.0, 1.0));

    // --- NEW: Set secondary colors ---
    // Using the pure colors you asked for: Yellow(255,255,0), Violet(255,0,255), Aqua(0,255,255)
    shaderMaterial.setColor3("colorForYellow", new Color3(1.0, 1.0, 0.0));
    shaderMaterial.setColor3("colorForViolet", new Color3(1.0, 0.0, 1.0));
    shaderMaterial.setColor3("colorForAqua", new Color3(0.0, 1.0, 1.0));

    const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
    const yourCube = result.meshes[1];
    if (yourCube) {
        yourCube.material = shaderMaterial;
    }

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const button = Button.CreateSimpleButton("colorButton", "Randomize Colors");
    button.width = "200px";
    button.height = "40px";
    button.color = "white";
    button.background = "green";
    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    button.paddingBottom = "20px";
    advancedTexture.addControl(button);

    button.onPointerUpObservable.add(() => {
        shaderMaterial.setColor3("colorForRed", Color3.Random());
        shaderMaterial.setColor3("colorForGreen", Color3.Random());
        shaderMaterial.setColor3("colorForBlue", Color3.Random());
        // --- NEW: Randomize secondary colors as well ---
        shaderMaterial.setColor3("colorForYellow", Color3.Random());
        shaderMaterial.setColor3("colorForViolet", Color3.Random());
        shaderMaterial.setColor3("colorForAqua", Color3.Random());
    });
};

createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});