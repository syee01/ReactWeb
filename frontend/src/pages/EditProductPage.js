import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditProductPage = ({ productData, country, onClose, onSave, isAdding }) => {
  // Handling no productData when adding new products
  const productId = productData ? productData.productID : null;
  
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    brand: '',
    date: '',
    imageURL: '',
    productId: productId,  // use null if adding a new product
  });

  const [imageFile, setImageFile] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Determine country based parameters
  let datacountry = '';
  let datacountryIMG = '';
  switch (country) {
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
      break;
  }

  useEffect(() => {
    const fetchProduct = async () => {
      if (!isAdding && productId) {
        setIsFetching(true);
        try {
          const response = await axios.get(`http://localhost:8085/${datacountry}product/${productId}`);
          if (response.data) {
            console.log('Product data received:', response.data);
            setEditedProduct(response.data);
          } else {
            console.error('No product data received');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        }
        setIsFetching(false);
      }
    };
    
    fetchProduct();
  }, [productId, datacountry, isAdding]);
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', editedProduct.name);
    formData.append('brand', editedProduct.brand);
    formData.append('date', editedProduct.date);
    formData.append('status', 'reviewed'); // Setting status as 'Reviewed' when saving
    formData.append('country', datacountry);

    if (imageFile) {
      const extension = imageFile.name.match(/\.(png|jpg|jpeg)$/i)[0];
      const filename = `image_${productId || 'new'}${extension}`;
      formData.append('image', imageFile, filename);
    } else {
      formData.append('imageURL', editedProduct.imageURL);
    }

    try {
      const apiEndpoint = isAdding ? 
        `http://localhost:8085/${datacountry}product/add` : 
        `http://localhost:8085/${datacountry}product/${productId}`;
        console.log('Requesting:', apiEndpoint, 'Method:', isAdding ? 'post' : 'put');
      const response = await axios({
        method: isAdding ? 'post' : 'put',
        url: apiEndpoint,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (onSave) onSave(response.data);  // Optionally pass saved data back
      onClose();  // Close modal after save
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (isFetching) return <div>Loading...</div>;
  if (!isAdding && !editedProduct) return <div>Product not found.</div>;

  return (
    <div className="edit-product-modal">
      <h2>{isAdding ? 'Add New Product' : 'Edit Product'}</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={editedProduct.name || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label>Brand:</label>
          <input type="text" name="brand" value={editedProduct.brand || ''} onChange={handleInputChange} className="form-input" />
        </div>
        <div>
          <label>Expired Date:</label>
          <input type="date" name="date" value={editedProduct.date ? editedProduct.date.split('T')[0] : ''} onChange={handleInputChange} disabled={country === 'KOREA'} />
        </div>
        <div>
          <label>Image:</label>
          {editedProduct.imageURL && !isAdding && (
            <img src={`http://localhost:8085/images/${datacountryIMG}ProductImage/${editedProduct.imageURL}`} alt="Product" style={{ width: '100px', height: 'auto' }} />
          )}
          <input type="file" name="image" accept=".png, .jpg, .jpeg" onChange={handleImageChange} />
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
