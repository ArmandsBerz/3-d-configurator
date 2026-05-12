import { useEffect, useRef } from 'react';
import { ZONES, getHexById, AppState, FONT_REGISTRY } from './product-data';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import opentype from 'opentype.js';

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
                                
                                // ---------------------------------------------------------
                                // VIRTUAL SAFE BOX SYSTEM (ZONE-SPECIFIC RESOLUTION)
                                // ---------------------------------------------------------
                                const isFront = fieldId === 'thumbName';
                                
                                // Front is a compact chest zone. Back is a wide shoulder nameplate.
                                const MAX_WIDTH = isFront ? 1574.12 : 3800.00;
                                const MAX_HEIGHT = isFront ? 1000.00 : 800.00;

                                // Base font size starts at the maximum allowed height limit
                                let fontSize = MAX_HEIGHT;

                                const textColorHex = getHexById(textConfig.colorId);
                                const outlineColorHex = textConfig.outlineColorId ? getHexById(textConfig.outlineColorId) : null;

                                // USE YOUR ACTUAL REGISTRY
                                const fontMeta = FONT_REGISTRY.find(f => f.id === textConfig.font);
                                if (!fontMeta) {
                                    console.warn(`[Ghost Pipeline] Missing registry entry for ${textConfig.font}`);
                                    continue;
                                }

                                const fontFileName = `${fontMeta.baseName}.ttf`; 
                                const fontUrl = `${process.env.PUBLIC_URL || ''}/assets/fonts/${fontFileName}`;

                                try {
                                    const fontBuffer = await (await fetch(fontUrl)).arrayBuffer();
                                    const font = opentype.parse(fontBuffer);

                                    // A. Extract the original placeholder metrics to find its true center
                                    const originalText = textElement.textContent || 'x';
                                    let origFontSize = 1678.89; // Fallback to your SVG standard
                                    
                                    const styleAttr = textElement.getAttribute('style');
                                    if (styleAttr) {
                                        const match = styleAttr.match(/font-size:([\d.]+)px/);
                                        if (match && match) {
                                            origFontSize = parseFloat(match[1]);
                                        }
                                    }
                                    const fontSizeAttr = textElement.getAttribute('font-size');
                                    if (fontSizeAttr) {
                                        origFontSize = parseFloat(fontSizeAttr);
                                    }

                                    // Measure original placeholder path
                                    const origPath = font.getPath(originalText, 0, 0, origFontSize);
                                    const origBox = origPath.getBoundingBox();
                                    const origWidth = origBox.x2 - origBox.x1;
                                    
                                    // Calculate the absolute geometric center (Cx) of the original placeholder
                                    const Cx = x + origBox.x1 + (origWidth / 2);

                                    // B. Generate new text path at origin (0,0) to measure physical boundaries
                                    let path = font.getPath(textConfig.text, 0, 0, fontSize);
                                    let boundingBox = path.getBoundingBox();
                                    let textWidth = boundingBox.x2 - boundingBox.x1;
                                    let textHeight = boundingBox.y2 - boundingBox.y1;

                                    // C. O(1) Constant-Time Mathematical Scaling Projection
                                    const widthRatio = MAX_WIDTH / textWidth;
                                    const heightRatio = MAX_HEIGHT / textHeight;
                                    const scaleFactor = Math.min(1, widthRatio, heightRatio);

                                    if (scaleFactor < 1) {
                                        fontSize = Math.floor(fontSize * scaleFactor);
                                        path = font.getPath(textConfig.text, 0, 0, fontSize);
                                        boundingBox = path.getBoundingBox();
                                        textWidth = boundingBox.x2 - boundingBox.x1;
                                        textHeight = boundingBox.y2 - boundingBox.y1;
                                    }

                                    // D. Align the new text's geometric center EXACTLY with Cx
                                    const drawX = Cx - (textWidth / 2) - boundingBox.x1;

                                    // E. Generate the final path at the absolute corrected coordinate
                                    path = font.getPath(textConfig.text, drawX, y, fontSize);

                                    // --- THE HARD-MATH FIX FOR SVG2PDF ---
                                    // Forces 'Z' on every contour to prevent open gaps during PDF vector compilation
                                    if (path.commands) {
                                        const closedCommands: any[] = [];
                                        for (let i = 0; i < path.commands.length; i++) {
                                            const cmd = path.commands[i];
                                            if (cmd.type === 'M' && i > 0) {
                                                const prev = path.commands[i - 1];
                                                if (prev.type !== 'Z' && prev.type !== 'M') {
                                                    closedCommands.push({ type: 'Z' });
                                                }
                                            }
                                            closedCommands.push(cmd);
                                        }
                                        if (closedCommands.length > 0) {
                                            const last = closedCommands[closedCommands.length - 1];
                                            if (last.type !== 'Z' && last.type !== 'M') {
                                                closedCommands.push({ type: 'Z' });
                                            }
                                        }
                                        path.commands = closedCommands;
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
                                    // LAYER 1: THE STROKE GROUP (Forces independent rendering pass)
                                    // ---------------------------------------------------------
                                    if (outlineColorHex && outlineColorHex.toLowerCase() !== textColorHex.toLowerCase()) {
                                        const strokeGroup = doc.createElementNS("http://www.w3.org/2000/svg", "g");
                                        strokeGroup.setAttribute('id', `${fieldId}-stroke-pass`);
                                        
                                        const strokePath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
                                        strokePath.setAttribute('d', pathData);
                                        strokePath.setAttribute('fill', 'none'); 
                                        strokePath.setAttribute('stroke', outlineColorHex);
                                        strokePath.setAttribute('stroke-width', (fontSize * 0.12).toString()); 
                                        strokePath.setAttribute('stroke-linejoin', 'round');
                                        strokePath.setAttribute('stroke-linecap', 'round'); 
                                        
                                        strokeGroup.appendChild(strokePath);
                                        groupElement.appendChild(strokeGroup);
                                    }
                                    
                                    // ---------------------------------------------------------
                                    // LAYER 2: THE FILL GROUP (Forces independent rendering pass)
                                    // ---------------------------------------------------------
                                    const fillGroup = doc.createElementNS("http://www.w3.org/2000/svg", "g");
                                    fillGroup.setAttribute('id', `${fieldId}-fill-pass`);
                                    
                                    const fillPath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
                                    fillPath.setAttribute('d', pathData);
                                    fillPath.setAttribute('fill', textColorHex);
                                    
                                    // THE FIX: Override Affinity's 'evenodd' to close the transparent holes
                                    fillPath.setAttribute('fill-rule', 'nonzero'); 
                                    
                                    fillGroup.appendChild(fillPath);
                                    groupElement.appendChild(fillGroup);
                                    
                                    // Swap out the vulnerable <text> node for our bulletproof layered group
                                    textElement.parentNode?.replaceChild(groupElement, textElement);
                                    
                                    if (anchorElement !== textElement && anchorElement.tagName.toLowerCase() === 'g') {
                                        anchorElement.parentNode?.removeChild(anchorElement);
                                    }

                                } catch (error) {
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