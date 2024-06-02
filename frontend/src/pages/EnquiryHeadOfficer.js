import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import '../cssFolder/modalProducts.css';

const EnquiryHeadOfficer = ({ isOpen, onClose, reportId, category }) => {
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
          const endpoint = `http://localhost:8085/specificEnquiry/${category}/${reportId}`;
          const response = await axios.get(endpoint);
          setReportData(response.data);
          console.log(response.data)
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
          const endpoint = `http://localhost:8085/enquiryImages/${reportId}`;
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

  const handleAction = async (action) => {
    console.log(comment); // For debugging purposes
    try {

      let reviewedByUsername = '';
        if (reportData.ViewedBy) {
            const userResponse = await axios.get(`http://localhost:8085/getUsername/${reportData.ViewedBy}`);
            reviewedByUsername = userResponse.data.username || 'N/A'; // Default to 'N/A' if no username found
        }

        const updateData = {
            Status: 'Completed',
            ApprovedBy: localStorage.getItem('userID'),
            Comment: comment,
            ApprovedDate: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })
        };

        const endpoint = `http://localhost:8085/finalise_enquiry/${category}`;
        await axios.post(endpoint, { reportId, updateData });

        // Prepare detailed data for the email notification
        const emailSubject = `Update on Your Enquiry #${reportData.ReportID}`;
        const emailBody = `
        <html>
          <body>
              <p style="color: #000000; font-family: Arial, sans-serif; font-size: 14px;">
                  Hello,<br><br>
                  Your enquiry with ID: <strong>${reportData.ReportID}</strong> has been replied. Here are the details:<br><br>
                  <strong>Type:</strong> ${category}<br>
                  <strong>Name:</strong> ${reportData.Name}<br>
                  <strong>Location:</strong> ${filterNull(reportData.Location)}<br>
                  <strong>Reason:</strong> ${reportData.Reason}<br>
                  <strong>Description:</strong> ${reportData.Description}<br>
                  <strong>Status:</strong> Completed<br>
                  <strong>Officer Comment:</strong> ${comment}<br>
                  <strong>Reviewed By:</strong> ${reviewedByUsername}<br>
                  <strong>Final Reviewed By:</strong> ${localStorage.getItem('username')}<br>
                  <strong>Replied Date:</strong> ${updateData.ApprovedDate}<br><br>
                  Thank you for your patience. If you have any further queries, please contact myhalalchecker@gmail.com<br><br>
                  Best Regards,<br>
                  myHalal Checker Team
              </p>
          </body>
          </html>
        `;

        const emailEndpoint = 'http://localhost:8085/send-email';
        await axios.post(emailEndpoint, {
            userId: reportData.UserID,
            subject: emailSubject,
            html: emailBody,
        });

        onClose(); // Close the modal
        window.location.reload(); // Refresh the page to update the UI
    } catch (error) {
        console.error('Failed to update the report and send notification:', error);
        alert('Failed to update the report status.');
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
            <div className="form-group">
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
            
          </div>
        )}
        <div className="modal-footer">
          <button onClick={() => handleAction('approve')}>Approve</button>
        </div>
      </div>
    </div>
  );
};

export default EnquiryHeadOfficer;
