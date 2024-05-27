import React, { useState } from 'react';
import axios from 'axios';
import '../cssFolder/verifyProduct.css'; // Ensure you have the appropriate CSS

const MosqueDetailsModal = ({ mosqueData, country, onClose }) => {

  if (!mosqueData) return <div>Mosques not found.</div>;

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8085/${country.toLowerCase()}/mosques/${mosqueData.mosqueprID}/status`, {
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
        <h2 className="titlePosition">Mosque Details</h2>
        <p><strong>Name:</strong></p>
        <p> {mosqueData.name}</p>
        <p><strong>Address:</strong></p>
        <p>{mosqueData.address}</p>
        <p><strong>State:</strong></p>
        <p>{mosqueData.state}</p>
        {country === 'MALAYSIA' && <p><strong>District:</strong></p>}
        {country === 'MALAYSIA' && <p>{mosqueData.district}</p>}
        <div className="action-buttons">
          <button className="approve-button" onClick={() => handleStatusChange('approved')}>Approve</button>
          <button className="reject-button" onClick={() => handleStatusChange('rejected')}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default MosqueDetailsModal ;
