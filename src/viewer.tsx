// src/viewer.tsx
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
  Mesh,
  Color4 // Import Color4 for transparency
} from '@babylonjs/core';

let box: Mesh | null = null;

// This function remains as the future entry point for the "Bridge"
export function updateBoxColor(hexColor: string) {
  if (box && box.material) {
    (box.material as StandardMaterial).diffuseColor = Color3.FromHexString(hexColor);
  }
}

const BabylonCanvas = () => {
  const reactCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const { current: canvas } = reactCanvas;
    if (!canvas) return;

    // 1. Enable the alpha channel for the WebGL context
    const engine = new Engine(canvas, true, { alpha: true });
    const scene = new Scene(engine);

    // 2. Set the scene's clear color to be fully transparent (R:0, G:0, B:0, A:0)
    scene.clearColor = new Color4(0, 0, 0, 0);

    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    
    box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    
    const material = new StandardMaterial("boxMaterial", scene);
    material.diffuseColor = new Color3(1, 0, 0); // Default red
    box.material = material;
    
    engine.runRenderLoop(() => {
      scene.render();
    });

    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      engine.dispose();
    };
  }, []);

  // The canvas itself fills its wrapper from layout.css
  return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default BabylonCanvas;
