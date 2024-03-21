import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../cssFolder/editProduct.css';

const EditMosquePage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    brand: '',
    date: '',
    imageURL: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const country = searchParams.get('country');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({ ...editedProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type if necessary
      setImageFile(file);
    }
  };
  
  const handleSave = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('country', datacountry);
    formData.append('name', editedProduct.name);
    formData.append('brand', editedProduct.brand);
    formData.append('date', editedProduct.date);

    // Only append the new image if it has been selected
    if (imageFile) {
      const extension = imageFile.name.match(/\.(png|jpg|jpeg)$/i)[0];
      const filename = `image_${productId}${extension}`;
      formData.append('image', imageFile, filename);
    } else {
      // If no new image file is selected, send the original image URL
      formData.append('imageURL', editedProduct.imageURL);
    }
    
    try {
      console.log(datacountry)
      const response = await axios.put(`http://localhost:8085/${datacountry}product/${productId}`, formData, {
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
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditMosquePage;
