import { useEffect, useRef } from 'react';
import { ZONES, getHexById, AppState } from './product-data';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

export const SpecGenerator = ({ state }: { state: AppState }) => {
    const isGenerating = useRef(false);
    
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        const handleKeyDown = async (event: KeyboardEvent) => {
            // THE TRIGGER: Admin presses Shift + D
            if (event.shiftKey && (event.key === 'D' || event.key === 'd')) {
                const currentState = stateRef.current; // Grab latest state from ref
                
                // Gate it so it doesn't spam downloads
                if (currentState.isLoading || isGenerating.current) return;
                isGenerating.current = true;
                
                try {
                    // 1. Fetch the file safely from the assets folder
                    const filePath = `${process.env.PUBLIC_URL || ''}/assets/master-pattern.svg`;
                    const response = await fetch(filePath);
                    
                    if (!response.ok) throw new Error(`Failed to load ${filePath}`);
                    
                    const rawSvg = await response.text();

                    // 2. Safety check against HTML 404 pages
                    if (rawSvg.trim().toLowerCase().startsWith('<!doctype') || rawSvg.trim().toLowerCase().startsWith('<html')) {
                        throw new Error("Path failed: Fetched the React index.html instead of the SVG.");
                    }

                    // 3. The bulletproof parser that prevents <parsererror>
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
                    const svgDoc = doc.documentElement; 

                    if (!svgDoc || svgDoc.tagName.toLowerCase() !== 'svg') throw new Error("File fetched but no valid <svg> tag found inside");

                    // 4. Inject the shell colors
                    Object.values(ZONES).forEach((zoneKey) => {
                        const zoneState = currentState.configuration[zoneKey];
                        if (zoneState) {
                            const hexColor = getHexById(zoneState.colorId);
                            // FIXED: Explicitly cast to SVGElement | null to permit style modifications
                            const layer = svgDoc.querySelector(`#${zoneKey}`) as SVGElement | null;
                            
                            if (layer) {
                                // 1. Kill any hardcoded inline CSS fill
                                layer.style.fill = hexColor;
                                // 2. Set the standard SVG attribute
                                layer.setAttribute('fill', hexColor);
                            } else {
                                // THE WARNING:
                                console.warn(`GHOST PIPELINE WARNING: Designer missing ID #${zoneKey} in SVG`);
                            }
                        }
                    });

                    // 5. Inject Text
                    const textFields = ['thumbName', 'pinkyName'] as const;
                    textFields.forEach((fieldId) => {
                        // FIXED: Explicitly cast to SVGElement | null to permit style modifications
                        const textElement = svgDoc.querySelector(`#${fieldId}`) as SVGElement | null;
                        if (textElement && currentState.configuration[fieldId]) {
                            textElement.textContent = currentState.configuration[fieldId].text;
                            const textColorHex = getHexById(currentState.configuration[fieldId].colorId);
                            // FIXED: Applied style.fill defensively for text elements too
                            textElement.style.fill = textColorHex;
                            textElement.setAttribute('fill', textColorHex);
                        }
                    });

                    // 6. Handle visibility toggles
                    const protectionType = currentState.configuration.build.fingerProtection;
                    if (protectionType === 'non') {
                        // FIXED: Casted for strict consistency
                        const padHoodElement = svgDoc.querySelector(`#${ZONES.PAD_HOOD}`) as SVGElement | null;
                        if (padHoodElement) padHoodElement.setAttribute('display', 'none');
                    }

                    // 7. Compile to PDF and Download (Dynamic Sizing with DPI correction)
                    
                    // A. Read the dimensions natively from the SVG's viewBox
                    const viewBox = svgDoc.getAttribute('viewBox');
                    let pdfWidth = 5668.56; // Fallback defaults
                    let pdfHeight = 2729.52;

                    if (viewBox) {
                        const [, , w, h] = viewBox.split(/\s+/).map(Number);
                        if (w && h) {
                            // Affinity exports viewBox in PIXELS at 300 DPI.
                            // jsPDF format requires POINTS at 72 DPI.
                            // Convert: (pixels / 300) * 72 = points
                            pdfWidth = w * 0.24;
                            pdfHeight = h * 0.24;
                        }
                    }

                    // B. Create the document perfectly sized to the designer's canvas
                    const pdf = new jsPDF({
                        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                        unit: 'pt',
                        format: [pdfWidth, pdfHeight]
                    });

                    // C. Pass the live DOM element into the compiler
                    await pdf.svg(svgDoc, {
                        x: 0,
                        y: 0,
                        width: pdfWidth,
                        height: pdfHeight
                    });

                    // D. Trigger the download
                    pdf.save(`factory-spec-${currentState.configuration.build.size}.pdf`);
                    
                } catch (error) {
                    console.error("GHOST PIPELINE ERROR:", error);
                } finally {
                    isGenerating.current = false;
                }
            }
        };

        // Listen for the shortcut anywhere on the page
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);

    }, []);

    return null; 
};