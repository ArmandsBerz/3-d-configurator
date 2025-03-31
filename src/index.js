import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";  // ✅ Ensure GLB, GLTF, and other formats work

/**
 * Initializes the Babylon.js scene.
 */
window.addEventListener("DOMContentLoaded", () => {
  /** @type {HTMLCanvasElement | null} */
  const canvas = document.getElementById("renderCanvas");

  if (!canvas) {
    console.error("❌ Canvas element not found!");
    return;
  }

  /** @type {BABYLON.Engine} */
  const engine = new BABYLON.Engine(canvas, true);

  /** @type {BABYLON.Scene} */
  const scene = new BABYLON.Scene(engine);

  // ✅ Camera setup
  /** @type {BABYLON.ArcRotateCamera} */
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    10,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // ✅ Lighting
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  /**
   * Loads a GLB model into the Babylon.js scene.
   * @param {string} path - The folder where the model is located.
   * @param {string} filename - The name of the GLB file.
   */
  function loadModel(path, filename) {
    BABYLON.SceneLoader.Append(
      path,
      filename,
      scene,
      function (scene) {
        console.log("✅ Loaded GLB model:", scene.meshes);

        if (scene.meshes.length > 0) {
          camera.setTarget(scene.meshes[0]);
          scene.meshes[0].position = new BABYLON.Vector3(0, 0, 0);
        }
      },
      null,
      function (scene, message) {
        console.error("❌ Error loading GLB model:", message);
      }
    );
  }

  // ✅ Call function to load the model
  loadModel("/assets/", "cube.glb");

  // ✅ Start the render loop
  engine.runRenderLoop(() => scene.render());

  window.addEventListener("resize", () => engine.resize());
});
