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
{/* LOGO - Updated for exact size and positioning */}
<div className="absolute top-[20px] left-[20px] w-[70px] h-[49px] bg-gray-300 bg-opacity-75 rounded z-10 flex items-center justify-center">
<p className="font-bold text-xl text-gray-900">LOGO</p>
</div>
{/* Placeholder for the actual visualization content */}
<div className="w-full h-full flex items-center justify-center border border-dashed border-gray-700">
<p className="text-gray-500">Actual Visualization Would Be Here</p>
</div>

{/* Interaction Hints & Expand Icon - Updated Styling and Layout */}
<div className="absolute bottom-4 inset-x-0 flex items-center justify-between text-xs z-10"> {/* Updated bottom, removed px-6 */}
{/* Expand Icon (Left) */}
<div className="p-1 hover:bg-gray-800 hover:bg-opacity-50 rounded-md cursor-pointer ml-[14px]"> {/* Added ml-[14px] */}
<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
<path d="M28 1.24271C28 0.556382 27.4436 0 26.7572 0H21.1692C20.8195 0 20.4843 0.138953 20.2371 0.386114C19.9899 0.633274 19.851 0.968417 19.851 1.31792C19.851 1.66763 19.9899 2.0028 20.2371 2.24994C20.4843 2.4971 20.8195 2.63605 21.1692 2.63605H23.4991L16.8345 9.30049C16.5891 9.54805 16.4518 9.88279 16.4524 10.2313C16.4532 10.58 16.592 10.914 16.8385 11.1605C17.0851 11.4068 17.4191 11.5456 17.7678 11.5464C18.1163 11.5472 18.4509 11.4099 18.6985 11.1645L25.3636 4.49957V6.83184C25.3636 7.18135 25.5024 7.51672 25.7498 7.76386C25.9969 8.01102 26.3321 8.14997 26.6819 8.14997C27.0314 8.14997 27.3666 8.01102 27.6138 7.76386C27.861 7.5167 27.9999 7.18135 27.9999 6.83184L28 1.24271Z" fill="white"/>
<path d="M11.1656 16.8327C10.9184 16.5856 10.5831 16.4468 10.2335 16.4468C9.88397 16.4468 9.54857 16.5856 9.30141 16.8327L2.63631 23.4992V21.167C2.63631 20.8175 2.49735 20.4821 2.25016 20.235C2.00298 19.9878 1.6678 19.8488 1.31805 19.8488C0.968513 19.8488 0.633316 19.9878 0.386152 20.235C0.138967 20.4821 0 20.8175 0 21.167V26.7565C0 27.4428 0.556426 27.9992 1.24281 27.9992H6.82977C7.17931 27.9992 7.51471 27.8602 7.76187 27.6133C8.00906 27.3661 8.14803 27.0307 8.14803 26.6812C8.14803 26.3315 8.00906 25.9964 7.76187 25.7492C7.51469 25.5021 7.17931 25.3631 6.82977 25.3631H4.49929L11.1654 18.6966C11.4126 18.4492 11.5514 18.1141 11.5514 17.7646C11.5514 17.4151 11.4126 17.0797 11.1654 16.8326L11.1656 16.8327Z" fill="white"/>
<path d="M19.8508 26.6821C19.8508 27.0316 19.9898 27.3667 20.237 27.6141C20.4841 27.861 20.8193 28 21.1691 28H26.756C27.4424 28 27.9988 27.4436 27.9988 26.7573V21.1673C27.9988 20.8178 27.8599 20.4824 27.6127 20.2353C27.3657 19.9881 27.0303 19.8492 26.6808 19.8492C26.331 19.8492 25.9958 19.8881 25.7487 20.2353C25.5015 20.4824 25.3625 20.8178 25.3625 21.1673V23.4987L18.6979 16.8327C18.4503 16.5874 18.1158 16.4501 17.7672 16.4509C17.4185 16.4515 17.0845 16.5904 16.838 16.8368C16.5914 17.0833 16.4526 17.4173 16.4518 17.7659C16.4512 18.1144 16.5886 18.4492 16.8339 18.6968L23.5001 25.3638H21.1687C20.819 25.3638 20.4838 25.5027 20.2366 25.7499C19.9895 25.9971 19.8505 26.3322 19.8505 26.6819L19.8508 26.6821Z" fill="white"/>
<path d="M11.1656 9.30049L4.50001 2.63605H6.82987C7.17941 2.63605 7.51481 2.4971 7.76198 2.24994C8.00916 2.00278 8.14813 1.66764 8.14813 1.31792C8.14813 0.968417 8.00916 0.633253 7.76198 0.386114C7.51479 0.138953 7.17941 0 6.82987 0H1.24292C0.55653 0 0.000103511 0.55637 0.000103511 1.24269V6.8322C0.000103511 7.1817 0.139071 7.51707 0.386255 7.76421C0.63344 8.01137 0.968616 8.15033 1.31816 8.15033C1.6679 8.15033 2.0031 8.01137 2.25027 7.76421C2.49745 7.51705 2.63642 7.1817 2.63642 6.8322V4.49993L9.30151 11.1649C9.5491 11.4102 9.88387 11.5476 10.2324 11.5467C10.5812 11.5459 10.9151 11.4072 11.1617 11.1608C11.4081 10.9143 11.5468 10.5803 11.5476 10.2317C11.5484 9.88317 11.4111 9.54845 11.1657 9.30084L11.1656 9.30049Z" fill="white"/>
</svg>
</div>
{/* Centered Group for Rotate and Zoom */}
<div className="flex items-center space-x-4">
<div className="flex items-center space-x-1.5 text-gray-400">
<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
<path fillRule="evenodd" clipRule="evenodd" d="M13.9645 16.8222L11.6787 19.1079C11.3445 19.4429 11.3445 19.9857 11.6787 20.3204L13.9645 22.6062C14.2994 22.9404 14.8423 22.9404 15.177 22.6062C15.5112 22.2712 15.5112 21.7284 15.177 21.3937L13.4968 19.7143L15.177 18.0349C15.5112 17.7 15.5112 17.1572 15.177 16.8225C14.842 16.4883 14.2992 16.4883 13.9645 16.8225V16.8222Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M16.8217 14.0355L19.1074 16.3213C19.4424 16.6555 19.9852 16.6555 20.3199 16.3213L22.6057 14.0355C22.9399 13.7006 22.9399 13.1577 22.6057 12.823C22.2707 12.4888 21.7279 12.4888 21.3932 12.823L19.7138 14.5032L18.0344 12.823C17.6995 12.4888 17.1566 12.4888 16.8219 12.823C16.4877 13.158 16.4877 13.7008 16.8219 14.0355H16.8217Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M8.91752 18.3994C6.3032 17.9039 4.15009 17.0485 2.85341 15.9501C2.1539 15.3575 1.71386 14.7118 1.71386 14.0003C1.71386 12.9901 2.55339 12.1214 3.83099 11.3638C6.12361 10.0044 9.82882 9.14309 14 9.14309C18.171 9.14309 21.8761 10.0044 24.169 11.3638C25.4468 12.1215 26.2861 12.9901 26.2861 14.0003C26.2861 15.0106 25.4466 15.8792 24.169 16.6369C21.8764 17.9963 18.1712 18.8576 14 18.8576H12.2857C11.8125 18.8576 11.4285 19.2415 11.4285 19.7147C11.4285 20.1879 11.8125 20.5719 12.2857 20.5719H14C18.5338 20.5719 22.5507 19.5895 25.0428 18.1114C26.9561 16.9772 28 15.5136 28 14.0003C28 12.487 26.9561 11.0237 25.0428 9.88929C22.5507 8.41093 18.5335 7.42878 14 7.42878C9.4665 7.42878 5.44931 8.41119 2.95718 9.88929C1.04387 11.0235 0 12.487 0 14.0003C0 15.1644 0.600521 16.2884 1.74567 17.2581C3.21534 18.5027 5.6355 19.5221 8.59902 20.0839C9.06357 20.1719 9.5128 19.8663 9.60083 19.401C9.68885 18.9364 9.38323 18.4872 8.91791 18.3992L8.91752 18.3994Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M18.3988 19.0825C17.9034 21.6968 17.048 23.8499 15.9496 25.1466C15.3569 25.8461 14.7113 26.2861 13.9998 26.2861C12.9896 26.2861 12.1209 25.4466 11.3633 24.169C10.0038 21.8764 9.14257 18.1712 9.14257 14C9.14257 9.82902 10.0038 6.12393 11.3633 3.83099C12.121 2.55319 12.9896 1.71386 13.9998 1.71386C15.01 1.71386 15.8787 2.55339 16.6363 3.83099C17.9958 6.12361 18.857 9.82882 18.857 14V15.7143C18.857 16.1875 19.241 16.5715 19.7142 16.5715C20.1874 16.5715 20.5714 16.1875 20.5714 15.7143V14C20.5714 9.46623 19.5889 5.44931 18.1108 2.95718C16.9766 1.04387 15.5131 0 13.9998 0C12.4865 0 11.0232 1.04387 9.88877 2.95718C8.41041 5.44931 7.42825 9.4665 7.42825 14C7.42825 18.5335 8.41067 22.5507 9.88877 25.0428C11.023 26.9561 12.4865 28 13.9998 28C15.1638 28 16.2878 27.3995 17.2575 26.2543C18.5022 24.7847 19.5216 22.3645 20.0834 19.401C20.1714 18.9364 19.8658 18.4872 19.4005 18.3992C18.9359 18.3112 18.4867 18.6168 18.3986 19.0821L18.3988 19.0825Z" fill="currentColor"/>
</svg>
<span>Drag to Rotate</span>
</div>
<div className="flex items-center space-x-1.5 text-gray-400">
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
<path d="M17.7074 0.622701C13.7678 -0.849719 9.19902 0.35492 6.54529 3.54063C3.34439 7.42228 4.00108 12.4284 6.79166 15.7212C4.60296 17.8895 2.41426 20.0312 0.225712 22.1728C-0.0752372 22.4673 -0.0752372 22.976 0.225712 23.2705L0.745564 23.7791C1.04651 24.0736 1.56636 24.0736 1.8673 23.7791C4.08325 21.6108 6.27195 19.4691 8.48796 17.3007C10.4851 18.7731 13.0568 19.5226 15.902 19.0407C20.6076 18.2375 23.8906 14.1952 24 9.59073C23.8905 5.62857 21.5102 2.06825 17.7076 0.622653L17.7074 0.622701ZM14.1783 17.6219C9.69157 17.6219 5.97086 13.9544 5.97086 9.59078C5.97086 5.20044 9.71888 1.53289 14.1783 1.55966C18.7471 1.55966 22.3037 5.20044 22.3857 9.59078C22.2762 13.9811 18.7471 17.6219 14.1783 17.6219Z" fill="currentColor"/>
<path d="M14.7527 4.2367H13.3848V8.92152H8.81601V10.26H13.3848V14.9449H14.7527V10.26H19.7593V8.92152H14.7527V4.2367Z" fill="currentColor"/>
</svg>
<span>Pinch to Zoom</span>
</div>
</div>

