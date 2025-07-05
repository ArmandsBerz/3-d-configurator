/* eslint-disable array-callback-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-multi-assign */

// Core Babylon imports
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import '@babylonjs/loaders/glTF';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  CubeTexture,
  Color4,
  AbstractMesh,
  AssetsManager,
  Color3,
  DynamicTexture,
  Material,
  Mesh,
  MultiMaterial,
  PBRMaterial,
  StandardMaterial,
  Texture,
  Observable,
  SceneLoader,
  Skeleton,
  ISceneLoaderAsyncResult,
  ImageAssetTask,
  AssetContainer,
} from '@babylonjs/core';

// Other libs
import _ from 'lodash';
import $ from 'jquery';

// -------------------------------------------------------------------
// ASSETS LOADER
// -------------------------------------------------------------------
export class AssetsLoader {
  private static instance: AssetsLoader;
  protected assetsManager: AssetsManager;
  protected sceneRoot: Scene;
  protected resources: any;
  protected meshArr: AbstractMesh[] = [];
  protected forSkeleton: { name: string; skeletons: Skeleton[] }[] = [];
  protected loadResultArr: ISceneLoaderAsyncResult[] = [];

  public taskArr: ImageAssetTask[] = [];
  public isLoad = false;

  constructor(scene: Scene) {
    this.sceneRoot = scene;
    this.assetsManager = new AssetsManager(this.sceneRoot);
  }

  /**
   * FIX: This method now queues all image tasks without starting the load.
   * Call `loadQueuedAssets()` afterwards to begin downloading.
   */
  public queueImageResources(resourcePack: any): void {
    for (const key in resourcePack) {
      if (Object.prototype.hasOwnProperty.call(resourcePack, key)) {
        const path = resourcePack[key];
        const imageTask = this.assetsManager.addImageTask(`${key}`, `${path}`);
        imageTask.onSuccess = (task) => {
          this.taskArr.push(task);
        };
      }
    }
  }

  /**
   * FIX: This new method executes the loading of all queued assets.
   * It returns a promise that resolves when all assets are finished.
   */
  public loadQueuedAssets(): Promise<void> {
    return new Promise((resolve, reject) => {
      // The observable for handling errors on any task
      const errorObserver = this.assetsManager.onTaskErrorObservable.add((task) => {
        console.error(`Error loading asset ${task.name}:`, task.errorObject.message, task.errorObject.exception);
        reject(new Error(`Failed to load ${task.name}`));
      });

      // The callback for when all tasks are finished successfully
      this.assetsManager.onFinish = (tasks) => {
        // Remove the error observer to prevent memory leaks
        this.assetsManager.onTaskErrorObservable.remove(errorObserver);
        this.isLoad = true;
        resolve();
      };
      
      this.assetsManager.load();
    });
  }

  public getResourceTexture(textureName: string): Texture {
    let texture: Texture | null = null;
    for (let i = 0; i < this.taskArr.length; i++) {
      const element = this.taskArr[i];
      if (textureName === element.name && element.image) {
        texture = new Texture(element.image.src, this.sceneRoot);
        break;
      }
    }
    if (!texture) {
      texture = new Texture('', this.sceneRoot);
    }
    return texture;
  }

  /**
   * This method correctly uses SceneLoader for a single mesh and remains unchanged.
   */
  public async loadMesh(url: string, type: string, name?: any): Promise<void> {
    let meshName = null;
    if (name) meshName = name;

    const result = await SceneLoader.ImportMeshAsync(meshName, `${url}`, `${type}`, this.sceneRoot);

    const env = result.meshes[1];
    env.setEnabled(false);
    const { skeletons } = result;
    this.meshArr.push(env);
    this.loadResultArr.push(result);
    this.forSkeleton.push({ name: env.name, skeletons });
  }

