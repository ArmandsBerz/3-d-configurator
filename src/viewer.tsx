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
  SceneLoader, // Import SceneLoader for loading assets
  Material, // Import Material for post-processing
  Texture, // Import Texture for the detail map
  PBRBaseMaterial, // Import PBRBaseMaterial for type checking
  PBRMaterial // Import PBRMaterial for specific texture properties
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

  /**
   * This is the placeholder for future shader attachment logic.
   * It will be called on specific materials after an asset is loaded.
   */
  private _prepareMaterial(material: Material) {
    // Future logic to attach a custom shader plugin will go here.
    console.log(`Found and prepared material: ${material.name}`);
  }

  /**
   * Handles errors that occur during a non-critical preload operation.
   * In production, it fails silently. In development, it logs a debug message.
   */
  private _handlePreloadError(assetName: string, error: any): void {
    // In production, we want to do nothing. A failed preload is not a user-facing error.
    if (process.env.NODE_ENV === 'development') {
      // In development, we log a low-priority debug message to inform the developer.
      console.debug(`[AssetManager] Preload failed for "${assetName}":`, error);
    }
  }

  public async getAsset(name: string): Promise<AssetContainer> {
    // 1. Check Cache: If the asset promise is already in the cache, return it.
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    // 2. Load and Cache: If not in cache, create a new promise that includes loading AND post-processing.
    const loadPromise = SceneLoader.LoadAssetContainerAsync(
      `build3/assets/`, // The root URL for assets
      `${name}.glb`, // The file name of the asset
      this.scene
    ).then(container => {
      // 3. Post-processing: After loading, find the specific material by name.
      const gloveMaterial = container.materials.find(m => m.name === 'glove');

      // If the material is found, prepare it.
      if (gloveMaterial) {
        this._prepareMaterial(gloveMaterial);

        // Add albedo and detail maps if the material is a PBRMaterial
        if (gloveMaterial instanceof PBRMaterial) {
            // Load and assign the albedo texture
            const albedoTexture = new Texture("build3/assets/openBack.png", this.scene, false, false);
            gloveMaterial.albedoTexture = albedoTexture;
            
            // Add detail normal map
            const detailTexture = new Texture("build3/assets/details.png", this.scene);
            detailTexture.coordinatesIndex = 0; // Use UV2
            detailTexture.uScale = 4;
            detailTexture.vScale = 4;
            
            gloveMaterial.detailMap.isEnabled = true;
            gloveMaterial.detailMap.normalBlendMethod = 1; // Constants.MATERIAL_NORMALBLENDMETHOD_WHITEOUT
            gloveMaterial.detailMap.texture = detailTexture;
            gloveMaterial.detailMap.diffuseBlendLevel = 0; 
            gloveMaterial.detailMap.roughnessBlendLevel = 0;
            gloveMaterial.detailMap.bumpLevel = .6; 

        }
      }
      
      return container;
    });

    this.cache.set(name, loadPromise);

    return loadPromise;
  }

  /**
   * Initiates the download of assets in the background without waiting for them to complete.
   * This is used to preload assets that the user is likely to need soon.
   */
  public preloadAssets(names: string[]): void {
    for (const name of names) {
      // Call getAsset and attach a catch handler to silently manage preload failures.
      this.getAsset(name).catch((error) => this._handlePreloadError(name, error));
    }
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

    // ...
    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);

    camera.minZ = 0.01;
    camera.wheelDeltaPercentage = 0.002;

    camera.attachControl(canvas, true); // Controls are attached once, after configuration
    // ...

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    
    // First, load the primary, high-priority asset.
    this.assetManager.getAsset('openBack').then(container => {
      // Add all the assets from the loaded file into the scene
      container.addAllToScene();

      // Find the main mesh from the loaded container to use for interaction
      const mainMesh = container.meshes.find(m => m.geometry) as Mesh;
      if (mainMesh) {
        this.box = mainMesh;
      }

      // Defer the preload call to the next event loop tick.
      // This ensures the browser has a chance to render the primary asset first.
      Promise.resolve().then(() => {
        this.assetManager.preloadAssets(['closeBack']);
      });
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