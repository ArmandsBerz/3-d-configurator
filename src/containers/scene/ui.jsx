import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { CgArrowRight } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import { OptionAccordion } from '../../context/isopenContext';
import SceneBabylon, { colorOptions, colorMap, configBuild, playerPosition } from './SceneBabylon';
import { useAppDispatch, useAppSelector, buildSlice } from '../../store/rootReducer';

import '../../../src/main.scss';

/* ---------------- Utility Components ---------------- */
function ColorCircle(props) {
  return (
    <div
      className="ml-2.5 h-5 w-5 rounded-full"
      style={{ backgroundColor: props.color }} // Dynamic style: Remains unchanged
    />
  );
}

/* ---------------- UI Select Components ---------------- */
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

  return (
    <div className="select-container pb-4">
      {props.subtitle ? (
        <h3 className="subtitle mb-2 text-white text-lg"> {/* Changed */}
          {props.subtitle}
        </h3>
      ) : null}
      <div className="modalselect">
        {props.options.map((option) => (
          <div
            className="select-block flex-1 w-full" // Changed
            key={option.value}
            ref={(element) => {
              if (element && props.full) {
                // element.style.setProperty('width', '100%', 'important'); // Removed: To be handled by SCSS if !important is truly needed, or w-full utility
              }
            }}
          >
            {props.full && (
              <button
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2 flex-1 w-full`} // Changed
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on5 === 'two' && (
              <button
                // minWidth/maxWidth specific to this variant, to be handled by SCSS variant class if this structure is kept
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2 flex-1 w-full`} // Changed (base flex/width)
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on4 === 'two' && (
              <button
                // minWidth/maxWidth specific to this variant, to be handled by SCSS variant class
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2 flex-1 w-full`} // Changed (base flex/width)
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on3 === 'two' && (
              <button
                // minWidth/maxWidth specific to this variant, to be handled by SCSS variant class
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2 flex-1 w-full`} // Changed (base flex/width)
                key={option.value}
                onClick={() => handleSelection(option)}
              >
                {option.text}
              </button>
            )}
            {props.on2 === 'two' && (
              <button
                // minWidth/maxWidth specific to this variant, to be handled by SCSS variant class
                className={`option${isSelected(option) ? ' selected' : ''} px-4 py-2 flex-1 w-full`} // Changed (base flex/width)
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
      if (
        !messenger.hasData(
          this.props.gloveId,
          this.props.itemId,
          this.props.section,
          this.props.dataId
        )
      ) {
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
            className={`${data.value === this.state.selectedId ? 'selected' : ''} w-1/4 border-0`} // Changed (Tailwind's border-0 or SCSS class for border:none)
            type="button"
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

  // Always wrap options; stage checks removed.
  const getStyles = () => { // This function is defined but its return value is not used for styling the modalSelect-build div directly.
    let style;
    switch (props.options.length) {
      case 2:
        style = { flex: '1', width: '100%', flexWrap: 'wrap' };
        break;
      case 3:
        style = { flex: '1', width: '100%', flexWrap: 'wrap' };
        break;
      case 4:
        style = { flex: '1', width: '100%', flexWrap: 'wrap' };
        break;
      case 5:
        style = { flex: '1', width: '100%', flexWrap: 'wrap' };
        break;
      default:
        style = {};
        break;
    }
    return style;
  };

  return (
    <div className="select-build-container pb-4">
      {props.subtitle ? (
        <h3 className="subtitle mb-2 text-white text-lg"> {/* Changed */}
          {props.subtitle}
        </h3>
      ) : null}
      <div className="modalSelect-build flex-wrap"> {/* Changed */}
        {props.options.map((option, index) => (
          <div
            className="select-block grow shrink basis-auto" // Changed
            key={option.value}
            ref={(element) => {
              if (element && props.full) {
                // element.style.setProperty('width', '100%', 'important'); // Removed
              }
            }}
          >
            <button
              className={`option${isSelected(index) ? ' selected' : ''} px-4 py-2 flex-1 w-full`} // Changed
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
  const [selected, setSelected] = useState(
    props.selected !== undefined ? { value: props.selected } : null
  );

  useEffect(() => {
    if (props.selected !== undefined) {
      if (!selected || selected.value !== props.selected) {
        setSelected({ value: props.selected });
      }
    } else {
      if (selected !== null) {
        setSelected(null);
      }
    }
  }, [props.selected]);

  const handleSelection = (colorOption) => { 
    setSelected(colorOption); 
    if (props.onSelection) {
      props.onSelection(colorOption); 
    }
  };

  const isSelected = (option) => selected && selected.value === option.value;

  return (
    <div className="select-container mb-4">
      {props.subtitle ? <h3 className="subtitle mb-2">{props.subtitle}</h3> : null}
      <div className="flex flex-wrap gap-2"> {/* Changed (assuming gap-2 = 8px) */}
        {props.colors.map((color) => ( 
          <button
            className={`color${isSelected(color) ? ' selected' : ''}`}
            style={{ backgroundColor: color.value }} // Dynamic style: Remains unchanged
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
    props.onSelection(option);
  };

  const isSelected = (index) => props.selected === index;

  return (
    <div className="select-image-container pb-2">
      {props.subtitle ? (
        <h3 className="subtitle mb-2 text-lg"> {/* Changed */}
          {props.subtitle}
        </h3>
      ) : null}
      <div className={`grid grid-cols-${props.options.length > 2 ? '3' : '2'} gap-3`}>
        {props.options.map((option, index) => (
          <button
            className={`option${isSelected(index) ? ' selected' : ''}`}
            style={{ backgroundImage: `url(${option.src})` }} // Dynamic style: Remains unchanged
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
  const handleInput = (value) => {
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

/* ---------------- Additional Options Components ---------------- */
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
  const [color, setColor] = useState(!defState?.color ? colors.white : defState?.color);
  const arr = names.map((item, index) => ({ index, text: item, value: item }));

  const getColors = () => {
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
          {/* Assuming 'custom-divider-extended' will be defined in SCSS */}
          <div className="buttonLine custom-divider-extended"></div> {/* Changed */}
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

const ColorOption = ({ title, windowWidth, both, setOptions, handleButton, colors }) => {
  const [state, setState] = useState(false);
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
      {/* Assuming 'full-bleed-divider' will be defined in SCSS */}
      <div className="buttonLine full-bleed-divider"></div> {/* Changed */}
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
  const arrWeb = webs.map((item, index) => ({
    title: item,
    text: 'Option Text',
    value: item,
    src: 'https://via.placeholder.com/100', // Placeholder, actual src would make this dynamic
    id: index,
  }));

  const getColors = () => {
    return Object.values(colors).map((item) => ({ value: item }));
  };

  return (
    <OptionAccordion
      title={title}
      type="options"
      selectedOption={defState.activeGlove && defState.activeGlove.text}
    >
      <SelectImage
        subtitle="Type"
        options={arrWeb}
        onSelection={(option) => onSelection(option)}
      />
      <SelectColor
        subtitle="Color"
        colors={getColors()}
        selected={defState?.color}
        onSelection={(option) => setOptionsColor('web', option)}
      />
      {windowWidth && (
        // Assuming 'custom-divider-extended' will be defined in SCSS and is visually the same as in TextOptions
        <div className="buttonLine custom-divider-extended"></div> // Changed
      )}
    </OptionAccordion>
  );
};

const NameOptions = ({ title, windowWidth, defState, names, onSelection, selected }) => {
  const arr = names.map((item, id) => ({ id, text: item, value: item }));

  return (
    <OptionAccordion
      title={title}
      type="options"
      selectedOption={defState.activeGlove && defState.activeGlove.text}
    >
      <Select
        full
        options={arr}
        selected={selected}
        onSelection={async (option) => onSelection(option)}
      />
      {windowWidth && (
        // Assuming 'custom-divider-extended' will be defined in SCSS and is visually the same as in TextOptions
        <div className="buttonLine custom-divider-extended"></div> // Changed
      )}
    </OptionAccordion>
  );
};

/* ---------------- UI Component (from first file) ---------------- */
const UI = (props) => {
  const isLoaded = false;

  // Removed legacy comments regarding other stages.
  const renderGlove = () => (
    <div>
      <div>{props.glove.id}</div>
      {renderGloveObject(props.glove.id, props.glove.gloveObject)}
    </div>
  );

  const renderGloveObject = (gloveId, gloveObject) => (
    <div>
      <div>{gloveObject.id}</div>
      {renderSection(gloveId, 'zones', gloveObject)}
    </div>
  );

  function renderSection(gloveId, section, gloveObject) {
    const gloveZones = gloveObject.zones.zones;

    return (
      <div>
        <div>{section}</div>
        <br />
        {gloveZones.map((element) => (
          <SelectGroup
            gloveId={gloveId}
            itemId={gloveObject.id}
            section={section}
            messenger={props.messenger}
            key={element}
            subtitle={element}
            dataId={element}
            options={colorOptions}
          />
        ))}
      </div>
    );
  }

  return <>{renderGlove()}</>;
};

/* ---------------- Other Components ---------------- */

function BuildModal(props) {
  const [positionName, setPositionName] = useState(configBuild.Position[0]);
  const { pallette, size, stiffness, position, handSize, hand } = useAppSelector(
    (state) => state.buildReducer
  );
  const { setPallette } = buildSlice.actions;
  const myDispatch = useAppDispatch();

  const arrValues = [pallette, position, size, handSize, stiffness, hand];

  const getOptions = (el) => {
    const arr = [];
    el.forEach((item, index) => {
      arr.push({
        text: item,
        value: index,
        id: index,
      });
    });
    return arr;
  };

  const btnHandler = (key, options) => {
    myDispatch(setPallette({ key, val: options.id }));
    if (key === 1) {
      configBuild.Size = playerPosition[options.text].size;
    }
  };

  const getBuild = () =>
    Object.entries(configBuild).map(([key, value], index) => {
      const arr = getOptions(value);
      if (key === 'Glove Leather') {
        return (
          <SelectImage
            key={Math.random()}
            subtitle={key}
            options={[
              {
                title: 'Option Title',
                text: 'Option Text',
                value: 'option-value-1',
                src: 'https://via.placeholder.com/150', // Placeholder, actual src would make this dynamic
                id: 0,
              },
              {
                title: 'Option Title',
                text: 'Option Text',
                value: 'option-value-2',
                src: 'https://via.placeholder.com/150', // Placeholder, actual src would make this dynamic
                id: 1,
              },
            ]}
            selected={pallette}
            onSelection={(options) => btnHandler(index, options)}
          />
        );
      }
      return (
        <SelectBuild
          key={Math.random()}
          subtitle={key}
          options={arr}
          selected={arrValues[index]}
          onSelection={(options) => btnHandler(index, options)}
        />
      );
    });

  return (
    <div
      className={`build-modal-two ${props.show ? ' BuildModalShow ' : ' display-none'}`}
    >
      <div className={`build-modal-content${props.show ? ' animate-bottom' : ''}`}>
        <div className="build-modal-header">
          <h2 className="text-white text-base">{props.title}</h2> {/* Changed */}
        </div>
        <div className="build-modal-body">
          {getBuild()}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Exports ---------------- */
export {
  Select,
  SelectGroup,
  SelectBuild,
  SelectColor,
  SelectImage,
  SelectInput,
  TextOptions,
  ColorOption,
  WebOption,
  NameOptions,
  ColorCircle,
  BuildModal,
  UI
};