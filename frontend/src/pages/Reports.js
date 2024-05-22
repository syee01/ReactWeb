import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/report.css';
import moment from 'moment'; 
import ProductReportModal from './ReportModal';
import ReportHeadOfficer from './ReportHeadOfficer';
import CompletedReportModal from './CompletedReport';

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [activeCategory, setActiveCategory] = useState('Products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const currentUser = localStorage.getItem('userID');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const userRole = localStorage.getItem('role');
  const [selectedFilter, setSelectedFilter] = useState('ReportID'); // Default to 'ReportID'
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const handleTabClick = (tab) => {
    const formattedStatus = tab.charAt(0) + tab.slice(1).toLowerCase();
    setActiveTab(formattedStatus);
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(`http://localhost:8085/reports`, {
        params: { 
          category: activeCategory,
          status: activeTab
        }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };
  
  const handleReview = async (reportId) => {
    try {
        const report = reports.find(report => report.ReportID === reportId);
        if (report.ViewedBy) {
            console.log('This report has already been reviewed.');
            return;
        }

        // Update the report as reviewed in the database
        await axios.put(`http://localhost:8085/viewByReportUpdate/${reportId}`, {
            viewedBy: currentUser,
            category: activeCategory,
            status: 'Reviewed'
        });

        // Set modal state to show the report is under review
        setIsModalOpen(true);
        setSelectedReportId(report.ReportID);
        fetchReports();

        // Prepare and send the email notification
        const emailSubject = `Your Report is Now Under Review`;
        const emailBody = `Hello, your report with ID: ${report.ReportID} is now under review by our team. We will update you with any final decisions or further inquiries as necessary.`;

        // Send email notification
        const emailEndpoint = 'http://localhost:8085/send-email';
        await axios.post(emailEndpoint, {
            userId: report.UserID,  // Assumes that `UserID` is part of the report object
            subject: emailSubject,
            text: emailBody,
        });

    } catch (error) {
        console.error('Error updating viewedBy or sending email:', error);
    }
};

  const formatDate = (dateString) => {
    return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:8085/reports`, {
          params: { 
            category: activeCategory,
            status: activeTab
          }
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
  
    fetchReports();
  }, [activeCategory, activeTab]);

  return (
    <>
      <div className='reportTitle'>
        <h2 className="reportTitle">Report Submitted</h2>
      </div>
      <div className="tabs">
        {['PENDING', 'REVIEWED', 'TO BE CONFIRMED', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab.toLowerCase() === tab.toLowerCase() ? 'selected' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="categories">
        {['Products', 'Restaurants'].map((category) => (
          <button
            key={category}
            className={`category ${activeCategory === category ? 'selected' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="data-component">
        <div className="filter-controls">
          <select
            className="filter-type-selector"
            value={selectedFilter}
            onChange={handleFilterChange}
          >
            <option value="ReportID">Report ID</option>
            <option value="Name">Product Name</option>
            {/* Add other options as needed */}
          </select>
          <input
            className="filter-input"
            type="text"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="content">
          <table>
            <thead>
              <tr>
                {activeCategory === 'Products' ? (
                  <>
                    <th>Report ID</th>
                    <th>Product Name</th>
                    <th>Product Brand</th>
                    <th>Reported Date</th>
                    <th>Viewed By</th>
                    <th>Approved By</th>
                  </>
                ) : (
                  <>
                    <th>Report ID</th>
                    <th>Restaurant Name</th>
                    <th>Reported Date</th>
                    <th>Viewed By</th>
                    <th>Approved By</th>
                  </>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {reports.filter((report) => {
                // No filter applied if there's no search term.
                if (!searchTerm.trim()) return true;

                // Adjusting the field to be searched based on the selectedFilter.
                let fieldValue = '';
                if (selectedFilter === 'ReportID') {
                  fieldValue = report.ReportID;
                } else if (selectedFilter === 'Name' && activeCategory === 'Products') {
                  fieldValue = report.Name; // Assuming 'Name' is the field for Product Name.
                }
                // Add more conditions if there are more filters.

                // Return true if the field value includes the searchTerm.
                // Adjust toLowerCase for case-insensitive search.
                return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
              })
              .map((report) => (
                <tr key={report.id}>
                  <td>{report.ReportID}</td>
                  <td>{report.Name}</td>
                  {activeCategory === 'Products' ? (
                    <>
                      <td>{report.Brand}</td>
                      <td>{formatDate(report.Date)}</td>
                    </>
                  ) : (
                    <>
                      <td>{formatDate(report.Date)}</td>
                    </>
                  )}
                  <td>{report.ViewedByUsername}</td>
                  <td>{report.ApprovedByUsername}</td>
                  <td>
                  {activeTab !== 'To be confirmed' ? (
                    (report.ViewedBy !== null && report.ViewedBy !== currentUser && activeTab !== 'Completed') ? ( // Adjusted condition
                      <button 
                        className="edit-button" 
                        onClick={() => handleReview(report.ReportID)}
                        disabled={report.ViewedBy !== null && report.ViewedBy !== currentUser && activeTab !== 'Completed'} // Adjusted condition
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        className="edit-button"
                        onClick={() => {
                          handleReview(report.ReportID);
                          setSelectedReportId(report.ReportID);
                          setIsModalOpen(true);
                        }}
                      >
                        Review
                      </button>
                    )
                  ) : (
                    userRole === 'head officer' ? (
                      <button
                        className="edit-button"
                        onClick={() => {
                          handleReview(report.ReportID);
                          setSelectedReportId(report.ReportID);
                          setIsModalOpen(true);
                        }}
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        className="edit-button"
                        onClick={() => {}}
                        disabled={true}
                      >
                        Review
                      </button>
                    )
                  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <>
        {reports.map((report) => (
        <React.Fragment key={report.id}>
          {activeTab !== 'To be confirmed' ? (
            activeTab === 'Completed' ? (
              <CompletedReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                reportId={selectedReportId}
                category={activeCategory}
              />
            ) : (
              <ProductReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                reportId={selectedReportId}
                category={activeCategory}
              />
            )
          ) : (
            <ReportHeadOfficer
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              reportId={selectedReportId}
              category={activeCategory}
            />
          )}
        </React.Fragment>
      ))}
      </>
    </>
  );
};

export default ReportPage;
