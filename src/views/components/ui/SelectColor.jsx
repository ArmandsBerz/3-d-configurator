import './SelectColor.scss';
import { useState, useEffect } from 'react';

function SelectColor(props) {
    const [selected, setSelected] = useState({ value: props.selected });

    const handleSelection = (color) => {
        setSelected(color);
        props.onSelection(color);
    };

    useEffect(() => {
        setSelected({ value: props.selected });
    }, [props.selected]);

    // console.log('props.selected ::', props);

    const isSelected = (option) => selected && selected.value === option.value;
    return (
        <div className="select-container mb-4">
            { props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null }
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {props.colors.map((color, item) => (
                    <button
                        className={`color${isSelected(color) ? ' selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        key={`${color.value}+${Math.random()}`}
                        onClick={() => handleSelection(color)}
                    />
                ))}
            </div>
        </div>
    );
}

export default SelectColor;
