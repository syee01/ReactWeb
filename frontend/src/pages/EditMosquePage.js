import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditMosquePage = ({ mosqueData, country, onClose, onSave }) => {
  const mosqueprId = mosqueData.mosqueprID;
  const [editedMosque, setEditedMosque] = useState({
    name: '',
    address: '',
    state: '',
    district: '',
    ...mosqueData
  });
  const [isFetching, setIsFetching] = useState(false);

  let datacountry = '';

  switch (mosqueData.country) {
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
    const fetchMosque = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`http://localhost:8085/${datacountry}/mosque/${mosqueprId}`);
        setEditedMosque(response.data);
      } catch (error) {
      console.error('Error fetching mosque:', error);
      }
      setIsFetching(false);
    };

    fetchMosque();
  }, [mosqueprId, datacountry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMosque({ ...editedMosque, [name]: value });
  };
  
  const handleSave = async (event) => {
    event.preventDefault();
    
    const data = {
      country: datacountry,
      name: editedMosque.name,
      address: editedMosque.address,
      state: editedMosque.state,
      district: editedMosque.district,
  };

    try {
      const response = await axios.put(`http://localhost:8085/${datacountry}mosque/${mosqueprId}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (onSave) onSave();
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error saving mosque:', error);
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!editedMosque) return <div>Mosque not found.</div>;

  return (
    <div className='edit-product-modal'>
      <h2>Edit Mosque</h2>
      <form onSubmit={handleSave}>
      <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={editedMosque.name || ''}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="address"
            value={editedMosque.address|| ''}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            name="state"
            value={editedMosque.state|| ''}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label>District:</label>
          <input
            type="text"
            name="district"
            value={editedMosque.district|| ''}
            disabled={mosqueData.country !== 'MALAYSIA'}
            onChange={handleInputChange}
            className="form-input"
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

export default EditMosquePage;
