import { useEffect, useRef } from 'react';
import { ZONES, getHexById, AppState, FONT_REGISTRY } from './product-data';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import opentype from 'opentype.js'; // <-- ADD THIS IMPORT

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

                    // 5. Inject Text (The opentype.js Vector Method)
                    const textFields = ['thumbName', 'pinkyName'] as const;

                    for (const fieldId of textFields) {
                        const anchorElement = svgDoc.querySelector(`#${fieldId}`) as SVGElement | null;
                        const textConfig = currentState.configuration[fieldId];

                        if (anchorElement && textConfig && textConfig.text) {
                            
                            let textElement: SVGElement | null = null;
                            if (anchorElement.tagName.toLowerCase() === 'text') {
                                textElement = anchorElement;
                            } else if (anchorElement.tagName.toLowerCase() === 'g') {
                                textElement = anchorElement.querySelector('text') || (anchorElement.nextElementSibling?.tagName.toLowerCase() === 'text' ? anchorElement.nextElementSibling as SVGElement : null);
                            }

                            if (textElement) {
                                const x = parseFloat(textElement.getAttribute('x') || '0');
                                const y = parseFloat(textElement.getAttribute('y') || '0');
                                const transform = textElement.getAttribute('transform'); // <-- Preserve Affinity's positioning
                                
                                let fontSize = 72; 
                                const styleAttr = textElement.getAttribute('style');
                                if (styleAttr) {
                                    const match = styleAttr.match(/font-size:([\d.]+)px/);

                                        if (match) {
                                            fontSize = parseFloat(match[1]);
                                        }
                                }
                                
                                const textColorHex = getHexById(textConfig.colorId);
                                // 1. Grab the outline color from the state
                                const outlineColorHex = textConfig.outlineColorId ? getHexById(textConfig.outlineColorId) : null;

                                // USE YOUR ACTUAL REGISTRY
                                const fontMeta = FONT_REGISTRY.find(f => f.id === textConfig.font);
                                if (!fontMeta) {
                                    console.warn(`[Ghost Pipeline] Missing registry entry for ${textConfig.font}`);
                                    continue;
                                }

                                // Ensure these filenames match exactly what is in your public/assets/fonts/ folder
                                // If your file is Lobster-Regular.ttf, change fontMeta.baseName in your registry to match!
                                const fontFileName = `${fontMeta.baseName}.ttf`; 
                                const fontUrl = `${process.env.PUBLIC_URL || ''}/assets/fonts/${fontFileName}`;

                                try {
                                    const fontBuffer = await (await fetch(fontUrl)).arrayBuffer();
                                    const font = opentype.parse(fontBuffer);

                                    const MAX_WIDTH_POINTS = 600; 
                                    let path = font.getPath(textConfig.text, x, y, fontSize);
                                    let boundingBox = path.getBoundingBox();
                                    let textWidth = boundingBox.x2 - boundingBox.x1;

                                    while (textWidth > MAX_WIDTH_POINTS && fontSize > 10) {
                                        fontSize -= 4;
                                        path = font.getPath(textConfig.text, x, y, fontSize);
                                        boundingBox = path.getBoundingBox();
                                        textWidth = boundingBox.x2 - boundingBox.x1;
                                    }

                                    const pathData = path.toPathData(2); 

                                    // 1. Create a containing group to keep layers and transforms organized
                                    const groupElement = doc.createElementNS("http://www.w3.org/2000/svg", "g");
                                    groupElement.setAttribute('id', fieldId);
                                    
                                    // Apply the preserved Affinity Designer transform to the entire group
                                    if (transform) {
                                        groupElement.setAttribute('transform', transform);
                                    }
                                    
                                    // ---------------------------------------------------------
                                    // LAYER 1: THE STROKE (Fat outline underneath)
                                    // ---------------------------------------------------------
                                    if (outlineColorHex && outlineColorHex.toLowerCase() !== textColorHex.toLowerCase()) {
                                        const strokePath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
                                        strokePath.setAttribute('d', pathData);
                                        strokePath.setAttribute('fill', 'none'); // Transparent center
                                        strokePath.setAttribute('stroke', outlineColorHex);
                                        strokePath.setAttribute('stroke-width', (fontSize * 0.12).toString()); 
                                        strokePath.setAttribute('stroke-linejoin', 'round');
                                        strokePath.setAttribute('stroke-linecap', 'round'); // Smooth ends
                                        groupElement.appendChild(strokePath);
                                    }
                                    
                                    // ---------------------------------------------------------
                                    // LAYER 2: THE FILL (Crisp text on top)
                                    // ---------------------------------------------------------
                                    const fillPath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
                                    fillPath.setAttribute('d', pathData);
                                    fillPath.setAttribute('fill', textColorHex);
                                    
                                    // No stroke applied here, so the inward bleed doesn't happen
                                    groupElement.appendChild(fillPath);
                                    
                                    // Swap out the vulnerable <text> node for our bulletproof layered group
                                    textElement.parentNode?.replaceChild(groupElement, textElement);
                                    
                                    if (anchorElement !== textElement && anchorElement.tagName.toLowerCase() === 'g') {
                                        anchorElement.parentNode?.removeChild(anchorElement);
                                    }

                                } catch (error) {
                                    // REMOVED THE SILENT FALLBACK. 
                                    // If it fails now, it will scream at you in the console and you will know exactly why.
                                    console.error(`[Ghost Pipeline] CRITICAL FAIL on ${fieldId}. Check your font path: ${fontUrl}`, error);
                                }
                            }
                        }
                    }
                

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