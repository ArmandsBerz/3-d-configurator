import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './BuildModal.scss';
import './Modal.scss';
import '../../../views/components/stage1/Hero.scss';
import '../../../views/components/stage1/Card.scss';
import '../../../views/components/ui/Filters.scss';
import { SelectImage } from '../ui/SelectImage';
import { SelectBuild } from '../../../components/selectGroup.jsx';
import { configBuild, playerPosition } from '../../../helpers/config';
import { useAppDispatch, useAppSelector, buildSlice } from '../../../store/rootReducer';

// Filters Component
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

  // The following code is commented out as in the original file.
  // document.addEventListener('scroll', function () {
  //   const el = document.getElementById('Navigation');
  //   if (scroll >= 280) {
  //     el.classList.add('fixed_navbar');
  //   } else {
  //     el.classList.remove('fixed_navbar');
  //   }
  // });

  return (
    <div className="filters-container">
      <div className="filters-desktop flex pt-2">
        {props.filters.map((filter, index) => {
          return (
            <button
              key={index}
              value={filter}
              className={`filter${filter === selected ? ' active' : ''} mr-2 text-xl filterBtn`}
              onClick={() => handleSelection(filter)}
            >
              {filter}
            </button>
          );
        })}
      </div>
      <select
        style={{ backgroundColor: 'black !important', fontSize: '20px' }}
        className="filters-mobile"
        onChange={(e) => handleSelection(e.target.value)}
      >
        {props.filters.map((filter, index) => {
          return (
            <option
              style={{ backgroundColor: 'black' }}
              key={index}
              value={filter}
            >
              {filter}
            </option>
          );
        })}
      </select>
    </div>
  );
}

// BuildModal Component
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
      const obj = {
        text: item,
        value: index,
        id: index,
      };
      arr.push(obj);
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 1L21 21M21 1L11 11L1 21" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>
        <div className="build-modal-body">
          {getBuild()}
          {!props.stage === 'two' && (
            <div className="build-modal-btn">
              <button className="cta mt-4" onClick={props.handleClose}>
                <p>Call To Action</p>
                <span>&rarr;</span>
              </button>
            </div>
          )}
          {props.stage === 'one' && (
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

// Modal Component
function Modal(props) {
  return (
    <div className={`modal ${props.show ? 'overrideModal' : ' display-none'}`}>
      <div className={`modal-content${props.show ? ' animate-bottom' : ''}`}>
        <div className="modal-header">
          <h2 style={{ fontSize: '34px', lineHeight: '16px' }}>{props.title}</h2>
          <button className="close-button" onClick={props.handleClose}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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

// Hero Component
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
                        className=""
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

// Card Component
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

export { BuildModal, Modal, Hero, Card, Filters };
