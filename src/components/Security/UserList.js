import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import './UserList.css';
import { API_BASEURL } from '../../variables';

Modal.setAppElement('#root');

const UserList = () => {
  const [searchName, setSearchName] = useState('');
  const [searchUserType, setSearchUserType] = useState('');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentUser, setCurrentUser] = useState({
    name: '',
    email: '',
    password: '',
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
    role: 'visitor',
    status: 'active',
    company: ''
  });
  // Fetch clients for company dropdown
  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_BASEURL}/client`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Error fetching client list');
    }
  };
  

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASEURL}/userlist/users`);

      setAllUsers(response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format';
      case 'password':
        return !currentUser._id && value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'designation':
        return value.trim() ? '' : 'Designation is required';
      case 'mobile':
        return /^\+?[\d\s-]{10,}$/.test(value) ? '' : 'Invalid mobile number';
      case 'dateOfBirth':
        return value ? '' : 'Date of birth is required';
      case 'dateOfJoining':
        return value ? '' : 'Date of joining is required';
      case 'department':
        return value.trim() ? '' : 'Department is required';
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
      case 'role':
        return ["admin", "client", "client user", "user", "visitor"].includes(value) ? '' : 'Invalid role';
      case 'company':
          return (currentUser.role === 'client' || currentUser.role === 'client user') && !value ? 'Company is required for client and client user roles' : '';
      default:
        return '';
    }
  };

  const validateUser = (user) => {
    const errors = [];
    
    // Basic field validations
    const requiredFields = [
      { field: 'name', label: 'Name' },
      { field: 'designation', label: 'Designation' },
      { field: 'department', label: 'Department' },
      { field: 'dateOfBirth', label: 'Date of Birth' },
      { field: 'dateOfJoining', label: 'Date of Joining' }
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!user[field] || user[field].trim() === '') {
        errors.push(`${label} is required`);
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!user.email || !emailRegex.test(user.email)) {
      errors.push('Please provide a valid email');
    }

    // Password validation (only for new users)
    if (!user._id && (!user.password || user.password.length < 6)) {
      errors.push('Password must be at least 6 characters long');
    }

    // Mobile validation
    const mobileRegex = /^\+?[\d\s-]{10,}$/;
    if (!user.mobile || !mobileRegex.test(user.mobile)) {
      errors.push('Please provide a valid mobile number');
    }

    // Address validation
    const addressFields = [
      { field: 'street', label: 'Street' },
      { field: 'city', label: 'City' },
      { field: 'state', label: 'State' },
      { field: 'postalCode', label: 'Postal Code' },
      { field: 'country', label: 'Country' }
    ];

    addressFields.forEach(({ field, label }) => {
      if (!user.address[field] || user.address[field].trim() === '') {
        errors.push(`Address ${label} is required`);
      }
    });
    if ((user.role === 'client' || user.role === 'client user') && !user.company) {
      errors.push('Company is required for client and client user roles');
    }

    // Role validation
    const validRoles = ["admin", "client", "client user", "user", "visitor"];
    if (!validRoles.includes(user.role)) {
      errors.push('Invalid role specified');
    }

    
    
    return errors;
  };
  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`/userlist/users/${user._id}`, {
        ...user,
        status: newStatus
      });
      await fetchUsers();
      handleSuccess(`User status set to ${newStatus} successfully`);
    } catch (error) {
      handleError('Error updating user status');
    }
  };

  const handleInputChange = (name, value) => {
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setCurrentUser({
        ...currentUser,
        address: {
          ...currentUser.address,
          [addressField]: value
        }
      });
    } 
    else if (name === 'role') {
      const updatedUser = {
        ...currentUser,
        [name]: value
      };
  
      if (value !== 'client' && value !== 'client user') {
        updatedUser.company = ''; 
      }
  
      setCurrentUser(updatedUser);
    }
    else {
      setCurrentUser({ 
        ...currentUser, 
        [name]: value 
      });
    }
    setFieldErrors({
      ...fieldErrors,
      [name]: validateField(name, value)
    });
  };

  const handleSearch = () => {
    const filteredUsers = allUsers.filter(user => {
      return (
        (!searchName || user.name.toLowerCase().includes(searchName.toLowerCase())) &&
        (!searchUserType || user.role === searchUserType)
      );
    });
    setUsers(filteredUsers);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchUserType('');
    setUsers(allUsers);
  };

  const handleCreateUser = async () => {
    const validationErrors = validateUser(currentUser);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    try {
      const response = await axios.post(`${API_BASEURL}/userlist/users`, currentUser);
      await fetchUsers();
      handleSuccess('User created successfully');
      setIsCreateModalOpen(false);
      resetCurrentUser();
    } catch (error) {
      handleError(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser({ ...user });
    setFieldErrors({});
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    const validationErrors = validateUser(currentUser);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    try {
      await axios.put(`/userlist/users/${currentUser._id}`, currentUser);
      await fetchUsers();
      handleSuccess('User updated successfully');
      setIsEditModalOpen(false);
      resetCurrentUser();
    } catch (error) {
      handleError('Error updating user');
    }
  };

  

  

  const resetCurrentUser = () => {
    setCurrentUser({
      name: '',
      email: '',
      password: '',
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
      role: 'visitor',
      status: 'active'
    });
    setFieldErrors({});
  };

  const renderUserForm = () => (
    <div className="modal-form">
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={currentUser.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`form-control ${fieldErrors.name ? 'error' : ''}`}
        />
        {fieldErrors.name && <div className="error-message">{fieldErrors.name}</div>}
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={currentUser.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`form-control ${fieldErrors.email ? 'error' : ''}`}
        />
        {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}
      </div>

      {(!currentUser._id || isCreateModalOpen) && (
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={currentUser.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`form-control ${fieldErrors.password ? 'error' : ''}`}
          />
          {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}
        </div>
      )}

      <div className="form-group">
        <label>Designation:</label>
        <input
          type="text"
          value={currentUser.designation}
          onChange={(e) => handleInputChange('designation', e.target.value)}
          className={`form-control ${fieldErrors.designation ? 'error' : ''}`}
        />
        {fieldErrors.designation && <div className="error-message">{fieldErrors.designation}</div>}
      </div>

      <div className="form-group">
        <label>Department:</label>
        <input
          type="text"
          value={currentUser.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          className={`form-control ${fieldErrors.department ? 'error' : ''}`}
        />
        {fieldErrors.department && <div className="error-message">{fieldErrors.department}</div>}
      </div>

      <div className="form-group">
        <label>Mobile:</label>
        <input
          type="text"
          value={currentUser.mobile}
          onChange={(e) => handleInputChange('mobile', e.target.value)}
          className={`form-control ${fieldErrors.mobile ? 'error' : ''}`}
        />
        {fieldErrors.mobile && <div className="error-message">{fieldErrors.mobile}</div>}
      </div>

      <div className="form-group">
        <label>Date of Birth:</label>
        <input
          type="date"
          value={currentUser.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          className={`form-control ${fieldErrors.dateOfBirth ? 'error' : ''}`}
        />
        {fieldErrors.dateOfBirth && <div className="error-message">{fieldErrors.dateOfBirth}</div>}
      </div>

      <div className="form-group">
        <label>Date of Joining:</label>
        <input
          type="date"
          value={currentUser.dateOfJoining}
          onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
          className={`form-control ${fieldErrors.dateOfJoining ? 'error' : ''}`}
        />
        {fieldErrors.dateOfJoining && <div className="error-message">{fieldErrors.dateOfJoining}</div>}
      </div>

      <div className="form-group">
        <label>Street Address:</label>
        <input
          type="text"
          value={currentUser.address.street}
          onChange={(e) => handleInputChange('address.street', e.target.value)}
          className={`form-control ${fieldErrors['address.street'] ? 'error' : ''}`}
        />
        {fieldErrors['address.street'] && <div className="error-message">{fieldErrors['address.street']}</div>}
      </div>

      <div className="form-group">
        <label>City:</label>
        <input
          type="text"
          value={currentUser.address.city}
          onChange={(e) => handleInputChange('address.city', e.target.value)}
          className={`form-control ${fieldErrors['address.city'] ? 'error' : ''}`}
        />
        {fieldErrors['address.city'] && <div className="error-message">{fieldErrors['address.city']}</div>}
      </div>

      <div className="form-group">
        <label>State:</label>
        <input
          type="text"
          value={currentUser.address.state}
          onChange={(e) => handleInputChange('address.state', e.target.value)}
          className={`form-control ${fieldErrors['address.state'] ? 'error' : ''}`}
        />
        {fieldErrors['address.state'] && <div className="error-message">{fieldErrors['address.state']}</div>}
      </div>

      <div className="form-group">
        <label>Postal Code:</label>
        <input
          type="text"
          value={currentUser.address.postalCode}
          onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
          className={`form-control ${fieldErrors['address.postalCode'] ? 'error' : ''}`}
        />
        {fieldErrors['address.postalCode'] && <div className="error-message">{fieldErrors['address.postalCode']}</div>}
      </div>

      <div className="form-group">
        <label>Country:</label>
        <input
          type="text"
          value={currentUser.address.country}
          onChange={(e) => handleInputChange('address.country', e.target.value)}
          className={`form-control ${fieldErrors['address.country'] ? 'error' : ''}`}
        />
        {fieldErrors['address.country'] && <div className="error-message">{fieldErrors['address.country']}</div>}
      </div>

      <div className="form-group">
        <label>Role:</label>
        <select
          value={currentUser.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
          className={`form-control ${fieldErrors.role ? 'error' : ''}`}
        >
          <option value="admin">Admin</option>
          <option value="client">Client</option>
          <option value="client user">Client User</option>
          <option value="user">User</option>
          <option value="visitor">Visitor</option>
        </select>
        {fieldErrors.role && <div className="error-message">{fieldErrors.role}</div>}
      </div>
      {(currentUser.role === 'client' || currentUser.role === 'client user') && (
      <div className="form-group">
        <label>Company:</label>
        <select
          value={currentUser.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          className={`form-control ${fieldErrors.company ? 'error' : ''}`}
          required
        >
          <option value="">Select Company</option>
          {clients.map(client => (
            <option key={client._id} value={client.clientName}>
              {client.clientName}
            </option>
          ))}
        </select>
        {fieldErrors.company && <div className="error-message">{fieldErrors.company}</div>}
      </div>
    )}

      <div className="form-group">
        <label>Status:</label>
        <select
          value={currentUser.status}
          onChange={(e) => handleInputChange('status', e.target.value)}
          className="form-control"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="userlist-container">
      <ToastContainer />
      <h1>User Management</h1>
      
      <div className="search-container">
        <div className="search-fields">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select
              value={searchUserType}
              onChange={(e) => setSearchUserType(e.target.value)}
              className="form-control"
            >
              <option value="">All</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
              <option value="client user">Client User</option>
              <option value="user">User</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>
        </div>
        <div className="button-row">
          <button onClick={handleSearch} className="btn-primary">Search</button>
          <button onClick={handleReset} className="btn-primary">Reset</button>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            Create New User
          </button>
        </div>
      </div>

      <div className="table-section">
        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.designation}</td>
                <td>{user.department}</td>
                <td>{user.mobile}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button 
                    onClick={() => handleEditClick(user)}
                    className="btn-primary btn-small"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleStatusToggle(user)}
                    className="btn-primary btn-small"
                  >
                    {user.status === 'active' ? 'Set Inactive' : 'Set Active'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onRequestClose={() => {
          setIsCreateModalOpen(false);
          resetCurrentUser();
        }}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Create New User</h2>
          <button onClick={() => {
            setIsCreateModalOpen(false);
            resetCurrentUser();
          }} className="modal-close">×</button>
        </div>
        {renderUserForm()}
        <div className="modal-footer">
          <button onClick={handleCreateUser} className="btn-primary">Create User</button>
          <button onClick={() => {
            setIsCreateModalOpen(false);
            resetCurrentUser();
          }} className="btn-secondary">Cancel</button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => {
          setIsEditModalOpen(false);
          resetCurrentUser();
        }}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Edit User</h2>
          <button onClick={() => {
            setIsEditModalOpen(false);
            resetCurrentUser();
          }} className="modal-close">×</button>
        </div>
        {renderUserForm()}
        <div className="modal-footer">
          <button onClick={handleUpdateUser} className="btn-primary">Save Changes</button>
          <button onClick={() => {
            setIsEditModalOpen(false);
            resetCurrentUser();
          }} className="btn-secondary">Cancel</button>
        </div>
      </Modal>

      
    </div>
  );
};

export default UserList;