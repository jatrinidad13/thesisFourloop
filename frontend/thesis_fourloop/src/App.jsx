import React, { useState, useEffect } from 'react';
import { Login } from './Login';
import { Header } from './Header';
import Map from './Map';
import Graphs from './Graphs';
import Admin from './Admin';
import './App.css';

const App = () => {
  const [formType, setFormType] = useState(null);
  const [username, setUsername] = useState(null);
  const [roles, setUserRoles] = useState(null);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [isAdminVisible, setIsAdminVisible] = useState(false);

  useEffect(() => {
    if (username) {
      const fetchUserRoles = async () => {
        try {
          const response = await fetch('/userinfo');
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

  const handleLoginSuccess = (username, roles) => {
    setUsername(username);
    setUserRoles(roles);
    setFormType(null);
  };

  const handleLogout = () => {
    setUsername(null);
    setUserRoles(null);
    setIsAdminVisible(false);
  };

  const handleNavigateToAdmin = () => {
    setIsAdminVisible((prev) => !prev);
    if (isAdminVisible) {
      setIsGraphVisible(false);
    }
  };

    // Fetch pins from the database on component mount
    useEffect(() => {
      const fetchPins = async () => {
        const response = await fetch('/api/markers');
        const data = await response.json();
        setPins(data);
      };
      fetchPins();
    }, []);
    
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
          {isAdminVisible ? (
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