  /**
   * FIX: Refactored to use SceneLoader.LoadAssetContainerAsync.
   * This is cleaner for loading a single awaited asset and avoids the AssetsManager issue.
   */
  public async loadAssetsContainer(url: string, file: string, scene: Scene): Promise<AssetContainer> {
    const container = await SceneLoader.LoadAssetContainerAsync(url, file, scene);

    // This will add all loaded assets, including meshes AND materials, to the scene.
    container.addAllToScene();
    
    const arr: Mesh[] = [];
    
    // The first mesh is the __root__ node, which we can ignore for merging.
    container.meshes.forEach((item) => {
      if (item.id !== '__root__') {
        arr.push(item as Mesh);
      }
    });

    const merged = Mesh.MergeMeshes(arr, true, false, null, false, true);
    if (merged) {
      merged.name = file.replace('.glb', '');
      this.meshArr.push(merged);
    }
    
    return container;
  }

  public getMesh(meshName: string): AbstractMesh {
    let mesh;
    for (let i = 0; i < this.meshArr.length; i++) {
      const element = this.meshArr[i];
      if (element.name === meshName) {
        mesh = element;
      }
    }
    return mesh;
  }

  public getSkeletons(name: string) {
    let skeleton;
    for (let i = 0; i < this.forSkeleton.length; i++) {
      const element = this.forSkeleton[i];
      if (element.name === name) {
        skeleton = element.skeletons[0];
      }
    }
    return skeleton;
  }

  public getResult(name: string): ISceneLoaderAsyncResult {
    let result;
    for (let i = 0; i < this.loadResultArr.length; i++) {
      const element = this.loadResultArr[i];
      const resultMeshName = element.meshes[0].name;
      if (resultMeshName === name) {
        result = element;
      }
    }
    return result;
  }

  public static getInstance(scene: Scene): AssetsLoader {
    if (!AssetsLoader.instance) {
      AssetsLoader.instance = new AssetsLoader(scene);
    }
    return AssetsLoader.instance;
  }
}

// -------------------------------------------------------------------
// NEW GLOVE MANAGER AND ENGINE API CLASSES
// -------------------------------------------------------------------

/**
 * Manages the logic for updating glove and web appearances.
 * It is the single point of contact for making visual changes.
 */
export class GloveManager {
    private scene: Scene;
    private currentGlove: Glove | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // Method to inform the manager which glove is currently active
    public setActiveGlove(glove: Glove): void {
        this.currentGlove = glove;
    }

    /**
     * This is the core logic, moved from the old Glove class.
     * It updates the color on the correct part of the model.
     */
    public async updateColor(zone: string, color: string): Promise<void> {
        if (!this.currentGlove) return;

        // Update the main glove's texture
        if (this.currentGlove.isSvgLoaded) {
            this.currentGlove.svgProcessor.updateSVGZone(zone, color);
            await this.currentGlove.updateTexture();
        }

        // If the zone is also a web-specific zone, update the active web
        if (ZONES_WEB.includes(zone) && this.currentGlove.currentWeb) {
            await this.currentGlove.currentWeb.updateZoneColor(zone, color);
        }
    }

    // You can add more methods here to handle text, etc.
    public updateText(zone: string, text: string, font: string, color: string) {
        if (!this.currentGlove) return;
        
        this.currentGlove.changeTextStyle('text', text);
        this.currentGlove.changeTextStyle('font', font);
        this.currentGlove.changeTextStyle('color', color);
        this.currentGlove.updateText(zone);
    }
}

/**
 * The formal, public-facing API for the entire Babylon.js engine.
 * The React UI will interact ONLY with this object.
 */
export class EngineAPI {
    private gloveManager: GloveManager;
    private sceneBabylon: SceneBabylon;

    constructor(gloveManager: GloveManager, sceneBabylon: SceneBabylon) {
        this.gloveManager = gloveManager;
        this.sceneBabylon = sceneBabylon;
    }

