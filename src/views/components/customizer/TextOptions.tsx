import React, { useState, useEffect } from 'react';
import { CgArrowRight } from 'react-icons/cg';

import { OptionAccordion } from '../../../context/isopenContext';
import SelectInput from '../ui/SelectInput';
import SelectColor from '../ui/SelectColor';
import Select from '../ui/Select';
import { ColorCircle } from '../ui/ColorCircle';
import SceneBabylon, { colorMap } from '../../../containers/scene/SceneBabylon';

const TextOptions = ({
    title,
    windowWidth,
    defState,
    names,
    selected,
    both,
    setOptions,
    id,
    colors,
}) => {
    // Use the provided color if available, otherwise default to colors.white.
    const [color, setColor] = useState(!defState?.color ? colors.white : defState?.color);

    // Map the provided names into the format expected by the Select component.
    const arr = names.map((item, index) => ({ index, text: item, value: item }));

    const getColors = () => {
        // Create an array of color objects from the colors provided.
        return Object.values(colors).map((item) => ({ value: item }));
    };

    const onClick = (name, option) => {
        const value = {};
        value[name] = option;
        setOptions(id, value);
    };

    return (
        <OptionAccordion title={title} type="TextInput">
            <SelectInput
                subtitle="Text"
                value={defState?.text}
                onSelection={(option) => onClick('text', option)}
            />
            <Select
                subtitle="Font"
                full
                options={arr}
                selected={selected}
                onSelection={(option) => onClick('font', option.value)}
            />
            <SelectColor
                subtitle="Color"
                colors={getColors()}
                selected={defState?.color}
                onSelection={(option) => onClick('color', option.value)}
            />
            {windowWidth && (
                <>
                    <div
                        className="buttonLine"
                        style={{
                            width: '120%',
                            marginLeft: '-28px',
                            height: '10px',
                            backgroundColor: '#161616',
                        }}
                    ></div>
                    <button className="inlineButton ininlineButtonPrimary">
                        <div>Primary</div>
                        <div className="iconButt">
                            <CgArrowRight />
                        </div>
                    </button>
                </>
            )}
        </OptionAccordion>
    );
};

const ColorOption = ({
    title,
    windowWidth,
    both,
    setOptions,
    handleButton,
    colors,
}) => {
    const [state, setState] = useState(false);
    // Use the provided color from "both" if available, otherwise default to colors.white.
    const [color, setColor] = useState(!both ? colors.white : both);

    const getColors = () => {
        return Object.values(colors).map((item) => ({ value: item }));
    };

    return (
        <OptionAccordion
            type="colorOption"
            title={title}
            selectedOption={<ColorCircle color={!both ? color : both} />}
        >
            <SelectColor
                colors={getColors()}
                selected={color}
                onSelection={(option) => setOptions(title, option)}
            />
            <div
                className="buttonLine"
                style={{
                    width: '100vw',
                    marginLeft: '-28px',
                    height: '10px',
                    backgroundColor: '#161616',
                }}
            ></div>
            <div className="buttonAndIcon">
                <button className="inlineButton" onClick={handleButton}>
                    <div>Secondary</div>
                    <div className="iconButtSecondary">
                        <CgArrowRight />
                    </div>
                </button>
                {windowWidth && (
                    <button className="inlineButton primaryButton">
                        <div>Primary</div>
                        <div className="iconButt">
                            <CgArrowRight />
                        </div>
                    </button>
                )}
            </div>
        </OptionAccordion>
    );
};

export { TextOptions, ColorOption };
