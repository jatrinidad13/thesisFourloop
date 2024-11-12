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

  useEffect(() => {
    if (username) {
      const fetchUserRoles = async () => {
        try {
          const response = await fetch('https://thesisfourloop.onrender.com/userinfo');
          const data = await response.json();
          setUserRoles(data.roles);
          console.log('User Role:', data.roles);
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      };
      fetchUserRoles();
    }
  }, [username]);
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
  const handleLoginSuccess = (username, roles, truckNum) => {
    setUsername(username);
    setUserRoles(roles);
    setTruckNum(truckNum);
    setFormType(null);
  };

  const handleLogout = () => {
    setUsername(null);
    setUserRoles(null);
    setTruckNum(null);
    setIsAdminVisible(false);
  };

  const handleNavigateToAdmin = () => {
    setIsAdminVisible((prev) => !prev);
    if (isAdminVisible) {
      setIsGraphVisible(false);
    }
  };

  return (
    <div className="App">
      <div className="header" style={{ display: formType ? 'none' : 'flex' }}>
        <Header 
          username={username} 
          roles={roles} 
          onLogout={handleLogout} 
          onNavigateToAdmin={handleNavigateToAdmin} 
          isAdminVisible={isAdminVisible} 
        />
        <div className="login-register">
          {!username && (
            <p>
              <a href="#" onClick={() => setFormType('login')}>Login</a> | 
              <a href="#" onClick={() => setFormType('register')}>Register</a>
            </p>
          )}
        </div>
      </div>

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