    // Clean function for the UI to call via the useEngine() hook
    public updateColor(zone: string, color: string): void {
        this.gloveManager.updateColor(zone, color);
    }
    
    // Example of another clean API function
    public setActiveGlove(index: number): void {
        this.sceneBabylon.setActiveGlove(index);
    }

    // The new "bridge" function, explicitly added for the UI to use.
    public setActiveWeb(webTypeValue: string): void {
        this.sceneBabylon.setActiveWeb(webTypeValue);
    }

    public updateText(zone: string, text: string, font: string, color: string): void {
        this.gloveManager.updateText(zone, text, font, color);
    }
}


// -------------------------------------------------------------------
// SVGProcessor
// -------------------------------------------------------------------
export class SVGProcessor {
  svg: Document;
  serializer: XMLSerializer;

  constructor() {
    this.serializer = new XMLSerializer();
  }

  loadSVG(url: string): Promise<null> {
    return new Promise((resolve, reject) => {
      // Use the modern 'fetch' API instead of jQuery's 'get'
      fetch(url)
        .then(response => {
          if (!response.ok) {
            // This gives a clearer error if the file is not found
            throw new Error(`Network response was not ok for ${url}`);
          }
          // Get the file's content as plain text
          return response.text();
        })
        .then(text => {
          // Use the browser's built-in parser to convert the text to a proper SVG document
          const parser = new DOMParser();
          this.svg = parser.parseFromString(text, "image/svg+xml");
          // Check for parsing errors, which is good practice
          const errorNode = this.svg.querySelector('parsererror');
          if (errorNode) {
              console.error('Error parsing SVG:', errorNode.textContent);
              reject(new Error('Error parsing SVG'));
          } else {
              resolve(null);
          }
        })
        .catch(error => {
          console.error(`Failed to load or parse SVG from ${url}:`, error);
          reject(error);
        });
    });
  }

  updateSVGZone(zone: string, color: string): void {
    if (!this.svg) {
      console.warn(`Attempted to update zone '${zone}' before SVG was loaded.`);
      return;
    }
    const element = this.svg.getElementById(zone);
    if (element) {
      element.style.fill = color;
    } else {
      // This will now print a clear message instead of crashing
      // console.error(`SVG element with ID '${zone}' was not found in the loaded SVG file.`);
    }
  }

  async textureFromSVGData(scene: Scene): Promise<Texture> {
    return new Promise((resolve) => {
      const serializedSVG: string = this.serializer.serializeToString(this.svg);
      const encodedData = `data:image/svg+xml;base64,${window.btoa(serializedSVG)}`;
      const texture: Texture = Texture.LoadFromDataString(
        `svg-${Date.now()}`,
        encodedData,
        scene
      );
      texture.onLoadObservable.add(() => {
        resolve(texture);
      });
    });
  }
}

// -------------------------------------------------------------------
// CONSTANTS and ZONES
// -------------------------------------------------------------------
export const fonts = ['Oswald', 'BrushScript'];

export const colorMap = [
  {
    white: '#E5E7E8',
    red: '#A9131B',
    maroon: '#421518',
    dark_brown: '#39221B',
  },
  {
    white: '#E5E7E8',
    red: '#A9131B',
    brown: '#602D28',
    water_blue: '#0A4175',
  },
];

export const additionalColors = {
  toneOnTone: {
    value: '#0000ff00',
    zones: ['stitching'],
  },
  blackSplitWelting: {
    value: '#000000',
    zones: ['welting'],
  },
  greySplitWelting: {
    value: '#706E64',
    zones: ['welting'],
  },
};

export const colorOptions = [
  {
    text: 'White',
    value: 'white',
  },
  {
    text: 'Red',
    value: 'red',
  },
  {
    text: 'Brown',
    value: 'brown',
  },
  {
    text: 'Water_blue',
    value: 'water_blue',
  },
];

