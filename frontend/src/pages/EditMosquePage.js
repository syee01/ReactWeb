import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditMosquePage = () => {
  const { mosqueprId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [editedMosque, setEditedMosque] = useState({
    name: '',
    location: '',
    state: '',
    district: '',
  });
  const [isFetching, setIsFetching] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const country = searchParams.get('country');
  let datacountry = '';

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
      // Handle other cases or default case as needed
      break;
  }

  useEffect(() => {
    const fetchMosque = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`http://localhost:8085/${datacountry}mosque/${mosqueprId}`);
        console.log(mosqueprId)
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
    
    const formData = new FormData();
    formData.append('country', datacountry);
    formData.append('name', editedMosque.name);
    formData.append('location', editedMosque.address);
    formData.append('state', editedMosque.state);
    formData.append('district', editedMosque.district);
    try {
      console.log(datacountry)
      const response = await axios.put(`http://localhost:8085/${datacountry}mosque/${mosqueprId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      navigate('/Data'); // Or your desired route after saving
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!editedMosque) return <div>Mosque not found.</div>;

  return (
    <div className='edit-form'>
      <h2>Edit Mosque</h2>
      <form onSubmit={handleSave}>
      <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={editedMosque.name || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="address"
            value={editedMosque.address|| ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>State:</label>
          <input
            type="text"
            name="address"
            value={editedMosque.state|| ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>District:</label>
          <input
            type="text"
            name="address"
            value={editedMosque.district|| ''}
            disabled={country !== 'MALAYSIA'}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditMosquePage;