{/* Invisible Spacer (Right) - to balance the expand icon for centering the middle group */}
<div className="p-1 w-7 h-7" aria-hidden="true"></div>

</div>
</main>

{/* 3. Options/Controls Area */}
<section className="p-4 bg-neutral-800 h-80 overflow-y-auto"> {/* Updated height and overflow */}
{/* Static option rows based on the mockup image_e59280.jpg (leftmost panel) */}

<div className="w-full h-[56px] bg-stone-900 flex items-center justify-between px-4 mb-[10px]">
<div className="flex items-center">
<svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3">
<path opacity={0.2} d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/>
</svg>
<span className="text-lg">Build</span>
</div>
<span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
</div>

<div className="w-full h-[56px] bg-stone-900 flex items-center justify-between px-4 mb-[10px]">
<div className="flex items-center">
<svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3">
<path opacity={0.2} d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/>
</svg>
<span className="text-lg">Select Option</span>
</div>
<span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
</div>

<div className="w-full h-[56px] bg-stone-900 flex items-center justify-between px-4 mb-[10px]">
<div className="flex items-center">
<svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3">
<path opacity={0.2} d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/>
</svg>
<span className="text-lg">Color Option</span>
</div>
<span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
</div>

<div className="w-full h-[56px] bg-stone-900 flex items-center justify-between px-4 mb-[10px]">
<div className="flex items-center">
<svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3">
<path opacity={0.2} d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/>
</svg>
<span className="text-lg">Input Option</span>
</div>
<span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
</div>

