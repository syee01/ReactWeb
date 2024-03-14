// EditProductPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    brand: '',
    date: '',
  });
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`http://localhost:8085/masproduct/${productId}`);
        setEditedProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
      setIsFetching(false);
    };

    fetchProduct();
  }, [productId]);

  if (isFetching) return <div>Loading...</div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleSave = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      console.log('Saving product', editedProduct);
      await axios.put(`http://localhost:8085/masproduct/${editedProduct.id}`, editedProduct);
      navigate('/home'); // Adjust the navigation route as needed
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (!editedProduct) return <div>Product not found.</div>;

  return (
    <div className='edit-form'>
      <h2>Edit Product</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={editedProduct.name || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Brand:</label>
          <input
            type="text"
            name="brand"
            value={editedProduct.brand || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Expired Date:</label>
          <input
            type="date"
            name="date"
            value={editedProduct.date ? editedProduct.date.split('T')[0] : ''}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditProductPage;
