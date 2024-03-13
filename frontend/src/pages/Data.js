import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/data.css';

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
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [visibleRows, setVisibleRows] = useState(5);

  const countries = ['MALAYSIA', 'THAILAND', 'KOREA'];
  const categories = ['Products', 'Restaurants', 'Mosques', 'Prayer Room'];

  useEffect(() => {
    if (selectedCountry === 'MALAYSIA' && selectedCategory === 'Products') {
      fetchProducts();
    }
  }, [selectedCountry, selectedCategory]);


  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      // Replace with your actual API endpoint
      const response = await axios.get('http://localhost:8085/masproduct');
      setProducts(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching products:', error);
      console.log(error.response.data)
    }
    setIsFetching(false);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };


  useEffect(() => {
    setVisibleRows(5);
  }, [products]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setVisibleRows(prevVisibleRows => prevVisibleRows + 5); // Load next 5 rows
    }
  };

  // Filter products based on the filter state
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(filter) ||
    product.brand.toLowerCase().includes(filter) ||
    product.id.toString().toLowerCase().includes(filter)
  );

  const displayedProducts = filteredProducts.slice(0, visibleRows);



  return (
    <div>
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
    <div className="data-component">
    <input
      type="text"
      placeholder="Type to filter..."
      className="filter-input"
      value={filter}
      onChange={handleFilterChange}
    />
      <div className="content">
        {isFetching ? (
          <p>Loading...</p>
        ) : selectedCountry === 'MALAYSIA' && selectedCategory === 'Products' ? (
          <div className="scrollable-table-container"
          onScroll={handleScroll} >
          <table>
            <thead>
              <tr>
              <th>Product ID</th>
              <th>Expired Date</th>
              <th>Brand</th>
              <th>Name</th>
              </tr>
            </thead>
            <tbody className="table-scroll">
                {filteredProducts.map((product) => (
                    <tr key={product.id}>
                    <td>{product.productID}</td>
                    <td>{product.date}</td>
                    <td>{product.brand}</td>
                    <td>{product.name}</td>
                    </tr>
                ))}
            </tbody>
          </table>
          </div>
        ) : null}
      </div>
      <div className="add-new-data">
        {/* ... */}
        {/* <button className="add-data-button">Add New Data +</button> */}
      </div>
    </div>
    </div>
  );
};

export default Data;
