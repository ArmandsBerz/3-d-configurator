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
      <main className="flex-grow p-4 flex items-center justify-center">
        <p>Visualization Area (Drag to Rotate, Pinch to Zoom)</p>
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
      <footer className="p-4 bg-gray-800 shadow-up-md flex justify-between items-center">
        <p>Accordion Toggle</p>
        <p>Call To Action ---&gt;</p>
      </footer>

    </div>
  );
};

export default UI;