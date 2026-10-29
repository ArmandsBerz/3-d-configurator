# 3D WebGL Product Configurator Engine

A production-grade, interactive 3D product configurator engine built from the ground up using React and Babylon.js. 

## Technical Architecture
* **Rendering Engine:** Babylon.js with custom GLSL shaders for SDF-based anti-aliasing and seamless edge blending.
* **Performance Optimization:** Custom material plugins utilizing 1D Look-Up Tables (LUTs) for instantaneous, 60-FPS color swapping across 30+ zones without mesh reloading.
* **Headless Export:** Direct 300-DPI vector PDF compilation using `opentype.js` and programmatic Canvas 2D text rendering.
* **State Management:** Decoupled React UI state and 3D scene manager via a robust initialization token system to prevent async race conditions during heavy `.glb` loading.

## Note on Project Data & Mock Assets
*Code names used in historical feature branches (e.g., 'LV', 'Meadows', 'Auburn') and any associated demo assets represent fictional mock profiles. They were used exclusively as dummy data to stress-test multi-material shader zones, dynamic text rendering, and PDF vector generation locally. This is a 100% personally owned, independent engineering project, not client or employer work.*