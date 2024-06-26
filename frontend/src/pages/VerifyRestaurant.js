import React, { useState } from 'react';
import axios from 'axios';
import '../cssFolder/verifyProduct.css'; // Ensure you have the appropriate CSS

const RestaurantDetailsModal = ({ restaurantData, country, onClose }) => {
  if (!restaurantData) return <div>Restaurant not found.</div>;

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8085/${country.toLowerCase()}/restaurants/${restaurantData.restaurantID}/status`, {
        status: newStatus
      });
      alert(`Data is verified successfully`);
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
        <h2 className="titlePosition">Restaurant Details</h2>
        <p><strong>Name:</strong></p>
        <p> {restaurantData.name}</p>
        <p><strong>Address:</strong></p>
        <p>{restaurantData.address}</p>
        <p><strong>Region:</strong></p>
        <p>{restaurantData.region}</p>
        <p><strong>Description:</strong></p>
        <p>{restaurantData.description}</p>
        <p><strong>Category:</strong></p>
        <p>{restaurantData.category}</p>
        <div className="action-buttons">
          <button className="approve-button" onClick={() => handleStatusChange('approved')}>Approve</button>
          <button className="reject-button" onClick={() => handleStatusChange('rejected')}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailsModal;
