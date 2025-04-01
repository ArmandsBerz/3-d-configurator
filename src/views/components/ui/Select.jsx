import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import './Select.scss';
import '../../../views/components/ui/SelectBuild.scss';
import './SelectColor.scss';
import './SelectImage.scss';
import './SelectInput.scss';
/* eslint-disable max-len */

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
      {props.subtitle ? (
        <h3 style={{ color: 'white', fontSize: '18px' }} className="subtitle mb-2">
          {props.subtitle}
        </h3>
      ) : null}
      <div className="modalselect">
        {props.options.map((option) => (
          <div
            className="select-block"
            key={option.value}
            style={{ flex: '1', width: '100%' }}
            ref={(element) => {
              if (element && props.full) element.style.setProperty('width', '100%', 'important');
            }}
          >
            {props.full && (
              <button
                style={{ flex: '1', width: '100%' }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on5 === 'two' && (
              <button
                style={{
                  flex: '1',
                  minWidth: '116px',
                  maxWidth: '116px',
                  width: '100%',
                }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on4 === 'two' && (
              <button
                style={{
                  flex: '1',
                  minWidth: '179px',
                  maxWidth: '179px',
                  width: '100%',
                }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on3 === 'two' && (
              <button
                style={{
                  flex: '1',
                  minWidth: '116px',
                  maxWidth: '116px',
                  width: '100%',
                }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on2 === 'two' && (
              <button
                style={{
                  flex: '1',
                  minWidth: '179px',
                  maxWidth: '179px',
                  width: '100%',
                }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {!windowWidth && props.on5 === 'one' && (
              <button
                style={{ flex: '1', width: '100%' }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {windowWidth && props.on5 === 'one' && (
              <button
                style={{
                  flex: '1',
                  minWidth: '116px',
                  maxWidth: '116px',
                  width: '100%',
                }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {!windowWidth && props.on4 === 'one' && (
              <button
                style={{ flex: '1', width: '100%' }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {windowWidth && props.on4 === 'one' && (
              <button
                style={{
                  flex: '1',
                  minWidth: '178px',
                  maxWidth: '179px',
                  width: '100%',
                }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on3 === 'one' && (
              <button
                style={{ flex: '1', width: '100%' }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on2 === 'one' && (
              <button
                style={{ flex: '1', width: '100%' }}
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2`}
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

class SelectGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedId: null,
    };

    const { messenger } = this.props;

    messenger.onDataChanged.add((data) => {
      if (this.isThisDataMine(data)) {
        if (this.optionValues().includes(data.value)) {
          this.selectButton(data.value, false);
        } else {
          this.selectFirstButton();
        }
      }
    });

    messenger.onLoaded.add((data) => {
      if (!messenger.hasData(this.props.gloveId, this.props.itemId, this.props.section, this.props.dataId)) {
        this.selectFirstButton();
      }
    });
  }

  isThisDataMine(data) {
    return (
      data.gloveId === this.props.gloveId &&
      data.itemId === this.props.itemId &&
      data.section === this.props.section &&
      this.props.dataId === data.key
    );
  }

  buttonSelected = (selectedId) => (ev) => {
    this.selectButton(selectedId, true);
  };

  selectButton(selectedId, updateData) {
    this.setState({ selectedId });
    if (updateData) {
      this.props.messenger.updateData(
        this.props.gloveId,
        this.props.itemId,
        this.props.section,
        this.props.dataId,
        selectedId
      );
    }
  }

  selectFirstButton() {
    this.selectButton(this.props.options[0].value, true);
  }

  optionValues() {
    return _.map(this.props.options, 'value');
  }

  render() {
    return (
      <div>
        <div>{this.props.subtitle}</div>
        {this.props.options.map((data) => (
          <button
            className={data.value === this.state.selectedId ? 'selected' : ''}
            type="button"
            style={{ width: '25%', border: 'none' }}
            key={data.value}
            onClick={this.buttonSelected(data.value)}
          >
            {data.text}
          </button>
        ))}
      </div>
    );
  }
}

function SelectBuild(props) {
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
  };

  const isSelected = (index) => props.selected === index;

  const getStyles = () => {
    let style;
    switch (props.options.length) {
      case 2:
        style = { flex: '1', width: '100%' };
        break;
      case 3:
        style = { flex: '1', width: '100%' };
        break;
      case 4:
        style = { flex: '1', width: '100%' };
        break;
      case 5:
        style = {
          flex: '1',
          width: '100%',
          flexWrap: props.stage === 'two' ? 'wrap' : null,
        };
        break;
      default:
        break;
    }
    return style;
  };

  return (
    <div className="select-build-container pb-4">
      {props.subtitle ? (
        <h3 style={{ color: 'white', fontSize: '18px' }} className="subtitle mb-2">
          {props.subtitle}
        </h3>
      ) : null}
      <div className="modalSelect-build" style={{ flexWrap: props.stage === 'two' ? 'wrap' : null }}>
        {props.options.map((option, index) => (
          <div
            className="select-block"
            key={option.value}
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: 'auto',
            }}
            ref={(element) => {
              if (element && props.full) {
                element.style.setProperty('width', '100%', 'important');
              }
            }}
          >
            <button
              style={{ flex: '1', width: '100%' }}
              className={`option${isSelected(index) ? ' selected' : ''} px-4 py-2`}
              key={option.value}
              onClick={() => handleSelection(option)}
            >
              {option.text}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectColor(props) {
  const [selected, setSelected] = useState({ value: props.selected });

  const handleSelection = (color) => {
    setSelected(color);
    props.onSelection(color);
  };

  useEffect(() => {
    setSelected({ value: props.selected });
  }, [props.selected]);

  const isSelected = (option) => selected && selected.value === option.value;

  return (
    <div className="select-container mb-4">
      {props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {props.colors.map((color) => (
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

function SelectColor2(props) {
  const [selected, setSelected] = useState(null);

  const handleSelection = (color) => {
    setSelected(color);
    props.onSelection(color);
  };

  // Uncomment the useEffect below if you want to auto-select the first color when none is selected.
  // useEffect(() => {
  //   if (selected === null && props.colors.length > 0) {
  //     handleSelection(props.colors[0]);
  //   }
  // }, [selected, props.colors]);

  const isSelected = (option) => selected && selected.value === option.value;

  return (
    <div className="select-container mb-4">
      {props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null}
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

function SelectImage(props) {
  const [selected, setSelected] = useState(0);

  const handleSelection = (option) => {
    console.log('option ::', option);
    // setSelected(option);
    props.onSelection(option);
  };

  // useEffect(() => {
  //   if (selected === null && props.options.length > 0) {
  //     handleSelection(props.options[0]);
  //   }
  // })

  const isSelected = (index) => props.selected === index;

  return (
    <div className="select-image-container pb-2">
      {props.subtitle ? (
        <h3 style={{ fontSize: '18px' }} className="subtitle mb-2">
          {props.subtitle}
        </h3>
      ) : null}
      <div className={`grid grid-cols-${props.options.length > 2 ? '3' : '2'} gap-3`}>
        {props.options.map((option, index) => (
          <button
            className={`option${isSelected(index) ? ' selected' : ''}`}
            style={{ backgroundImage: `url(${option.src})` }}
            key={`${option.value}${Math.random()}`}
            onClick={() => handleSelection(option)}
          >
            <div className="checked">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                role="img"
                width="14"
                height="14"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 24 24"
              >
                <path
                  fill="black"
                  d="m8.818 19.779l-6.364-6.364l2.83-2.83l3.534 3.544l9.898-9.908l2.83 2.83L8.818 19.779Z"
                />
              </svg>
            </div>
            {option.title}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectInput(props) {
  // const [input, setInput] = useState(props.value ? props.value : '');

  const handleInput = (value) => {
    // setInput(value);
    props.onSelection(value);
  };

  return (
    <div className="select-input-container mb-4">
      {props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null}
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

export {
  Select,
  SelectGroup,
  SelectBuild,
  SelectColor,
  SelectColor2,
  SelectImage,
  SelectInput,
};
