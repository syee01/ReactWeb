import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditPrayerRoomPage = ({ prayerRoomData, onClose, onSave, country, isAdding }) => {
  const mosqueprId = prayerRoomData ? prayerRoomData.mosqueprID : null;
  const [editedPrayerRoom, setEditedPrayerRoom] = useState({
    name: '',
    location: '',
    state: '',
    district: '',
    ...prayerRoomData
  });
  const [isFetching, setIsFetching] = useState(false);

  // Initialize datacountry based on the country from prayerRoomData or from props
  let datacountry = '';
  if (prayerRoomData && prayerRoomData.country) {
    switch (prayerRoomData.country) {
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
        break;
    }
  } else {
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
        break;
    }
  }

  useEffect(() => {
    const fetchMosque = async () => {
      if (!isAdding && mosqueprId) {
        setIsFetching(true);
        try {
          const response = await axios.get(`http://localhost:8085/${datacountry}/pr/${mosqueprId}`);
          setEditedPrayerRoom(response.data);
        } catch (error) {
          console.error('Error fetching mosque:', error);
        }
        setIsFetching(false);
      }
    };

    fetchMosque();
  }, [mosqueprId, datacountry, isAdding]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPrayerRoom(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    const data = {
      name: editedPrayerRoom.name,
      address: editedPrayerRoom.address,
      state: editedPrayerRoom.state,
      district: editedPrayerRoom.district,
      status: 'reviewed',  // Assume default status is 'reviewed'
    };

    const apiEndpoint = isAdding ? 
      `http://localhost:8085/${datacountry}pr/add` : 
      `http://localhost:8085/${datacountry}pr/${mosqueprId}`;

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
      onClose(); 
    } catch (error) {
      console.error('Error saving prayer room:', error);
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!isAdding && !editedPrayerRoom) return <div>Prayer Room not found.</div>;

  return (
    <div className='edit-product-modal'>
      <h2>{isAdding ? 'Add New Prayer Room' : 'Edit Prayer Room'}</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={editedPrayerRoom.name || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label>Location:</label>
          <input type="text" name="address" value={editedPrayerRoom.address || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label>State:</label>
          <input type="text" name="state" value={editedPrayerRoom.state || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label>District:</label>
          <input type="text" name="district" value={editedPrayerRoom.district || ''} disabled={datacountry !== 'malaysia'} onChange={handleInputChange} className="form-input" />
        </div>
        <div className="buttoncontainer">
          <button type="submit" className="form-button save-button">Save</button>
          <button type="button" onClick={onClose} className="form-button cancel-button">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditPrayerRoomPage;
