// src/logic.ts

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
// Import the command function from your actual viewer file
import { updateBoxColor } from './viewer';

// --- Redux Slice ---
interface ConfigState {
  color: string;
}
const initialState: ConfigState = {
  color: '#FF0000',
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setColor: (state, action: PayloadAction<string>) => {
      state.color = action.payload;
    },
  },
});

export const { setColor } = configSlice.actions;

// --- Redux Store ---
export const store = configureStore({
  reducer: {
    config: configSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;

// --- The Bridge to Babylon.js ---
// This subscribes to the store and calls the command in your viewer
let lastKnownColor = store.getState().config.color;
store.subscribe(() => {
  const currentColor = store.getState().config.color;
  if (lastKnownColor !== currentColor) {
    updateBoxColor(currentColor); // Call the correct function
    lastKnownColor = currentColor;
  }
});

// --- The React UI Component ---
export const UIControl = () => {
  const dispatch = useDispatch();
  const currentColor = useSelector((state: RootState) => state.config.color);

  return (
    <div className="ui-container">
      <h2>Controls</h2>
      <p>Current Color: <b style={{ color: currentColor }}>{currentColor}</b></p>
      <div className="button-group">
        <button onClick={() => dispatch(setColor('#FF0000'))}>Red</button>
        <button onClick={() => dispatch(setColor('#00FF00'))}>Green</button>
        <button onClick={() => dispatch(setColor('#0000FF'))}>Blue</button>
      </div>
    </div>
  );
};