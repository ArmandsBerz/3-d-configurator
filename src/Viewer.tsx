import React, { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh
} from '@babylonjs/core';

// This will hold a reference to our box mesh so we can manipulate it
let box: Mesh | null = null;

// The single command function that the Logic Monolith can call to control this scene
export function updateBoxColor(hexColor: string) {
  if (box && box.material) {
    // We assume the material is a StandardMaterial to change its color
    (box.material as StandardMaterial).diffuseColor = Color3.FromHexString(hexColor);
  }
}

const BabylonCanvas = () => {
  const reactCanvas = useRef(null);

  // This hook runs once when the component is added to the page
  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) {
      return;
    }

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    // --- Basic Scene Setup ---
    // Create a camera and position it
    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Create a basic light source
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    
    // --- The Fucking Code-Generated Cube ---
    // Create the box mesh
    box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    
    // Create a material so it can have a color
    const material = new StandardMaterial("boxMaterial", scene);
    material.diffuseColor = new Color3(1, 0, 0); // Default to red
    box.material = material;
    
    // Start the engine's render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });
    resizeObserver.observe(canvas);

    // Cleanup on component unmount
    return () => {
      resizeObserver.disconnect();
      engine.dispose();
    };
  }, []);

  return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default BabylonCanvas;