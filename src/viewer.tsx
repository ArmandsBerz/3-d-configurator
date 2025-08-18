// src/viewer.tsx
import React, { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  Color4,
  AssetContainer,
  SceneLoader,
  Material,
  Texture,
  PBRMaterial,
  // --- ADDED IMPORTS for Plugin and GUI ---
  MaterialPluginBase,
  PBRBaseMaterial,
  MaterialDefines,
  UniformBuffer,
  Constants,
  Color3
} from '@babylonjs/core';
import { AdvancedDynamicTexture, Button, Control } from '@babylonjs/gui'; // GUI Imports
import "@babylonjs/loaders/glTF";

// --- PLUGIN CODE PASTED HERE ---
// The GradientColorSwapPlugin is now part of this file.
class GradientColorSwapPlugin extends MaterialPluginBase {
    // Store replacements in array for easier uniform handling
    replacements = [
        new Color3(1.0, 0.0, 1.0),   // Red replacement
        new Color3(1.0, 1.0, 0.0),   // Green replacement
        new Color3(0.0, 1.0, 1.0),   // Blue replacement
        new Color3(1.0, 0.5, 0.0),   // Yellow replacement
        new Color3(0.5, 0.0, 1.0),
        new Color3(0.5, 0.0, 1.0),
        new Color3(0.2, 0.0, 0.2),
        new Color3(0.1, 0.5, 0.9),   // Cyan replacement
        new Color3(1.0, 1.0, 1.0)    // Magenta replacement (default: white)
    ];
    
    // Base colors we're targeting from the colorID map
    baseColors = [
        Color3.FromHexString("#FF0000"),
        Color3.FromHexString("#00FFFF"),
        Color3.FromHexString("#80FF00"),
        Color3.FromHexString("#7F00FF"),
        Color3.FromHexString("#FFBF00"),
        Color3.FromHexString("#0040FF"),
        Color3.FromHexString("#00FF40"),
        Color3.FromHexString("#FF00BF"),
        Color3.FromHexString("#FF6000")
    ];
    
    blendRadius = 0.05;
    blendStrength = 1;

    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;

    constructor(material: PBRBaseMaterial) {
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];

        // *** FIX: Convert all base colors to linear space. ***
        // This ensures the colors sent to the shader match the color space
        // of the texture after it's processed by the rendering engine.
        for (let i = 0; i < this.baseColors.length; i++) {
            this.baseColors[i] = this.baseColors[i].toLinearSpace();
        }

        this.isEnabled = true;
    }

    get isEnabled() { return this._isEnabled; }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled) return;
        this._isEnabled = enabled;
        this._markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    prepareDefines(defines: MaterialDefines) {
        defines["COLOR_SWAP"] = this._isEnabled;
    }

    getUniforms() {
        return {
            ubo: [
                { name: "replacements", size: 3, type: "vec3", arraySize: 9 },
                { name: "baseColors", size: 3, type: "vec3", arraySize: 9 },
                { name: "blendRadius", size: 1, type: "float" },
                { name: "blendStrength", size: 1, type: "float" }
            ],
            fragment: `
                #ifdef COLOR_SWAP
                    uniform vec3 replacements[9];
                    uniform vec3 baseColors[9];
                    uniform float blendRadius;
                    uniform float blendStrength;
                #endif
            `
        };
    }

    bindForSubMesh(uniformBuffer: UniformBuffer) {
        if (this._isEnabled) {
            const replacementsArray = new Float32Array(this.replacements.length * 3);
            const baseColorsArray = new Float32Array(this.baseColors.length * 3);

            for (let i = 0; i < this.replacements.length; i++) {
                replacementsArray.set(this.replacements[i].asArray(), i * 3);
                baseColorsArray.set(this.baseColors[i].asArray(), i * 3);
            }

            uniformBuffer.updateArray("replacements", [...replacementsArray]);
            uniformBuffer.updateArray("baseColors", [...baseColorsArray]);
            uniformBuffer.updateFloat("blendRadius", this.blendRadius);
            uniformBuffer.updateFloat("blendStrength", this.blendStrength);
        }
    }

    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            return {
                "CUSTOM_FRAGMENT_BEFORE_LIGHTS": `
                    #ifdef COLOR_SWAP
                        vec3 original = surfaceAlbedo.rgb;
                        vec3 accumulatedColor = vec3(0.0);
                        float totalInfluence = 0.0;
                        float safeRadius = max(blendRadius, 0.0001);
                        float radiusSq = 2.0 * safeRadius * safeRadius;
                        
                        for (int i = 0; i < 9; i++) {
                            float dist = distance(original, baseColors[i]);
                            float influence = exp(-(dist * dist) / radiusSq);
                            accumulatedColor += replacements[i] * influence;
                            totalInfluence += influence;
                        }
                        
                        if (totalInfluence > 0.001) {
                           vec3 finalColor = accumulatedColor / totalInfluence;
                           surfaceAlbedo.rgb = mix(original, finalColor, min(totalInfluence * blendStrength, 1.0));
                        }
                    #endif
                `
            };
        }
        return null;
    }
}


