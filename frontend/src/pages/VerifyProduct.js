import React from 'react';
import '../cssFolder/verifyProduct.css'; // Adjust the path as necessary

const ProductDetailsModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="modalBackdrop1">
      <div className="modalContent1">
        <h2>Product Details</h2>
        <p><strong>Name:</strong> {product.name}</p>
        <p><strong>Brand:</strong> {product.brand}</p>
        <p><strong>Expired Date:</strong> {product.date}</p>
        <button onClick={onClose} className="modal-closebutton">Close</button>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
