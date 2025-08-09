import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateSphereColor } from './BabylonCanvas'; // Assuming the command function is in this file

// ----------------------------------------------------------------
// ## 1. The Slice: Defines the shape and reducers for a piece of state
// ----------------------------------------------------------------

interface ConfigState {
  color: string;
}

const initialState: ConfigState = {
  color: '#FF0000', // Start with red
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    // This reducer handles the action of setting a new color
    setColor: (state, action: PayloadAction<string>) => {
      state.color = action.payload;
    },
  },
});

// Export the action so UI components can dispatch it
export const { setColor } = configSlice.actions;

// ----------------------------------------------------------------
// ## 2. The Store: The single source of truth for the entire app
// ----------------------------------------------------------------

export const store = configureStore({
  reducer: {
    config: configSlice.reducer,
  },
});

// ----------------------------------------------------------------
// ## 3. The Bridge: Connects the State to the Rendering layer
// ----------------------------------------------------------------

// Variable to hold the last known color to prevent unnecessary updates
let lastKnownColor = store.getState().config.color;

// The bridge subscribes to every state change
store.subscribe(() => {
  const currentColor = store.getState().config.color;

  // Only send a command if the color has actually changed
  if (lastKnownColor !== currentColor) {
    console.log(`[Bridge] State change detected. Sending command to renderer: ${currentColor}`);
    updateSphereColor(currentColor); // Send the command to Babylon.js
    lastKnownColor = currentColor; // Update the last known color
  }
});