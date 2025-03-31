import "./Filters.scss";
import { useEffect, useState } from "react";

function Filters(props) {
  const [selected, setSelected] = useState(props.filters[0]);

  const handleSelection = (option) => {
    setSelected(option);
  }
  const [scroll, setScroll] = useState();
  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScroll(window.scrollY);
    });
  }, []);

  // document.addEventListener('scroll', function () {
  //   const el = document.getElementById('Navigation');
  //   if (scroll >= 280) {
  //     el.classList.add('fixed_navbar');
  //   } else {
  //     el.classList.remove('fixed_navbar');
  //   }
  // });


  return (
    <div  className="filters-container">
      <div className="filters-desktop flex pt-2">
        {
          props.filters.map((filter, index) => {
            return (
              <button
                key={index}
                value={filter}
                className={`filter${filter === selected ? ' active' : ''} mr-2 text-xl filterBtn`}
                onClick={() => handleSelection(filter)}
              >{filter}</button>
            );
          })
        }
      </div>
      <select
      style={{backgroundColor:'black !important',fontSize:'20px'}}
        className="filters-mobile"
        onChange={(e) => handleSelection(e.target.value)}
      >
        {
          props.filters.map((filter, index) => {
            return (
              <option
              style={{backgroundColor:'black'}}
                key={index}
                value={filter}
              >{filter}</option>
            );
          })
        }
      </select>
    </div>
  ) 
}

export default Filters;