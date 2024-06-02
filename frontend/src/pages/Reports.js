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
  const [selectedFilter, setSelectedFilter] = useState('ReportID');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const handleTabClick = (tab) => {
    const formattedStatus = tab.charAt(0) + tab.slice(1).toLowerCase();
    setActiveTab(formattedStatus);
  };

  const handleReview = async (reportId) => {
    try {
      const report = reports.find(report => report.ReportID === reportId);

      if (report.ViewedBy && report.ViewedBy !== currentUser) {
        console.log('This report has already been reviewed by another user.');
        return;
      }

      let newStatus = '';
      let approvedBy = null;
      if (activeTab === 'PENDING') {
        newStatus = 'In Progress';
        setSelectedReportId(reportId);
      } else if (activeTab === 'IN PROGRESS') {
        newStatus = 'To Be Confirmed';
        alert('The report is reviewed successfully');
      } else if (activeTab === 'TO BE CONFIRMED') {
        newStatus = 'Completed';
        alert('The report is reviewed successfully');
        setIsModalOpen(false);
        approvedBy = currentUser;
      }

      if (newStatus) {
        await axios.put(`http://localhost:8085/viewByReportUpdate/${reportId}`, {
          viewedBy: currentUser,
          approvedBy: approvedBy,
          category: activeCategory,
          status: newStatus
        });

        const updatedReports = reports.map(r => 
          r.ReportID === reportId ? {...r, Status: newStatus, ViewedBy: currentUser, ApprovedBy: approvedBy} : r
        );
        setReports(updatedReports);
        setSelectedReportId(reportId);

        const emailSubject = `Update on Your Report #${reportId}`;
        const emailBody = `
          <html>
          <body>
            <p style="color: #000000; font-family: Arial, sans-serif; font-size: 14px;">
              Hello,<br><br>
              Your report with ID: <strong>${report.ReportID}</strong> is currently in progress. Here are the details:<br><br>
              <strong>Type:</strong> ${activeCategory}<br>
              <strong>Name:</strong> ${report.Name}<br>
              <strong>Location:</strong> ${filterNull(report.Location)}<br>
              <strong>Reason:</strong> ${report.Reason}<br>
              <strong>Description:</strong> ${report.Description}<br>
              <strong>Viewed By:</strong> ${localStorage.getItem('username')}<br><br>
              Thank you for your patience. If you have any further queries, please contact <a href="mailto:myhalalchecker@gmail.com">myhalalchecker@gmail.com</a>.<br><br>
              Best Regards,<br>
              myHalal Checker Team
            </p>
          </body>
        </html>
        `;

        const emailEndpoint = 'http://localhost:8085/send-email';
        await axios.post(emailEndpoint, {
          userId: report.UserID,
          subject: emailSubject,
          html: emailBody,
        });
      }
    } catch (error) {
      console.error('Error handling review process:', error);
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
  };

  const filterNull = (location) => {
    const parts = location.split(', ');
    const filteredParts = parts.filter(part => part !== 'null');
    return filteredParts.join(', ');
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
        {['PENDING', 'IN PROGRESS', 'TO BE CONFIRMED', 'COMPLETED'].map((tab) => (
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
                if (!searchTerm.trim()) return true;
                let fieldValue = '';
                if (selectedFilter === 'ReportID') {
                  fieldValue = report.ReportID;
                } else if (selectedFilter === 'Name' && activeCategory === 'Products') {
                  fieldValue = report.Name;
                }
                return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
              }).map((report) => (
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
                      (report.ViewedBy !== null && report.ViewedBy !== currentUser && activeTab !== 'Completed') ? (
                        <button 
                          className="edit-button" 
                          onClick={() => handleReview(report.ReportID)}
                          disabled={report.ViewedBy !== null && report.ViewedBy !== currentUser && activeTab !== 'Completed'}
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
        {isModalOpen && (
          activeTab !== 'To be confirmed' ? (
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
          )
        )}
      </>
    </>
  );
};

export default ReportPage;
