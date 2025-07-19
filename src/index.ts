// Import the model URL
import modelUrl from './assets/cube.glb';
// Import the texture URL
import colorIdUrl from './assets/colorID.png';

// Enable the GLTF loader
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
  SceneLoader,
  Texture
} from '@babylonjs/core';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

const createScene = async () => {
  scene.clearColor = Color4.FromHexString('#161616');
  const hdrTexture = CubeTexture.CreateFromPrefilteredData('/assets/environment.env', scene);
  scene.environmentTexture = hdrTexture;

  new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  const pbrMaterial = new PBRMaterial("pbr", scene);

  const albedoTexture = new Texture(colorIdUrl, scene);
  
  // --- FIX: Flip the texture vertically (Y-inversion) ---
  albedoTexture.vScale = -1;

  pbrMaterial.albedoTexture = albedoTexture;
  pbrMaterial.metallic = 0.7;
  pbrMaterial.roughness = 0.4;
  
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