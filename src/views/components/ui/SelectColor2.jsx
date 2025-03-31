import './SelectColor.scss';
import { useState } from 'react';

function SelectColor2(props) {
    const [selected, setSelected] = useState(null);

    const handleSelection = (color) => {
        setSelected(color);
        props.onSelection(color);
    };

    // useEffect(() => {
    //   if (selected === null && props.colors.length > 0) {
    //     handleSelection(props.colors[0]);
    //   }
    // })

    const isSelected = (option) => selected && selected.value === option.value;

    return (
        <div className="select-container mb-4">
            { props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null }
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {props.colors.map((color) => (
                    <button
                        className={`color${isSelected(color) ? ' selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        key={color.value}
                        onClick={() => handleSelection(color)}
                    />
                ))}
            </div>
        </div>
    );
}

export default SelectColor2;
