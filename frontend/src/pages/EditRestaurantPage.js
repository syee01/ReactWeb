import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditRestaurantPage = ({ restaurantData, onClose, onSave, country, isAdding }) => {
  const restaurantId = restaurantData ? restaurantData.restaurantID : null;
  const [editedRestaurant, setEditedRestaurant] = useState({
    name: '',
    address: '',
    region: '',
    date: '',
    ...restaurantData
  });
  const [isFetching, setIsFetching] = useState(false);

  let datacountry = '';
  // Ensure restaurantData is defined before accessing its properties
  if (restaurantData) {
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
        datacountry = ''; // default or error handling
        break;
    }
  }
  else{
    switch (country) {
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
        datacountry = ''; // default or error handling
        break;
    }
  }


  useEffect(() => {
    const fetchRestaurant = async () => {
      if (restaurantId && datacountry) { // Ensure restaurantId and datacountry are set
        setIsFetching(true);
        try {
          const response = await axios.get(`http://localhost:8085/${datacountry}/restaurant/${restaurantId}`);
          setEditedRestaurant(response.data);
        } catch (error) {
          console.error('Error fetching restaurant:', error);
        }
        setIsFetching(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId, datacountry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRestaurant(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async (event) => {
    event.preventDefault();
    
    const data = {
      country: datacountry,
      name: editedRestaurant.name,
      address: editedRestaurant.address,
      region: editedRestaurant.region,
      date: editedRestaurant.date,
      status: 'reviewed',
      description: editedRestaurant.description,
      category: editedRestaurant.category,
    };
  
    const apiEndpoint = isAdding ? 
        `http://localhost:8085/${datacountry}restaurant/add` : 
        `http://localhost:8085/${datacountry}restaurant/${restaurantId}`;
  
    try {
      const response = await axios({
        method: isAdding ? 'post' : 'put',
        url: apiEndpoint,
        data: data,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (onSave) onSave(response.data);
      isAdding ? 
      alert("Data is submitted successfully "): 
      alert("Data is edited successfully");
      onClose(); 
    } catch (error) {
      console.error('Error saving restaurant:', error);
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!isAdding && !editedRestaurant) return <div>Restaurant not found.</div>;

  return (
    <div className='edit-product-modal'>
      <h2>{isAdding ? 'Add New Restaurant' : 'Edit Restaurant'}</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={editedRestaurant.name || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label>Location:</label>
          <input type="text" name="address" value={editedRestaurant.address || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label>State:</label>
          <input type="text" name="region" value={editedRestaurant.region || ''} onChange={handleInputChange} className="form-input" />
        </div>
        {restaurantData && restaurantData.country === 'MALAYSIA' && (
          <div>
            <label>Expired Date:</label>
            <input type="date" name="date" value={editedRestaurant.date ? editedRestaurant.date.split('T')[0] : ''} onChange={handleInputChange} />
          </div>
        )}
        <div>
        <label>Description:</label>
          <input type="text" name="description" value={editedRestaurant.description || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
        <label>Category:</label>
          <input type="text" name="description" value={editedRestaurant.category || ''} onChange={handleInputChange} className="form-input" />
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
