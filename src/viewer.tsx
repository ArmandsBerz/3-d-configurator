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
  Color4, // Import Color4 for transparency
  AssetContainer, // Import AssetContainer for the cache
  SceneLoader // Import SceneLoader for loading assets
} from '@babylonjs/core';
import "@babylonjs/loaders/glTF"; // Import the GLTF loader

/**
 * Manages the loading and caching of all 3D assets.
 * This class is the single source for fetching assets.
 */
class AssetManager {
  private cache = new Map<string, Promise<AssetContainer>>();

  constructor(private scene: Scene) {
    // The constructor takes the scene to know where to load assets into.
  }

  public async getAsset(name: string): Promise<AssetContainer> {
    // 1. Check Cache: If the asset promise is already in the cache, return it.
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    // 2. Load and Cache: If not in cache, start loading and store the promise.
    const loadPromise = SceneLoader.LoadAssetContainerAsync(
      `build3/assets/`, // The root URL for assets
      `${name}.glb`, // The file name of the asset
      this.scene
    );

    this.cache.set(name, loadPromise);

    return loadPromise;
  }
}

/**
 * Manages the entire lifecycle of the Babylon.js scene.
 * This class is responsible for initialization, rendering, and disposal.
 */
class SceneManager {
  private engine: Engine;
  private scene: Scene;
  private resizeObserver: ResizeObserver;
  private assetManager: AssetManager; // The SceneManager now owns the AssetManager
  
  // The box property is kept to be populated by the loaded asset
  public box: Mesh | null = null;

  constructor(canvas: HTMLCanvasElement) {
    // 1. Enable the alpha channel for the WebGL context
    const engine = new Engine(canvas, true, { alpha: true });
    this.engine = engine;

    const scene = new Scene(engine);
    this.scene = scene;

    // Create and hold the single instance of the AssetManager
    this.assetManager = new AssetManager(this.scene);

    // 2. Set the scene's clear color to be fully transparent (R:0, G:0, B:0, A:0)
    scene.clearColor = new Color4(0, 0, 0, 0);

    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    
    // Replace the placeholder box with a call to the AssetManager
    this.assetManager.getAsset('openBack').then(container => {
      // Add all the assets from the loaded file into the scene
      container.addAllToScene();

      // Find the main mesh from the loaded container to use for interaction
      // Note: We look for a mesh with geometry to avoid picking an empty root node.
      const mainMesh = container.meshes.find(m => m.geometry) as Mesh;
      if (mainMesh) {
        this.box = mainMesh;
      }
    });
    
    engine.runRenderLoop(() => {
      scene.render();
    });

    this.resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });
    this.resizeObserver.observe(canvas);
  }

  /**
   * Cleans up all Babylon.js resources to prevent memory leaks.
   */
  public dispose() {
    this.resizeObserver.disconnect();
    this.engine.dispose();
  }
}

// A module-level variable to hold the SceneManager instance.
// This allows the exported update function to access it.
let sceneManager: SceneManager | null = null;

// This function remains as the future entry point for the "Bridge"
export function updateBoxColor(hexColor: string) {
  if (sceneManager && sceneManager.box && sceneManager.box.material) {
    // Note: This will only work if the loaded model's material is a StandardMaterial.
    // We will replace this with the shader plugin logic later.
    if (sceneManager.box.material instanceof StandardMaterial) {
      sceneManager.box.material.diffuseColor = Color3.FromHexString(hexColor);
    }
  }
}

const BabylonCanvas = () => {
  const reactCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const { current: canvas } = reactCanvas;
    if (!canvas) return;

    // Create a single instance of our new SceneManager, passing it the canvas.
    sceneManager = new SceneManager(canvas);

    // Call the dispose method on that instance in its cleanup function.
    return () => {
      sceneManager?.dispose();
      sceneManager = null;
    };
  }, []);

  // The canvas itself fills its wrapper from layout.css
  return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default BabylonCanvas;
