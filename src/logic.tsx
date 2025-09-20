// src/logic.tsx
import { useEffect, createContext, useContext } from 'react';
import { Color3 } from '@babylonjs/core';
import { useGloveConfigurator, GloveConfiguration } from './ui';
import { SceneManager } from './viewer';

// Step 1: Create a Context for the 3D Scene
export const SceneContext = createContext<SceneManager | null>(null);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) {
        throw new Error('useScene must be used within a SceneProvider');
    }
    return context;
};

// Step 2: Create the UI-to-Shader Map
const PART_TO_SHADER_INDEX_MAP = {
    thumb_inner: 0,
    thumb_outer: 1,
    index: 2,
    middle_inner: 3,
    middle_outer: 4,
    ring_inner: 5,
    ring_outer: 6,
    pinky_inner: 7,
    pinky_outer: 8,
    web: 9,
};

// Step 3: Create the Logic Controller Component
export const GloveLogicController = () => {
    const { state } = useGloveConfigurator();
    const sceneManager = useContext(SceneContext);

    useEffect(() => {
        if (!sceneManager || !sceneManager.isReady()) {
            return;
        }

        const { configuration } = state;

        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.thumb_inner, Color3.FromHexString(configuration.thumb.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.thumb_outer, Color3.FromHexString(configuration.thumb.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.index, Color3.FromHexString(configuration.index.color));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.middle_inner, Color3.FromHexString(configuration.middle.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.middle_outer, Color3.FromHexString(configuration.middle.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.ring_inner, Color3.FromHexString(configuration.ring.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.ring_outer, Color3.FromHexString(configuration.ring.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.pinky_inner, Color3.FromHexString(configuration.pinky.inner));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.pinky_outer, Color3.FromHexString(configuration.pinky.outer));
        sceneManager.updateColor(PART_TO_SHADER_INDEX_MAP.web, Color3.FromHexString(configuration.web.color));

        sceneManager.updateBuild(configuration.build);

    }, [state.configuration, sceneManager]);

    return null;
};