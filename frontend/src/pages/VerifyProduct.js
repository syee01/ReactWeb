import React, { useState } from 'react';
import axios from 'axios';
import '../cssFolder/verifyProduct.css'; // Ensure you have the appropriate CSS

const ZoomImageModal = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div className="zoomImageModalBackdrop">
      <div className="zoomImageModalContent">
        <img src={src} alt="Zoomed" style={{ width: '100%', height: 'auto' }} />
        <button onClick={onClose} className="zoomModalCloseButton">&times;</button>
      </div>
    </div>
  );
};

const ProductDetailsModal = ({ productData, country, onClose }) => {
  const [zoomImageSrc, setZoomImageSrc] = useState(null);

  if (!productData) return <div>Product not found.</div>;

  let datacountryIMG = '';
  switch (country) {
    case 'THAILAND':
      datacountryIMG = 'thailand';
      break;
    case 'MALAYSIA':
      datacountryIMG = 'malaysia';
      break;
    case 'KOREA':
      datacountryIMG = 'korea';
      break;
    default:
      datacountryIMG = ''; // Default or error handling
      break;
  }

  const handleImageClick = () => {
    if (productData.imageURL) {
      setZoomImageSrc(`http://localhost:8085/images/${datacountryIMG}ProductImage/${productData.imageURL}`);
    }
  };

  const closeZoomModal = () => {
    setZoomImageSrc(null);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8085/${country.toLowerCase()}/products/${productData.productID}/status`, {
        status: newStatus
      });
      alert(`Status updated to ${newStatus}`);
      onClose(); // Close modal after status update
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="modalBackdrop1">
      <div className="modalContent1">
        <button onClick={onClose} className="closeButton">&times;</button>
        <h2 className="titlePosition">Product Details</h2>
        <p><strong>Name:</strong></p>
        <p> {productData.name}</p>
        <p><strong>Brand:</strong></p>
        <p>{productData.brand}</p>
        {country !== 'KOREA' && <p><strong>Expired Date:</strong> {productData.date ? productData.date.split('T')[0] : 'N/A'}</p>}
        {country !== 'KOREA' && <p>{productData.date ? productData.date.split('T')[0] : 'N/A'}</p>}
        <p><strong>Image:</strong></p>
        {productData.imageURL && (
          <img
            src={`http://localhost:8085/images/${datacountryIMG}ProductImage/${productData.imageURL}`}
            alt="Product"
            style={{ width: '100px', height: '100px' }}
            onClick={handleImageClick}
          />
        )}
        <div className="action-buttons">
          <button className="approve-button" onClick={() => handleStatusChange('Approved')}>Approve</button>
          <button className="reject-button" onClick={() => handleStatusChange('Rejected')}>Reject</button>
        </div>
      </div>
      {zoomImageSrc && <ZoomImageModal src={zoomImageSrc} onClose={closeZoomModal} />}
    </div>
  );
};

export default ProductDetailsModal;
