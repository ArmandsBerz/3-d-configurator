/* eslint-disable import/prefer-default-export */
import { configureStore, combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Slice definition
const initialState = {
    pallette: 0,
    position: 0,
    size: 0,
    handSize: 0,
    stiffness: 0,
    hand: 0,
    isEngineReady: false,
};

// --- FIX STARTS HERE ---

// 1. Create a specific type for ONLY the keys that have number values.
type BuildStateNumberKey = Exclude<keyof typeof initialState, 'isEngineReady'>;

// --- FIX ENDS HERE ---


export const buildSlice = createSlice({
    name: 'build',
    initialState,
    reducers: {
        /**
         * A robust reducer to set any NUMERIC property in the build state.
         * Usage: dispatch(setBuildProperty({ key: 'pallette', value: 1 }))
         */
        setBuildProperty(
            state,
            // 2. Update the action to use the specific key type and only accept a 'number' value.
            action: PayloadAction<{ key: BuildStateNumberKey; value: number }>
        ) {
            const { key, value } = action.payload;
            // The check 'key in state' is still good practice.
            if (key in state) {
                // This assignment is now guaranteed to be type-safe.
                state[key] = value;
            }
        },

        /**
         * Sets the engine state to ready. This reducer specifically handles the boolean property.
         */
        engineReady(state) {
            state.isEngineReady = true;
        },
    },
});

// Store setup
const rootReducer = combineReducers({
    buildReducer: buildSlice.reducer,
});

export const setupStore = () =>
    configureStore({
        reducer: rootReducer,
    });

// Type definitions
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

// Custom hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export actions for easy use in components
export const { setBuildProperty, engineReady } = buildSlice.actions;

// Export the reducer as default if needed
export default buildSlice.reducer;