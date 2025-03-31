import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Hero.scss';
import Filters from '../ui/Filters';

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
        if (scroll >= 280) {
            el.classList.add('fixed_navbar');
        } else {
            el.classList.remove('fixed_navbar');
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
                    Start from scratch to create the perfect ball glove for you. With limitless possibilities, the Blank Slate is the ultimate creative expression on the diamond.
                                    </p>
                                    <div
                                        style={{ position: 'relative', top: '6px' }}
                                        className="tags-container"
                                    >
                                        <ul className="tags">
                                            <li className="tag-title">Tag</li>
                                            <li style={{ color: 'white' }} className="main-tag">
                        Series
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            ) : ''}
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
                    Start from scratch to create the perfect ball glove for you. With limitless possibilities, the Blank Slate is the ultimate creative expression on the diamond.
                                    </p>
                                    <div
                                        style={{ position: 'relative', top: '-16px' }}
                                        className="tags-container"
                                    >
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
                                        Start from scratch to create the perfect ball glove for you. With limitless possibilities, the Blank Slate is the ultimate creative expression on the diamond.
                                    </p>
                                    <div
                                        style={{ position: 'relative', top: '6px' }}
                                        className="tags-container"
                                    >
                                        <ul className="tags">
                                            <li className="tag-title">Tag</li>
                                            <li style={{ color: 'white' }} className="main-tag">
                                                Series
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            ) : ''}
                        </div>
                        <div className="button-container" id="Navigation">
                            <div
                                style={{ position: 'relative' }}
                                className="cta-container cta-hero"
                            >
                                <NavLink
                                    className="cta"
                                    onClick={props.handleOpen}
                                    to="/stage-two"
                                    // to={{
                                    //     pathname: '/stage-two',
                                    //     state: { popup: true },
                                    // }}
                                >
                                    <div>
                                        {!windowWidth && (
                                            <p className="">
                                                {scroll ? 'Call To Action' : 'Call To Action'}
                                            </p>
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
                                {/* <button className="cta " onClick={props.handleOpen}>
                                    <div>
                                        {!windowWidth && (
                                            <p className="">
                                                {scroll ? 'Call To Action' : 'Call To Action'}
                                            </p>
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
                                </button> */}
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

export default Hero;
