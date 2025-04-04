// import "./Modal.scss";

// function Modal(props) {
//   return (
//     <div className={`modal ${props.show ? "overrideModal" : " display-none"}`}>
//       <div className={`modal-content${props.show ? " animate-bottom" : ""}`}>
//         <div className="modal-header">
//           <h2 style={{fontSize:'34px', lineHeight: '16px'}}>{props.title}</h2>
//           <button
//             className="close-button"
//             onClick={props.handleClose}
//           >
//             <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M1 1L21 21M21 1L11 11L1 21" stroke="white" strokeWidth="2"/>
//             </svg>
//           </button>
//         </div>
//         <div className="modal-body">
//           <div className="tags-container">
//             <ul className="tags">
//               <li className="tag-title">Tag</li>
//               <li className="main-tag">Series</li>
//             </ul>
//             {/* <ul className="tags regular-tags">
//               <li>Regular</li>
//             </ul> */}
//           </div>
//           <div className="img-container"></div>
//           <p>
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam porta, nisl ut varius malesuada, quam ipsum pharetra augue, ac suscipit enim tortor a mi. Curabitur ut semper quam, vitae commodo nisl. In in pellentesque neque. Pellentesque et augue elit. Duis vulputate massa vel ligula venenatis, nec vestibulum nisi vehicula.
//           </p>
//           <div>
//             <button className="cta">
//               <p>Call To Action</p>
//               <span className="cta-arrow">&rarr;</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export { Modal };