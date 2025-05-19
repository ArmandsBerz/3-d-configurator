import React from 'react';

const UI = () => {
  return (
    // Main container for the mobile view, full height, dark theme
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">

      {/* 1. Header Area */}
      <header className="p-4 bg-gray-800 shadow-md">
        <p>LOGO</p>
      </header>

        {/* 2. Visualization Area (Flex-grow to take available space) */}
      <main className="flex-grow p-4 flex flex-col items-center justify-center relative bg-black">
        
        {/* Placeholder for the actual visualization content */}
        <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-700">
          <p className="text-gray-500">Actual Visualization Would Be Here</p>
        </div>

        {/* Interaction Hints & Expand Icon - Positioned at the bottom center (or bottom-left) of the main area */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-4 p-2 bg-gray-700 bg-opacity-50 rounded text-xs">
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
      <section className="p-4 bg-gray-800">
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
      <footer className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center"> {/* Removed shadow-up-md, added border-t */}

        {/* Accordion Toggle Button - Styled as a less prominent button */}
        <button type="button" className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-sm">
          Accordion Toggle
        </button>

        {/* Call To Action Button - Styled as a prominent button */}
        <button type="button" className="py-2 px-6 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold flex items-center">
          Call To Action
          <span className="ml-2">---&gt;</span> {/* Simple arrow, can be replaced with an icon later */}
        </button>

      </footer>

    </div>
  );
};

export default UI;