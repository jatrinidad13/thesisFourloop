import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct import statement for jwt-decode
import './Login.css';

export function Login({ formType, onLoginSuccess, onBackToDashboard, setFormType }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    ext_name: '',
    confirmPassword: '', // Added for confirm password
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = formType === 'login' ? '/login' : '/register';
    const data = formType === 'login'
      ? { username: formData.username, password: formData.password }
      : formData;``

    try {
      const response = await axios.post(`https://thesisfourloop.onrender.com${endpoint}`, data);

      if (formType === 'login') {
        alert('Login successful!');
        console.log (response);
        const decoded = jwtDecode(response.data.token); // Decode the token
        console.log({ decoded });
        onLoginSuccess(decoded.username, decoded.roles); // Use the username from the decoded token
      } else {
        alert('Registration successful!');
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error);
      alert('An error occurred. Please try again.');
    }
  };
  
  //start of login
  return (
    <div className="l-r-wrapper">
      <form onSubmit={handleSubmit}>
        <h2>{formType === 'login' ? 'Login' : 'Register'}</h2>
        
        {/* Form fields */}
        <div className="input-box">
          <input
            type="text"
            name="username"
            id='username'
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
        </div>

        <div className="input-box">
          <input
            type="password"
            name="password"
            id= "password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
        </div>

        {formType === 'register' && (
          <>
            {/* Additional fields for registration */}
            <div className="input-box">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                placeholder="Middle Name"
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                name="ext_name"
                value={formData.ext_name}
                onChange={handleChange}
                placeholder="Extension Name"
              />
            </div>
          </>
        )}

        <button type="submit">{formType === 'login' ? 'Login' : 'Register'}</button>
      </form>

      {/* Back to Dashboard and conditional redirect links */}
      <p className="back-to-dashboard" onClick={onBackToDashboard} style={{ cursor: 'pointer' }}>
        Back to Dashboard
      </p>
      <p className="switch-link">
        {formType === 'login' ? (
          <span 
            onClick={() => setFormType('register')} 
            style={{ cursor: 'pointer', color: 'blue' }}
          >
            No account? Register here
          </span>
        ) : (
          <span 
            onClick={() => setFormType('login')} 
            style={{ cursor: 'pointer', color: 'blue' }}
          >
            Already have an account? Login here
          </span>
        )}
      </p>
    </div>
  );
}
