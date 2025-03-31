import './Select.scss';
import { useEffect, useState } from 'react';

function Select(props) {
    const [selected, setSelected] = useState(null);

    const [windowWidth, setWindowWidth] = useState();
    useEffect(() => {
        setWindowWidth(window.innerWidth && window.innerWidth <= 600);
    }, []);

    useEffect(() => {
        setSelected(props.selected);
    }, [props.selected]);

    const handleSelection = (option) => {
        setSelected(option);
        if (props.onSelection) props.onSelection(option);
        console.log('--------yewwwwww', option);
    };

    const isSelected = (option) => selected && selected.value === option.value;

    const gridLength = (len) => {
        if (props.wide) {
            if (len <= 5) {
                return String(len);
            }
            return '5';
        }
        if (len >= 3) {
            return '3';
        }
        return '2';
    };

    const getStyles = (option) => {
        switch (props.options.length) {
        case 2:

            break;

        default:
            break;
        }
    };

    return (
        <div className="select-container pb-4">
            { props.subtitle ? <h3 style={{ color: 'white', fontSize: '18px' }} className="subtitle mb-2">{props.subtitle}</h3> : null }
            <div className="modalselect" style={{}}>
                { props.options.map((option) => (
                    <div
                        className="select-block"
                        key={option.value}
                        style={{ flex: '1', width: '100%' }}
                        ref={(element) => {
                            if (element && props.full) element.style.setProperty('width', '100%', 'important');
                        }}
                    >
                        {props.full && <button
                            style={{
                                flex: '1', width: '100%',
                            }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {props.on5 === 'two' && <button
                            style={{
                                flex: '1', minWidth: '116px', maxWidth: '116px', zIndex: '', width: '100%',
                            }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {props.on4 === 'two' && <button
                            style={{
                                flex: '1', minWidth: '179px', maxWidth: '179px', zIndex: '', width: '100%',
                            }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {props.on3 === 'two' && <button
                            style={{
                                flex: '1', minWidth: '116px', maxWidth: '116px', zIndex: '', width: '100%',
                            }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {props.on2 === 'two' && <button
                            style={{
                                flex: '1', minWidth: '179px', maxWidth: '179px', zIndex: '', width: '100%',
                            }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {!windowWidth && props.on5 === 'one' && <button
                            style={{ flex: '1', width: '100%' }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {windowWidth && props.on5 === 'one' && <button
                            style={{
                                flex: '1', minWidth: '116px', maxWidth: '116px', zIndex: '', width: '100%',
                            }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {!windowWidth && props.on4 === 'one' && <button
                            style={{ flex: '1', width: '100%' }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {windowWidth && props.on4 === 'one' && <button
                            style={{
                                flex: '1', minWidth: '178px', maxWidth: '179px', zIndex: '', width: '100%',
                            }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {props.on3 === 'one' && <button
                            style={{ flex: '1', width: '100%' }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                        {props.on2 === 'one' && <button
                            style={{ flex: '1', width: '100%' }}
                            className={`option${isSelected(option) ? ' selected' : ''}  px-4 py-2`}
                            key={option.value}
                            onClick={() => handleSelection(option)}
                        >
                            {option.text}
                        </button>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Select;
