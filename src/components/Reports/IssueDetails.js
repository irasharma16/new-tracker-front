import axios from 'axios';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import './IssueDetails.css';
import { API_BASEURL } from '../../variables';

const IssueDetails = () => {
  const [formData, setFormData] = useState({
    issueNumber: '',
    fromDate: '',
    toDate: '',
    client: '',
    module: '',
    level: '',
    resolutionType: '',
    issueType: '',
    assignTo: '',
    status: '',
    size: ''
  });
  
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');

  // States for dropdown data
  const [clients, setClients] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [modules, setModules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [resolutionTypes, setResolutionTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    const storedLoggedInUser = localStorage.getItem('loggedInUser');
    setUserRole(storedUserRole);
    setLoggedInUser(storedLoggedInUser);
  }, []);

  const fetchData = async (url) => {
    try {
      const userRole = localStorage.getItem('userRole');
      const loggedInUser = localStorage.getItem('loggedInUser');
  
      if (userRole === 'client' && url.includes('registerissue')) {
        // Fetch user details to get the company
        const userResponse = await axios.get(`${API_BASEURL}/userlist/users`);
  
        // Find the user's details by username
        const user = userResponse.data.find((u) => u.name === loggedInUser);
  
        // Ensure company exists
        if (!user || !user.company) {
          setFormError('Company not found for logged-in client.');
          return [];
        }
  
        // Fetch issues for the user's company
        const response = await axios.get(url, {
          params: { userRole, company: user.company },
        });
        return response.data;
      }
  
      // Default fetch logic for other roles
      const response = await axios.get(url, {
        params: { userRole, loggedInUser },
      });
      return response.data;
    } catch (error) {
      setFormError(`Error fetching data from ${url}: ${error.message}`);
      return [];
    }
  };
  
  
  useEffect(() => {
    const fetchDataFromAPIs = async () => {
      setIsLoadingData(true);
      try {
        const [
          clientsData,
          issuesData,
          statusesData,
          modulesData,
          employeesData,
          sizesData,
          resolutionTypesData,
          levelsData
        ] = await Promise.all([
          fetchData(`${API_BASEURL}/client`),
          fetchData(`${API_BASEURL}/issues`),
          fetchData(`${API_BASEURL}/status`),
          fetchData(`${API_BASEURL}/modules`),
          fetchData(`${API_BASEURL}/employees`),
          fetchData(`${API_BASEURL}/size`),
          fetchData(`${API_BASEURL}/resolutionTypes`),
          fetchData(`${API_BASEURL}/levels`)
        ]);

        setClients(clientsData || []);
        setIssueTypes(issuesData || []);
        setStatuses(statusesData || []);
        setModules(modulesData || []);
        setEmployees(employeesData || []);
        setSizes(sizesData || []);
        setResolutionTypes(resolutionTypesData || []);
        setLevels(levelsData || []);
      } catch (error) {
        setFormError('Failed to load dropdown options.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDataFromAPIs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setFormError('');
    setSearchResults([]);
    setSubmitMessage('');
    setSelectedIssue(null);
  };

  const handleSearch = async () => {
    // Check if at least one search field has a value
    const searchCriteria = [
      'issueNumber', 'client', 'module', 'issueType',
      'level', 'resolutionType', 'assignTo', 'status', 'fromDate', 'toDate'
    ];
    const hasSearchCriteria = searchCriteria.some(criteria => formData[criteria] !== '');
    if (!hasSearchCriteria) {
      setFormError('Please enter at least one search criteria');
      return;
    }
  
    setIsLoading(true);
    try {
      const userRole = localStorage.getItem('userRole');
      const loggedInUser = localStorage.getItem('loggedInUser');
      const url = `${API_BASEURL}/registerissue`;
  
      let queryParams = {
        userRole,
        loggedInUser,
        ...formData, // Include form data for filtering
      };
  
      if (userRole === 'client') {
        // Fetch user details to get the company
        const userResponse = await axios.get(`${API_BASEURL}/userlist/users`);
        const user = userResponse.data.find(u => u.name === loggedInUser);
  
        if (!user || !user.company) {
          setFormError('Company not found for logged-in client.');
          setIsLoading(false);
          return;
        }
  
        // Add company to query parameters
        queryParams.company = user.company;
      }
  
      // Perform the search
      const response = await axios.get(url, { params: queryParams });
      const allIssues = response.data;
  
      // Apply filtering logic (from the previous handleSearch function)
      const filteredIssues = allIssues.filter(issue => {
        const hasAccess =
          userRole === 'admin' ||
          (userRole === 'user' && (issue.assignTo === loggedInUser || issue.assignTo2 === loggedInUser)) ||
          (userRole === 'client' && issue.client === queryParams.company);
  
        const matchesCriteria =
          (!formData.issueNumber || issue.issueNumber.toLowerCase().includes(formData.issueNumber.toLowerCase())) &&
          (!formData.client || issue.client === formData.client) &&
          (!formData.module || issue.module === formData.module) &&
          (!formData.issueType || issue.issueType === formData.issueType) &&
          (!formData.level || issue.level === formData.level) &&
          (!formData.resolutionType || issue.resolutionType === formData.resolutionType) &&
          (!formData.assignTo || issue.assignTo === formData.assignTo) &&
          (!formData.status || issue.status === formData.status);
  
        const isWithinDateRange =
          (!formData.fromDate || new Date(issue.targetDate) >= new Date(formData.fromDate)) &&
          (!formData.toDate || new Date(issue.targetDate) <= new Date(formData.toDate));
  
        return hasAccess && matchesCriteria && isWithinDateRange;
      });
  
      if (filteredIssues.length > 0) {
        setSearchResults(filteredIssues);
        setFormError('');
      } else {
        setFormError('No issues found matching the search criteria');
      }
    } catch (error) {
      setFormError('Error searching for issues: ' + error.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.issueNumber || !formData.client || !formData.module) {
      setFormError('Please fill in the required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASEURL}/registerissue`, formData);
      setSubmitMessage('Form submitted successfully!');
      handleReset();
    } catch (error) {
      setFormError('Failed to submit form: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      issueNumber: '',
      fromDate: '',
      toDate: '',
      client: '',
      module: '',
      level: '',
      resolutionType: '',
      issueType: '',
      assignTo: '',
      status: '',
      size: ''
    });
    setSubmitMessage('');
    setFormError('');
    setSearchResults([]);
    setSelectedIssue(null);
  };

  const handleCloseDetails = () => {
    setSelectedIssue(null);
  };

  if (isLoadingData) {
    return <div className="loading">Loading dropdown options...</div>;
  }
  const exportToExcel = () => {
    if (searchResults.length === 0) {
      setFormError('No data to export.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(searchResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'IssueDetails');
    XLSX.writeFile(workbook, 'IssueDetails.xlsx');
  };

  return (
    <div className="issue-form-container">
      <h1 className="issue-form-title">Issue Details Report</h1>
      {formError && <div className="form-error">{formError}</div>}
      {submitMessage && <div className="form-success">{submitMessage}</div>}
      
      <form className="issue-form" onSubmit={handleSubmit}>
        <div className="issue-form-row">
          <div className="issue-form-group">
            <label htmlFor="issueNumber">Issue Number:</label>
            <input
              type="text"
              id="issueNumber"
              name="issueNumber"
              value={formData.issueNumber}
              onChange={handleChange}
              placeholder="Enter Issue Number"
              className="wider-input"
            />
          </div>
          <div className="issue-form-group">
            <label htmlFor="client">Client:</label>
            <select
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              className="wider-input"
            >
              <option value="">Select</option>
              {clients.map(client => (
                <option key={client._id || client.id} value={client.clientName || client.name}>
                  {client.clientName || client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="issue-form-group">
            <label htmlFor="module">Module:</label>
            <select
              id="module"
              name="module"
              value={formData.module}
              onChange={handleChange}
              className="wider-input"
            >
              <option value="">Select</option>
              {modules.map(module => (
                <option key={module._id || module.id} value={module.moduleName || module.name}>
                  {module.moduleName || module.name}
                </option>
              ))}
            </select>
          </div>
          <div className="issue-form-group">
            <label htmlFor="issueType">Issue Type:</label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              className="wider-input"
            >
              <option value="">Select</option>
              {issueTypes.map(issue => (
                <option 
                  key={issue._id || issue.id} 
                  value={issue.issueName || issue.name}
                >
                  {issue.issueName || issue.name}
                </option>
              ))}
            </select>
          </div>
          <div className="issue-form-group">
            <label htmlFor="level">Level:</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="wider-input"
            >
              <option value="">Select</option>
              {levels.map(level => (
                <option key={level._id || level.id} value={level.levelName || level.name}>
                  {level.levelName || level.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="issue-form-row">
          
          <div className="issue-form-group">
            <label htmlFor="fromDate">From Date:</label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              className="wider-input"
            />
          </div>
          <div className="issue-form-group">
            <label htmlFor="toDate">To Date:</label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              className="wider-input"
            />
          </div>
          <div className="issue-form-group">
            <label htmlFor="resolutionType">Resolution Type:</label>
            <select
              id="resolutionType"
              name="resolutionType"
              value={formData.resolutionType}
              onChange={handleChange}
              className="wider-input"
            >
              <option value="">Select</option>
              {resolutionTypes.map(resolutionType => (
                <option key={resolutionType.id} value={resolutionType.resolutionTypeName}>
                  {resolutionType.resolutionTypeName}
                </option>
              ))}
            </select>
          </div>
          <div className="issue-form-group">
            <label htmlFor="assignTo">Assign To:</label>
            <select
              id="assignTo"
              name="assignTo"
              value={formData.assignTo}
              onChange={handleChange}
              className="wider-input"
            >
              <option value="">Select</option>
              {employees.map(employee => (
                <option key={employee._id || employee.id} value={employee.employeeName || employee.name}>
                  {employee.employeeName || employee.name}
                </option>
              ))}
            </select>
          </div>
          <div className="issue-form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="wider-input"
            >
              <option value="">Select</option>
              {statuses.map(status => (
                <option key={status._id || status.id} value={status.statusName || status.name}>
                  {status.statusName || status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        

        
        <div className="issue-form-actions">
          <button 
            type="button" 
            className="search-button" 
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          <button type="button" className="reset-button" onClick={handleReset}>
            Reset
          </button>
          <button type="button" onClick={exportToExcel}>
          Export to Excel
        </button>

        </div>
      </form>

      {/* Search Results Table */}
      {searchResults.length > 0 && (
        <div className="search-results-table">
          <h2>Search Results</h2>
          <table>
            <thead>
              <tr>
                <th>Issue Number</th>
                <th>Client</th>
                <th>Module</th>
                <th>Issue Type</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Date Reported</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((issue, index) => (
                <tr key={index}>
                  <td>{issue.issueNumber}</td>
                  <td>{issue.client}</td>
                  <td>{issue.module}</td>
                  <td>{issue.issueType}</td>
                  <td>{issue.status}</td>
                  <td>{issue.assignTo}</td>
                  <td>{issue.dateReported}</td>
                  <td>
                    <button onClick={() => handleViewDetails(issue)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseDetails}>×</button>
            <h2>Issue Details</h2>
            <div className="result-grid">
              <div className="result-item">
                <strong>Issue Number:</strong> {selectedIssue.issueNumber}
              </div>
              <div className="result-item">
                <strong>Description:</strong> {selectedIssue.description}
              </div>
              <div className="result-item">
                <strong>Contact Person:</strong> {selectedIssue.contactPerson}
              </div>
              <div className="result-item">
                <strong>Date Reported:</strong> {selectedIssue.dateReported}
              </div>
              <div className="result-item">
                <strong>Target Date:</strong> {selectedIssue.targetDate}
              </div>
              <div className="result-item">
                <strong>Client:</strong> {selectedIssue.client}
              </div>
              <div className="result-item">
                <strong>Module:</strong> {selectedIssue.module}
              </div>
              <div className="result-item">
                <strong>Level:</strong> {selectedIssue.level}
              </div>
              <div className="result-item">
                <strong>Resolution Type:</strong> {selectedIssue.resolutionType}
              </div>
              <div className="result-item">
                <strong>Issue Type:</strong> {selectedIssue.issueType}
              </div>
              <div className="result-item">
                <strong>Assigned To:</strong> {selectedIssue.assignTo}
              </div>
              <div className="result-item">
                <strong>Status:</strong> {selectedIssue.status}
              </div>
              <div className="result-item">
                <strong>Size:</strong> {selectedIssue.size}
              </div>
              {selectedIssue.finalResolution && (
                <div className="result-item">
                  <strong>Final Resolution:</strong> {selectedIssue.finalResolution}
                </div>
              )}
              <div className="result-item">
                <strong>Support Type:</strong> {selectedIssue.supportType}
              </div>
              <div className="result-item">
                <strong>Estimated Time:</strong> {selectedIssue.estimatedTime}
              </div>
              <div className="result-item">
                <strong>Actual Time:</strong> {selectedIssue.actualTime}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetails;