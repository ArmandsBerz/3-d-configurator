declare module '*.glb' {
  const value: string;
  export default value;
}

// Add this declaration for PNG files
declare module '*.png' {
  const value: string;
  export default value;
}