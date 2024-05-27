import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import '../cssFolder/modalProducts.css';

const ReportHeadOfficer = ({ isOpen, onClose, reportId, category }) => {
  const [reportData, setReportData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportImages, setReportImages] = useState([]);
  const [comment, setComment] = useState('');
 
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

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
          setComment(response.data.Comment || ''); 
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


  const handleAction = async (action, reportType) => {
    console.log(comment); // Debugging
    try {
        const updateData = {
            Status: 'Completed',
            ApprovedBy: localStorage.getItem('userID'),
            Comment: comment,
            ApprovedDate: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })
        };

        const updateEndpoint = `http://localhost:8085/finalise_report/${category}`;
        await axios.post(updateEndpoint, { reportId, updateData });

        // Prepare dynamic email content
        const emailSubject = `Update on Your Report #${reportData.ReportID}`;
        
        const emailBody = `Hello, your report with ID: ${reportData.ReportID} is now marked as.`;

        // Send email
        const emailEndpoint = 'http://localhost:8085/send-email';
        await axios.post(emailEndpoint, {
            userId: reportData.UserID,
            subject: emailSubject,
            text: emailBody,
        });

        onClose(); // Close the modal
        alert('Report status is updated successfully')
        window.location.reload(); // Refresh the page
    } catch (error) {
        console.error('Failed to update report:', error);
    }
};



  if (!isOpen) return null;

  return (
    <div className="modalBackdrop">
      <div className="modalContainer">
        <div className="modalHeader">
          <h2 className="reportTitle">{reportData.ReportID}</h2>
          <span className="modalclose-button" onClick={onClose}>
            &times;
          </span>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="modalContent">
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
                  <strong>Reason:</strong> {reportData.Reason}
                </p>
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
                  <strong>Reason:</strong> {reportData.Reason}
                </p>
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
              <div className="comment-edit">
              <label htmlFor="comment" className="bold-text"> {/* Added class for bold text */}
                Officer Comment:
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                className="comment-textarea"
                rows="4"  // Specifies the number of lines you want the textarea to have
              ></textarea>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button onClick={() => handleAction('approve')}>Approve</button>
        </div>
      </div>
    </div>
  );
};

export default ReportHeadOfficer;
