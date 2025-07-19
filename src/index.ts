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
  ShaderMaterial, // Import ShaderMaterial
  Texture,        // Import Texture
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

// Vertex shader: Passes position and UV coordinates to the fragment shader
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

// Fragment shader: Blends two colors based on a texture mask
const fragmentShaderCode = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D maskTexture;
  uniform vec3 startColor;
  uniform vec3 endColor;

  void main(void) {
    // Sample the texture to get the grayscale value (0.0 to 1.0)
    float blendAmount = texture2D(maskTexture, vUV).r;

    // Linearly interpolate (lerp) between the two colors
    vec3 finalColor = mix(startColor, endColor, blendAmount);

    // Set the final pixel color
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;


const createScene = async () => {
  scene.clearColor = Color4.FromHexString('#161616');
  new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  // Create the custom shader material
  const shaderMaterial = new ShaderMaterial(
    "textureBlendShader",
    scene,
    {
      vertexSource: vertexShaderCode,
      fragmentSource: fragmentShaderCode,
    },
    {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection", "maskTexture", "startColor", "endColor"],
    }
  );

  // Load the mask texture
  const maskTexture = new Texture(colorIdUrl, scene);

  // Assign the texture and initial colors to the material's uniforms
  shaderMaterial.setTexture("maskTexture", maskTexture);
  shaderMaterial.setColor3("startColor", new Color3(0.8, 0.2, 0.2)); // Initial Red
  shaderMaterial.setColor3("endColor", new Color3(0.2, 0.2, 0.8));   // Initial Blue

  const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
  const yourCube = result.meshes[1];
  if (yourCube) {
    // Assign the shader material to the cube
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

  // On button click, change the start and end colors to random values
  button.onPointerUpObservable.add(() => {
    shaderMaterial.setColor3("startColor", Color3.Random());
    shaderMaterial.setColor3("endColor", Color3.Random());
  });
};

createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});