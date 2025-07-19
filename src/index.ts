import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color4,
  CubeTexture,
  // --- NEW IMPORTS ---
  PBRMaterial,
  Color3
} from '@babylonjs/core';

// Get the canvas element from the HTML file
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

// Initialize the Babylon.js engine
const engine = new Engine(canvas, true);

// Create a new scene
const scene = new Scene(engine);

// Set the background color and environment
scene.clearColor = Color4.FromHexString('#161616');
// This environment texture is important for PBR materials to look good
const hdrTexture = CubeTexture.CreateFromPrefilteredData('assets/environment.env', scene);
scene.environmentTexture = hdrTexture;

// Create a camera
const camera = new ArcRotateCamera(
  'Camera',
  Math.PI / 2,
  Math.PI / 2.5,
  3,
  Vector3.Zero(),
  scene
);
camera.attachControl(canvas, true);
camera.lowerRadiusLimit = 1.5;
camera.upperRadiusLimit = 5;

// Create a basic light
new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

// Create a simple test box
const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);

// --- NEW PBR MATERIAL CODE ---
// 1. Create a new PBR material
const pbrMaterial = new PBRMaterial("pbr", scene);

// 2. Set its properties to make it look like a physical material
pbrMaterial.albedoColor = new Color3(0.5, 0.8, 1.0); // The base color (a light blue)
pbrMaterial.metallic = 0.7;    // How metallic it is (0 = plastic, 1 = metal)
pbrMaterial.roughness = 0.4;   // How rough or smooth the surface is (0 = mirror, 1 = matte)

// 3. Apply the material to our box
box.material = pbrMaterial;
// --- END OF NEW CODE ---

// Run the engine's render loop
engine.runRenderLoop(() => {
  scene.render();
});

// Handle browser resizing
window.addEventListener('resize', () => {
  engine.resize();
});