/**
 * AssetManager remains unchanged. The plugin attachment logic
 * will be handled in the SceneManager after the asset is loaded.
 */
class AssetManager {
  private cache = new Map<string, Promise<AssetContainer>>();

  constructor(private scene: Scene) {}

  private _handlePreloadError(assetName: string, error: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[AssetManager] Preload failed for "${assetName}":`, error);
    }
  }

  public async getAsset(name: string): Promise<AssetContainer> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    const loadPromise = SceneLoader.LoadAssetContainerAsync(
      `build3/assets/`,
      `${name}.glb`,
      this.scene
    );

    this.cache.set(name, loadPromise);
    return loadPromise;
  }

  public preloadAssets(names: string[]): void {
    for (const name of names) {
      this.getAsset(name).catch((error) => this._handlePreloadError(name, error));
    }
  }
}

/**
 * SceneManager now creates the GUI button and attaches the plugin.
 */
class SceneManager {
  private engine: Engine;
  private scene: Scene;
  private resizeObserver: ResizeObserver;
  private assetManager: AssetManager;
  
  // --- ADDED a property to hold the plugin instance ---
  private colorPlugin: GradientColorSwapPlugin | null = null;
  public box: Mesh | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true, { alpha: true });
    this.engine = engine;

    const scene = new Scene(engine);
    this.scene = scene;
    this.assetManager = new AssetManager(this.scene);
    scene.clearColor = new Color4(0, 0, 0, 0);

    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
    camera.minZ = 0.01;
    camera.wheelDeltaPercentage = 0.002;
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    
    this.assetManager.getAsset('openBack').then(container => {
      container.addAllToScene();
      const mainMesh = container.meshes.find(m => m.geometry) as Mesh;
      if (mainMesh) {
        this.box = mainMesh;
      }
      
      // Find the specific material by name
      const gloveMaterial = container.materials.find(m => m.name === 'glove');

      if (gloveMaterial && gloveMaterial instanceof PBRMaterial) {
        // --- PLUGIN ATTACHED HERE ---

        // 1. Load the "color ID" map. We assume 'openBack.png' serves this purpose.
        // It's crucial to use NEAREST sampling for accurate color picking by the shader.
        const colorIdTexture = new Texture("build3/assets/openBack.png", this.scene, false, false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);
        gloveMaterial.albedoTexture = colorIdTexture;
        
        // 2. Add detail normal map
        const detailTexture = new Texture("build3/assets/details.png", this.scene);
        detailTexture.coordinatesIndex = 0;
        detailTexture.uScale = 4;
        detailTexture.vScale = 4;
        gloveMaterial.detailMap.isEnabled = true;
        gloveMaterial.detailMap.normalBlendMethod = 1;
        gloveMaterial.detailMap.texture = detailTexture;
        gloveMaterial.detailMap.diffuseBlendLevel = 0; 
        gloveMaterial.detailMap.roughnessBlendLevel = 0;
        gloveMaterial.detailMap.bumpLevel = .6;

        // 3. Instantiate the plugin and store it in the class property
        this.colorPlugin = new GradientColorSwapPlugin(gloveMaterial);
      }

      Promise.resolve().then(() => {
        this.assetManager.preloadAssets(['closeBack']);
      });
    });

    // --- GUI CREATION ---
    this.createUI();
    
    engine.runRenderLoop(() => {
      scene.render();
    });

    this.resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });
    this.resizeObserver.observe(canvas);
  }

  /**
   * Creates the GUI with nine buttons, each one hooked to a specific color index.
   */
  private createUI() {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Loop 9 times to create a button for each color index
    for (let i = 0; i < 9; i++) {
        const button = Button.CreateSimpleButton(`randomBtn_${i}`, `Randomize Color ${i + 1}`);
        button.width = "200px";
        button.height = "40px";
        button.color = "white";
        button.background = "#555555";
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        // Align to the top of the screen
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        button.paddingRight = "20px";
        // Position each button below the last one using the 'top' property
        button.top = `${20 + (i * 50)}px`;
        
        button.onPointerUpObservable.add(() => {
            // If the plugin has been initialized...
            if (this.colorPlugin) {
                // Create a new random color
                const randomColor = new Color3(Math.random(), Math.random(), Math.random());
                // Assign the new random color to the specific slot for this button
                this.colorPlugin.replacements[i] = randomColor;
                console.log(`Changed color at index ${i} to ${randomColor.toHexString()}`);
            }
        });

        advancedTexture.addControl(button);
    }
  }

  public dispose() {
    this.resizeObserver.disconnect();
    this.engine.dispose();
  }
}

// --- The rest of the file remains the same ---
let sceneManager: SceneManager | null = null;

// This function is no longer used by the new plugin system but can be kept for other purposes.
export function updateBoxColor(hexColor: string) {
    // Legacy function, not connected to the shader plugin
}

const BabylonCanvas = () => {
  const reactCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const { current: canvas } = reactCanvas;
    if (!canvas) return;

    sceneManager = new SceneManager(canvas);

    return () => {
      sceneManager?.dispose();
      sceneManager = null;
    };
  }, []);

  return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default BabylonCanvas;
