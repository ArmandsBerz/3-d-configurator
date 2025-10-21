// Import the model URL
import modelUrl from './assets/cube.glb';
import detailUrl from './assets/details.png';

// Enable the GLTF loader
import "@babylonjs/loaders/glTF";

// Core BabylonJS imports
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Color4,
    SceneLoader,
    Color3,
    MaterialPluginBase,
    PBRBaseMaterial,
    AbstractMesh,
    MaterialDefines,
    SubMesh,
    UniformBuffer,
    Constants,
    Texture
} from '@babylonjs/core';

// Import GUI components
import { AdvancedDynamicTexture, Button, Control, StackPanel } from '@babylonjs/gui';

// Basic scene setup
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Browser-safe Color Swap Plugin (no UBO arrays; late-stage GLSL)
class GradientColorSwapPlugin extends MaterialPluginBase {
  // Configurable arrays
  replacements = [
    new Color3(1.0, 0.0, 1.0),
    new Color3(1.0, 1.0, 0.0),
    new Color3(0.0, 1.0, 1.0),
    new Color3(1.0, 0.5, 0.0),
    new Color3(0.5, 0.0, 1.0),
    new Color3(1.0, 1.0, 1.0)
  ];

  baseColors = [
    new Color3(1.0, 0.0, 0.0),
    new Color3(0.0, 1.0, 0.0),
    new Color3(0.0, 0.0, 1.0),
    new Color3(1.0, 1.0, 0.0),
    new Color3(0.0, 1.0, 1.0),
    new Color3(1.0, 0.0, 1.0)
  ];

  blendRadius = 0.3;
  blendStrength = 0.8;

  private _isEnabled = false;
  private _markAllDefinesAsDirty: () => void;
  private _varColorName: "finalColor" | "color";

  constructor(material: PBRBaseMaterial) {
    super(material, "ColorSwap", 200, { COLOR_SWAP: false });
    this._markAllDefinesAsDirty = material._dirtyCallbacks[Constants.MATERIAL_AllDirtyFlag];
    this._varColorName = material instanceof PBRBaseMaterial ? "finalColor" : "color";
    this.isEnabled = true;
  }

  get isEnabled() { return this._isEnabled; }
  set isEnabled(enabled: boolean) {
    if (this._isEnabled === enabled) return;
    this._isEnabled = enabled;
    this._markAllDefinesAsDirty();
    this._enable(this._isEnabled);
  }

  prepareDefines(defines: MaterialDefines) {
    defines["COLOR_SWAP"] = this._isEnabled;
  }

  // Declare classic uniforms; Babylon will place them in the UBO for us
  getUniforms() {
    return {
      ubo: [
        // six base + six replacement colors as separate vec3 uniforms
        { name: "base0", size: 3, type: "vec3" },
        { name: "base1", size: 3, type: "vec3" },
        { name: "base2", size: 3, type: "vec3" },
        { name: "base3", size: 3, type: "vec3" },
        { name: "base4", size: 3, type: "vec3" },
        { name: "base5", size: 3, type: "vec3" },
        { name: "repl0", size: 3, type: "vec3" },
        { name: "repl1", size: 3, type: "vec3" },
        { name: "repl2", size: 3, type: "vec3" },
        { name: "repl3", size: 3, type: "vec3" },
        { name: "repl4", size: 3, type: "vec3" },
        { name: "repl5", size: 3, type: "vec3" },
        { name: "blendRadius", size: 1, type: "float" },
        { name: "blendStrength", size: 1, type: "float" },
      ],
      fragment: `
        #ifdef COLOR_SWAP
          uniform vec3 base0; uniform vec3 base1; uniform vec3 base2;
          uniform vec3 base3; uniform vec3 base4; uniform vec3 base5;
          uniform vec3 repl0; uniform vec3 repl1; uniform vec3 repl2;
          uniform vec3 repl3; uniform vec3 repl4; uniform vec3 repl5;
          uniform float blendRadius;
          uniform float blendStrength;
        #endif
      `
    };
  }

