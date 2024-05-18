import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust the path as necessary
import Login from './pages/Login';
import Data from './pages/Data'
import Home from './pages/Home';
import Profile from './pages/Profile';
import { UserProvider } from './UserContext'; // Ensure this is correctly imported
import EditProductPage from './pages/EditProductPage';
import EditMosquePage from './pages/EditMosquePage';
import ReportPage from './pages/Reports';
import ProductReportPage from './pages/ProductReport';
import ReportHeadOfficer from './pages/ReportHeadOfficer';
import EnquiryPage from './pages/Enquiry';
import EnquiryHeadOfficer from './pages/EnquiryHeadOfficer';
import VerifyData from './pages/VerifyData';

// Create a component to conditionally render the Navbar
const LayoutWithConditionalNavbar = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && <Navbar />}
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/home' element={<Home />} />
        <Route path='/data' element={<Data />} />
        <Route path="/editProduct/:productId" element={<EditProductPage />} />
        <Route path="/editMosque/:mosqueprId" element={<EditMosquePage />} />
        <Route path="/editPrayerRoom/:productId" element={<EditMosquePage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/report' element={<ReportPage />} />
        <Route path="/productReport/:reportId/:category" element={<ProductReportPage />} />
        <Route path="/reportHeadOfficer/:reportId/:category" element={<ReportHeadOfficer />} />
        <Route path='/enquiry' element={<EnquiryPage />} />
        <Route path='/verifyData' element={<VerifyData />} />
        <Route path="/enquiryHeadOfficer/:reportId/:category" element={<EnquiryHeadOfficer />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        {/* Render LayoutWithConditionalNavbar within UserProvider to have access to user context */}
        <LayoutWithConditionalNavbar />
      </UserProvider>
    </BrowserRouter>
  );
}



export default App;
