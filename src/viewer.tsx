import React, { useEffect, useRef } from 'react';
import {
    Engine, // Changed for bindForSubMesh signature
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Mesh,
    Color4,
    AssetContainer,
    SceneLoader,
    PBRMaterial,
    MaterialPluginBase,
    PBRBaseMaterial,
    MaterialDefines,
    UniformBuffer,
    Constants,
    Color3,
    DynamicTexture,
    Texture,
    RawTexture, // Added for Step 2
    SubMesh, // Added for Step 6
    Viewport, // <-- ADD THIS
    // Removed AbstractEngine import
    // Note: Effect is implicitly used by bindForSubMesh, but not explicitly imported.
} from '@babylonjs/core';
import "@babylonjs/loaders";
// --- START OF FIX B: Import COLOR_OPTIONS ---
import { GLOVE_TO_WEBS_MAP, COLOR_OPTIONS } from './logic';
// --- END OF FIX B ---

// --- INTERFACE FOR PLUGIN CONFIGURATION ---
interface ColorSwapConfig {
    baseColors: string[]; // Hex strings
    initialReplacements: Color3[]; // These are the PALETTE colors
}

// --- Helper function for Step 2 & 3 ---
// Encodes a palette index (0-19 ideally) into an RGB color string for canvas drawing
// We store the index in the Red channel.
function encodeIndexAsColor(index: number): string {
    // Clamp index just in case, although checks should prevent out-of-bounds
    const clampedIndex = Math.max(0, Math.min(index, 255));
    return `rgb(${clampedIndex}, 0, 0)`;
}

// --- REFACTORED PLUGIN CODE ---
class ColorSwapPlugin extends MaterialPluginBase {
    // --- START OF STEP 1 MODIFICATION (Corrected Plan) ---
    // --- START OF DEFINITE ASSIGNMENT FIX ---
    // --- START OF A.1 ---
    private _baseLUT!: RawTexture;     // linear colors (per-zone id colors)
    private _pointerLUT!: RawTexture;  // raw byte indices (R channel)
    private _pointerBuf!: Uint8Array;  // keep CPU-side buffer for cheap updates
    private _paletteLUT!: Texture; // Will hold the swappable palette colors
    // --- END OF A.1 ---
    // --- END OF DEFINITE ASSIGNMENT FIX ---
    private _zoneCount = 32; // Number of zones/base colors
    private _paletteColorCount = 20; // Number of actual swappable colors (adjust if needed)
    // --- END OF STEP 1 MODIFICATION (Corrected Plan) ---

    // Optional: keep the old feel unless you *want* wider blending
    public blendRadius = 1.01;
    public blendStrength = 1.5;
    public enableSdf = 1.0; // <-- ADD THIS
    private _isEnabled = false;
    private _markAllDefinesAsDirty: () => void;

    // in ColorSwapPlugin class:
    private _sdfTex?: Texture;                 // <— add
    public setSDFTexture(t: Texture) { this._sdfTex = t; }  // <— add

    constructor(material: PBRBaseMaterial, config: ColorSwapConfig) {
        super(material, "ColorSwap", 200, { "COLOR_SWAP": false });
        this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];

        // --- START OF STEP 2 MODIFICATION ---
        // 1. Determine Actual Sizes & Validate Config
        if (!config || !config.baseColors || !config.initialReplacements) {
            console.error("ColorSwapPlugin: Invalid configuration provided (missing arrays).");
            // Added explicit return to satisfy TypeScript potentially about _dataLUT/_paletteLUT not being assigned
            // although the `!` assertion technically handles this. Better safe.
            return;
        }
        // Use provided lengths, with fallbacks just in case (though validation helps)
        this._zoneCount = config.baseColors.length || 32;
        this._paletteColorCount = config.initialReplacements.length || 20;

        if (this._zoneCount === 0 || this._paletteColorCount === 0) {
             console.error("ColorSwapPlugin: Config arrays cannot be empty.");
             return; // Need at least one of each
        }
        if (this._paletteColorCount > 255) {
            console.error("ColorSwapPlugin: Cannot support more than 255 palette colors with current encoding.");
             return;
        }

