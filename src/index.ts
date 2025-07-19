// Import the model and texture URLs
import modelUrl from './assets/cube.glb';
import colorIdUrl from './assets/colorID.png'; // Needed for the Node Material

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
    NodeMaterial, // Use NodeMaterial
    Texture,      // To load the texture for the material
    Color3,
    InputBlock,   // Import InputBlock for casting
    TextureBlock  // Import TextureBlock for casting
} from '@babylonjs/core';

// Import GUI elements
import {
    AdvancedDynamicTexture,
    Button,
    Control
} from '@babylonjs/gui';

// --- Node Material JSON Data ---
const nodeMaterialJson = {
  "tags": null,
  "ignoreAlpha": false,
  "maxSimultaneousLights": 4,
  "mode": 0,
  "forceAlphaBlending": false,
  "id": "node",
  "name": "node",
  "checkReadyOnEveryCall": false,
  "checkReadyOnlyOnce": false,
  "state": "",
  "alpha": 1,
  "backFaceCulling": true,
  "cullBackFaces": true,
  "_needDepthPrePass": false,
  "disableDepthWrite": false,
  "disableColorWrite": false,
  "forceDepthWrite": false,
  "depthFunction": 0,
  "separateCullingPass": false,
  "fogEnabled": true,
  "pointSize": 1,
  "zOffset": 0,
  "zOffsetUnits": 0,
  "pointsCloud": false,
  "fillMode": 0,
  "editorData": {
    "locations": [
      {"blockId": 8249, "x": 1720, "y": 500, "isCollapsed": false},
      {"blockId": 8250, "x": 840, "y": 40, "isCollapsed": false},
      {"blockId": 8251, "x": 440, "y": 80, "isCollapsed": false},
      {"blockId": 8252, "x": 0, "y": 160, "isCollapsed": false},
      {"blockId": 8253, "x": 0, "y": 40, "isCollapsed": false},
      {"blockId": 8254, "x": 240, "y": 880, "isCollapsed": false},
      {"blockId": 8255, "x": 2500, "y": 1560, "isCollapsed": false},
      {"blockId": 8256, "x": 1600, "y": 1440, "isCollapsed": false},
      {"blockId": 8257, "x": 800, "y": 940, "isCollapsed": false},
      {"blockId": 8258, "x": 320, "y": 1020, "isCollapsed": false},
      {"blockId": 8259, "x": 920, "y": 1740, "isCollapsed": false},
      {"blockId": 8260, "x": 920, "y": 1820, "isCollapsed": false},
      {"blockId": 8261, "x": 780, "y": 1540, "isCollapsed": false},
      {"blockId": 8264, "x": -120, "y": 1560, "isCollapsed": false},
      {"blockId": 8265, "x": 400, "y": 1560, "isCollapsed": false},
      {"blockId": 8266, "x": 420, "y": 1720, "isCollapsed": false},
      {"blockId": 8268, "x": 920, "y": 2000, "isCollapsed": false},
      {"blockId": 8269, "x": 920, "y": 2080, "isCollapsed": false},
      {"blockId": 8370, "x": 420, "y": 1440, "isCollapsed": false}
    ]
  },
  "customType": "BABYLON.NodeMaterial",
  "outputNodes": [8249, 8255],
  "blocks": [
    {"customType": "BABYLON.VertexOutputBlock", "id": 8249, "name": "VertexOutput", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [{"name": "vector", "inputName": "vector", "targetBlockId": 8250, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}], "outputs": []},
    {"customType": "BABYLON.TransformBlock", "id": 8250, "name": "WorldPos * ViewProjectionTransform", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [{"name": "vector", "inputName": "vector", "targetBlockId": 8251, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "transform", "inputName": "transform", "targetBlockId": 8254, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}], "outputs": [{"name": "output"}, {"name": "xyz"}], "complementZ": 0, "complementW": 1},
    {"customType": "BABYLON.TransformBlock", "id": 8251, "name": "WorldPos", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [{"name": "vector", "inputName": "vector", "targetBlockId": 8252, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "transform", "inputName": "transform", "targetBlockId": 8253, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}], "outputs": [{"name": "output"}, {"name": "xyz"}], "complementZ": 0, "complementW": 1},
    {"customType": "BABYLON.InputBlock", "id": 8252, "name": "position", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 8, "mode": 1, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false},
    {"customType": "BABYLON.InputBlock", "id": 8253, "name": "World", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 128, "mode": 0, "systemValue": 1, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false},
    {"customType": "BABYLON.InputBlock", "id": 8254, "name": "ViewProjection", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 128, "mode": 0, "systemValue": 4, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false},
    {"customType": "BABYLON.FragmentOutputBlock", "id": 8255, "name": "FragmentOutput", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 2, "inputs": [{"name": "rgba"}, {"name": "rgb", "inputName": "rgb", "targetBlockId": 8256, "targetConnectionName": "lighting", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "a"}, {"name": "glow"}], "outputs": [], "convertToGammaSpace": false, "convertToLinearSpace": false, "useLogarithmicDepth": false},
    {"customType": "BABYLON.PBRMetallicRoughnessBlock", "id": 8256, "name": "PBRMetallicRoughness", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 3, "inputs": [{"name": "worldPosition", "inputName": "worldPosition", "targetBlockId": 8251, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "worldNormal", "inputName": "worldNormal", "targetBlockId": 8257, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "view", "inputName": "view", "targetBlockId": 8259, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "cameraPosition", "inputName": "cameraPosition", "targetBlockId": 8260, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "perturbedNormal"}, {"name": "baseColor", "inputName": "baseColor", "targetBlockId": 8261, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "metallic", "inputName": "metallic", "targetBlockId": 8268, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "roughness", "inputName": "roughness", "targetBlockId": 8269, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "ambientOcc"}, {"name": "opacity"}, {"name": "indexOfRefraction"}, {"name": "ambientColor"}, {"name": "reflection"}, {"name": "clearcoat"}, {"name": "sheen"}, {"name": "subsurface"}, {"name": "anisotropy"}, {"name": "iridescence"}], "outputs": [{"name": "ambientClr"}, {"name": "diffuseDir"}, {"name": "specularDir"}, {"name": "clearcoatDir"}, {"name": "sheenDir"}, {"name": "diffuseInd"}, {"name": "specularInd"}, {"name": "clearcoatInd"}, {"name": "sheenInd"}, {"name": "refraction"}, {"name": "lighting"}, {"name": "shadow"}, {"name": "alpha"}], "lightFalloff": 0, "useAlphaTest": false, "alphaTestCutoff": 0.5, "useAlphaBlending": false, "useRadianceOverAlpha": true, "useSpecularOverAlpha": true, "enableSpecularAntiAliasing": false, "realTimeFiltering": false, "realTimeFilteringQuality": 8, "useEnergyConservation": true, "useRadianceOcclusion": true, "useHorizonOcclusion": true, "unlit": false, "forceNormalForward": false, "debugMode": 0, "debugLimit": 0, "debugFactor": 1, "generateOnlyFragmentCode": false},
    {"customType": "BABYLON.TransformBlock", "id": 8257, "name": "World normal", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [{"name": "vector", "inputName": "vector", "targetBlockId": 8258, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "transform", "inputName": "transform", "targetBlockId": 8253, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}], "outputs": [{"name": "output"}, {"name": "xyz"}], "complementZ": 0, "complementW": 0},
    {"customType": "BABYLON.InputBlock", "id": 8258, "name": "normal", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 8, "mode": 1, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false},
    {"customType": "BABYLON.InputBlock", "id": 8259, "name": "view", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 128, "mode": 0, "systemValue": 2, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false},
    {"customType": "BABYLON.InputBlock", "id": 8260, "name": "cameraPosition", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 8, "mode": 0, "systemValue": 7, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false},
    {"customType": "BABYLON.LerpBlock", "id": 8261, "name": "Lerp", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 4, "inputs": [{"name": "left", "inputName": "left", "targetBlockId": 8370, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "right", "inputName": "right", "targetBlockId": 8265, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "gradient", "inputName": "gradient", "targetBlockId": 8266, "targetConnectionName": "rgb", "isExposedOnFrame": true, "exposedPortPosition": -1}], "outputs": [{"name": "output"}]},
    {"customType": "BABYLON.InputBlock", "id": 8370, "name": "ColorA", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 32, "mode": 0, "systemValue": null, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false, "valueType": "BABYLON.Color3", "value": [1, 0.00784313725490196, 0.00784313725490196]},
    {"customType": "BABYLON.InputBlock", "id": 8265, "name": "ColorB", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 32, "mode": 0, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false, "valueType": "BABYLON.Color3", "value": [0.5019607843137255, 1, 0]},
    {"customType": "BABYLON.TextureBlock", "id": 8266, "name": "Texture", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 3, "inputs": [{"name": "uv", "inputName": "uv", "targetBlockId": 8264, "targetConnectionName": "output", "isExposedOnFrame": true, "exposedPortPosition": -1}, {"name": "source"}, {"name": "layer"}, {"name": "lod"}], "outputs": [{"name": "rgba"}, {"name": "rgb"}, {"name": "r"}, {"name": "g"}, {"name": "b"}, {"name": "a"}, {"name": "level"}], "convertToGammaSpace": false, "convertToLinearSpace": false, "fragmentOnly": false, "disableLevelMultiplication": false},
    {"customType": "BABYLON.InputBlock", "id": 8264, "name": "uv", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 4, "mode": 1, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false},
    {"customType": "BABYLON.InputBlock", "id": 8268, "name": "Metallic", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 1, "mode": 0, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false, "valueType": "number", "value": 0.5},
    {"customType": "BABYLON.InputBlock", "id": 8269, "name": "Roughness", "comments": "", "visibleInInspector": false, "visibleOnFrame": false, "target": 1, "inputs": [], "outputs": [{"name": "output"}], "type": 1, "mode": 0, "animationType": 0, "min": 0, "max": 0, "isBoolean": false, "matrixMode": 0, "isConstant": false, "groupInInspector": "", "convertToGammaSpace": false, "convertToLinearSpace": false, "valueType": "number", "value": 0.1}
  ],
  "uniqueId": 5
};