<div className="w-full h-[56px] bg-stone-900 flex items-center justify-between px-4 mb-[10px]">
<div className="flex items-center">
<svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3">
<path opacity={0.2} d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/>
</svg>
<span className="text-lg">Select & Color Option</span>
</div>
<span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
</div>

<div className="w-full h-[56px] bg-stone-900 flex items-center justify-between px-4 mb-[10px]">
<div className="flex items-center">
<svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3">
<path opacity={0.2} d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/>
</svg>
<span className="text-lg">Input & Color Option</span>
</div>
<span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
</div>

<div className="w-full h-[56px] bg-stone-900 flex items-center justify-between px-4"> {/* Last item doesn't need mb-[10px] or can have it if consistent spacing to bottom of container is desired */}
<div className="flex items-center">
<svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto mr-3">
<path opacity={0.2} d="M1 1L8 8L1.10769 15" stroke="white" strokeWidth={2}/>
</svg>
<span className="text-lg">Dual Color Option</span>
</div>
<span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
</div>

</section>

{/* 4. Bottom Bar/Footer Area */}
{/* Footer with specified button sizes and spacing */}
<footer className="bg-neutral-800 border-t border-gray-700 flex items-center justify-start pt-4 pb-[20px] px-[14px]">

{/* Accordion Toggle Button */}
<button
type="button"
className="flex items-center justify-center space-x-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-base font-semibold text-white w-[146px] h-[56px]"
aria-label="Toggle accordion panel"
>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>
<span>Accordion</span>
</button>

{/* Call To Action Button */}
<button
type="button"
className="flex items-center justify-center px-4 ml-[10px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded text-base font-semibold text-white w-[244px] h-[56px]"
>
Call To Action
<span className="ml-2 text-lg">→</span>
</button>

</footer>

</div>
);
};

export default UI;