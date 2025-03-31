import "./Card.scss";

function Card(props) {
  return (
    <div className="card-container" onClick={props.handleOpen}>
    {/* <div className="card-container"> */}
      <div className="tagandtitle">
      <div className="card-header">
        <h2>Title</h2>
        <div>
          <button
            className="info-button"
            // onClick={props.handleOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C8.8174 0 5.76502 1.26434 3.5147 3.5147C1.26433 5.76528 0 8.81729 0 12C0 15.1827 1.26433 18.235 3.5147 20.4853C5.76528 22.7357 8.81729 24 12 24C15.1827 24 18.235 22.7357 20.4853 20.4853C22.7357 18.2347 24 15.1827 24 12C24 8.81729 22.7357 5.76502 20.4853 3.5147C18.2347 1.26434 15.1827 0 12 0ZM12 21.3335C9.52455 21.3335 7.15061 20.3501 5.40044 18.5996C3.64995 16.8493 2.66659 14.4754 2.66659 12.0001C2.66659 9.52471 3.64995 7.15067 5.40044 5.40049C7.15072 3.65 9.52465 2.66664 12 2.66664C14.4753 2.66664 16.8494 3.65 18.5996 5.40049C20.35 7.15077 21.3334 9.52471 21.3334 12.0001C21.3334 13.6384 20.9021 15.2479 20.0828 16.6667C19.2637 18.0857 18.0855 19.2639 16.6665 20.083C15.2477 20.9023 13.6382 21.3336 11.9998 21.3336L12 21.3335Z" fill="#ffffff"/>
              <path d="M13.3331 6.66661C13.3331 7.40283 12.7362 7.99988 11.9998 7.99988C11.2635 7.99988 10.6666 7.40283 10.6666 6.66661C10.6666 5.93017 11.2635 5.33313 11.9998 5.33313C12.7362 5.33313 13.3331 5.93017 13.3331 6.66661Z" fill="#ffffff"/>
              <path d="M12 9.33336C11.6464 9.33336 11.3071 9.47393 11.0571 9.72397C10.8071 9.974 10.6667 10.3131 10.6667 10.6668V17.3334V17.3332C10.6667 17.8098 10.9209 18.2499 11.3334 18.4881C11.7459 18.7263 12.2541 18.7263 12.6667 18.4881C13.0792 18.2499 13.3333 17.8098 13.3333 17.3332V10.6666C13.3333 10.3129 13.1929 9.97378 12.9429 9.72376C12.6929 9.47374 12.3536 9.33315 12 9.33315L12 9.33336Z" fill="#ffffff"/>
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
          style={{zIndex: 99}}
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
};

export default Card;