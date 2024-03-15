// EditProductPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    brand: '',
    date: '',
  });
  const [isFetching, setIsFetching] = useState(false);

  // Function to parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const country = searchParams.get('country'); // Get the country query parameter
  let datacountry = '';
  if(country==='THAILAND'){
    datacountry='thai'
  }
  else if(country==='MALAYSIA'){
    datacountry='mas'
  }
  else if(country==='KOREA'){
    datacountry='kr'
  }

  useEffect(() => {
    // Fetch product using productId and country
    // Adjust your API endpoint as necessary
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(`http://localhost:8085/${datacountry}product/${productId}`);
        setEditedProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
      setIsFetching(false);
    };

    fetchProduct();
  }, [productId, country]);
  
  if (isFetching) return <div>Loading...</div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleSave = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      console.log('Saving product', editedProduct);
      const productId = editedProduct.productID;
      await axios.put(`http://localhost:8085/${datacountry}product/${productId}`, editedProduct);
      navigate('/Data'); // Adjust the navigation route as needed
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
            disabled={country === 'KOREA'}
          />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditProductPage;