// Zones
export const ZONES_TEXT = {
  openBack: ['thumbName', 'pinkyName'],
  closeBack: ['thumbName', 'pinkyName'],
  firstBase: ['thumbName'],
  catchers: ['thumbName'],
};
export const ZONES_PAD_HOOD: string[] = ['padHood'];
export const ZONES_WEB: string[] = ['lace', 'web', 'stitching'];

export const WEBS: string[] = ['modTrapOB', 'iOB', 'twoPieceFB', 'postFB'];

export const ZONES_GLOVE = {
  openBack: [
    'web',
    'padHood',
    'thumbOuter',
    'thumbInner',
    'index',
    'middleInner',
    'middleOuter',
    'ringInner',
    'ringOuter',
    'pinkyInner',
    'pinkyOuter',
    'palm',
    'liner',
    'binding',
    'welting',
    'lace',
    'stitching',
    'wristLogo',
    'wristLogoOutline',
    'fingerLogo',
  ],
  closeBack: [
    'web',
    'wristStrap',
    'thumbOuter',
    'primaryUPiece',
    'middleOuterRingInner',
    'ringOuterPinkyInner',
    'pinkyOuter',
    'palm',
    'liner',
    'binding',
    'welting',
    'lace',
    'stitching',
    'wristLogo',
    'wristLogoOutline',
    'fingerLogo',
  ],
  firstBase: [
    'web',
    'wrist',
    'padHood',
    'thumbOuter',
    'primaryUPiece',
    'shellBack',
    'palm',
    'liner',
    'binding',
    'lace',
    'stitching',
    'wristLogo',
    'wristLogoOutline',
    'fingerLogo',
  ],
  catchers: [
    'web',
    'wrist',
    'padHood',
    'shellBack',
    'shellBase',
    'palm',
    'rails',
    'liner',
    'binding',
    'lace',
    'stitching',
    'wristLogo',
    'wristLogoOutline',
    'fingerLogo',
  ],
};

export const WEBS_GLOVE = {
  openBack: ['modTrapOB', 'iOB'],
  closeBack: ['modTrapCB', 'hCB'],
  firstBase: ['twoPieceFB', 'postFB'],
  catchers: ['twoPieceCM'],
};

// -------------------------------------------------------------------
// NEW CONSTANTS from second file
// -------------------------------------------------------------------
export const playerPosition = {
  infield: {
    glove: ['openBack'],
    web: [
      'modTrap',
      'i',
      'h',
      'onePiece',
      'framedModTrap',
      'basket',
      'singlePostLace',
      'singlePost',
    ],
    size: ['11"', '11.25"', '11.5"', '11.75"', '12"', '12.25"'],
  },
  outfield: {
    glove: ['openBack', 'closeBack'],
    web: ['modTrap', 'h', 'framedModTrap', 'lacedH', 'trap'],
    size: ['12"', '12.25"', '12.5"', '12.75"', '13"'],
  },
  pitcher: {
    glove: ['openBack', 'closeBack'],
    web: [
      'modTrap',
      'onePiece',
      'twoPiece',
      'dualHinge',
      'framedModTrap',
      'closedV',
      'basket',
      'basketLace',
      'sealing',
      'laceSealing',
    ],
    size: ['11.25"', '11.5"', '11.75"', '12"', '12.25"', '12.5"'],
  },
  'first base': {
    glove: ['firstBase'],
    web: ['twoPieceFB', 'postFB'],
    size: ['12"', '12.25"', '12.5"', '12.75"', '13"'],
  },
  catcher: {
    glove: ['catchers'],
    web: ['twoPieceCM'],
    size: ['32"', '32.5"', '33"', '33.5"', '34"'],
  },
};

