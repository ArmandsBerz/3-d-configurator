import React, { useState } from 'react';
import { OptionAccordion } from '../../../context/isopenContext';
import Select from '../ui/Select';
import SelectImage from '../ui/SelectImage';
import SelectColor from '../ui/SelectColor';

const WebOption = ({
    title,
    windowWidth,
    defState,
    setOptionsColor,
    names,
    onSelection,
    selected,
    colors,
    webs,
}) => {
    // Mapping the webs array to the format needed by SelectImage
    const arrWeb = webs.map((item, index) => ({
        title: item,
        text: 'Option Text',
        value: item,
        src: 'https://via.placeholder.com/100',
        id: index,
    }));

    const getColors = () => {
        return Object.values(colors).map((item) => ({ value: item }));
    };

    return (
        <OptionAccordion
            title={title}
            type={'options'}
            selectedOption={defState.activeGlove && defState.activeGlove.text}
        >
            <SelectImage
                subtitle={'Type'}
                options={arrWeb}
                onSelection={(option) => onSelection(option)}
            />
            <SelectColor
                subtitle={'Color'}
                colors={getColors()}
                selected={defState?.color}
                onSelection={(option) => setOptionsColor('web', option)}
            />
            {windowWidth && (
                <div
                    className="buttonLine"
                    style={{
                        width: '120%',
                        marginLeft: '-28px',
                        height: '10px',
                        backgroundColor: '#161616',
                    }}
                />
            )}
        </OptionAccordion>
    );
};

const NameOptions = ({
    title,
    windowWidth,
    defState,
    names,
    onSelection,
    selected,
}) => {
    const arr = names.map((item, id) => ({ id, text: item, value: item }));

    return (
        <OptionAccordion
            title={title}
            type={'options'}
            selectedOption={defState.activeGlove && defState.activeGlove.text}
        >
            <Select
                full
                options={arr}
                selected={selected}
                onSelection={async (option) => onSelection(option)}
            />
            {windowWidth && (
                <div
                    className="buttonLine"
                    style={{
                        width: '120%',
                        marginLeft: '-28px',
                        height: '10px',
                        backgroundColor: '#161616',
                    }}
                />
            )}
        </OptionAccordion>
    );
};

export { WebOption, NameOptions };
