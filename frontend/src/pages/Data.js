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
    if (selectedCategory === 'Products') {
      fetchProducts();
    }
  }, [selectedCountry, selectedCategory]);


  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      let endpoint = ''
      // Dynamically set the endpoint based on the selected country
      if (selectedCountry === 'THAILAND') {
        endpoint = 'http://localhost:8085/thaiproduct'; // Example endpoint for Thai products
      } else if (selectedCountry === 'KOREA') {
        endpoint = 'http://localhost:8085/krproduct'; // Example endpoint for Korean products
      } else if (selectedCountry === 'MALAYSIA') {
        endpoint = 'http://localhost:8085/masproduct'; // Existing endpoint for Malaysian products
      }
  
      const response = await axios.get(endpoint);
      setProducts(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Handle error based on error.response.data if available
      if (error.response && error.response.data) {
        console.log(error.response.data);
      } else {
        console.log('Error fetching data');
      }
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
        ) : selectedCategory === 'Products' ? (
          <div className="scrollable-table-container"
          onScroll={handleScroll} >
          <table>
            <thead>
              <tr>
              <th>ID</th>
              {selectedCountry !== 'KOREA' && <th>Expired Date</th>}
              <th>Brand</th>
              <th>Name</th>
              </tr>
            </thead>
            <tbody className="table-scroll">
                {filteredProducts.map((product) => (
                    <tr key={product.id}>
                    <td>{product.productID}</td>
                    {selectedCountry !== 'KOREA' && <td>{product.date.split('T')[0]}</td>}
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