export const configBuild = {
  'Glove Leather': ['Japanese Kip', 'US Steerhide'],
  Position: ['infield', 'outfield', 'pitcher', 'catcher', 'first base'],
  // Size: ['11"', '11.25"', '11.5"', '11.75"', '12"'],
  Size: playerPosition.infield.size,
  'Hand Opening Size': ['adult', 'youth'],
  Stiffness: ['stiff', 'standard', 'soft'],
  'Throwing Hand': ['right hand', 'left hand'],
};

// -------------------------------------------------------------------
// CLASSES for Glove objects and related entities
// -------------------------------------------------------------------
class Zones {
  zones: string[];

  constructor(zones: string[]) {
    this.zones = zones;
  }
}

class GloveObject {
  id: string;
  name: string;
  model: AbstractMesh;
  zones: Zones;
  protected loader: AssetsLoader;

  get material(): MultiMaterial {
    return this.model.material as MultiMaterial;
  }

  constructor(scene: Scene, meshName: string, zones: Zones) {
    this.loader = AssetsLoader.getInstance(scene);
    this.id = meshName;
    this.name = meshName;
    this.model = this.loader.getMesh(meshName);
    this.model.setEnabled(true);
    this.zones = zones;
  }
}

class Web extends GloveObject {}
class PadHood extends GloveObject {}

// -------------------------------------------------------------------
// The WebGlove class
// -------------------------------------------------------------------
export class WebGlove {
  id: string;
  glbFile: string;
  designFile: string;
  textSelectorFont = 'bold 100px monospace';

  webZones: Zones = new Zones(ZONES_WEB);
  padHoodZones: Zones = new Zones(ZONES_PAD_HOOD);

  scene: Scene;

  webObject: GloveObject;
  svgProcessor: SVGProcessor;
  objectMat: PBRMaterial;
  textTexture: DynamicTexture;

  public web: Mesh;
  protected arrMeshes: AbstractMesh[] = [];

  constructor(
    assetName: string,
    designName: string,
    scene: Scene,
    engine: Engine,
    callback: () => void
  ) {
    this.id = assetName;
    this.glbFile = `${assetName}.glb`;
    this.designFile = `${designName}.svg`;

    this.scene = scene;

    this.textTexture = new DynamicTexture('dynamic texture', { width: 512, height: 256 }, scene);

    // Create the web portion as a GloveObject
    this.webObject = new GloveObject(scene, assetName, this.webZones);
    // Then get that object's material
    this.objectMat = this.webObject.material as unknown as PBRMaterial;

    // Set up SVGProcessor for the web design
    this.svgProcessor = new SVGProcessor();
    this.svgProcessor.loadSVG(`assets/${this.designFile}`).then(() => {
      callback();
      this.updateTexture();
    });

    // FIX: Removed redundant render loop.
  }

  updateText(text: string) {
    console.log(`custom text: ${text}`);
    const ctx = this.textTexture.getContext();
    ctx.clearRect(0, 0, this.textTexture.getSize().width, this.textTexture.getSize().height);
    
    // Explicitly disable the internal update mechanism of drawText
    this.textTexture.drawText(
      text,
      undefined,
      undefined,
      this.textSelectorFont,
      'white',
      'transparent',
      false, // invertY: false (so it's right-side up)
      false  // update: false (we will handle the update call)
    );
    
    // Explicitly call update(false) to apply the drawing without flipping
    this.textTexture.update(false);
  }

  async updateZoneColor(zone: string, color: string) {
    this.svgProcessor.updateSVGZone(zone, color);
    await this.updateTexture();
  }

  async updateTexture() {
    const texture = await this.svgProcessor.textureFromSVGData(this.scene);
    const oldTexture = this.objectMat.albedoTexture;
    this.objectMat.albedoTexture = texture;
    texture.vScale = -1; // Flip vertically
    oldTexture?.dispose();
  }
}

// -------------------------------------------------------------------
// The main Glove class (Corrected Version)
// -------------------------------------------------------------------
// IN: SceneBabylon.ts
// REPLACE THE ENTIRE GLOVE CLASS WITH THIS FINAL VERSION

