import React, { useState } from 'react';
import './styles/Dropdown.css'; 
import { SlOptionsVertical } from 'react-icons/sl';

const Dropdown = ({ options, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`dropdown ${className}`}>
      <SlOptionsVertical onClick={toggleDropdown} className="dropdown-toggle"/> 
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option, index) => (
            <li key={index} className="dropdown-item">
              <a href={option.route}>
                {option.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;

