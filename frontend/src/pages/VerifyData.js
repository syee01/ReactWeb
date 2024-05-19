import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/verifyData.css'; 
import ProductDetailsModal from './VerifyProduct';
import RestaurantDetailsModal from './VerifyRestaurant';
import MosqueDetailsModal from './VerifyMosque';
import PrayerRoomDetailsModal from './VerifyPrayerRoom';

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
  const [viewingDetail, setViewingDetail] = useState(null);

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

  const handleViewDetails = (item) => {
    const idField = getIdField(selectedCategory);
    setViewingDetail({ ...item, id: item[idField] });
  };

  const getIdField = (category) => {
    switch (category) {
      case 'Products':
        return 'productID';
      case 'Restaurants':
        return 'restaurantID';
      case 'Mosques':
      case 'Prayer Room':
        return 'mosqueprID';
      default:
        return 'id'; // Default ID field if not specified
    }
  };

  const closeViewModal = () => {
    setViewingDetail(null);
  };

  const renderDetailsModal = () => {
    if (!viewingDetail) return null;
    
    switch (selectedCategory) {
      case 'Products':
        return <ProductDetailsModal productData={viewingDetail} country={selectedCountry} onClose={closeViewModal} />;
      case 'Restaurants':
        return <RestaurantDetailsModal restaurantData={viewingDetail} country={selectedCountry} onClose={closeViewModal} />;
      case 'Mosques':
        return <MosqueDetailsModal mosqueData={viewingDetail} country={selectedCountry} onClose={closeViewModal} />;
      case 'Prayer Room':
        return <PrayerRoomDetailsModal prayerRoomData={viewingDetail} country={selectedCountry} onClose={closeViewModal} />;
      default:
        return null;
    }
  };

  return (
    <div>
    <div className='reportTitle'>
        <h2 className="reportTitle">Data Verification</h2>
      </div>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item[getIdField(selectedCategory)]}>
                    <td>{item[getIdField(selectedCategory)]}</td>
                    <td>{item.name}</td>
                    <td>{item.status}</td>
                    <td>
                      <button onClick={() => handleViewDetails(item)} className='verify-btn'>Verify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No item required to be verified.</p>
        )}
      </div>
      {renderDetailsModal()}
    </div>
  );
};

export default VerifyData;