export class Glove {
  id: string;
  glbFile: string;
  designFile: string;
  designFileWeb = 'webDesign.svg';
  textSelectorFont = 'bold 100px monospace';

  // Glove zones
  gloveZones: Zones;
  webZones: Zones = new Zones(ZONES_WEB);
  padHoodZones: Zones = new Zones(ZONES_PAD_HOOD);

  protected scene: Scene;
  protected engine: Engine;

  gloveObject: GloveObject;
  padHoodObjects: PadHood[];

  svgProcessor: SVGProcessor;
  objectMat: PBRMaterial;
  public isSvgLoaded = false;

  // Text data
  textTexture: DynamicTexture;
  protected arrMeshes: AbstractMesh[] = [];
  protected arrText: DynamicTexture[] = [];

  // Additional web references
  protected loader: AssetsLoader;
  protected websGlove: string[];
  protected textFont: string;
  protected textColor: string;
  protected text: string;

  public textZones: string[];
  public currentWeb: WebGlove;
  public glove: Mesh;

  // text settings
  protected planeWidth = 10;
  protected planeHeight = 3;
  protected DTWidth = 512;
  protected DTHeight = 256;
  protected size = 12;
  protected defSize = 90;

  protected webObjects: WebGlove[] = [];

  constructor(
    assetName: string,
    designName: string,
    scene: Scene,
    engine: Engine,
    callback: () => void
  ) {
    this.id = assetName;
    this.gloveZones = new Zones(ZONES_GLOVE[assetName]);
    this.websGlove = WEBS_GLOVE[assetName];
    this.textZones = ZONES_TEXT[assetName];

    this.loader = AssetsLoader.getInstance(scene);
    this.scene = scene;
    this.engine = engine;

    this.glbFile = `${assetName}.glb`;
    this.designFile = `${designName}.svg`;

    this.textFont = fonts[0];
    this.textColor = 'white';
    this.text = '';

    this.gloveObject = new GloveObject(scene, assetName, this.gloveZones);
    this.glove = this.gloveObject.model as Mesh;

    this.objectMat = this.getMaterial('glove');

    this.textZones.forEach((element) => {
      const arr = assetName.split('');
      arr[0] = arr[0].toUpperCase();
      const newName = arr.join('');
      const materialName = `${element}${newName}`;
      
      const textTexture = new DynamicTexture(element, { width: 512, height: 256 }, this.scene);
      textTexture.hasAlpha = true; // ADD THIS LINE
      const textMat = this.scene.getMaterialByName(materialName) as PBRMaterial;

      if (textMat) {
        // --- DEFINITIVE DECAL MATERIAL SETUP ---

        // 1. Tell the PBR material to use the alpha channel from our texture for transparency.
        //    This is a critical and necessary step.
        textMat.useAlphaFromAlbedoTexture = true;
        
        // 2. Set the texture that contains both color (albedo) and transparency (alpha).
        textMat.albedoTexture = textTexture;

        // 3. Set the material's transparency mode to allow blending.
        textMat.transparencyMode = Material.MATERIAL_ALPHABLEND;

        // 4. IMPORTANT: Do NOT set a separate albedoColor. The color information
        //    will come exclusively from what we draw on the texture. Removing this
        //    prevents the solid white rectangle from appearing.
        // textMat.albedoColor = Color3.White(); // THIS LINE IS REMOVED.

        this.arrText.push(textTexture);

        // Initially, clear the texture so it's fully transparent and invisible.
        const ctx = textTexture.getContext();
        ctx.clearRect(0, 0, 512, 256);
        textTexture.update(false);
      } else {
        console.warn(`Material with name "${materialName}" was not found in the 3D model's sub-materials.`);
      }
    });

    this.loadWebs(callback);
  }

