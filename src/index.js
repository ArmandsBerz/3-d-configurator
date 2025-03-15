import * as BABYLON from 'babylonjs';

window.addEventListener('DOMContentLoaded', () => {
  // Get the canvas element
  const canvas = document.getElementById('renderCanvas');
  
  // Initialize the BabylonJS engine
  const engine = new BABYLON.Engine(canvas, true);
  
  // Create a basic scene
  const scene = new BABYLON.Scene(engine);
  
  // Set up a simple camera (ArcRotateCamera)
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 2.5,
    10,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);
  
  // Add a hemispheric light
  const light = new BABYLON.HemisphericLight(
    'light',
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  
  // Create a simple box mesh
  const box = BABYLON.MeshBuilder.CreateBox('box', { size: 2 }, scene);
  
  // Render loop
  engine.runRenderLoop(() => {
    scene.render();
  });
  
  // Resize the engine on window resize
  window.addEventListener('resize', () => {
    engine.resize();
  });
});
