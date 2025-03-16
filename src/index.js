import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";  // ✅ Ensure GLB, GLTF, and other formats work

// Wait for the page to load
window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas");

  if (!canvas) {
    console.error("❌ Canvas element not found!");
    return;
  }

  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  // Camera
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    10,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // Light
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // ✅ Load the GLB model (Uses `SceneLoader.Append`)
  BABYLON.SceneLoader.Append(
    "/assets/",  // Path to the folder where cube.glb is located
    "cube.glb",  // GLB file name
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

  engine.runRenderLoop(() => scene.render());

  window.addEventListener("resize", () => engine.resize());
});