  protected getMaterial(name: string): PBRMaterial {
    const multi = this.gloveObject.material as MultiMaterial;
    if (multi && multi.subMaterials) {
      const found = multi.subMaterials.find((m) => m.name === name);
      if (found) {
        return found as PBRMaterial;
      }
      return multi.subMaterials[0] as PBRMaterial;
    }
    return this.gloveObject.material as unknown as PBRMaterial;
  }

  protected async loadWebs(callback: () => void) {
    const arrPromise = this.websGlove.map(async (item) => {
      await this.loader.loadMesh('assets/', `${item}.glb`, item);
    });
    await Promise.all(arrPromise);

    this.websGlove.forEach((element) => {
      const web = new WebGlove(element, element, this.scene, this.engine, () => {});
      this.webObjects.push(web);
    });

    this.finishCreateGlove(callback);
  }

  protected finishCreateGlove(callback: () => void) {
    console.log('finish');
    this.svgProcessor = new SVGProcessor();
    this.svgProcessor.loadSVG(`assets/${this.designFile}`).then(() => {
      this.isSvgLoaded = true;
      callback();
      this.updateTexture();
    });

    // FIX: Removed redundant render loop.
  }

  public changeTextStyle(name: string, value: string) {
    switch (name) {
      case 'color': this.textColor = value; break;
      case 'font': this.textFont = value; break;
      case 'text': this.text = value; break;
      default: break;
    }
  }

  protected getFontSize(material: DynamicTexture): number {
    const ctx = material.getContext();
    // Add quotes around the font family for robustness
    ctx.font = `${this.size}px "${this.textFont}"`; 
    const textWidth = ctx.measureText(this.text).width;

    if (textWidth === 0) return this.defSize; // Prevent division by zero

    const ratio = textWidth / this.size;
    const calcSize = Math.floor(this.DTWidth / (ratio * 1));
    return calcSize > 310 ? 310 : calcSize;
  }

  public updateText(zone: string) {
    this.arrText.forEach((dynamicTexture) => {
        if (dynamicTexture.name === zone) {
            const fontSize = this.text ? this.getFontSize(dynamicTexture) : 90;
            const fontString = `${fontSize}px "${this.textFont}"`;

            const ctx = dynamicTexture.getContext();
            ctx.clearRect(0, 0, dynamicTexture.getSize().width, dynamicTexture.getSize().height);

            if (this.text) {
                dynamicTexture.drawText(
                    this.text, null, null, fontString,
                    this.textColor, 'transparent', false, false
                );
            }

            dynamicTexture.update(false);
        }
    });
  }

  protected resetStyleText() {
    this.textFont = fonts[0];
    this.textColor = 'white';
    this.text = '';
  }

  public async updateTexture() {
    const texture = await this.svgProcessor.textureFromSVGData(this.scene);
    const oldTexture = this.objectMat.albedoTexture;
    this.objectMat.albedoTexture = texture;
    texture.vScale = -1;
    oldTexture?.dispose();
  }

  public setActiveWeb(name: string) {
    this.webObjects.forEach((item) => {
      if (name === item.id) {
        item.webObject.model.setEnabled(true);
        this.currentWeb = item;
      } else {
        item.webObject.model.setEnabled(false);
      }
    });
  }
}

// -------------------------------------------------------------------
// The SceneBabylon class
// -------------------------------------------------------------------
export default class SceneBabylon {
  scene: Scene;
  engine: Engine;
  glove: Glove;
  gloveManager: GloveManager;
  public static engineAPI: EngineAPI;

  protected loader: AssetsLoader;
  protected arrGloves: Glove[] = [];
  protected arrWebs: WebGlove[] = [];

  protected static _instance: SceneBabylon;

  public websName: string[];
  public currentGlove: Glove;
  public currentWeb: WebGlove;
  public canvas: HTMLCanvasElement;
  public gloves: string[];
  public glovesDesign = ['openBack', 'firstBase', 'closeBack', 'catcher'];

