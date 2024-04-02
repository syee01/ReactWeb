// ProductReportModal.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import '../cssFolder/modalProducts.css'

const ProductReportModal = ({ isOpen, onClose, reportId, category }) => {
  const [reportData, setReportData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const endpoint = `http://localhost:8085/specificReports/${category}/${reportId}`;
          const response = await axios.get(endpoint);
          setReportData(response.data);
        } catch (err) {
          setError('Failed to fetch data. Please try again later.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, reportId, category]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className='reportTitle'>Report Details</h2>
          <button className="modal-close-button" onClick={onClose}>&times;</button>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="modal-content">
            <h3 className='reportReportID'>{reportData.ReportID}</h3>
            {category === 'Products' && (
              <>
                <p><strong>Name:</strong> {reportData.Name}</p>
                <p><strong>Brand:</strong> {reportData.Brand}</p>
                <p><strong>Location:</strong> {reportData.Location}</p>
              </>
            )}
            <p><strong>Description:</strong> {reportData.Description}</p>
            <p><strong>Reported Date:</strong> {moment(reportData.Date).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        )}
        <div className="modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ProductReportModal;
