import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditRestaurantPage = ({ restaurantData, country, onClose, onSave }) => {
  const restaurantId = restaurantData.restaurantID;
  const [editedRestaurant, setEditedRestaurant] = useState({
    name: '',
    address: '',
    region: '',
    date: '',
    ...restaurantData
  });
  const [isFetching, setIsFetching] = useState(false);

  let datacountry = '';

  switch (restaurantData.country) {
    case 'THAILAND':
      datacountry = 'thailand';
      break;
    case 'MALAYSIA':
      datacountry = 'malaysia';
      break;
    case 'KOREA':
      datacountry = 'korea';
      break;
    default:
      // Handle other cases or default case as needed
      break;
  }

  useEffect(() => {
    const fetchRestaurant = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`http://localhost:8085/${datacountry}/restaurant/${restaurantId}`);
        setEditedRestaurant(response.data);
      } catch (error) {
      console.error('Error fetching restaurant:', error);
      }
      setIsFetching(false);
    };

    fetchRestaurant();
  }, [restaurantId, datacountry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRestaurant({ ...editedRestaurant, [name]: value });
  };
  
  const handleSave = async (event) => {
    event.preventDefault();
    
    const data = {
      country: datacountry,
      name: editedRestaurant.name,
      address: editedRestaurant.address,
      region: editedRestaurant.region,
      date: editedRestaurant.date,
  };
    try {
      const response = await axios.put(`http://localhost:8085/${datacountry}restaurant/${restaurantId}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (onSave) onSave();
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error saving restaurant:', error);
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!editedRestaurant) return <div>Restaurant not found.</div>;

  return (
    <div className='edit-product-modal'>
      <h2>Edit Restaurant</h2>
      <form onSubmit={handleSave}>
      <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={editedRestaurant.name || ''}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="address"
            value={editedRestaurant.address|| ''}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            name="region"
            value={editedRestaurant.region|| ''}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label>Expired Date:</label>
          <input
            type="date"
            name="date"
            value={editedRestaurant.date ? editedRestaurant.date.split('T')[0] : ''}
            onChange={handleInputChange}
            disabled={restaurantData.country !== 'MALAYSIA'}
          />
        </div>
        <div className="buttoncontainer">
          <button type="submit" className="form-button save-button">Save</button>
          <button type="button" onClick={onClose} className="form-button cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurantPage;