        const scene = material.getScene(); // Get scene reference

        // --- START OF A.1 viewer.tsx — plugin: replace mixed _dataLUT with two RawTextures ---
        // -------- baseLUT (linear colors) --------
        const baseBuf = new Uint8Array(this._zoneCount * 3);
        {
          let o = 0;
          for (let i = 0; i < this._zoneCount; i++) {
            const hex = config.baseColors[i] ?? "#000000";
            const lin = Color3.FromHexString(hex).toLinearSpace(); // <- linear
            baseBuf[o++] = Math.round(lin.r * 255);
            baseBuf[o++] = Math.round(lin.g * 255);
            baseBuf[o++] = Math.round(lin.b * 255);
          }
          this._baseLUT = RawTexture.CreateRGBTexture(
            baseBuf,
            this._zoneCount,
            1,
            scene,
            /*noMipmap*/ true,
            /*invertY*/ false,
            Constants.TEXTURE_NEAREST_SAMPLINGMODE,
            Constants.TEXTURETYPE_UNSIGNED_BYTE
          );
          this._baseLUT.gammaSpace = false; // bytes are already linear
          this._baseLUT.wrapU = this._baseLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        }
        
        // -------- pointerLUT (raw byte indices in R) --------
        this._pointerBuf = new Uint8Array(this._zoneCount * 3);
        {
          let o = 0;
          for (let i = 0; i < this._zoneCount; i++) {
            const idx = i % this._paletteColorCount;  // initial mapping
            this._pointerBuf[o++] = idx; // R = palette index [0..255]
            this._pointerBuf[o++] = 0;   // G
            this._pointerBuf[o++] = 0;   // B
          }
          this._pointerLUT = RawTexture.CreateRGBTexture(
            this._pointerBuf,
            this._zoneCount,
            1,
            scene,
            /*noMipmap*/ true,
            /*invertY*/ false,
            Constants.TEXTURE_NEAREST_SAMPLINGMODE,
            Constants.TEXTURETYPE_UNSIGNED_BYTE
          );
          this._pointerLUT.gammaSpace = false; // integer data, never gamma
          this._pointerLUT.wrapU = this._pointerLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        }

        // -------- paletteLUT (already correct: linear bytes) --------
        // 3. Create _paletteLUT (Static Texture - paletteColorCount x 1)
        // --- END OF A.1 ---
        const paletteBufferSize = this._paletteColorCount * 3; // 3 bytes per RGB color
        const paletteBuffer = new Uint8Array(paletteBufferSize);
        let bufferIndex = 0;
        for (const color of config.initialReplacements) {
            // --- START OF GAMMA CORRECTION (per ChatGPT suggestion) ---
            paletteBuffer[bufferIndex++] = Math.round(color.r * 255); // Use linear .r
            paletteBuffer[bufferIndex++] = Math.round(color.g * 255); // Use linear .g
            paletteBuffer[bufferIndex++] = Math.round(color.b * 255); // Use linear .b
            // --- END OF GAMMA CORRECTION ---
        }

        // --- START OF FIX 3: Add TEXTURETYPE_UNSIGNED_BYTE ---
        // Create the texture from the raw byte data
        this._paletteLUT = RawTexture.CreateRGBTexture(
            paletteBuffer,
            this._paletteColorCount, // width
            1, // height
            scene,
            false, // noMipmap
            false, // invertY
            Constants.TEXTURE_NEAREST_SAMPLINGMODE, // Critical: Nearest sampling
            Constants.TEXTURETYPE_UNSIGNED_BYTE // Explicitly state the data type
        );
        // --- END OF FIX 3 ---
        this._paletteLUT.gammaSpace = false; // Critical: Treat as linear data
        // --- START OF CLAMP ADDRESS MODE (per ChatGPT suggestion) ---
        this._paletteLUT.wrapU = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        this._paletteLUT.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        // --- END OF CLAMP ADDRESS MODE ---

        // 4. Populate _dataLUT (REMOVED)
        // 5. Update _dataLUT to send initial data to GPU (REMOVED)
        