  constructor(callback?) {
    this.websName = WEBS;

    this.createScene();
    this.createDebugTool();
    this.loader = AssetsLoader.getInstance(this.scene);

    this.gloveManager = new GloveManager(this.scene);
    SceneBabylon.engineAPI = new EngineAPI(this.gloveManager, this);

    this.gloves = ['openBack', 'firstBase', 'closeBack', 'catchers'];

    const defGloveId = 0;
    this.createGloves(this.gloves[defGloveId], defGloveId, callback);
  }

  protected async createGloves(name: string, id: number, callback?: () => void) {
    console.log('createGloves');

    // Load the GLB as an AssetsContainer if needed
    const assets = await this.loader.loadAssetsContainer('assets/', `${name}.glb`, this.scene);
    console.log('assets ::', assets);

    const glove = new Glove(
      name,
      this.glovesDesign[id],
      this.scene,
      this.engine,
      () => {
        console.log('glove ready', glove);
        glove.glove.setEnabled(true);
        this.currentGlove = glove;
        this.arrGloves[id] = glove;
        this.gloveManager.setActiveGlove(glove);
        if (callback) callback();
      }
    );
  }

  public static instance(callback?): SceneBabylon {
    if (!SceneBabylon._instance) {
      SceneBabylon._instance = new SceneBabylon(callback);
    }
    return SceneBabylon._instance;
  }

  protected setScene(): void {
    const main = document.getElementById('main');
    main?.append(this.canvas);
  }

  createScene(): void {
    const root = document.getElementById('root');
    this.canvas = document.createElement('canvas') as HTMLCanvasElement;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    root?.prepend(this.canvas);

    // Initialize babylon scene and engine
    const engine = new Engine(this.canvas, true);
    window.addEventListener('resize', () => {
      engine.resize();
    });

    const scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString('#161616');

    const hdrTexture = CubeTexture.CreateFromPrefilteredData('assets/environment.env', scene);
    scene.environmentTexture = hdrTexture;

      // CAMERA
    const camera = new ArcRotateCamera(
      'Camera',
      Math.PI / 2,
      Math.PI / 2,
      3,
      Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 1.5;
    camera.upperRadiusLimit = 4;
    camera.minZ = 0.1;
    camera.wheelPrecision = 150;
    camera.fov = 0.3;
    camera.attachControl(this.canvas, true);

    // This setting universally disables panning for mouse, touch, and pen.
    camera.panningSensibility = 0;

    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    this.engine = engine;
    this.scene = scene;

    // FIX: Start the one and only render loop for the scene.
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  public async setActiveGlove(index: number) {
    if (!this.arrGloves[index]) {
      await this.createNewGlove(index);
    }

    this.arrGloves.forEach((item, id) => {
      if (id === index) {
        this.arrGloves[id].glove.setEnabled(true);
        this.currentGlove = this.arrGloves[id];
        this.gloveManager.setActiveGlove(this.currentGlove);
      } else {
        this.arrGloves[id].glove.setEnabled(false);
        this.arrGloves[id].setActiveWeb(undefined);
      }
    });
    console.log('this.currentGlove', this.currentGlove);
  }

  public setActiveWeb(name: string) {
    this.currentGlove.setActiveWeb(name);
  }

  protected async createNewGlove(id: number) {
    const name = this.gloves[id];
    await new Promise<void>((resolve) => {
      this.createGloves(name, id, () => resolve());
    });
  }

  createDebugTool(): void {
    // DEBUGGING CONFIG
    if (process.env.NODE_ENV === 'development') {
      // hide/show the Inspector via Shift+Ctrl+Alt+I
      window.addEventListener('keydown', (ev) => {
        if (ev.shiftKey && ev.keyCode === 73) {
          if (this.scene.debugLayer.isVisible()) {
            this.scene.debugLayer.hide();
          } else {
            this.scene.debugLayer.show();
          }
        }
      });
    }
  }
}