import './SelectInput.scss';
import { useState } from 'react';

function SelectInput(props) {
    // const [input, setInput] = useState(props.value ? props.value : '');

    const handleInput = (value) => {
        // setInput(value);
        props.onSelection(value);
    };

    return (
        <div className="select-input-container mb-4">
            { props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null }
            <div className="input-container">
                <input
                    placeholder="Enter your text..."
                    type="text"
                    value={props.value ? props.value : ''}
                    onChange={(e) => handleInput(e.target.value)}
                    maxLength={props.maxLength ? props.maxLength : 10}
                />
            </div>
        </div>
    );
}

export default SelectInput;
