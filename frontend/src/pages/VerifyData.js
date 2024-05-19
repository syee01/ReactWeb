import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/verifyData.css'; // Make sure the path is correct
import ProductDetailsModal from './VerifyProduct';

const countries = ['MALAYSIA', 'THAILAND', 'KOREA'];
const categories = ['Products', 'Restaurants', 'Mosques', 'Prayer Room'];

const Tab = ({ name, isSelected, onClick }) => (
  <button className={`tab ${isSelected ? 'selected' : ''}`} onClick={() => onClick(name)}>{name}</button>
);

const Category = ({ name, isSelected, onClick }) => (
  <button className={`category ${isSelected ? 'selected' : ''}`} onClick={() => onClick(name)}>{name}</button>
);

const VerifyData = () => {
  const [selectedCountry, setSelectedCountry] = useState('MALAYSIA');
  const [selectedCategory, setSelectedCategory] = useState('Products');
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedCountry, selectedCategory]);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const endpoint = `http://localhost:8085/${selectedCountry.toLowerCase()}/${selectedCategory.toLowerCase()}/reviewed`;
      const response = await axios.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsFetching(false);
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
  };

  const closeViewModal = () => {
    setViewingProduct(null);
  };

  return (
    <div>
      <div className="tabs">
        {countries.map(country => (
          <Tab key={country} name={country} isSelected={selectedCountry === country} onClick={setSelectedCountry} />
        ))}
      </div>
      <div className="categories">
        {categories.map(category => (
          <Category key={category} name={category} isSelected={selectedCategory === category} onClick={setSelectedCategory} />
        ))}
      </div>
      <div className="data-component">
        {isFetching ? <p>Loading...</p> : (
          data.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.details}</td>
                    <td>{item.status}</td>
                    <td>
                      <button onClick={() => handleViewProduct(item)}>Verify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No item found.</p>
        )}
      </div>
      {viewingProduct && <ProductDetailsModal productData={viewingProduct} country={selectedCountry} onClose={closeViewModal} />}
    </div>
  );
};

export default VerifyData;