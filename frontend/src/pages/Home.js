import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/dashboard.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register components required for the bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const role = localStorage.getItem('role'); // Retrieve role from local storage
  const [roleHeader, setRoleHeader] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [officerCount, setOfficerCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [reviewCounts, setReviewCounts] = useState({});
  const [totalReviewsNeeded, setTotalReviewsNeeded] = useState(0);
  const [statusDetails, setStatusDetails] = useState({
    reportData: null,
    enquiryData: null
  });
  const [graphData, setGraphData] = useState({
    labels: ['Products', 'Restaurants', 'Mosques', 'Prayer Rooms'],
    datasets: []
  });
  
  function formatCategory(category) {
    if (!category) return 'Unknown Category';
    if(category=='pr') return 'Prayer Room';
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  useEffect(() => {
    const baseURI = 'http://localhost:8085';
    async function fetchData() {
      try {
        const usersRes = await axios.get(`${baseURI}/user-count`);
        const officersRes = await axios.get(`${baseURI}/officer-count`);
        const reportsRes = await axios.get(`${baseURI}/reports-count`);
        const enquiriesRes = await axios.get(`${baseURI}/enquiries-count`);
        const reviewDataRes = await axios.get(`${baseURI}/review-counts`);
        const statusDetailsRes = await axios.get(`${baseURI}/status-details`, { params: { role } });
  
        setUserCount(usersRes.data.usersCount);
        setOfficerCount(officersRes.data.officerCount);
        setReportsCount(reportsRes.data.totalReports);
        setEnquiriesCount(enquiriesRes.data.totalEnquiries);
        setReviewCounts(reviewDataRes.data);
  
        const totalReviews = Object.values(reviewDataRes.data).reduce((acc, curr) => acc + Object.values(curr).reduce((sum, num) => sum + num, 0), 0);
        setTotalReviewsNeeded(totalReviews);

        if(role === 'data admin') {
          setRoleHeader('Data Admin');
        } else if(role === 'officer') {
          setRoleHeader('Officer');
        } else {
          setRoleHeader('Head Officer');
        }

        // Filter data based on role
        const allowedStatuses = role === 'data admin' ? ['Pending', 'In Progress', 'To Be Confirmed', 'Completed']
          : role === 'head officer' ? ['To Be Confirmed', 'Completed']
          : ['Pending', 'In Progress', 'Completed']; // Modify as necessary for officers

        // Helper function to filter data by role
        const filterDataByRole = (dataObject) =>
          allowedStatuses.reduce((acc, status) => {
            acc[status] = dataObject[status];
            return acc;
          }, {});

        setStatusDetails({
          reportData: {
            labels: allowedStatuses,
            datasets: [{
              label: 'Restaurant Reports',
              data: allowedStatuses.map(status => filterDataByRole(statusDetailsRes.data.restaurant_reports)[status]),
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }, {
              label: 'Product Reports',
              data: allowedStatuses.map(status => filterDataByRole(statusDetailsRes.data.product_reports)[status]),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          enquiryData: {
            labels: allowedStatuses,
            datasets: [{
              label: 'Restaurant Enquiries',
              data: allowedStatuses.map(status => filterDataByRole(statusDetailsRes.data.restaurant_enquiry)[status]),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }, {
              label: 'Product Enquiries',
              data: allowedStatuses.map(status => filterDataByRole(statusDetailsRes.data.product_enquiry)[status]),
              backgroundColor: 'rgba(255, 206, 86, 0.5)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            }]
          }
          
        });
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    if (role === 'data admin') {
      const fetchDataAdminData = async () => {
        const [officerRes, graphDataRes] = await Promise.all([
          axios.get(`${baseURI}/officer-count`),
          axios.get(`${baseURI}/api/data`)
        ]);
        setOfficerCount(officerRes.data.officerCount);
    
        // Assuming graphDataRes.data.data is the object with country keys and data arrays
        const graphDataFromApi = graphDataRes.data.data;
    
        const updatedDatasets = [
          {
            label: 'Malaysia',
            data: graphDataFromApi.malaysia,
            backgroundColor: 'rgba(120, 57, 251, 0.3)',
            borderColor: 'rgba(110, 43, 253, 0.8)',
            borderWidth: 1
          },
          {
            label: 'Korea',
            data: graphDataFromApi.korea,
            backgroundColor: 'rgba(88, 243, 235, 0.3)',
            borderColor: 'rgba(57, 251, 241, 0.8)',
            borderWidth: 1
          },
          {
            label: 'Thailand',
            data: graphDataFromApi.thailand,
            backgroundColor: 'rgba(155, 250, 77, 0.3)',
            borderColor: 'rgba(116, 254, 2, 0.8)',
            borderWidth: 1
          }
        ];
    
        setGraphData(prevState => ({
          ...prevState,
          datasets: updatedDatasets
        }));
      };
    
      fetchDataAdminData();
    }
    
    fetchData();
  }, [role]);

  return (
    <div className="dashboard">
      <h2 className="dashboardTitle">Dashboard - {roleHeader}</h2>
      <div className="card-container">
        <div className="card"><h4>Officer Count</h4><p>{officerCount}</p></div>
        {role === 'data admin' && <div className="card"><h4>User Count</h4><p>{userCount}</p></div>}
        <div className="card"><h4>Total Reports</h4><p>{reportsCount}</p></div>
        <div className="card"><h4>Total Enquiries</h4><p>{enquiriesCount}</p></div>
        {role === 'data admin' && (
        <>
        <div className='row'>
          <h2 className='dashboardSub'>Total Dataset</h2>
          <div className="graph-container">
            <Bar data={graphData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </div>
          </div>
        </>
      )}
      </div>
      {role === 'head officer' && (
        <>
          <h2 className="dashboardSub">Review Dashboard</h2>
          <h5 className='pendingTitle'>Total Pending Reviews: {totalReviewsNeeded}</h5>
          <div className="three-columns">
            {Object.entries(reviewCounts).map(([country, counts]) => (
              <div key={country} className="column">
                <div className="country-section">
                  <h4 className="collapsible">{country.toUpperCase()} - Pending Reviews: {Object.values(counts).reduce((a, b) => a + b, 0)}</h4>
                  <div className="content1">
                    {Object.entries(counts).map(([category, count]) => (
                      <p key={category}><span className="bold-text">{formatCategory(category)}</span>: {count}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="row">
  {statusDetails.reportData && (
    <div className="half-width">
      <h2 className='dashboardSub'>Report Data</h2>
      <Bar
        data={statusDetails.reportData}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              min: 0,      // Explicitly set minimum
              max: 5,     // Explicitly set maximum
              ticks: {
                stepSize: 1  // Ensures Y-axis values increment in steps of 1
              }
            }
          }
        }}
      />
    </div>
  )}
  {statusDetails.enquiryData && (
    <div className="half-width">
      <h2 className='dashboardSub'>Enquiry Data</h2>
      <Bar
        data={statusDetails.enquiryData}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              min: 0,      // Explicitly set minimum
              max: 5,     // Explicitly set maximum
              
              ticks: {
                stepSize: 1 , // Ensures Y-axis values increment in steps of 1
              }
            }
          }
        }}
      />
    </div>
  )}
</div>

    </div>
  );
};

export default Dashboard;
