import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import './EditProfile.css';
import { API_BASEURL } from '../../variables';

// Create axios instance with proper configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || API_BASEURL



; 
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const EditProfile = () => {
  // Set the app element for accessibility after component mounts
  useEffect(() => {
    // Try to set the app element safely
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && document.getElementById('root')) {
        Modal.setAppElement('#root');
      } else if (typeof window !== 'undefined' && document.body) {
        // Fallback to body if root is not available
        Modal.setAppElement('body');
      }
    } catch (error) {
      console.error("Failed to set app element for Modal:", error);
    }
  }, []);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    designation: '',
    mobile: '',
    dateOfBirth: '',
    dateOfJoining: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    department: '',
    role: '',
    status: ''
  });
  
  const fetchUserProfile = useCallback(async (loginName) => {
    try {
      const encodedLoginName = encodeURIComponent(loginName);
      console.log('Fetching profile for:', encodedLoginName);
      
      // Updated endpoint to match your API structure
      const response = await axiosInstance.get(`/userlist/users/profile/${encodedLoginName}`);
      console.log('Profile data received:', response.data);
      
      setUserProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error details:', error);
      console.error('Response:', error.response);
      
      handleError(error.response?.data?.message || 'Error fetching user profile');
      setLoading(false);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const loginName = localStorage.getItem('loggedInUser');
    console.log('Logged in user:', loginName);
    
    if (!loginName) {
      console.log('No logged in user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    fetchUserProfile(loginName);
  }, [fetchUserProfile, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
      case 'mobile':
        return /^\+?[\d\s-]{10,}$/.test(value) ? '' : 'Invalid mobile number';
      case 'address.street':
        return value.trim() ? '' : 'Street address is required';
      case 'address.city':
        return value.trim() ? '' : 'City is required';
      case 'address.state':
        return value.trim() ? '' : 'State is required';
      case 'address.postalCode':
        return value.trim() ? '' : 'Postal code is required';
      case 'address.country':
        return value.trim() ? '' : 'Country is required';
      default:
        return '';
    }
  };

  const validateProfile = (profile) => {
    const errors = [];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email || !emailRegex.test(profile.email)) {
      errors.push('Please provide a valid email');
    }

    const mobileRegex = /^\+?[\d\s-]{10,}$/;
    if (!profile.mobile || !mobileRegex.test(profile.mobile)) {
      errors.push('Please provide a valid mobile number');
    }

    const addressFields = [
      { field: 'street', label: 'Street' },
      { field: 'city', label: 'City' },
      { field: 'state', label: 'State' },
      { field: 'postalCode', label: 'Postal Code' },
      { field: 'country', label: 'Country' }
    ];

    addressFields.forEach(({ field, label }) => {
      if (!profile.address[field] || profile.address[field].trim() === '') {
        errors.push(`Address ${label} is required`);
      }
    });

    return errors;
  };

  const handleInputChange = (name, value) => {
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setUserProfile({
        ...userProfile,
        address: {
          ...userProfile.address,
          [addressField]: value
        }
      });
    } else {
      setUserProfile({ ...userProfile, [name]: value });
    }
    
    setFieldErrors({
      ...fieldErrors,
      [name]: validateField(name, value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProfile(userProfile);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    try {
      console.log('Submitting profile update:', userProfile);
      // Updated endpoint to match your API structure
      await axiosInstance.put(`/userlist/users/profile/${userProfile._id}`, userProfile);
      handleSuccess('Profile updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
      handleError(error.response?.data?.message || 'Error updating profile');
    }
  };

  const renderProfileForm = () => (
    <form onSubmit={handleSubmit} className="ep-profile-form">
      {/* First row with two fields */}
      <div className="ep-form-row">
        <div className="ep-form-group">
          <label>Email:</label>
          <input
            type="email"
            value={userProfile.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`ep-form-control ${fieldErrors.email ? 'error' : ''}`}
          />
          {fieldErrors.email && <div className="ep-error-message">{fieldErrors.email}</div>}
        </div>
  
        <div className="ep-form-group">
          <label>Mobile:</label>
          <input
            type="text"
            value={userProfile.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value)}
            className={`ep-form-control ${fieldErrors.mobile ? 'error' : ''}`}
          />
          {fieldErrors.mobile && <div className="ep-error-message">{fieldErrors.mobile}</div>}
        </div>
      </div>
  
      
  
      {/* Second row with two fields */}
      <div className="ep-form-row">
        <div className="ep-form-group full-width">
          <label>Street Address:</label>
          <input
            type="text"
            value={userProfile.address.street}
            onChange={(e) => handleInputChange('address.street', e.target.value)}
            className={`ep-form-control ${fieldErrors['address.street'] ? 'error' : ''}`}
          />
          {fieldErrors['address.street'] && <div className="ep-error-message">{fieldErrors['address.street']}</div>}
        </div>
        <div className="ep-form-group">
          <label>City:</label>
          <input
            type="text"
            value={userProfile.address.city}
            onChange={(e) => handleInputChange('address.city', e.target.value)}
            className={`ep-form-control ${fieldErrors['address.city'] ? 'error' : ''}`}
          />
          {fieldErrors['address.city'] && <div className="ep-error-message">{fieldErrors['address.city']}</div>}
        </div>
      </div>

      <div className="ep-form-row">
        <div className="ep-form-group">
          <label>State:</label>
          <input
            type="text"
            value={userProfile.address.state}
            onChange={(e) => handleInputChange('address.state', e.target.value)}
            className={`ep-form-control ${fieldErrors['address.state'] ? 'error' : ''}`}
          />
          {fieldErrors['address.state'] && <div className="ep-error-message">{fieldErrors['address.state']}</div>}
        </div>
        <div className="ep-form-group">
          <label>Postal Code:</label>
          <input
            type="text"
            value={userProfile.address.postalCode}
            onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
            className={`ep-form-control ${fieldErrors['address.postalCode'] ? 'error' : ''}`}
          />
          {fieldErrors['address.postalCode'] && <div className="ep-error-message">{fieldErrors['address.postalCode']}</div>}
        </div>
      </div>
      
      <div className="ep-form-row">
        <div className="ep-form-group">
          <label>Country:</label>
          <input
            type="text"
            value={userProfile.address.country}
            onChange={(e) => handleInputChange('address.country', e.target.value)}
            className={`ep-form-control ${fieldErrors['address.country'] ? 'error' : ''}`}
          />
          {fieldErrors['address.country'] && <div className="ep-error-message">{fieldErrors['address.country']}</div>}
        </div>
      </div>
    </form>
  );

  if (loading) {
    return <div className="ep-loading">Loading...</div>;
  }

  return (
    <div className="ep-edit-profile-container">
      <ToastContainer />
      <h1>Profile Details</h1>
      
      <div className="ep-profile-details">
        <div className="ep-detail-row">
          <label>Name:</label>
          <span>{userProfile.name}</span>
        </div>
        <div className="ep-detail-row">
          <label>Email:</label>
          <span>{userProfile.email}</span>
        </div>
        <div className="ep-detail-row">
          <label>Designation:</label>
          <span>{userProfile.designation}</span>
        </div>
        <div className="ep-detail-row">
          <label>Department:</label>
          <span>{userProfile.department}</span>
        </div>
        <div className="ep-detail-row">
          <label>Mobile:</label>
          <span>{userProfile.mobile}</span>
        </div>
        <div className="ep-detail-row">
          <label>Date of Birth:</label>
          <span>{userProfile.dateOfBirth}</span>
        </div>
        <div className="ep-detail-row">
          <label>Date of Joining:</label>
          <span>{userProfile.dateOfJoining}</span>
        </div>
        <div className="ep-detail-row">
          <label>Address:</label>
          <span>
            {userProfile.address.street}, {userProfile.address.city}, {userProfile.address.state},
            {userProfile.address.postalCode}, {userProfile.address.country}
          </span>
        </div>
        <div className="ep-detail-row">
          <label>Role:</label>
          <span>{userProfile.role}</span>
        </div>
        <div className="ep-detail-row">
          <label>Status:</label>
          <span>{userProfile.status}</span>
        </div>
      </div>

      <div className="ep-profile-actions">
        <button onClick={() => setIsEditModalOpen(true)} className="ep-btn-primary">
          Edit Profile
        </button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="ep-modal-content"
        overlayClassName="ep-modal-overlay"
        ariaHideApp={false} // This is important to prevent the toggle error
      >
        <div className="ep-modal-header">
          <h2>Edit Your Information</h2>
          <button onClick={() => setIsEditModalOpen(false)} className="ep-modal-close">×</button>
        </div>
        <div className="ep-modal-body">
          {renderProfileForm()}
        </div>
        <div className="ep-modal-footer">
          <button onClick={handleSubmit} className="ep-btn-primary">Save Changes</button>
          <button onClick={() => setIsEditModalOpen(false)} className="ep-btn-secondary">Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default EditProfile;