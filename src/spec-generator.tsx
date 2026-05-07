import { useEffect, useRef } from 'react';
import { ZONES, getHexById, AppState } from './product-data';

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
                            const layer = svgDoc.querySelector(`#${zoneKey}`);
                            
                            if (layer) {
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
                        const textElement = svgDoc.querySelector(`#${fieldId}`);
                        if (textElement && currentState.configuration[fieldId]) {
                            textElement.textContent = currentState.configuration[fieldId].text;
                            const textColorHex = getHexById(currentState.configuration[fieldId].colorId);
                            textElement.setAttribute('fill', textColorHex);
                        }
                    });

                    // 6. Handle visibility toggles
                    const protectionType = currentState.configuration.build.fingerProtection;
                    if (protectionType === 'non') {
                        const padHoodElement = svgDoc.querySelector(`#${ZONES.PAD_HOOD}`);
                        if (padHoodElement) padHoodElement.setAttribute('display', 'none');
                    }

                    // 7. Serialize and download
                    const finalSvg = new XMLSerializer().serializeToString(svgDoc);
                    const blob = new Blob([finalSvg], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `factory-spec-${currentState.configuration.build.size}.svg`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    
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