const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
const camera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2.5, 3, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

const createScene = async () => {
    scene.clearColor = Color4.FromHexString('#161616');
    new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

    // --- Create Node Material from Local JSON ---
    const nodeMaterial = NodeMaterial.Parse(nodeMaterialJson, scene);
    nodeMaterial.build(false); // Compile the material

    // --- FIX: Use getBlockByName and cast to the correct type ---
    const textureBlock = nodeMaterial.getBlockByName("Texture") as TextureBlock;
    const colorAInput = nodeMaterial.getBlockByName("ColorA") as InputBlock;
    const colorBInput = nodeMaterial.getBlockByName("ColorB") as InputBlock;

    // Assign the actual texture to the texture block
    if (textureBlock) {
        textureBlock.texture = new Texture(colorIdUrl, scene, false, false);
    }

    const result = await SceneLoader.ImportMeshAsync(null, "", modelUrl, scene);
    const yourCube = result.meshes[1];
    if (yourCube) {
        // Apply the Node Material to the cube
        yourCube.material = nodeMaterial;
    }

    // --- Create UI ---
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const button = Button.CreateSimpleButton("colorButton", "Randomize Colors");
    button.width = "200px";
    button.height = "40px";
    button.color = "white";
    button.background = "green";
    button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    button.paddingBottom = "20px";
    advancedTexture.addControl(button);

    // On button click, change the node material's color input values randomly
    button.onPointerUpObservable.add(() => {
        if (colorAInput && colorBInput) {
            colorAInput.value = Color3.Random();
            colorBInput.value = Color3.Random();
        }
    });
};

createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});