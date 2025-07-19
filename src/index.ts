// NEW: Import the model directly. This gives us a stable URL from the build system.
import modelUrl from './assets/cube.glb';

// This import is still needed to enable the GLTF loader
import "@babylonjs/loaders/glTF";

import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
  CubeTexture,
  PBRMaterial,
  Color3,
  SceneLoader
} from '@babylonjs/core';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
camera.attachControl(canvas, true);
camera.lowerRadiusLimit = 1.5;
camera.upperRadiusLimit = 5;

const createScene = async () => {
  scene.clearColor = Color4.FromHexString('#161616');
  const hdrTexture = CubeTexture.CreateFromPrefilteredData('/assets/environment.env', scene);
  scene.environmentTexture = hdrTexture;

  new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  const pbrMaterial = new PBRMaterial("pbr", scene);
  pbrMaterial.albedoColor = new Color3(0.5, 0.8, 1.0);
  pbrMaterial.metallic = 0.7;
  pbrMaterial.roughness = 0.4;

  // --- MODIFICATION: Load the model using the imported URL ---
  // The 'rootUrl' is now an empty string, and the imported 'modelUrl' is passed as the filename.
  const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);

  const yourCube = result.meshes[1];
  
  if (yourCube) {
    yourCube.material = pbrMaterial;
  }
};

createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});