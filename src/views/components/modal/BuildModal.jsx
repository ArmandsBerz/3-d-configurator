import React, { useContext, useEffect, useState } from 'react';
import './BuildModal.scss';
import "./Modal.scss";
import SelectImage from '../ui/SelectImage';
import SelectBuild from '../ui/SelectBuild';
import { configBuild, playerPosition } from '../../../helpers/config';
import { useAppDispatch, useAppSelector, buildSlice } from '../../../store/rootReducer';

function BuildModal(props) {
    const [positionName, setPositionName] = useState(configBuild.Position[0]);

    const { pallette, size, stiffness, position, handSize, hand } = useAppSelector((state) => state.buildReducer);
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
        <div className={`${props.stage === 'two' ? 'build-modal-two ' : ' build-modal'} ${props.show ? ' BuildModalShow ' : ' display-none'}`}>
            <div className={`build-modal-content${props.show ? ' animate-bottom' : ''}`}>
                {/* {getBuild()} */}
                <div className="build-modal-header">
                    {props.stage === 'two' && <h2 style={{ color: 'white', fontSize: '16px' }}>{props.title}</h2>}
                    {props.stage === 'one' && <h2 style={{ color: 'white', fontSize: '36px' }}>{props.title}</h2>}
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

function Modal(props) {
    return (
        <div className={`modal ${props.show ? "overrideModal" : " display-none"}`}>
            <div className={`modal-content${props.show ? " animate-bottom" : ""}`}>
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
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam porta, nisl ut varius malesuada, quam ipsum
                        pharetra augue, ac suscipit enim tortor a mi. Curabitur ut semper quam, vitae commodo nisl. In in pellentesque neque.
                        Pellentesque et augue elit. Duis vulputate massa vel ligula venenatis, nec vestibulum nisi vehicula.
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

export { BuildModal, Modal };