  // Use Babylon helpers that are known to be ANGLE/Chrome-safe
  bindForSubMesh(ubo: UniformBuffer) {
    if (!this._isEnabled) return;

    ubo.updateColor3("base0", this.baseColors[0]);
    ubo.updateColor3("base1", this.baseColors[1]);
    ubo.updateColor3("base2", this.baseColors[2]);
    ubo.updateColor3("base3", this.baseColors[3]);
    ubo.updateColor3("base4", this.baseColors[4]);
    ubo.updateColor3("base5", this.baseColors[5]);

    ubo.updateColor3("repl0", this.replacements[0]);
    ubo.updateColor3("repl1", this.replacements[1]);
    ubo.updateColor3("repl2", this.replacements[2]);
    ubo.updateColor3("repl3", this.replacements[3]);
    ubo.updateColor3("repl4", this.replacements[4]);
    ubo.updateColor3("repl5", this.replacements[5]);

    ubo.updateFloat("blendRadius", this.blendRadius);
    ubo.updateFloat("blendStrength", this.blendStrength);
    // No need to call ubo.update() here; Babylon flushes when binding the UBO per draw
  }

  getCustomCode(shaderType: string) {
    if (shaderType !== "fragment") return null;

    // work at a late stage so PBR can’t overwrite it (Chrome/ANGLE safe)
    const varName = this._varColorName; // "finalColor" for PBR, "color" for Standard

    return {
      "CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR": `
        #ifdef COLOR_SWAP
          vec3 original = ${varName}.rgb;
          vec3 accumulatedColor = vec3(0.0);
          float totalInfluence = 0.0;

          float safeRadius = max(blendRadius, 0.0001);
          float radiusSq = 2.0 * safeRadius * safeRadius;

          vec3 bases[6];
          vec3 repls[6];
          bases[0]=base0; bases[1]=base1; bases[2]=base2; bases[3]=base3; bases[4]=base4; bases[5]=base5;
          repls[0]=repl0; repls[1]=repl1; repls[2]=repl2; repls[3]=repl3; repls[4]=repl4; repls[5]=repl5;

          for (int i = 0; i < 6; i++) {
            float d = distance(original, bases[i]);
            float inf = exp(-(d*d) / radiusSq);
            accumulatedColor += repls[i] * inf;
            totalInfluence += inf;
          }

          if (totalInfluence > 0.001) {
            vec3 finalSwap = accumulatedColor / totalInfluence;
            ${varName}.rgb = mix(original, finalSwap, min(totalInfluence * blendStrength, 1.0));
          }
        #endif
      `
    };
  }
}

const createScene = async () => {
  scene.clearColor = Color4.FromHexString('#161616');
  new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
  const yourCube = result.meshes[1];

  if (yourCube && yourCube.material) {
    const material: any = yourCube.material;
    if (material.albedoTexture) {
      material.albedoTexture.updateSamplingMode(Constants.TEXTURE_NEAREST_SAMPLINGMODE);
    }

    const detailTexture = new Texture(detailUrl, scene);
    detailTexture.coordinatesIndex = 1;
    detailTexture.uScale = 1.5;
    detailTexture.vScale = 1.5;

    material.detailMap.isEnabled = true;
    material.detailMap.useNormalMap = true;
    material.detailMap.normalBlendMethod = 1;
    material.detailMap.texture = detailTexture;

    const plugin = new GradientColorSwapPlugin(yourCube.material as PBRBaseMaterial);
    plugin.isEnabled = true; // trigger defines + compile

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const panel = new StackPanel();
    panel.isVertical = true; 
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.width = "200px";
    panel.paddingRight = "20px";
    advancedTexture.addControl(panel);

    const createButton = (text: string, color: string, onClick: () => void) => {
      const button = Button.CreateSimpleButton(text, text);
      button.width = "180px";
      button.height = "40px";
      button.color = "white";
      button.background = color;
      button.paddingTop = "10px";
      button.onPointerUpObservable.add(onClick);
      panel.addControl(button);
    };

    // These randomize the replacement colors; baseColors stay fixed
    createButton("Randomize Red", "red", () => {
      plugin.replacements[0] = new Color3(Math.random(), Math.random(), Math.random());
    });
    createButton("Randomize Green", "green", () => {
      plugin.replacements[1] = new Color3(Math.random(), Math.random(), Math.random());
    });
    createButton("Randomize Blue", "blue", () => {
      plugin.replacements[2] = new Color3(Math.random(), Math.random(), Math.random());
    });
    createButton("Randomize Yellow", "yellow", () => {
      plugin.replacements[3] = new Color3(Math.random(), Math.random(), Math.random());
    });
    createButton("Randomize Cyan", "cyan", () => {
      plugin.replacements[4] = new Color3(Math.random(), Math.random(), Math.random());
    });
    createButton("Randomize Magenta", "magenta", () => {
      plugin.replacements[5] = new Color3(Math.random(), Math.random(), Math.random());
    });
  }
};

createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});
