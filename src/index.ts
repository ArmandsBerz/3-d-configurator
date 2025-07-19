import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color4,
} from '@babylonjs/core';

// Get the canvas element from the HTML file
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

// Initialize the Babylon.js engine
const engine = new Engine(canvas, true);

// Create a new scene
const scene = new Scene(engine);

// Set the background color
scene.clearColor = new Color4(0.2, 0.2, 0.25, 1);

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

// Create a basic light
new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

// Create a simple test box to make sure it's working
MeshBuilder.CreateBox("box", { size: 1 }, scene);

// Run the engine's render loop
engine.runRenderLoop(() => {
  scene.render();
});

// Handle browser resizing
window.addEventListener('resize', () => {
  engine.resize();
});