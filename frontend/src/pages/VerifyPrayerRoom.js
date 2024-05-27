import React from 'react';
import axios from 'axios';
import '../cssFolder/verifyProduct.css'; // Ensure you have the appropriate CSS

const PrayerRoomDetailsModal = ({ prayerRoomData, country, onClose }) => {
  if (!prayerRoomData) return <div>Product not found.</div>;
  console.log(country)
  const endpoint = `http://localhost:8085/${country.toLowerCase()}/prayerroom/${prayerRoomData.mosqueprID}/status`
  console.log(endpoint)
  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`http://localhost:8085/${country.toLowerCase()}/prayerroom/${prayerRoomData.mosqueprID}/status`, {
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
        <h2 className="titlePosition">Prayer Room Details</h2>
        <p><strong>Name:</strong></p>
        <p> {prayerRoomData.name}</p>
        <p><strong>Address:</strong></p>
        <p>{prayerRoomData.address}</p>
        <p><strong>State:</strong></p>
        <p>{prayerRoomData.state}</p>
        {country === 'MALAYSIA' && <p><strong>District:</strong></p>}
        {country === 'MALAYSIA' && <p>{prayerRoomData.district}</p>}
        <div className="action-buttons">
          <button className="approve-button" onClick={() => handleStatusChange('approved')}>Approve</button>
          <button className="reject-button" onClick={() => handleStatusChange('rejected')}>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default PrayerRoomDetailsModal;