        // --- END OF STEP 2 MODIFICATION ---

        this.isEnabled = true;
    }

    // --- START OF STEP 3 MODIFICATION ---
    // --- START OF A.1 Update method ---
    public updateZonePaletteIndex(zoneIndex: number, paletteIndex: number): void {
      if (zoneIndex < 0 || zoneIndex >= this._zoneCount) return;
      if (paletteIndex < 0 || paletteIndex >= this._paletteColorCount) return;
    
      const o = zoneIndex * 3;
      this._pointerBuf[o] = paletteIndex;
      this._pointerLUT.update(this._pointerBuf); // re-upload small 1×N strip
    }
    // --- END OF A.1 Update method ---
    // --- END OF STEP 3 MODIFICATION ---


    // --- START OF DISPOSE FIX ---
    public dispose() {
        // --- START OF A.1 Dispose ---
        this._baseLUT?.dispose(); // Dispose the LUTs if they exist
        this._pointerLUT?.dispose();
        // --- END OF A.1 Dispose ---
        this._paletteLUT?.dispose();
        super.dispose();
    }
    // --- END OF DISPOSE FIX ---

    get isEnabled() { return this._isEnabled; }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled) return;
        this._isEnabled = enabled;
        this._markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }

    // --- START OF STEP 5 MODIFICATION ---
    // --- START OF A.1 Samplers ---
    public getSamplers(samplers: string[]) {
        samplers.push("baseLUT");
        samplers.push("pointerLUT");
        samplers.push("paletteLUT");
        samplers.push("sdfTex");                 // <— add
    }
    // --- END OF A.1 Samplers ---
    // --- END OF STEP 5 MODIFICATION ---

    prepareDefines(defines: MaterialDefines) {
        defines["COLOR_SWAP"] = this._isEnabled;
    }

    // --- START OF FIX 1: Add samplers back to fragment string ---
    getUniforms() {
        return {
            ubo: [
                { name: "blendRadius", size: 1, type: "float" },
                { name: "blendStrength", size: 1, type: "float" },
                { name: "u_enableSdf", size: 1, type: "float" }, // <-- ADD THIS
            ],
            fragment: `
#ifdef COLOR_SWAP
// Added texture sampler declarations back: (REMOVED - Handled in DEFINITIONS)

// Kept original uniforms:
uniform float blendRadius;
uniform float blendStrength;
uniform float u_enableSdf; // <-- ADD THIS
#endif
`
        };
    }
    // --- END OF FIX 1 ---

    // --- START OF STEP 6 MODIFICATION ---
    // --- START OF A.1 Bind ---
    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: Engine, subMesh: SubMesh) {
        if (this._isEnabled && this._baseLUT && this._pointerLUT && this._paletteLUT) {
            uniformBuffer.updateFloat("blendRadius", this.blendRadius);
            uniformBuffer.updateFloat("blendStrength", this.blendStrength);
            uniformBuffer.updateFloat("u_enableSdf", this.enableSdf); // <-- ADD THIS

            const effect = this._material?.getEffect();
            if (effect) {
                effect.setTexture("baseLUT", this._baseLUT);
                effect.setTexture("pointerLUT", this._pointerLUT);
                effect.setTexture("paletteLUT", this._paletteLUT);
                if (this._sdfTex) effect.setTexture("sdfTex", this._sdfTex);  // <— add
            }
        }
    }
    // --- END OF A.1 Bind ---
    // --- END OF STEP 6 MODIFICATION ---

    // --- START OF STEP 7 MODIFICATION ---
    // --- START OF FIX 2: Move logic to UPDATE_ALBEDO ---
    getCustomCode(shaderType: string) {
        if (shaderType === "fragment") {
            // --- START OF A.1 Shader glue ---
            const definitionsGLSL = `
                const int ZONE_COUNT = ${this._zoneCount};
                const int PALETTE_COUNT = ${this._paletteColorCount};

                #ifdef COLOR_SWAP // Gate helpers
                uniform sampler2D baseLUT;     // linear colors per zone
                uniform sampler2D pointerLUT;  // index per zone (R channel, 0..255)
                uniform sampler2D paletteLUT;  // linear palette colors
                uniform sampler2D sdfTex;      // signed/normalized distance field in R channel

                int decodeIndex(vec4 c) { return int(c.r * 255.0 + 0.5); }

                #ifdef WEBGL2
                    #define FETCH_BASE(ix)    texelFetch(baseLUT,    ivec2(ix, 0), 0)
                    #define FETCH_POINTER(ix) texelFetch(pointerLUT, ivec2(ix, 0), 0)
                    #define FETCH_PALETTE(ix) texelFetch(paletteLUT, ivec2(ix, 0), 0)
                #else
                    vec2 uv1D(int ix, int W){ return (vec2(float(ix)+0.5, 0.5) / vec2(float(W), 1.0)); }
                    #define FETCH_BASE(ix)    texture2D(baseLUT,    uv1D(ix, ZONE_COUNT))
                    #define FETCH_POINTER(ix) texture2D(pointerLUT, uv1D(ix, ZONE_COUNT))
                    #define FETCH_PALETTE(ix) texture2D(paletteLUT, uv1D(ix, PALETTE_COUNT))
                #endif

                // sRGB -> Linear conversion (matches Babylon's toLinearSpace behavior closely)
                vec3 srgbToLinear(vec3 c){
                  // piecewise sRGB
                  vec3 lo = c / 12.92;
                  vec3 hi = pow((c + 0.055) / 1.055, vec3(2.4));
                  return mix(lo, hi, step(vec3(0.04045), c));
                }

                // Find the closest zone in baseLUT to a sampled ID color (linear space)
                int closestZone(vec3 idColor) {
                  int bestI = 0;
                  float bestD = 1e9;
                  for (int i = 0; i < ZONE_COUNT; ++i) {
                    vec3 b = FETCH_BASE(i).rgb;
                    vec3 d = idColor - b;
                    float dd = dot(d, d);
                    if (dd < bestD) { bestD = dd; bestI = i; }
                  }
                  return bestI;
                }

                // Old behavior: try exact-ish match first, then fallback
                int findZone(vec3 idColor) {
                  const float ID_TOL = 0.5 / 255.0; // half LSB in byte space
                  for (int i = 0; i < ZONE_COUNT; ++i) {
                    vec3 b = FETCH_BASE(i).rgb;
                    if (all(lessThan(abs(idColor - b), vec3(ID_TOL)))) {
                      return i;
                    }
                  }
                  return closestZone(idColor);
                }

                // Map a zone -> palette color via pointerLUT
                vec3 zoneToPalette(int zone) {
                  int p = decodeIndex(FETCH_POINTER(zone));
                  return FETCH_PALETTE(p).rgb; // linear
                }
                #endif // End gate helpers
            `;
            // --- END OF FIX 2 (ChatGPT): Gate helpers ---

            // --- START OF FIX 1 (ChatGPT): Rename finalColor ---
            const updateAlbedoGLSL = `
#ifdef COLOR_SWAP
// This is the global switch (1.0 = on, 0.0 = off)
// It is set from the CPU, which now measures the object's pixel size.

if (u_enableSdf > 0.5) {
  // --- HIGH QUALITY PATH (SDF ON) ---
  // The 'fwidth' check is GONE from here.
  
  float sd = texture2D(sdfTex, vAlbedoUV).r;
  float sd_fwidth = fwidth(sd); // Still needed for blend width
  vec2 g  = vec2(dFdx(sd), dFdy(sd));
  float glen = max(length(g), 1e-6);
  vec2 dir = g / glen;

  float px = max(fwidth(vAlbedoUV.x) + fwidth(vAlbedoUV.y), 1e-5);
  vec2 duv = dir * px;

  vec3 idA = srgbToLinear(texture2D(albedoSampler, vAlbedoUV - duv).rgb);
  vec3 idB = srgbToLinear(texture2D(albedoSampler, vAlbedoUV + duv).rgb);

  int  zA = findZone(idA);
  int  zB = findZone(idB);
  vec3 palA = zoneToPalette(zA);
  vec3 palB = zoneToPalette(zB);

  float wMin = 0.8 * px;                 // tune 0.7–1.0
float w    = max(max(sd_fwidth * blendStrength, 1e-6), wMin);
  float t = smoothstep(0.5 - blendRadius * w, 0.5 + blendRadius * w, sd);
  surfaceAlbedo.rgb = mix(palB, palA, t);

} else {
  // --- MINIFICATION FILTER (material-local, palette-aware; no global FXAA/TAA) ---

  // 1) Edge direction from the ID map luminance
  vec3  id0 = srgbToLinear(texture2D(albedoSampler, vAlbedoUV).rgb);
  float L0  = dot(id0, vec3(0.299, 0.587, 0.114));
  vec2  g   = vec2(dFdx(L0), dFdy(L0));
  float glen = max(length(g), 1e-6);
  vec2  dir  = g / glen;

  // 2) Pixel footprint in UV (subpixel coverage span)
  float fp = max(fwidth(vAlbedoUV.x) + fwidth(vAlbedoUV.y), 1e-5);
  vec2  duv = dir * fp;

  // 3) Take a few samples across the footprint, map each to a PALETTE color,
  //    then blend in palette space (not raw RGB of the ID map).
  vec2 offs[4] = vec2[](-1.5*duv, -0.5*duv, 0.5*duv, 1.5*duv);
  float w[4]   = float[](0.2, 0.3, 0.3, 0.2); // tent weights

  vec3 accum = vec3(0.0);
  float sumw = 0.0;
  for (int i = 0; i < 4; ++i) {
    vec3 idS = srgbToLinear(texture2D(albedoSampler, vAlbedoUV + offs[i]).rgb);
    int  z   = findZone(idS);
    vec3 pal = zoneToPalette(z);
    accum += pal * w[i];
    sumw  += w[i];
  }

  surfaceAlbedo.rgb = accum / sumw;
}
#endif
`;
            // --- END OF A.1 Shader glue ---
            // --- END OF FIX 1 (ChatGPT): Rename finalColor ---

            return {
                "CUSTOM_FRAGMENT_DEFINITIONS": definitionsGLSL,
                "CUSTOM_FRAGMENT_UPDATE_ALBEDO": updateAlbedoGLSL // Moved logic here
            };
        }
        return null;
    }
    // --- END OF FIX 2 ---
    // --- END OF STEP 7 MODIFICATION ---
}

