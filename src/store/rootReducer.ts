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
};

export const buildSlice = createSlice({
    name: 'build',
    initialState,
    reducers: {
        setPallette(state, action: PayloadAction<any>) {
            let newKey;
            Object.entries(state).forEach(([key, value], index) => {
                if (index === action.payload.key) newKey = key;
            });
            state[newKey] = action.payload.val;
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

// Export the reducer as default if needed
export default buildSlice.reducer;