import React, { useState, useEffect } from 'react';
import { Login } from './Login';
import { Header } from './Header';
import Map from './Map';
import Graphs from './Graphs';
import Admin from './Admin';
import Collector from './Collector';
import './App.css';

const App = () => {
  const [formType, setFormType] = useState(null);
  const [username, setUsername] = useState(null);
  const [roles, setUserRoles] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [truckNum, setTruckNum] = useState(null);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch user roles after login
  useEffect(() => {
    if (username) {
      const fetchUserRoles = async () => {
        try {
          console.log({truckNum});
          return;
          const response = await fetch('https://thesisfourloop.onrender.com/userinfo', {
            method: 'GET',
            credentials: 'include',  // Include cookies for token
          });
          console.log({response});
          if (response.ok) {
            const data = await response.json();
            console.log('Received User Info:', data.user);  // Log user info response
            setUserRoles(data.roles);  // Set the roles state
          } else {
            console.error('Failed to fetch user role:', response.status);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      };
      fetchUserRoles();
    }
  }, [username]);

  // Fetch GeoJSON data for the map
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const response = await fetch('/shapefiles/sampleroutes.json');
        if (response.ok) {
          const data = await response.json();
          setGeoJsonData(data);
        } else {
          console.error('Failed to fetch GeoJSON data.');
        }
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    };

    fetchGeoJson();
  }, []);

  // Handle login success
  const handleLoginSuccess = (username, roles, truckNum, token) => {
    console.log('Received Token:', token);  // Log token to console for debugging
    setUsername(username);
    setUserRoles(roles);  // Set user roles after login
    setTruckNum(truckNum);
    setFormType(null);  // Close login form
  };

  // Handle logout
  const handleLogout = () => {
    setUsername(null);
    setUserRoles(null);
    setTruckNum(null);
    setIsAdminVisible(false);
  };

  // Handle Admin navigation toggle
  const handleNavigateToAdmin = () => {
    setIsAdminVisible((prev) => !prev);
    if (isAdminVisible) {
      setIsGraphVisible(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderSidebarContent = () => {
    return (
      <>
        <div className="sidebar-header">
          <h1>Waste Management</h1>
          <button className="close-button" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        
        <div className="sidebar-content">
          {username ? (
            <>
              <div className="sidebar-section">
                <div className="user-info">
                  <div className="user-avatar">
                    {username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3>{username}</h3>
                    <p>Role: {roles}</p>
                  </div>
                </div>
              </div>
              
              <div className="sidebar-section">
                <ul className="nav-links">
                  {roles === 'admin' && (
                    <li>
                      <a href="#" onClick={handleNavigateToAdmin}>
                        {isAdminVisible ? 'View Map' : 'Admin Panel'}
                      </a>
                    </li>
                  )}
                  <li>
                    <a href="#" onClick={handleLogout}>Logout</a>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="sidebar-section">
              <div className="login-register">
                <a href="#" onClick={() => setFormType('login')}>Login</a>
                <span>|</span>
                <a href="#" onClick={() => setFormType('register')}>Register</a>
              </div>
            </div>
          )}
          
          {/* Add additional sidebar sections as needed */}
        </div>
      </>
    );
  };

  return (
    <div className="App">
      {/* Hamburger Menu Button - only show when sidebar is closed */}
      {!isSidebarOpen && (
        <button className="menu-button" onClick={toggleSidebar}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {renderSidebarContent()}
      </div>

      {/* Main Content */}
      {formType ? (
        <Login 
          formType={formType} 
          onLoginSuccess={handleLoginSuccess} 
          onBackToDashboard={() => setFormType(null)} 
          setFormType={setFormType} 
        />
      ) : (
        <>
          {roles === 'collector' ? (
            <Collector truckNum={truckNum} geoJsonData={geoJsonData} />
          ) : isAdminVisible ? (
            <Admin userRole={roles} />
          ) : (
            <>
              <button
                className="button-graph"
                onClick={() => setIsGraphVisible(!isGraphVisible)}
              >
                {isGraphVisible ? 'Hide Graph' : 'Show Graph'}
              </button>
              {isGraphVisible && <Graphs />}
              <Map userRoles={roles} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;
