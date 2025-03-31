import React, { useState } from 'react';

import { CgArrowRight } from 'react-icons/cg';
import { OptionAccordion } from '../../../context/isopenContext';
import SelectInput from '../ui/SelectInput';
import SelectColor from '../ui/SelectColor';
import Select from '../ui/Select';
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
    // const [color, setColor] = useState(!defState?.color ? colorMap.white : defState?.color);
    const [color, setColor] = useState(!defState?.color ? colors.white : defState?.color);

    const arr = names.map((item, index) => ({ index, text: item, value: item }));

    const getColors = () => {
        const arrColors = Object.values(colors).map((item) => ({ value: item }));

        return arrColors;
    };

    const onClick = (name, option) => {
        // console.log('onClick ::', name, option);

        const value = {};
        value[name] = option;

        setOptions(id, value);
        // setOptions(title, value);
    };

    // console.log('defState ::', title, defState);
    // console.log('defState[title]?.text ::', defState[title]?.text);

    return <OptionAccordion
        title={title}
        // selectedOption={state.textOption}
        type={'TextInput'}
    >
        <SelectInput
            subtitle={'Text'}
            value={defState?.text}
            onSelection={(option) => onClick('text', option)}
        />
        <Select
            // on2={'two'}
            subtitle={'Font'}
            full
            options={arr}
            selected={selected}
            onSelection={(option) => onClick('font', option.value)}
        />
        <SelectColor
            subtitle={'Color'}
            colors={getColors()}
            selected={defState?.color}
            onSelection={(option) => onClick('color', option.value)}
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
        {windowWidth && (
            <button
                className="inlineButton ininlineButtonPrimary"
            >
                <div>Primary</div>
                <div className="iconButt ">
                    <CgArrowRight />
                </div>
            </button>
        )}
    </OptionAccordion>;
    // return <OptionAccordion
    //     title={title}
    //     type={'options'}
    //     selectedOption={defState.activeGlove && defState.activeGlove.text}
    // >
    //     <Select
    //         full
    //         options={arr}
    //         selected={selected}
    //         onSelection={ async (option) => onSelection(option)}
    //     />
    //     {windowWidth && (
    //         <div
    //             className="buttonLine"
    //             style={{
    //                 width: '120%',
    //                 marginLeft: '-28px',
    //                 height: '10px',
    //                 backgroundColor: '#161616',
    //             }}
    //         ></div>
    //     )}
    // </OptionAccordion>;
};

export default TextOptions;
