import React, { useState } from 'react';
import '../cssFolder/data.css'

const Tab = ({ name, isSelected, onClick }) => (
  <button
    className={`tab ${isSelected ? 'selected' : ''}`}
    onClick={() => onClick(name)}
  >
    {name}
  </button>
);

const Category = ({ name, isSelected, onClick }) => (
  <button
    className={`category ${isSelected ? 'selected' : ''}`}
    onClick={() => onClick(name)}
  >
    {name}
  </button>
);

const Data = () => {
  const [selectedCountry, setSelectedCountry] = useState('MALAYSIA');
  const [selectedCategory, setSelectedCategory] = useState('Products');

  const countries = ['MALAYSIA', 'THAILAND', 'KOREA'];
  const categories = ['Products', 'Restaurants', 'Mosques', 'Prayer Room'];

  return (
    <div className="data-component">
      <div className="tabs">
        {countries.map((country) => (
          <Tab
            key={country}
            name={country}
            isSelected={selectedCountry === country}
            onClick={setSelectedCountry}
          />
        ))}
      </div>
      <div className="categories">
        {categories.map((category) => (
          <Category
            key={category}
            name={category}
            isSelected={selectedCategory === category}
            onClick={setSelectedCategory}
          />
        ))}
      </div>
      <div className="content">
        {/* Content based on the selected tab and category */}
      </div>
      <div className="add-new-data">
        <button className="add-data-button">Add New Data +</button>
      </div>
    </div>
  );
};

export default Data;
