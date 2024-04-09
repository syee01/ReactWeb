import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditProductPage = ({ productData, country, onClose, onSave }) => {
  const productId = productData.productID;
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    brand: '',
    date: '',
    imageURL: '', // assuming there's an image URL
    productId: null, // Ensure you have a productId to work with for PUT requests
    ...productData
  });
  const [imageFile, setImageFile] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  let datacountry = '';
  let datacountryIMG = '';
  switch (productData.country) {
    case 'THAILAND':
      datacountry = 'thai';
      datacountryIMG = 'thailand';
      break;
    case 'MALAYSIA':
      datacountry = 'mas';
      datacountryIMG = 'malaysia';
      break;
    case 'KOREA':
      datacountry = 'kr';
      datacountryIMG = 'korea';
      break;
    default:
      // Handle other cases or default case as needed
      break;
  }

  useEffect(() => {
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
  }, [productId, datacountry]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type if necessary
      setImageFile(file);
    }
  };

  // Handle changes in form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('country', datacountry);
    formData.append('name', editedProduct.name);
    formData.append('brand', editedProduct.brand);
    formData.append('date', editedProduct.date);
  
    // Handle image file if selected
    if (imageFile) {
      const extension = imageFile.name.match(/\.(png|jpg|jpeg)$/i)[0];
      const filename = `image_${productId}${extension}`;
      formData.append('image', imageFile, filename);
    } else {
      formData.append('imageURL', editedProduct.imageURL);
    }
    
    try {
      // Assuming onSave is also handling refresh or any post-save actions
      const response = await axios.put(`http://localhost:8085/${datacountry}product/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Call onSave if provided for any additional actions
      if (onSave) onSave();
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      // Optionally handle error state here (e.g., displaying an error message)
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!editedProduct) return <div>Product not found.</div>;

  return (
    <div className="edit-product-modal">
      <h2>Edit Product</h2>
      <form onSubmit={handleSave}>
      <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={editedProduct.name || ''}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        <div>
          <label>Brand:</label>
          <input
            type="text"
            name="brand"
            value={editedProduct.brand || ''}
            onChange={handleInputChange}
            className="form-input"
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
        <div>
          <label>Image:</label>
          {editedProduct.imageURL && (
            <img
              src={`http://localhost:8085/images/${datacountryIMG}ProductImage/${editedProduct.imageURL}`}
              alt="Product"
              style={{ width: '100px', height: 'auto' }}
            />
          )}
          <input
            type="file"
            name="image"
            accept=".png, .jpg, .jpeg"
            onChange={handleImageChange}
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

export default EditProductPage;
