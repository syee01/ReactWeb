import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/data.css';
import { useNavigate } from 'react-router-dom';


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
  const [filter, setFilter] = useState('');
  const [visibleRows, setVisibleRows] = useState(5);
  const [filterBy, setFilterBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState(''); // Possible values: '', 'Active', 'Expired'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const handleEdit = (productId, country) => {
    navigate(`/editProduct/${productId}?country=${country}`);
  };
  

  const handleSave = (product) => {
    console.log('Saving product', product);
    setIsModalOpen(false);
    // Here you would send the update to your backend
  };

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
  
  const getStatus = (dateString) => {
    if (!dateString) return 'Unknown'; // Handle undefined or null dates
  
    const today = new Date();
    const expiredDate = new Date(dateString.split('T')[0]); // dateString is expected to be in ISO format
  
    return expiredDate < today ? 'Expired' : 'Active';
  };

  const filteredProducts = products.filter((product) => {
    // Match by name or brand, according to the filterBy state
    const matchesFilter = filterBy === 'name'
      ? product.name.toLowerCase().includes(filter)
      : product.brand.toLowerCase().includes(filter);
  
    // If the selected country is Korea, return the product if it matches the name/brand filter
    // without considering the status filter.
    if (selectedCountry === 'KOREA') {
      return matchesFilter;
    }
  
    // For other countries, apply the status filter if specified.
    if (statusFilter === 'Active' || statusFilter === 'Expired') {
      const status = getStatus(product.date);
      return matchesFilter && status === statusFilter;
    }
  
    // If no status filter is set, just return based on the name/brand match.
    return matchesFilter;
  });

  useEffect(() => {
    setVisibleRows(100);
  }, [products]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setVisibleRows(prevVisibleRows => prevVisibleRows + 5); // Load next 5 rows
    }
  };

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
    <div className="filter-controls">
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="filter-type-selector"
        >
          <option value="name">Name</option>
          <option value="brand">Brand</option>
        </select>
        <input
          type="text"
          placeholder="Type to search..."
          className="filter-input"
          value={filter}
          onChange={handleFilterChange}
        />
      </div>
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
            {selectedCountry !== 'KOREA' && (
              <th>
                Status
              <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-selector"
              style={{ marginLeft: '10px' }}
              disabled={selectedCountry === 'KOREA'} // Disable the dropdown for Korea
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
              </th>
            )}
            <th>Edit</th> 
          </tr>
        </thead>
        <tbody className="table-scroll">
        {displayedProducts.map((product) => (
          <tr key={product.productID}>
            <td>{product.productID}</td>
            {selectedCountry !== 'KOREA' && (
              <td>{product.date ? product.date.split('T')[0] : 'N/A'}</td>
            )}
            <td>{product.brand}</td>
            <td>{product.name}</td>
            {selectedCountry !== 'KOREA' && (
              <td>{product.date ? getStatus(product.date) : 'Unknown'}</td>
            )}
            <td>
            <button onClick={() => handleEdit(product.productID, selectedCountry)} className="edit-button">Edit</button>
            </td>
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
