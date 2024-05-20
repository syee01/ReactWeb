import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/dashboard.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register components required for the bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [officerCount, setOfficerCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [reviewCounts, setReviewCounts] = useState({});
  const [totalReviewsNeeded, setTotalReviewsNeeded] = useState(0);
  const [statusDetails, setStatusDetails] = useState({
    reportData: null,  // Initialize as null or with default structure
    enquiryData: null  // Initialize as null or with default structure
  });

  const [graphData, setGraphData] = useState({
    labels: ['Products', 'Restaurants', 'Mosques', 'Prayer Rooms'],
    datasets: [{
      label: 'Malaysia',
      backgroundColor: 'rgba(120, 57, 251, 0.3)',
      borderColor: 'rgba(110, 43, 253, 0.8)',
      borderWidth: 1,
      data: []
    },
    {
      label: 'Korea',
      backgroundColor: 'rgba(88, 243, 235, 0.3)',
      borderColor: 'rgba(57, 251, 241, 0.8)',
      borderWidth: 1,
      data: []
    },
    {
      label: 'Thailand',
      backgroundColor: 'rgba(155, 250, 77, 0.3)',
      borderColor: 'rgba(116, 254, 2, 0.8)',
      borderWidth: 1,
      data: []
    }]
  });

  useEffect(() => {
    async function fetchData(endpoint) {
      const response = await axios.get(`http://localhost:8085/${endpoint}`);
      return response.data;
    }

    async function loadData() {
      const usersData = await fetchData('user-count');
      setUserCount(usersData.usersCount);

      const reportsData = await fetchData('reports-count');
      setReportsCount(reportsData.totalReports);

      const enquiriesData = await fetchData('enquiries-count');
      setEnquiriesCount(enquiriesData.totalEnquiries);

      const graphDataResponse = await fetchData('api/data');
      setGraphData({
        ...graphData,
        datasets: graphData.datasets.map((dataset, index) => {
          const countryKey = ['malaysia', 'korea', 'thailand'][index];
          return { ...dataset, data: graphDataResponse.data[countryKey] };
        })
      });

      const reviewData = await fetchData('review-counts');
      setReviewCounts(reviewData);
    }

    loadData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRes = await axios.get('http://localhost:8085/user-count');
        const officersRes = await axios.get('http://localhost:8085/officer-count');
        const reportsRes = await axios.get('http://localhost:8085/reports-count');
        const enquiriesRes = await axios.get('http://localhost:8085/enquiries-count');
        const graphDataRes = await axios.get('http://localhost:8085/api/data');
        const reviewDataRes = await axios.get('http://localhost:8085/review-counts');
        const statusDetailsRes = await axios.get('http://localhost:8085/status-details');

        setUserCount(usersRes.data.usersCount);
        setOfficerCount(officersRes.data.officerCount);
        setReportsCount(reportsRes.data.totalReports);
        setEnquiriesCount(enquiriesRes.data.totalEnquiries);

        setGraphData(current => ({
          ...current,
          datasets: current.datasets.map((dataset, index) => {
            const countryKey = ['malaysia', 'korea', 'thailand'][index];
            return { ...dataset, data: graphDataRes.data.data[countryKey] };
          })
        }));

        setReviewCounts(reviewDataRes.data);
        const totalReviews = Object.values(reviewDataRes.data).reduce((acc, curr) => acc + Object.values(curr).reduce((sum, num) => sum + num, 0), 0);
        setTotalReviewsNeeded(totalReviews);

        const combinedData = prepareCombinedGraphData(statusDetailsRes.data);
        setStatusDetails(combinedData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    fetchData();
  }, []);

  const prepareCombinedGraphData = (data) => {
    if (!data) return { reportData: null, enquiryData: null };
    return {
      reportData: {
        labels: ['Pending', 'Reviewed', 'To Be Confirmed', 'Completed'],
        datasets: [
          {
            label: 'Restaurant Reports',
            data: ['Pending', 'Reviewed', 'To Be Confirmed', 'Completed'].map(status => data.restaurant_reports[status]),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Product Reports',
            data: ['Pending', 'Reviewed', 'To Be Confirmed', 'Completed'].map(status => data.product_reports[status]),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      enquiryData: {
        labels: ['Pending', 'Reviewed', 'To Be Confirmed', 'Completed'],
        datasets: [
          {
            label: 'Restaurant Enquiries',
            data: ['Pending', 'Reviewed', 'To Be Confirmed', 'Completed'].map(status => data.restaurant_enquiry[status]),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Product Enquiries',
            data: ['Pending', 'Reviewed', 'To Be Confirmed', 'Completed'].map(status => data.product_enquiry[status]),
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1
          }
        ]
      }
    };
  };
  
  return (
    <div className="dashboard">
      <h2 className="dashboardTitle">Dashboard</h2>
      <div className="card-container">
        <div className="card user-count"><h4>User Count</h4><p>{userCount}</p></div>
        <div className="card officer-count"><h4>Officer Count</h4><p>{officerCount}</p></div>
        <div className="card reports-count"><h4>Total Reports</h4><p>{reportsCount}</p></div>
        <div className="card enquiries-count"><h4>Total Enquiries</h4><p>{enquiriesCount}</p></div>
      </div>
      <div className="row">
        <div className="half-width">
          <h2 className='dashboardSub'>Total Dataset</h2>
          <div className="graph-container">
            <Bar data={graphData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
        <div className="half-width">
          <h2 className="dashboardSub">Review Dashboard</h2>
          <h5 className='pendingTitle'>Total Pending Reviews: {totalReviewsNeeded}</h5>
          <div className="three-columns">
            {Object.entries(reviewCounts).map(([country, counts]) => (
              <div key={country} className="column">
                <div className="country-section">
                  <h4 className="collapsible">{country.toUpperCase()} - Pending Reviews: {Object.values(counts).reduce((a, b) => a + b, 0)}</h4>
                  <div className="content1">
                    {Object.entries(counts).map(([category, count]) => (
                      <p key={category}>{`${category}: ${count}`}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="row">
        {statusDetails.reportData ? (
          <div className="half-width">
            <h2 className='dashboardSub'>Report Data</h2>
            <Bar data={statusDetails.reportData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </div>
        ) : <p>Loading Report Data...</p>}
        {statusDetails.enquiryData ? (
          <div className="half-width">
            <h2 className='dashboardSub'>Enquiry Data</h2>
            <Bar data={statusDetails.enquiryData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </div>
        ) : <p>Loading Enquiry Data...</p>}
      </div>
      </div>
  );
}  
export default Dashboard;
