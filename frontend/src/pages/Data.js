import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../cssFolder/data.css';
import { useNavigate } from 'react-router-dom';
import EditProductPage from './EditProductPage';
import EditMosquePage from './EditMosquePage';
import EditPrayerRoom from './EditPrayerRoom'
import EditRestaurantPage from './EditRestaurantPage';

// Tab component for country selection
const Tab = ({ name, isSelected, onClick }) => (
  <button
    className={`tab ${isSelected ? 'selected' : ''}`}
    onClick={() => onClick(name)}
  >
    {name}
  </button>
);

// Category component for category selection
const Category = ({ name, isSelected, onClick }) => (
  <button
    className={`category ${isSelected ? 'selected' : ''}`}
    onClick={() => onClick(name)}
  >
    {name}
  </button>
);

// Main Data component
const Data = () => {
  const [selectedCountry, setSelectedCountry] = useState('MALAYSIA');
  const [selectedCategory, setSelectedCategory] = useState('Products');
  const [products, setProducts] = useState([]);
  const [mosques, setMosques] = useState([]);
  const [prayerRoom, setPrayerRoom] = useState([]);
  const [restaurant, setRestaurant] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [filter, setFilter] = useState('');
  const [visibleRows, setVisibleRows] = useState(10);
  const [filterBy, setFilterBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState('');
  const userRole = localStorage.getItem('role');

  const [isEditModalProductOpen, setIsEditModalProductOpen] = useState(false);
  const [isEditModalMosqueOpen, setIsEditModalMosqueOpen] = useState(false);
  const [isEditModalPrayerRoomOpen, setIsEditModalPrayerRoomOpen] = useState(false);
  const [isEditModalRestaurantOpen, setIsEditModalRestaurantOpen] = useState(false);
  const [currentProductData, setCurrentProductData] = useState(null);
  const [currentMosqueData, setCurrentMosqueData] = useState(null);
  const [currentPrayerRoomData, setCurrentPrayerRoomData] = useState(null);
  const [currentRestaurantData, setCurrentRestaurantData] = useState(null);
 
  const [isAddModalProductOpen, setIsAddModalProductOpen] = useState(false);
  const [isAddModalMosqueOpen, setIsAddModalMosqueOpen] = useState(false);
  const [isAddModalPrayerRoomOpen, setIsAddModalPrayerRoomOpen] = useState(false);
  const [isAddModalRestaurantOpen, setIsAddModalRestaurantOpen] = useState(false);

  // Handle opening the Add Data modals
  const handleAddProduct = () => {
    setCurrentProductData(null);
    setIsAddModalProductOpen(true);
  };
  const handleAddMosque = () => {
    setCurrentMosqueData(null);
    setIsAddModalMosqueOpen(true);
  };
  const handleAddPrayerRoom = () => {
    setCurrentPrayerRoomData(null);
    setIsAddModalPrayerRoomOpen(true);
  };
  const handleAddRestaurant = () => {
    setCurrentRestaurantData(null);
    setIsAddModalRestaurantOpen(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProductData({ productID: product, country: selectedCountry });
    setIsEditModalProductOpen(true);
  };

  const handleEditMosques = (mosque) => {
    setCurrentMosqueData({ mosqueprID: mosque, country: selectedCountry });
    setIsEditModalMosqueOpen(true);
  };

  const handleEditPrayerRoom = (prayerroom) => {
    setCurrentPrayerRoomData({ mosqueprID: prayerroom, country: selectedCountry });
    setIsEditModalPrayerRoomOpen(true);
  };

  const handleEditRestaurant = (restaurant) => {
    setCurrentRestaurantData({ restaurantID: restaurant, country: selectedCountry });
    setIsEditModalRestaurantOpen(true);
  };

  const closeModal = () => {
    setIsEditModalProductOpen(false);
    setIsEditModalMosqueOpen(false);
    setIsEditModalPrayerRoomOpen(false);
    setIsEditModalRestaurantOpen(false);
    setIsAddModalProductOpen(false);
    setIsAddModalMosqueOpen(false);
    setIsAddModalPrayerRoomOpen(false);
    setIsAddModalRestaurantOpen(false);
    setCurrentProductData(null); // Optionally reset any modal-specific data
    setCurrentMosqueData(null);
    setCurrentPrayerRoomData(null);
    setCurrentRestaurantData(null);
  };

  // Call this after saving the product to refresh data, if necessary
  const afterSave = () => {
    // Code to refresh products list goes here
    closeModal();
  };

  const countries = ['MALAYSIA', 'THAILAND', 'KOREA'];
  const categories = ['Products', 'Restaurants', 'Mosques', 'Prayer Room'];

  useEffect(() => {
    if (selectedCategory === 'Products') {
      fetchProducts();
    } else if (selectedCategory === 'Mosques') {
      fetchMosques();
    } else if (selectedCategory === 'Prayer Room') {
      fetchPrayerRoom();
    } else if (selectedCategory === 'Restaurants') {
      fetchRestaurants();
    }
  }, [selectedCountry, selectedCategory]);

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      let endpoint = '';
      if (selectedCountry === 'THAILAND') {
        endpoint = 'http://localhost:8085/thaiproduct';
      } else if (selectedCountry === 'KOREA') {
        endpoint = 'http://localhost:8085/krproduct';
      } else {
        // Default to MALAYSIA
        endpoint = 'http://localhost:8085/masproduct';
      }
      const response = await axios.get(endpoint);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setIsFetching(false);
  };

  const fetchMosques = async () => {
    setIsFetching(true);
    try {
      let endpoint = '';
      if (selectedCountry === 'THAILAND') {
        endpoint = 'http://localhost:8085/thailandmosque';
      } else if (selectedCountry === 'KOREA') {
        endpoint = 'http://localhost:8085/koreamosque';
      } else {
        // Default to MALAYSIA
        endpoint = 'http://localhost:8085/malaysiamosque';
      }
      const response = await axios.get(endpoint);
      setMosques(response.data);
    } catch (error) {
      console.error('Error fetching mosque:', error);
    }
    setIsFetching(false);
  };

  const fetchPrayerRoom = async () => {
    setIsFetching(true);
    try {
      let endpoint = '';
      if (selectedCountry === 'THAILAND') {
        endpoint = 'http://localhost:8085/thailandpr';
      } else if (selectedCountry === 'KOREA') {
        endpoint = 'http://localhost:8085/koreapr';
      } else {
        // Default to MALAYSIA
        endpoint = 'http://localhost:8085/malaysiapr';
      }
      const response = await axios.get(endpoint);
      setPrayerRoom(response.data);
    } catch (error) {
      console.error('Error fetching mosque:', error);
    }
    setIsFetching(false);
  };

  const fetchRestaurants = async () => {
    setIsFetching(true);
    try {
      let endpoint = '';
      if (selectedCountry === 'THAILAND') {
        endpoint = 'http://localhost:8085/thailandrestaurant';
      } else if (selectedCountry === 'KOREA') {
        endpoint = 'http://localhost:8085/korearestaurant';
      } else {
        // Default to MALAYSIA
        endpoint = 'http://localhost:8085/malaysiarestaurant';
      }
      const response = await axios.get(endpoint);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
    setIsFetching(false);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const getStatus = (dateString) => {
    if (!dateString) return 'Unknown';
    const today = new Date();
    const expiredDate = new Date(dateString.split('T')[0]);
    return expiredDate < today ? 'Expired' : 'Active';
  };

  const filteredProducts = products.filter((product) => {
    const productName = product.name || "";
    const productBrand = product.brand || "";
    
    const matchesFilter = filterBy === 'name'
      ? productName.toLowerCase().includes(filter)
      : productBrand.toLowerCase().includes(filter);
    
    if (selectedCountry === 'KOREA') {
      return matchesFilter;
    }
    
    if (statusFilter === 'Active' || statusFilter === 'Expired') {
      const status = getStatus(product.date);
      return matchesFilter && status === statusFilter;
    }
    
    return matchesFilter;
  });

  const filteredMosques = mosques.filter((mosque) => {
    const mosqueName = mosque.name || "";

    const matchesFilter = filterBy === 'name'
    ? mosqueName.toLowerCase().includes(filter)
    : false;
        
    return matchesFilter;
  });

  const filteredPrayerRoom = prayerRoom.filter((pr) => {
    const prName = pr.name || "";

    const matchesFilter = filterBy === 'name'
    ? prName.toLowerCase().includes(filter)
    : false;
        
    return matchesFilter;
  });

  const filteredRestaurant = restaurant.filter((restaurant) => {
    const restaurantName = restaurant.name || "";

    const matchesFilter = filterBy === 'name'
    ? restaurantName.toLowerCase().includes(filter)
    : false;
        
    return matchesFilter;
  });

  useEffect(() => {
    setVisibleRows(5); // Reset visible rows on product change
  }, [products,prayerRoom, mosques, restaurant]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setVisibleRows((prevVisibleRows) => prevVisibleRows + 10);
    }
  };

  const displayedProducts = filteredProducts.slice(0, visibleRows);
  const displayedMosques = filteredMosques.slice(0, visibleRows);
  const displayedPrayerRoom = filteredPrayerRoom.slice(0, visibleRows);
  const displayedRestaurant = filteredRestaurant.slice(0, visibleRows);

  const getImageUrl = (country, imageURL) => {
    switch (country) {
      case 'MALAYSIA':
        return `http://localhost:8085/images/malaysiaProductImage/${imageURL}`;
      case 'KOREA':
        return `http://localhost:8085/images/koreaProductImage/${imageURL}`;
      case 'THAILAND':
        return `http://localhost:8085/images/thailandProductImage/${imageURL}`;
      default:
        return ''; // Default case or you can put a placeholder image
    }
  };

  return (
    <div>
      <div className="tabs">
        {countries.map((country) => (
          <Tab key={country} name={country} isSelected={selectedCountry === country} onClick={setSelectedCountry} />
        ))}
      </div>
      <div className="categories">
        {categories.map((category) => (
          <Category key={category} name={category} isSelected={selectedCategory === category} onClick={setSelectedCategory} />
        ))}
      </div>
      <div className="data-component">
      
      <div className="filter-controls">
        {selectedCategory === 'Products' && (
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="filter-type-selector">
            <option value="name">Name</option>
            <option value="brand">Brand</option>
          </select>
        )}
        <input type="text" placeholder="Type to search..." className="filter-input" value={filter} onChange={handleFilterChange} />
        {selectedCategory === 'Products' && (
        <button className="add-data-button" onClick={handleAddProduct}>Add Data</button>
        )}
        {selectedCategory === 'Restaurants' && (
          <button className="add-data-button" onClick={handleAddRestaurant}>Add Data</button>
        )}
        {selectedCategory === 'Mosques' && (
          <button className="add-data-button" onClick={handleAddMosque}>Add Data</button>
        )}
        {selectedCategory === 'Prayer Room' && (
          <button className="add-data-button" onClick={handleAddPrayerRoom}>Add Data</button>
        )}
        </div>
        <div className="content">
          {isFetching ? (
            <p>Loading...</p>
          ) : (
            <>
              {selectedCategory === 'Products' && (
                <div className="scrollable-table-container" onScroll={handleScroll} >
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      {selectedCountry !== 'KOREA' && <th>Expired Date</th>}
                      <th>Brand</th>
                      <th>Name</th>
                      {selectedCountry !== 'KOREA' && (
                        <th>
                          Status
                        <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-selector"
                        style={{ marginLeft: '10px' }}
                        disabled={selectedCountry === 'KOREA'} // Disable the dropdown for Korea
                      >
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                      </select>
                        </th>
                      )}
                      <th>Image</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody className="table-scroll">
                    {displayedProducts.map((product) => (
                      <tr key={product.productID}>
                        <td>{product.productID}</td>
                        {selectedCountry !== 'KOREA' && <td>{product.date ? product.date.split('T')[0] : 'N/A'}</td>}
                        <td>{product.brand}</td>
                        <td>{product.name}</td>
                        {selectedCountry !== 'KOREA' && <td>{product.date ? getStatus(product.date) : 'Unknown'}</td>}
                        <td>
                        <img 
                            src={getImageUrl(selectedCountry, product.imageURL)} 
                            alt={product.name} 
                            style={{ width: '100px', height: 'auto' }} 
                          />
                        </td>
                        <td>
                          <button onClick={() => handleEditProduct(product.productID, selectedCountry)} disabled={userRole !== 'data admin'} className="edit-button">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}{selectedCategory === 'Restaurants' && (
                <div className="scrollable-table-container" onScroll={handleScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Location</th>
                      <th>State</th>
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody className="table-scroll">
                    {displayedRestaurant.map((restaurant) => (
                      <tr key={restaurant.restaurantID}>
                        <td>{restaurant.restaurantID}</td>
                        <td>{restaurant.name}</td>
                        <td>{restaurant.address}</td>
                        <td>{restaurant.region}</td>
                        <td>
                        <button onClick={() => handleEditRestaurant(restaurant.restaurantID, selectedCountry)} disabled={userRole !== 'data admin'} className="edit-button">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
              {selectedCategory === 'Mosques' && (
                <div className="scrollable-table-container" onScroll={handleScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Address</th>
                      <th>State</th>
                      {selectedCountry === 'MALAYSIA' && <th>District</th>}
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody className="table-scroll">
                    {displayedMosques.map((mosque) => (
                      <tr key={mosque.mosqueprID}>
                        <td>{mosque.mosqueprID}</td>
                        <td>{mosque.name}</td>
                        <td>{mosque.address}</td>
                        <td>{mosque.state}</td>
                        {selectedCountry === 'MALAYSIA' && <td>{mosque.district}</td>}
                        <td>
                        <button onClick={() => handleEditMosques(mosque.mosqueprID, selectedCountry)} disabled={userRole !== 'data admin'} className="edit-button">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
              
              {selectedCategory === 'Prayer Room' && (
                <div className="scrollable-table-container" onScroll={handleScroll}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Address</th>
                      <th>State</th>
                      {selectedCountry === 'MALAYSIA' && <th>District</th>}
                      <th>Edit</th>
                    </tr>
                  </thead>
                  <tbody className="table-scroll">
                    {displayedPrayerRoom.map((pr) => (
                      <tr key={pr.mosqueprID}>
                        <td>{pr.mosqueprID}</td>
                        <td>{pr.name}</td>
                        <td>{pr.address}</td>
                        <td>{pr.state}</td>
                        {selectedCountry === 'MALAYSIA' && <td>{pr.district}</td>}
                        <td>
                          <button onClick={() => handleEditPrayerRoom(pr.mosqueprID, selectedCountry)} disabled={userRole !== 'data admin'} className="edit-button">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {isEditModalProductOpen && (
        <div className="modalbackdrop">
          <div className="modalcontent">
          <button className="closebutton" onClick={closeModal}>&times;</button> {/* Close button */}
            <EditProductPage 
              productData={currentProductData}
              country={selectedCountry}
              onClose={closeModal} // Here you're passing closeModal function from Data as onClose prop
              onSave={afterSave}
              isAdding={false}
            />
          </div>
        </div>
      )}
      {isEditModalMosqueOpen && (
        <div className="modalbackdrop">
          <div className="modalcontent">
          <button className="closebutton" onClick={closeModal}>&times;</button>
            <EditMosquePage 
              mosqueData={currentMosqueData}
              onClose={closeModal} // Here you're passing closeModal function from Data as onClose prop
              onSave={afterSave}
            />
          </div>
        </div>
      )}
      {isEditModalPrayerRoomOpen && (
        <div className="modalbackdrop">
          <div className="modalcontent">
          <button className="closebutton" onClick={closeModal}>&times;</button>
            <EditPrayerRoom
              prayerRoomData={currentPrayerRoomData}
              onClose={closeModal} // Here you're passing closeModal function from Data as onClose prop
              onSave={afterSave}
            />
          </div>
        </div>
      )}
      {isEditModalRestaurantOpen && (
        <div className="modalbackdrop">
          <div className="modalcontent">
          <button className="closebutton" onClick={closeModal}>&times;</button>
            <EditRestaurantPage
              restaurantData={currentRestaurantData}
              onClose={closeModal} // Here you're passing closeModal function from Data as onClose prop
              onSave={afterSave}
            />
          </div>
        </div>
      )}
      {isAddModalProductOpen && (
          <div className="modalbackdrop">
              <div className="modalcontent">
                  <button className="closebutton" onClick={closeModal}>&times;</button>
                  <EditProductPage onSave={afterSave} onClose={closeModal} country={selectedCountry} isAdding={true} />
              </div>
          </div>
        )}
    </div>
  );
};

export default Data;
