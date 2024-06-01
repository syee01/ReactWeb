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
    if (!location) return '';
    return location.split(', ').filter(part => part && part !== 'null').join(', ');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8085/specificReports/${category}/${reportId}`);
        setReportData(response.data);
        setComment(response.data.Comment || '');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data. Please try again later.');
      }

      try {
        const imageResponse = await axios.get(`http://localhost:8085/reportImages/${reportId}`);
        setReportImages(imageResponse.data);
      } catch (err) {
        console.error('Failed to fetch report images:', err);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [isOpen, reportId, category]);

  const handleAction = async (action) => {
    const status = "Completed"
    try {
      const updateData = {
        Status: status,
        ApprovedBy: localStorage.getItem('userID'),
        Comment: comment,
        ApprovedDate: moment().format('YYYY-MM-DD HH:mm:ss')
      };

      await axios.post(`http://localhost:8085/finalise_report/${category}/${reportId}`, updateData);

      const emailSubject = `Update on Your Report #${reportId}`;
      const emailBody = `
        Hello,

        Your report with ID: ${reportId} has been ${status.toLowerCase()}. Here are the details:

        - Type: ${category}
        - Name: ${reportData.Name}
        - Location: ${filterNull(reportData.Location)}
        - Reason: ${reportData.Reason}
        - Description: ${reportData.Description}
        - Status: ${status}
        - Officer Comment: ${comment}
        - Approved Date: ${updateData.ApprovedDate}

        Thank you for your patience and understanding. If you have further query, please contact myhalalchecker@gmail.com

        Best regards,
        myHalal Checker Team
      `;

      await axios.post('http://localhost:8085/send-email', {
        userId: reportData.UserID,
        subject: emailSubject,
        text: emailBody,
      });

      onClose();
      window.location.reload(); // Consider using React state or context for UI updates instead
    } catch (error) {
      console.error('Failed to update report and send notification:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modalBackdrop">
      <div className="modalContainer">
        <div className="modalHeader">
          <h2 className="reportTitle">{reportData.ReportID}</h2>
          <span className="modalclose-button" onClick={onClose}>&times;</span>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="modalContent">
            <h3>{category === 'Products' ? 'Product' : 'Restaurant'} Report Details</h3>
            <p><strong>Name:</strong> {reportData.Name}</p>
            {reportData.Brand && <p><strong>Brand:</strong> {reportData.Brand}</p>}
            <p><strong>Location:</strong> {filterNull(reportData.Location)}</p>
            <p><strong>Reason:</strong> {reportData.Reason}</p>
            <p><strong>Description:</strong> {reportData.Description}</p>
            <p><strong>Reported Date:</strong> {moment(reportData.Date).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p className="bold-text"><strong>Images Uploaded:</strong></p>
            <div className="image-container">
              {reportImages.map((image, index) => (
                <div key={index} className="image-wrapper">
                  <img src={`http://localhost:8082/assets/${image}`} alt={`Report ${index + 1}`} onClick={() => window.open(`http://localhost:8082/assets/${image}`, '_blank')} />
                </div>
              ))}
            </div>
            <label htmlFor="comment" className="bold-text">Officer Comment:</label>
            <textarea id="comment" value={comment} onChange={handleCommentChange} className="comment-textarea" rows="4"></textarea>
            <div className="modal-footer">
              <button onClick={() => handleAction('approve')}>Approve</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportHeadOfficer;
