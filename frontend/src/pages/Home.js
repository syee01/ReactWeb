import React, { useEffect, useState } from 'react';
import '../cssFolder/dashboard.css'; // Adjust the path as necessary
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering components required for the bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // State for counts
  const [userCount, setUserCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [enquiriesCount, setEnquiriesCount] = useState(0);

  // State for the graph data
  const [graphData, setGraphData] = useState({
    labels: ['Products', 'Restaurants', 'Mosques', 'Prayer Rooms'],
    datasets: [{
      label: 'Malaysia',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    },
    {
      label: 'Korea',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    },
    {
      label: 'Thailand',
      data: [],
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1
    }]
  });

  useEffect(() => {
    const fetchData = async (endpoint) => {
      const response = await fetch(`http://localhost:8085/${endpoint}`);
      return response.json();
    };

    const loadData = async () => {
      // Example of fetching counts for user, reports, and enquiries
      const usersData = await fetchData('user-count');
      setUserCount(usersData.usersCount);
      const reportsData = await fetchData('reports-count');
      setReportsCount(reportsData.totalReports);
      const enquiriesData = await fetchData('enquiries-count');
      setEnquiriesCount(enquiriesData.totalEnquiries);

      // Fetch and set data for the graph
      // This is a placeholder - replace it with your actual data fetching logic
      const graphDataResponse = await fetchData('api/data');
      // Assuming the response data is an array of counts
      // Adjust according to your actual data structure
      setGraphData({
        ...graphData,
        datasets: graphData.datasets.map((dataset, index) => {
          let countryKey;
          if (index === 0) countryKey = "malaysia";
          else if (index === 1) countryKey = "korea";
          else if (index === 2) countryKey = "thailand";
          
          return {
            ...dataset,
            data: graphDataResponse.data[countryKey] // Directly assign the array of counts
          };
        })
      });
    }

    loadData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h1>Dashboard</h1>
      </div>
      <div className="card-container">
        <div className="card user-count">
          <h2 className='smalltitle'>User Count</h2>
          <p>{userCount}</p>
        </div>
        <div className="card reports-count">
          <h2 className='smalltitle'>Total Reports Submitted</h2>
          <p>{reportsCount}</p>
        </div>
        <div className="card enquiries-count">
          <h2 className='smalltitle'>Total Enquiries Submitted</h2>
          <p>{enquiriesCount}</p>
        </div>
      </div>
      <div className="graph-container">
        <Bar data={graphData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>
  );
};

export default Dashboard;
