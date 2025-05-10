import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TransportRequest.css';
import { API_BASEURL } from '../../variables';




const date = new Date("2024-08-04T00:00:00.000Z");
const formattedDate = date.toLocaleDateString('en-CA'); // 'en-CA' gives the format yyyy-MM-dd




const TransportRequestForm = () => {
  const [issueNumber, setIssueNumber] = useState('');
  const [formData, setFormData] = useState({
    client: '',
    email: '',
    issueType: '',
    contactPerson: '',
    dateReported: '',
    designation: '',
    status: '',
    department: '',
    phone: '',
    description: '',
    module: '',
    assignTo: '',
    priority: '',
    targetDate: '',
    estimatedTime: '',
    actualTime: '',
    resolutionType: '',
    resolutionDate: '',
    level: 'Level-2',
    trNo: '',
    size: '',
    finalResolution: '',
    supportType: ''  // Add supportType here
  });

  const [clients, setClients] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [modules, setModules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [resolutionTypes, setResolutionTypes] = useState([]);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [
          clientsRes,
          issueTypesRes,
          statusesRes,
          modulesRes,
          employeesRes,
          prioritiesRes,
          resolutionTypesRes,
          sizesRes
        ] = await Promise.all([
          axios.get(`${API_BASEURL}/client`),
          axios.get(`${API_BASEURL}/issues`),
          axios.get(`${API_BASEURL}/status`),
          axios.get(`${API_BASEURL}/modules`),
          axios.get(`${API_BASEURL}/employees`),
          axios.get(`${API_BASEURL}/priority`),
          axios.get(`${API_BASEURL}/resolutionTypes`),
          axios.get(`${API_BASEURL}/size`)
        ]);

        setClients(clientsRes.data);
        setIssueTypes(issueTypesRes.data);
        setStatuses(statusesRes.data);
        setModules(modulesRes.data);
        setEmployees(employeesRes.data);
        setPriorities(prioritiesRes.data);
        setResolutionTypes(resolutionTypesRes.data);
        setSizes(sizesRes.data);
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        toast.error('Failed to load form options');
      }
    };

    fetchOptions();
  }, []);

  const handleSearch = async () => {
    if (!issueNumber.trim()) {
      toast.error('Please enter an issue number');
      return;
    }

    try {
      const response = await axios.get(`${API_BASEURL}/registerissue/${issueNumber}`);
      if (response.data) {
        setFormData({
          ...response.data,
          supportType: response.data.supportType || '',  // Set the supportType from the fetched data
        });
        toast.success('Issue details fetched successfully');
      } else {
        toast.error('No issue found with the given number');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch issue details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASEURL}/transportrequest`, formData);
      toast.success('Transport request saved successfully');
    } catch (error) {
      console.error('Error saving transport request:', error);
      toast.error('Failed to save transport request');
    }
  };
  return (
    <div className="treq-form-container">
      <ToastContainer />
      <h2 className="treq-form-title">Transport Request</h2>
      <div className="treq-search-container">
        <label>Issue Number:</label>
        <input
          type="text"
          value={issueNumber}
          onChange={(e) => setIssueNumber(e.target.value)}
        />
        <button className="treq-search-button" onClick={handleSearch}>Search</button>
      </div>

      <form onSubmit={handleSubmit} className="treq-form-section">
        {/* Client & Email */}
        <div className="treq-form-row">
          <div className="treq-form-group">
            <label>Client:</label>
            <select name="client" value={formData.client || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {clients.map(client => (
                <option key={client.id} value={client.clientName}>{client.clientName}</option>
              ))}
            </select>
          </div>
          <div className="treq-form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="treq-form-group">
            <label>Issue Type:</label>
            <select name="issueType" value={formData.issueType || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {issueTypes.map(issue => (
                <option key={issue.id} value={issue.issueName}>{issue.issueName}</option>
              ))}
            </select>
          </div>
          <div className="treq-form-group">
            <label>Contact Person:</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="treq-form-group">
            <label>Date Reported:</label>
            <input
              type="date"
              name="dateReported"
              value={formattedDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Designation & Status */}
        <div className="treq-form-row">
          <div className="treq-form-group">
            <label>Designation:</label>
            <input
              type="text"
              name="designation"
              value={formData.designation || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="treq-form-group">
            <label>Status:</label>
            <select name="status" value={formData.status || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {statuses.map(status => (
                <option key={status.id} value={status.statusName}>{status.statusName}</option>
              ))}
            </select>
          </div>
          <div className="treq-form-group">
            <label>Department:</label>
            <input
              type="text"
              name="department"
              value={formData.department || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="treq-form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="treq-form-group">
            <label>Module:</label>
            <select name="module" value={formData.module || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {modules.map(module => (
                <option key={module.id} value={module.moduleName}>{module.moduleName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assign To, Priority & Target Date */}
        <div className="treq-form-row">
          <div className="treq-form-group">
            <label>Assign To:</label>
            <select name="assignTo" value={formData.assignTo || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
          </div>
          <div className="treq-form-group">
            <label>Priority:</label>
            <select name="priority" value={formData.priority || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {priorities.map(priority => (
                <option key={priority.id} value={priority.priorityName}>{priority.priorityName}</option>
              ))}
            </select>
          </div>
          <div className="treq-form-group">
            <label>Target Date:</label>
            <input
              type="date"
              name="targetDate"
              value={formattedDate}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Estimated Time, Actual Time & Resolution Type */}
        <div className="treq-form-row">
          <div className="treq-form-group">
            <label>Estimated Time:</label>
            <input
              type="text"
              name="estimatedTime"
              value={formData.estimatedTime || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="treq-form-group">
            <label>Actual Time:</label>
            <input
              type="text"
              name="actualTime"
              value={formData.actualTime || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="treq-form-group">
            <label>Resolution Type:</label>
            <select name="resolutionType" value={formData.resolutionType || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {resolutionTypes.map(resolution => (
                <option key={resolution.id} value={resolution.typeName}>{resolution.typeName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Level, Size, Final Resolution */}
        <div className="treq-form-row">
          <div className="treq-form-group">
            <label>Level:</label>
            <select name="level" value={formData.level} onChange={handleInputChange}>
              <option value="Level-2">Level-2</option>
              <option value="Level-3">Level-3</option>
            </select>
          </div>
          <div className="treq-form-group">
            <label>Size:</label>
            <select name="size" value={formData.size || ''} onChange={handleInputChange}>
              <option value="">---Select---</option>
              {sizes.map(size => (
                <option key={size.id} value={size.sizeName}>{size.sizeName}</option>
              ))}
            </select>
          </div>
          <div className="treq-form-group">
            <label>Final Resolution:</label>
            <textarea
              name="finalResolution"
              value={formData.finalResolution || ''}
              onChange={handleInputChange}
              placeholder="Enter the final resolution here"
            />
          </div>
        </div>

        {/* Support Type Displayed */}
        <div className="treq-form-row">
          <div className="treq-form-group">
            <label>Support Type:</label>
            <input
              type="text"
              name="supportType"
              value={formData.supportType || ''}
              disabled
            />
          </div>
        </div>

        {/* Submit */}
        <div className="treq-form-actions">
          <button type="submit" className="treq-submit-button">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default TransportRequestForm;