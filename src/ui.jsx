import React from 'react';

const UI = () => {
  return (
    // Main container for the mobile view, full height, dark theme
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">

      {/* 1. Header Area - This <header> element will be removed as LOGO moves into <main> */}
      {/*
      <header className="p-4 bg-gray-800 shadow-md">
        <p>LOGO</p>
      </header>
      */}

        {/* 2. Visualization Area (Flex-grow to take available space) */}
      <main className="flex-grow p-4 flex flex-col items-center justify-center relative bg-neutral-900"> {/* Updated background */}
        
        {/* LOGO - Updated for size and background/text color */}
        <div className="absolute top-4 left-4 p-4 bg-gray-300 bg-opacity-75 rounded z-10"> {/* Increased padding, lighter bg */}
          <p className="font-bold text-xl text-gray-900">LOGO</p> {/* Larger text, dark text color */}
        </div>
        
        {/* Placeholder for the actual visualization content */}
        <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-700">
          <p className="text-gray-500">Actual Visualization Would Be Here</p>
        </div>

        {/* Interaction Hints & Expand Icon - Positioned at the bottom center (or bottom-left) of the main area */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-4 p-2 bg-gray-700 bg-opacity-50 rounded text-xs z-10"> {/* Added z-10 just in case */}
          {/* Expand Icon Placeholder - Now at the start of this group */}
          <div className="p-1 hover:bg-gray-600 rounded cursor-pointer"> {/* Wrapper for icon if it needs its own hover/padding */}
            <span className="text-lg leading-none">⛶</span> {/* Unicode for square with four corners / "fullscreen" symbol */}
          </div>
          
          <div className="flex items-center space-x-1">
            <span>⟳</span> {/* Unicode for circular arrow / "rotate" symbol */}
            <span>Drag to Rotate</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🤏</span> {/* Pinch emoji / "zoom" symbol */}
            <span>Pinch to Zoom</span>
          </div>
        </div>
      </main>

      {/* 3. Options/Controls Area */}
      <section className="p-4 bg-neutral-800"> {/* Updated background */}
        {/* Static option rows based on the mockup image_e59280.jpg (leftmost panel) */}

        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <span className="text-lg">&gt; Build</span>
          {/* No explicit value shown on the right in the mockup for "Build" */}
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <span className="text-lg">&gt; Select Option</span>
          <span className="text-gray-400">Option</span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <span className="text-lg">&gt; Color Option</span>
          <span className="w-4 h-4 bg-yellow-400 rounded-full"></span> {/* Single color dot */}
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <span className="text-lg">&gt; Input Option</span>
          <span className="text-gray-400">Text</span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <span className="text-lg">&gt; Select & Color Option</span>
          <div className="flex items-center space-x-2"> {/* Wrapper for multiple items on the right */}
            <span className="text-gray-400">Option</span>
            <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
          </div>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <span className="text-lg">&gt; Input & Color Option</span>
          <div className="flex items-center space-x-2"> {/* Wrapper for multiple items on the right */}
            <span className="text-gray-400">Text</span>
            <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
          </div>
        </div>

        <div className="flex justify-between items-center py-3"> {/* No bottom border for the last item */}
          <span className="text-lg">&gt; Dual Color Option</span>
          <div className="flex items-center space-x-1"> {/* Wrapper for multiple items on the right, tighter spacing for two dots */}
            <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
            <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
          </div>
        </div>

      </section>

      {/* 4. Bottom Bar/Footer Area */}
      <footer className="p-4 bg-neutral-800 border-t border-gray-700 flex justify-between items-center space-x-4"> {/* Updated background */}

        {/* Accordion Toggle Button - Updated to include icon and "Accordion" text, with styling to match Figma */}
        <button
          type="button"
          className="flex items-center space-x-2 flex-shrink-0 py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded text-base font-semibold text-white"
          aria-label="Toggle accordion panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"> {/* Icon size updated to w-6 h-6 */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <span>Accordion</span>
        </button>

        {/* Call To Action Button - Styled to be more prominent and take available space */}
        <button
          type="button"
          className="flex-grow py-3 px-4 sm:px-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded text-base font-semibold flex items-center justify-center" // Added flex-grow, justify-center, adjusted padding, hover/active/focus states
        >
          Call To Action
          <span className="ml-2 text-lg">→</span> {/* Unicode right arrow, slightly larger */}
        </button>

      </footer>

    </div>
  );
};

export default UI;