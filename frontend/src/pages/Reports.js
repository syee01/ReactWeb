import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/report.css';
import moment from 'moment'; 

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('PENDING'); // Initialize in correct format
  const [activeCategory, setActiveCategory] = useState('Products');
  const [reports, setReports] = useState([]);
  const currentUser = localStorage.getItem('userID');

  // This function formats the tab status and sets the active tab
  const handleTabClick = (tab) => {
    const formattedStatus = tab.charAt(0) + tab.slice(1).toLowerCase();
    setActiveTab(formattedStatus);
  };

  const handleReview = async (reportId) => {
    try {
      const report = reports.find(report => report.ReportID === reportId);
      if (report.ViewedBy && report.ViewedBy !== currentUser) {
        console.log('You have already reviewed this report.');
        return;
      }

      await axios.put(`http://localhost:8085/viewByReportUpdate/${reportId}`, {
        viewedBy: currentUser,
        category: activeCategory
      });

      const response = await axios.get(`http://localhost:8085/getUsername/${report.ViewedBy}`);
      console.log(response.data)
      const { username } = response.data;

      setReports(reports.map(report => report.ReportID === reportId ? { ...report, ViewedBy: username } : report));
    } catch (error) {
      console.error('Error updating viewedBy:', error);
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('YYYY-MM-DD HH:mm:ss');
  };

  // Fetch reports when the active tab or category changes
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:8085/reports`, {
          params: { 
            category: activeCategory,
            status: activeTab // Send the formatted status to the server
          }
        });
        console.log(response.data)
        setReports(response.data); // Assuming the data is an array of reports
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
        {['PENDING', 'REVIEWED', 'COMPLETED'].map((tab) => ( // Initialize tabs in correct format
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
          <select className="filter-type-selector">
            <option value="name">Report ID</option>
            <option value="name">Product Name</option>
            
          </select>
          <input
            className="filter-input"
            type="text"
            placeholder="Type to search..."
          />
        </div>
        <div className="content">
          <table>
          <thead>
            <tr>
              {/* Render different headers based on activeCategory */}
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
          {/* Dynamically render different table rows based on activeCategory */}
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                {/* Table cells */}
                <td>{report.ReportID}</td>
                <td>{report.Name}</td>
                <td>{activeCategory === 'Products' ? report.Brand : report.RestaurantName}</td>
                <td>{formatDate(report.Date)}</td>
                <td>{report.ViewedBy}</td>
                <td>{report.ApprovedBy}</td>
                <td>
                <button 
                    className="edit-button" 
                    disabled={report.ViewedBy !== null && report.ViewedBy !== currentUser} // Enable the button if ViewedBy is null or matches currentUser
                    onClick={() => handleReview(report.ReportID)}
                    >
                    Review
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ReportPage;
