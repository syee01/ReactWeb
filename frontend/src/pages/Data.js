import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/data.css';
import { useNavigate } from 'react-router-dom';

// Tab component for country selection
const Tab = ({ name, isSelected, onClick }) => (
  <button
    className={`tab ${isSelected ? 'selected' : ''}`}
    onClick={() => onClick(name)}
  >
    {name}
  </button>
);

// Category component for category selection
const Category = ({ name, isSelected, onClick }) => (
  <button
    className={`category ${isSelected ? 'selected' : ''}`}
    onClick={() => onClick(name)}
  >
    {name}
  </button>
);

// Main Data component
const Data = () => {
  const [selectedCountry, setSelectedCountry] = useState('MALAYSIA');
  const [selectedCategory, setSelectedCategory] = useState('Products');
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filter, setFilter] = useState('');
  const [visibleRows, setVisibleRows] = useState(5);
  const [filterBy, setFilterBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const handleEdit = (productId, country) => {
    navigate(`/editProduct/${productId}?country=${country}`);
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
      let endpoint = '';
      if (selectedCountry === 'THAILAND') {
        endpoint = 'http://localhost:8085/thaiproduct';
      } else if (selectedCountry === 'KOREA') {
        endpoint = 'http://localhost:8085/krproduct';
      } else {
        // Default to MALAYSIA
        endpoint = 'http://localhost:8085/masproduct';
      }
      const response = await axios.get(endpoint);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setIsFetching(false);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const getStatus = (dateString) => {
    if (!dateString) return 'Unknown';
    const today = new Date();
    const expiredDate = new Date(dateString.split('T')[0]);
    return expiredDate < today ? 'Expired' : 'Active';
  };

  const filteredProducts = products.filter((product) => {
    const productName = product.name || "";
    const productBrand = product.brand || "";
    
    const matchesFilter = filterBy === 'name'
      ? productName.toLowerCase().includes(filter)
      : productBrand.toLowerCase().includes(filter);
    
    if (selectedCountry === 'KOREA') {
      return matchesFilter;
    }
    
    if (statusFilter === 'Active' || statusFilter === 'Expired') {
      const status = getStatus(product.date);
      return matchesFilter && status === statusFilter;
    }
    
    return matchesFilter;
  });

  useEffect(() => {
    setVisibleRows(5); // Reset visible rows on product change
  }, [products]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setVisibleRows((prevVisibleRows) => prevVisibleRows + 5);
    }
  };

  const displayedProducts = filteredProducts.slice(0, visibleRows);

  const getImageUrl = (country, imageURL) => {
    switch (country) {
      case 'MALAYSIA':
        return `http://localhost:8085/images/malaysiaProductImage/${imageURL}`;
      case 'KOREA':
        return `http://localhost:8085/images/koreaProductImage/${imageURL}`;
      case 'THAILAND':
        return `http://localhost:8085/images/thailandProductImage/${imageURL}`;
      default:
        return ''; // Default case or you can put a placeholder image
    }
  };

  return (
    <div>
      <div className="tabs">
        {countries.map((country) => (
          <Tab key={country} name={country} isSelected={selectedCountry === country} onClick={setSelectedCountry} />
        ))}
      </div>
      <div className="categories">
        {categories.map((category) => (
          <Category key={category} name={category} isSelected={selectedCategory === category} onClick={setSelectedCategory} />
        ))}
      </div>
      <div className="data-component">
        <div className="filter-controls">
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="filter-type-selector">
            <option value="name">Name</option>
            <option value="brand">Brand</option>
          </select>
          <input type="text" placeholder="Type to search..." className="filter-input" value={filter} onChange={handleFilterChange} />
        </div>
        <div className="content">
          {isFetching ? (
            <p>Loading...</p>
          ) : (
            selectedCategory === 'Products' && (
              <div className="scrollable-table-container" onScroll={handleScroll}>
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
                      <th>Image</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody className="table-scroll">
                    {displayedProducts.map((product) => (
                      <tr key={product.productID}>
                        <td>{product.productID}</td>
                        {selectedCountry !== 'KOREA' && <td>{product.date ? product.date.split('T')[0] : 'N/A'}</td>}
                        <td>{product.brand}</td>
                        <td>{product.name}</td>
                        {selectedCountry !== 'KOREA' && <td>{product.date ? getStatus(product.date) : 'Unknown'}</td>}
                        <td>
                        <img 
                            src={getImageUrl(selectedCountry, product.imageURL)} 
                            alt={product.name} 
                            style={{ width: '100px', height: 'auto' }} 
                          />
                        </td>
                        <td>
                          <button onClick={() => handleEdit(product.productID, selectedCountry)} className="edit-button">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Data;
