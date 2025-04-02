import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { CgArrowRight } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import { OptionAccordion } from '../../context/isopenContext';
import SceneBabylon, { colorOptions, colorMap, configBuild, playerPosition } from './SceneBabylon';
import { useAppDispatch, useAppSelector, buildSlice } from '../../store/rootReducer';

import '../../views/components/ui/Select.scss';
import '../../views/components/ui/SelectBuild.scss';
import '../../views/components/ui/SelectColor.scss';
import '../../views/components/ui/SelectImage.scss';
import '../../views/components/ui/SelectInput.scss';
import '../../views/components/modal/Modal.scss';
import '../../views/components/stage1/Card.scss';

/* ---------------- Utility Components ---------------- */
function ColorCircle(props) {
  return (
    <div
      className="ml-2.5 h-5 w-5 rounded-full"
      style={{ backgroundColor: props.color }}
    />
  );
}

function ColorCircle2(props) {
  return (
    <div
      className="ml-2.5 h-5 w-5 rounded-full"
      style={{ backgroundColor: props.color }}
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
              if (element && props.full)
                element.style.setProperty('width', '100%', 'important');
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
      <div
        className="modalSelect-build"
        style={{ flexWrap: props.stage === 'two' ? 'wrap' : null }}
      >
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
    props.onSelection(option);
  };

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
    src: 'https://via.placeholder.com/100',
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

/* ---------------- UI Component (from first file) ---------------- */
const UI = (props) => {
  const isLoaded = false;

  // componentDidMount() {
  //     this.isLoaded = true;
  //     this.props.onLoaded();
  // }

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
function Filters(props) {
  const [selected, setSelected] = useState(props.filters[0]);
  const [scroll, setScroll] = useState();

  const handleSelection = (option) => {
    setSelected(option);
  };

  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScroll(window.scrollY);
    });
  }, []);

  return (
    <div className="filters-container">
      <div className="filters-desktop flex pt-2">
        {props.filters.map((filter, index) => (
          <button
            key={index}
            value={filter}
            className={`filter${filter === selected ? ' active' : ''} mr-2 text-xl filterBtn`}
            onClick={() => handleSelection(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <select
        style={{ backgroundColor: 'black !important', fontSize: '20px' }}
        className="filters-mobile"
        onChange={(e) => handleSelection(e.target.value)}
      >
        {props.filters.map((filter, index) => (
          <option style={{ backgroundColor: 'black' }} key={index} value={filter}>
            {filter}
          </option>
        ))}
      </select>
    </div>
  );
}

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
            stage={props.stage}
            options={[
              {
                title: 'Option Title',
                text: 'Option Text',
                value: 'option-value-1',
                src: 'https://via.placeholder.com/150',
                id: 0,
              },
              {
                title: 'Option Title',
                text: 'Option Text',
                value: 'option-value-2',
                src: 'https://via.placeholder.com/150',
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
          stage={props.stage}
          subtitle={key}
          options={arr}
          selected={arrValues[index]}
          onSelection={(options) => btnHandler(index, options)}
        />
      );
    });

  return (
    <div
      className={`${props.stage === 'two' ? 'build-modal-two ' : ' build-modal'} ${
        props.show ? ' BuildModalShow ' : ' display-none'
      }`}
    >
      <div className={`build-modal-content${props.show ? ' animate-bottom' : ''}`}>
        <div className="build-modal-header">
          {props.stage === 'two' && (
            <h2 style={{ color: 'white', fontSize: '16px' }}>{props.title}</h2>
          )}
          {props.stage === 'one' && (
            <h2 style={{ color: 'white', fontSize: '36px' }}>{props.title}</h2>
          )}
          {props.stage !== 'two' && (
            <button className="close-button" onClick={props.handleClose}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L21 21M21 1L11 11L1 21" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>
        <div className="build-modal-body">
          {getBuild()}
          {(props.stage !== 'two' || props.stage === 'one') && (
            <div className="build-modal-btn">
              <button className="cta mt-4" onClick={props.handleClose}>
                <p>Call To Action</p>
                <span>&rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal(props) {
  return (
    <div className={`modal ${props.show ? 'overrideModal' : ' display-none'}`}>
      <div className={`modal-content${props.show ? ' animate-bottom' : ''}`}>
        <div className="modal-header">
          <h2 style={{ fontSize: '34px', lineHeight: '16px' }}>{props.title}</h2>
          <button className="close-button" onClick={props.handleClose}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L21 21M21 1L11 11L1 21" stroke="white" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="tags-container">
            <ul className="tags">
              <li className="tag-title">Tag</li>
              <li className="main-tag">Series</li>
            </ul>
          </div>
          <div className="img-container"></div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam porta, nisl ut varius
            malesuada, quam ipsum pharetra augue, ac suscipit enim tortor a mi. Curabitur ut semper
            quam, vitae commodo nisl. In in pellentesque neque. Pellentesque et augue elit. Duis
            vulputate massa vel ligula venenatis, nec vestibulum nisi vehicula.
          </p>
          <div>
            <button className="cta">
              <p>Call To Action</p>
              <span className="cta-arrow">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero(props) {
  const [scroll, setScroll] = useState();
  const [windowWidth, setWindowWidth] = useState();

  useEffect(() => {
    setWindowWidth(window.innerWidth && window.innerWidth <= 600);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScroll(window.scrollY);
    });
  }, []);

  document.addEventListener('scroll', () => {
    const el = document.getElementById('Navigation');
    if (el) {
      if (scroll >= 280) {
        el.classList.add('fixed_navbar');
      } else {
        el.classList.remove('fixed_navbar');
      }
    }
  });

  return (
    <div>
      <div className="hero-container">
        <div className={`hero-container-inner${scroll ? ' scrolled' : ''}`}>
          <header className="page-header">
            <div className="half">
              <h2>{scroll ? 'Blank Slate' : 'Blank Slate'}</h2>
              {!windowWidth && !scroll ? (
                <>
                  <p
                    className={`${scroll ? ' scrollpara' : ' notscrolled'}`}
                    style={{ fontSize: '18px !important', fontWeight: '500' }}
                  >
                    Start from scratch to create the perfect ball glove for you. With limitless
                    possibilities, the Blank Slate is the ultimate creative expression on the
                    diamond.
                  </p>
                  <div style={{ position: 'relative', top: '6px' }} className="tags-container">
                    <ul className="tags">
                      <li className="tag-title">Tag</li>
                      <li style={{ color: 'white' }} className="main-tag">
                        Series
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                ''
              )}
              {windowWidth && (
                <>
                  <p
                    style={{
                      fontSize: '18px !important',
                      fontWeight: '500',
                      marginTop: '0px',
                      marginBottom: '30px',
                    }}
                  >
                    Start from scratch to create the perfect ball glove for you. With limitless
                    possibilities, the Blank Slate is the ultimate creative expression on the
                    diamond.
                  </p>
                  <div style={{ position: 'relative', top: '-16px' }} className="tags-container">
                    <ul className="tags">
                      <li className="tag-title">Tag</li>
                      <li style={{ color: 'white' }} className="main-tag">
                        Series
                      </li>
                    </ul>
                  </div>
                </>
              )}
              {!windowWidth && scroll ? (
                <>
                  <p
                    style={{
                      fontSize: '18px !important',
                      fontWeight: '500',
                      marginTop: '0px',
                    }}
                  >
                    Start from scratch to create the perfect ball glove for you. With limitless
                    possibilities, the Blank Slate is the ultimate creative expression on the
                    diamond.
                  </p>
                  <div style={{ position: 'relative', top: '6px' }} className="tags-container">
                    <ul className="tags">
                      <li className="tag-title">Tag</li>
                      <li style={{ color: 'white' }} className="main-tag">
                        Series
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                ''
              )}
            </div>
            <div className="button-container" id="Navigation">
              <div style={{ position: 'relative' }} className="cta-container cta-hero">
                <NavLink className="cta" onClick={props.handleOpen} to="/stage-two">
                  <div>
                    {!windowWidth && (
                      <p className="">{scroll ? 'Call To Action' : 'Call To Action'}</p>
                    )}
                    {windowWidth && (
                      <p
                        style={{
                          height: '30px',
                          alignSelf: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0px 0px',
                        }}
                      >
                        Call To Action
                      </p>
                    )}
                  </div>
                  <div>
                    <span>&rarr;</span>
                  </div>
                </NavLink>
              </div>
            </div>
          </header>
        </div>
        <Filters filters={['Filter 1', 'Filter 2', 'Filter 3', 'Filter 4']} />
        <div className={`${scroll ? 'gradients' : 'disablefilter'}`}></div>
      </div>
    </div>
  );
}

function Card(props) {
  return (
    <div className="card-container" onClick={props.handleOpen}>
      <div className="tagandtitle">
        <div className="card-header">
          <h2>Title</h2>
          <div>
            <button className="info-button">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 0C8.8174 0 5.76502 1.26434 3.5147 3.5147C1.26433 5.76528 0 8.81729 0 12C0 15.1827 1.26433 18.235 3.5147 20.4853C5.76528 22.7357 8.81729 24 12 24C15.1827 24 18.235 22.7357 20.4853 20.4853C22.7357 18.2347 24 15.1827 24 12C24 8.81729 22.7357 5.76502 20.4853 3.5147C18.2347 1.26434 15.1827 0 12 0ZM12 21.3335C9.52455 21.3335 7.15061 20.3501 5.40044 18.5996C3.64995 16.8493 2.66659 14.4754 2.66659 12.0001C2.66659 9.52471 3.64995 7.15067 5.40044 5.40049C7.15072 3.65 9.52465 2.66664 12 2.66664C14.4753 2.66664 16.8494 3.65 18.5996 5.40049C20.35 7.15077 21.3334 9.52471 21.3334 12.0001C21.3334 13.6384 20.9021 15.2479 20.0828 16.6667C19.2637 18.0857 18.0855 19.2639 16.6665 20.083C15.2477 20.9023 13.6382 21.3336 11.9998 21.3336L12 21.3335Z"
                  fill="#ffffff"
                />
                <path
                  d="M13.3331 6.66661C13.3331 7.40283 12.7362 7.99988 11.9998 7.99988C11.2635 7.99988 10.6666 7.40283 10.6666 6.66661C10.6666 5.93017 11.2635 5.33313 11.9998 5.33313C12.7362 5.33313 13.3331 5.93017 13.3331 6.66661Z"
                  fill="#ffffff"
                />
                <path
                  d="M12 9.33336C11.6464 9.33336 11.3071 9.47393 11.0571 9.72397C10.8071 9.974 10.6667 10.3131 10.6667 10.6668V17.3334V17.3332C10.6667 17.8098 10.9209 18.2499 11.3334 18.4881C11.7459 18.7263 12.2541 18.7263 12 18.4881C13.0792 18.2499 13.3333 17.8098 13.3333 17.3332V10.6666C13.3333 10.3129 13.1929 9.97378 12.9429 9.72376C12.6929 9.47374 12.3536 9.33315 12 9.33315L12 9.33336Z"
                  fill="#ffffff"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="tags-container">
          <ul className="tags">
            <li className="tag-title">Tag</li>
            <li className="main-tag">Series</li>
          </ul>
          <ul className="tags regular-tags">
            <li>Regular Tag</li>
          </ul>
        </div>
      </div>
      <div className="img-container"></div>
      <div className="firstButton">
        <button
          className="cta secondary"
          style={{ zIndex: 99 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.handleOpenBuild();
          }}
        >
          <p>Call To Action</p>
          <span className="cta-card-arrow">&rarr;</span>
        </button>
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
  SelectColor2,
  SelectImage,
  SelectInput,
  TextOptions,
  ColorOption,
  WebOption,
  NameOptions,
  ColorCircle,
  ColorCircle2,
  BuildModal,
  Modal,
  Hero,
  Card,
  Filters,
  UI
};
