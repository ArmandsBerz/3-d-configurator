// Import the model and texture URLs
import modelUrl from './assets/cube.glb';
import colorIdUrl from './assets/colorID.png';

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
  Texture,
  ShaderMaterial,
  Color3
} from '@babylonjs/core';

// Import GUI elements
import {
  AdvancedDynamicTexture,
  Button,
  Control
} from '@babylonjs/gui';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Vertex shader code
const vertexShaderCode = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 worldViewProjection;
  varying vec2 vUV;
  void main(void) {
    gl_Position = worldViewProjection * vec4(position, 1.0);
    vUV = uv;
  }
`;

// Fragment shader code
const fragmentShaderCode = `
  precision highp float;
  varying vec2 vUV;
  uniform sampler2D textureSampler;
  uniform vec3 colorForRed;
  uniform vec3 colorForGreen;
  uniform vec3 colorForBlue;
  const vec3 defaultColor = vec3(0.1, 0.1, 0.1);

  void main(void) {
    // Sample the texture. With BILINEAR filtering, this color will be smoothly interpolated.
    vec4 idColor = texture2D(textureSampler, vUV);

    // Use the R, G, and B channels from the texture as weights to blend your target colors.
    // This mathematical approach naturally handles gradients.
    vec3 blendedColor = idColor.r * colorForRed +
                        idColor.g * colorForGreen +
                        idColor.b * colorForBlue;

    // Calculate the total influence of the mask.
    float totalMask = clamp(idColor.r + idColor.g + idColor.b, 0.0, 1.0);

    // Linearly interpolate between the default dark color and your new blended color
    // based on the mask's total intensity.
    vec3 outputColor = mix(defaultColor, blendedColor, totalMask);

    gl_FragColor = vec4(outputColor, 1.0);
  }
`;

const createScene = async () => {
  scene.clearColor = Color4.FromHexString('#161616');
  new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

  const shaderMaterial = new ShaderMaterial(
    "colorMaskShader",
    scene,
    {
      vertexSource: vertexShaderCode,
      fragmentSource: fragmentShaderCode,
    },
    {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection", "textureSampler", "colorForRed", "colorForGreen", "colorForBlue"],
    }
  );

  // This line remains exactly as you provided it.
  const idTexture = new Texture(
    colorIdUrl,
    scene,
    true, // noMipmap
    false, // invertY
    // --- FIX: Use BILINEAR filtering for smooth gradients ---
    Texture.BILINEAR_SAMPLINGMODE // samplingMode
  );
  
  
  shaderMaterial.setTexture("textureSampler", idTexture);

  shaderMaterial.setColor3("colorForRed", new Color3(1.0, 0.84, 0.0));
  shaderMaterial.setColor3("colorForGreen", new Color3(0.75, 0.75, 0.75));
  shaderMaterial.setColor3("colorForBlue", new Color3(0.6, 0.3, 0.1));

  const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
  const yourCube = result.meshes[1];
  if (yourCube) {
    yourCube.material = shaderMaterial;
  }

  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
  const button = Button.CreateSimpleButton("colorButton", "Randomize Colors");
  button.width = "200px";
  button.height = "40px";
  button.color = "white";
  button.background = "green";
  button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  button.paddingBottom = "20px";
  advancedTexture.addControl(button);

  button.onPointerUpObservable.add(() => {
    shaderMaterial.setColor3("colorForRed", Color3.Random());
    shaderMaterial.setColor3("colorForGreen", Color3.Random());
    shaderMaterial.setColor3("colorForBlue", Color3.Random());
  });
};

createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});