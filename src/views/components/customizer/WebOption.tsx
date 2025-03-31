import React, { useState } from 'react';

import { OptionAccordion } from '../../../context/isopenContext';
import Select from '../ui/Select';
import SelectImage from '../ui/SelectImage';
import SelectColor from '../ui/SelectColor';

const WebOption = ({
    title, windowWidth, defState, setOptionsColor, names, onSelection, selected, colors, webs,
}) => {
    // const arr = names.map((item, id) => ({ id, text: item, value: item }));

    const arrWeb = webs.map((item, index) => ({
        title: item,
        text: 'Option Text',
        value: item,
        src: 'https://via.placeholder.com/100',
        id: index,
    }));

    const getColors = () => {
        const arrColors = Object.values(colors).map((item) => ({ value: item }));

        return arrColors;
    };

    return <OptionAccordion
        title={title}
        type={'options'}
        selectedOption={defState.activeGlove && defState.activeGlove.text}
    >
        {/* <Select
            full
            options={arr}
            selected={selected}
            onSelection={ async (option) => onSelection(option)}
        /> */}
        <SelectImage
            subtitle={'Type'}
            // stage={props.stage}
            options={arrWeb}
            // selected={pallette}
            // onSelection={(options) => btnHandler(index, options.id)}
            onSelection={(option) => onSelection(option)}
        />
        <SelectColor
            subtitle={'Color'}
            colors={getColors()}
            selected={defState?.color}
            onSelection={(option) => setOptionsColor('web', option)}
            // onSelection={(option) => onClick('color', option.value)}
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
            ></div>
        )}
    </OptionAccordion>;
};

export default WebOption;