// --- AssetManager Class ---
class AssetManager {
    private cache = new Map<string, Promise<AssetContainer>>();
    constructor(private scene: Scene) { }
    private _handlePreloadError(assetName: string, error: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[AssetManager] Preload failed for "${assetName}":`, error);
        }
    }
    public async getAsset(name: string): Promise<AssetContainer> {
        if (this.cache.has(name)) {
            return this.cache.get(name)!;
        }
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;
        const loadPromise = SceneLoader.LoadAssetContainerAsync(rootUrl, `${name}.glb`, this.scene);
        this.cache.set(name, loadPromise);
        return loadPromise;
    }
    public preloadAssets(names: string[]): void {
        for (const name of names) {
            this.getAsset(name).catch((error) => this._handlePreloadError(name, error));
        }
    }
}


// --- UPDATED SceneManager Class ---
export class SceneManager {
    private engine: Engine;
    private scene: Scene;
    private camera: ArcRotateCamera; // <-- MAKE THIS A CLASS PROPERTY
    private resizeObserver: ResizeObserver;
    private assetManager: AssetManager;
    private isSceneReady = false;
    private textTextures = new Map<string, DynamicTexture>();

    private activeShellMaterial: PBRMaterial | null = null;
    private activeShellPlugin: ColorSwapPlugin | null = null;
    private activeWebMaterial: PBRMaterial | null = null;
    private activeWebPlugin: ColorSwapPlugin | null = null;

    private shellMaterialsCache = new Map<string, { material: PBRMaterial, plugin: ColorSwapPlugin }>();
    private gloveShells = new Map<string, Mesh>();
    private webMaterialsCache = new Map<string, { material: PBRMaterial, plugin: ColorSwapPlugin }>();
    private webs = new Map<string, Mesh>();
    private activeShellName: string | null = null;

    constructor(canvas: HTMLCanvasElement, onReady: (manager: SceneManager) => void) {
        this.engine = new Engine(canvas, true, { alpha: true });
        this.scene = new Scene(this.engine);
        this.assetManager = new AssetManager(this.scene);
        this.scene.clearColor = new Color4(0, 0, 0, 0);

        this.camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 3, Vector3.Zero(), this.scene); // <-- CHANGE to this.camera
        this.camera.minZ = 0.1;
        this.camera.attachControl(canvas, true);
        new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        this.camera.fov = 0.3;
        this.camera.lowerRadiusLimit = 1.5;
        this.camera.upperRadiusLimit = 4;
        this.camera.panningSensibility = 0;
        this.camera.wheelPrecision = 150;

        this.loadInitialAssets(onReady);

        // ... inside the constructor ...

        this.engine.runRenderLoop(() => {
            
            // --- THIS IS THE NEW "PIXEL BUDGET" LOGIC ---
            if (this.activeShellPlugin && this.activeShellName && this.gloveShells.has(this.activeShellName)) {
                const activeMesh = this.gloveShells.get(this.activeShellName);
                if (activeMesh) { // <-- guard for TS
                  activeMesh.computeWorldMatrix(true); // Ensure matrices are up to date

                  const localCorners = activeMesh.getBoundingInfo().boundingBox.vectors;
                  const worldMatrix = activeMesh.getWorldMatrix();
                  const transformMatrix = this.scene.getTransformMatrix();
                  const viewport = this.camera.viewport.toGlobal(this.engine.getRenderWidth(), this.engine.getRenderHeight());

                  let minX = Infinity, minY = Infinity;
                  let maxX = -Infinity, maxY = -Infinity;
                  let validPixels = 0;

                  // Project all 8 corners of the box to 2D screen space
                  for (const corner of localCorners) {
                    const screenPos = Vector3.Project(corner, worldMatrix, transformMatrix, viewport);

                    // Only count corners that are in front of the camera
                    if (screenPos.z > 0 && screenPos.z < 1) {
                      minX = Math.min(minX, screenPos.x);
                      maxX = Math.max(maxX, screenPos.x);
                      minY = Math.min(minY, screenPos.y);
                      maxY = Math.max(maxY, screenPos.y);
                      validPixels++;
                    }
                  }

                  let enableSdf = 1.0; // Default to ON

                  if (validPixels > 0) {
                    const pixelHeight = maxY - minY;

                    // If the object is less than 250px tall, turn off SDF
                    const SDF_PIXEL_HEIGHT_THRESHOLD = 470.0;

                    enableSdf = (pixelHeight > SDF_PIXEL_HEIGHT_THRESHOLD) ? 1.0 : 0.0;
                  } else {
                    enableSdf = 0.0; // Object is off-screen
                  }

                  // Set the uniform for the shader
                  this.activeShellPlugin.enableSdf = enableSdf;
                  if (this.activeWebPlugin) {
                    this.activeWebPlugin.enableSdf = enableSdf;
                  }
                }
            }
            // --- END OF NEW LOGIC ---

            this.scene.render();
        });
        
        this.resizeObserver = new ResizeObserver(() => this.engine.resize());
        this.resizeObserver.observe(canvas);
    }

    private _setupMaterialWithPlugin(material: PBRMaterial, modelName: string): ColorSwapPlugin {
        const rootUrl = `${process.env.PUBLIC_URL || ''}/assets/`;

        // --- START OF 2. viewer.tsx — SceneManager: sample the ID PNG as linear ---
        const colorIdTexture = new Texture(`${rootUrl}${modelName}.png`, this.scene, /*noMipmap*/ true, /*invertY*/ false, Constants.TEXTURE_NEAREST_SAMPLINGMODE);
        // IMPORTANT: PNG is sRGB; ask Babylon to convert to linear for the shader
        colorIdTexture.gammaSpace = true;
        // Be strict: avoid seams/bleeding
        colorIdTexture.wrapU = colorIdTexture.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        colorIdTexture.hasAlpha = false;
        
        material.albedoTexture = colorIdTexture;
        // --- END OF 2. ---

        const detailTexture = new Texture(`${rootUrl}details.png`, this.scene);
        detailTexture.coordinatesIndex = 0;
        detailTexture.uScale = 3;
        detailTexture.vScale = 3;
        material.detailMap.isEnabled = true;
        material.detailMap.normalBlendMethod = 1;
        material.detailMap.texture = detailTexture;
        material.detailMap.diffuseBlendLevel = 0;
        material.detailMap.roughnessBlendLevel = 0;
        material.detailMap.bumpLevel = .35;

        // --- START OF FIX B: Use imported COLOR_OPTIONS ---
        const paletteColorsFromLogic: Color3[] =
          COLOR_OPTIONS.map(({ hex }) => Color3.FromHexString(hex).toLinearSpace())
                       .slice(0, 20); // Assuming palette size is fixed at 20 based on COLOR_OPTIONS
        // --- END OF FIX B ---

        const gloveConfig: ColorSwapConfig = {
            baseColors: [ // Ensure this still has 32 colors
                "#FF0000", "#00FFFF", "#80FF00", "#7F00FF", "#FFBF00", "#0040FF", "#00FF40", "#FF00BF",
                "#FF6000", "#009FFF", "#20FF00", "#DF00FF", "#DFFF00", "#2000FF", "#00FF9F", "#FF0060",
                "#FF3000", "#00CFFF", "#50FF00", "#AF00FF", "#FFEF00", "#0010FF", "#00FF70", "#FF008F",
                "#FF8F00", "#0070FF", "#00FF10", "#FF00EF", "#AFFF00", "#5000FF", "#00FFCF", "#FF0030"
            ],
            initialReplacements: paletteColorsFromLogic // Use the actual 20 palette colors
        };

        const plugin = new ColorSwapPlugin(material, gloveConfig);

        // Wire SDF (required for smoothing)
        const sdfTexture = new Texture(
          `${rootUrl}${modelName}SDF.png`,
          this.scene,
          /*noMipmap*/ false,
          /*invertY*/ false,
          Constants.TEXTURE_TRILINEAR_SAMPLINGMODE
        );
        sdfTexture.gammaSpace = false; // data texture
        sdfTexture.wrapU = sdfTexture.wrapV = Constants.TEXTURE_CLAMP_ADDRESSMODE;
        plugin.setSDFTexture(sdfTexture); // <— add

        return plugin;
    }

    private async loadInitialAssets(onReady: (manager: SceneManager) => void) {
        const initialGloveName = 'openBack';
        await this.updateBuild(initialGloveName);
        this.isSceneReady = true;
        onReady(this);
    }

    public isReady = (): boolean => this.isSceneReady;

    // --- START OF SCENEMANAGER UPDATE FIX ---
    // Renamed methods and updated calls to use the new plugin method
    public updateShellZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeShellPlugin?.updateZonePaletteIndex(zoneIndex, paletteIndex);
    }

    public updateWebZonePointer(zoneIndex: number, paletteIndex: number): void {
        this.activeWebPlugin?.updateZonePaletteIndex(zoneIndex, paletteIndex);
    }
    // --- END OF SCENEMANAGER UPDATE FIX ---


    public async updateBuild(modelName: string): Promise<void> {
        if (!modelName || this.activeShellName === modelName) return;

        if (this.shellMaterialsCache.has(modelName)) {
            const cached = this.shellMaterialsCache.get(modelName)!;
            this.activeShellMaterial = cached.material;
            this.activeShellPlugin = cached.plugin;
        } else {
            const container = await this.assetManager.getAsset(modelName);
            const mesh = container.meshes.find(m => m.name === modelName) as Mesh;
            if (mesh) {
                container.addAllToScene();
                this.gloveShells.set(modelName, mesh);

                const gloveMaterial = container.materials.find(m => m.name === 'gloveMat') as PBRMaterial;
                if (gloveMaterial) {
                    const newPlugin = this._setupMaterialWithPlugin(gloveMaterial, modelName);
                    this.activeShellMaterial = gloveMaterial;
                    this.activeShellPlugin = newPlugin;
                    this.shellMaterialsCache.set(modelName, { material: gloveMaterial, plugin: newPlugin });
                }
            }
        }

        this.activeShellName = modelName;
        this.gloveShells.forEach((mesh, name) => {
            mesh.setEnabled(name === modelName);
        });

        const websToPreload = GLOVE_TO_WEBS_MAP[modelName as keyof typeof GLOVE_TO_WEBS_MAP];
        if (websToPreload) {
            this.assetManager.preloadAssets(Object.values(websToPreload));
        }
    }

    public async updateWeb(webModelName: string): Promise<void> {
        if (!webModelName) {
            this.webs.forEach(mesh => mesh.setEnabled(false));
            this.activeWebMaterial = null;
            this.activeWebPlugin = null;
            return;
        }

        if (this.webMaterialsCache.has(webModelName)) {
            const cached = this.webMaterialsCache.get(webModelName)!;
            this.activeWebMaterial = cached.material;
            this.activeWebPlugin = cached.plugin;
        } else {
            const container = await this.assetManager.getAsset(webModelName);
            const mesh = container.meshes.find(m => m.name === webModelName) as Mesh;
            if (mesh) {
                container.addAllToScene();
                this.webs.set(webModelName, mesh);

                const webMaterial = container.materials.find(m => m.name === 'webMat') as PBRMaterial;
                if (webMaterial) {
                    const webPlugin = this._setupMaterialWithPlugin(webMaterial, webModelName);
                    this.activeWebMaterial = webMaterial;
                    this.activeWebPlugin = webPlugin;
                    this.webMaterialsCache.set(webModelName, { material: webMaterial, plugin: webPlugin });
                }
            }
        }

        this.webs.forEach((mesh, name) => {
            mesh.setEnabled(name === webModelName);
        });
    }

    public updateText = (options: { zone: string; text: string; font: string; color: string; }) => {
        const { zone, text, font, color } = options;
        if (!this.activeShellName) return;
        const materialName = `${zone}${this.activeShellName.charAt(0).toUpperCase() + this.activeShellName.slice(1)}`;
        const textMat = this.scene.getMaterialByName(materialName) as PBRMaterial;
        if (textMat) {
            let texture = this.textTextures.get(zone);
            if (!texture) {
                texture = new DynamicTexture(zone, { width: 512, height: 256 }, this.scene);
                texture.hasAlpha = true;
                textMat.albedoTexture = texture;
                textMat.useAlphaFromAlbedoTexture = true;
                textMat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
                textMat.unlit = true;
                this.textTextures.set(zone, texture);
            }
            const fontSize = text ? 70 : 90;
            const fontString = `bold ${fontSize}px "${font}"`;
            const ctx = texture.getContext();
            ctx.clearRect(0, 0, texture.getSize().width, texture.getSize().height);
            if (text) {
                texture.drawText(text, null, null, fontString, color, 'transparent', false);
            }
        } else {
             console.warn(`Text material "${materialName}" not found on active model.`);
        }
    };

    public dispose() {
        this.shellMaterialsCache.forEach(cached => cached.plugin.dispose()); // Dispose plugins in cache
        this.shellMaterialsCache.clear();
        this.webMaterialsCache.forEach(cached => cached.plugin.dispose()); // Dispose plugins in cache
        this.webMaterialsCache.clear();
        this.resizeObserver.disconnect();
        this.scene.dispose(); // Dispose scene resources
        this.engine.dispose(); // Dispose engine
    }
}

interface BabylonCanvasProps {
    onSceneReady: (sceneManager: SceneManager) => void;
}

const BabylonCanvas = ({ onSceneReady }: BabylonCanvasProps) => {
    const reactCanvas = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const { current: canvas } = reactCanvas;
        if (!canvas) return;

        const sceneManager = new SceneManager(canvas, onSceneReady);

        return () => {
            sceneManager.dispose();
        };
    }, [onSceneReady]);

    return <canvas ref={reactCanvas} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};

export default BabylonCanvas;
