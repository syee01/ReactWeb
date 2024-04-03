import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import '../cssFolder/modalProducts.css';

const ProductReportModal = ({ isOpen, onClose, reportId, category }) => {
  const [reportData, setReportData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportImages, setReportImages] = useState([]);
  const [comment, setComment] = useState('');
  const [isHalal, setIsHalal] = useState(null);

  const filterNull = (location) => {
    // Split the location into parts
    const parts = location.split(', ');
    // Filter out the "null" values
    const filteredParts = parts.filter(part => part !== 'null');
    // Join the non-null parts back into a string
    return filteredParts.join(', ');
  };

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
      const fetchReportImages = async () => {
        try {
          const endpoint = `http://localhost:8085/reportImages/${reportId}`;
          const response = await axios.get(endpoint);
          setReportImages(response.data);
        } catch (err) {
          console.error('Failed to fetch report images', err);
        }
      };

      if (isOpen) {
        setIsLoading(true);
        fetchData();
        fetchReportImages().then(() => setIsLoading(false));
      }
    }
  }, [isOpen, reportId, category]);

  const handleHalalStatus = () => {
    setIsHalal(prevState => !prevState);
  };

  
  const handleSubmit = async () => {
    try {
      const endpoint = `http://localhost:8085/update_report/${category}`;
      await axios.post(endpoint, {
        reportId,
        halalStatus: isHalal,
        comment
      });
      // Close the modal
      onClose();
      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Failed to submit data:', error);
      // Handle error accordingly
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="reportTitle">{reportData.ReportID}</h2>
          <span className="modal-close-button" onClick={onClose}>
            &times;
          </span>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="modal-content">
            {category === 'Products' && (
              <>
                <h3 className="reportReportID">Product Report Details</h3>
                <p>
                  <strong>Name:</strong> {reportData.Name}
                </p>
                <p>
                  <strong>Brand:</strong> {reportData.Brand}
                </p>
                {reportData.Location && (
                  <p>
                    <strong>Location:</strong> {filterNull(reportData.Location)}
                  </p>
                )}
                <p>
                  <strong>Description:</strong> {reportData.Description}
                </p>
              </>
            )}
            {category === 'Restaurants' && (
              <>
                <h3 className="reportReportID">Restaurant Report Details</h3>
                <p>
                  <strong>Name:</strong> {reportData.Name}
                </p>
                {reportData.Location && (
                  <p>
                    <strong>Location:</strong> {filterNull(reportData.Location)}
                  </p>
                )}
                <p>
                  <strong>Description:</strong> {reportData.Description}
                </p>
              </>
            )}
            <p>
              <strong>Reported Date:</strong>{' '}
              {moment(reportData.Date).format('YYYY-MM-DD HH:mm:ss')}
            </p>
            <p className="bold-text"> {/* Added class for bold text */}
              <strong>Images Uploaded:</strong>
            </p>
            <div className="image-container">
              {reportImages.map((imagePath, index) => (
                <div key={index} className="image-wrapper">
                  <img
                    src={`http://localhost:8082/assets/${imagePath}`}
                    alt={`Report ${index + 1}`}
                    onClick={() => {
                      window.open(
                        `http://localhost:8082/assets/${imagePath}`,
                        '_blank'
                      );
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="form-group">
              <p className="bold-text"> {/* Added class for bold text */}
                <strong>Halal Status:</strong>
              </p>
              <div className="halal-buttons">
                <button
                  className={`halalStatus ${isHalal === true ? 'active' : ''}`}
                  onClick={handleHalalStatus}
                >
                  Halal
                </button>
                <button
                  className={`halalStatus ${isHalal === false ? 'active' : ''}`}
                  onClick={handleHalalStatus}
                >
                  Not Halal
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="comment" className="bold-text"> {/* Added class for bold text */}
                <strong>Comment:</strong>
              </label>
              <input
                type="text"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default ProductReportModal;
