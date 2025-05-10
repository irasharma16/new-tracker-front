import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import './RegisterIssue.css';
import { API_BASEURL } from '../../variables';


Modal.setAppElement('#root');

const Register = () => {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    issueNumber: '',
    client: '',
    email: '',
    issueType: '',
    contactPerson: '',
    dateReported: today, 
    designation: '',
    status: '',
    department: '',
    phone: '',
    module: '',
    attachment: '',
    assignTo: '',
    resolutionType: '',
    supportType: '',
    level: '',
    priority: '',
    size: '',
    targetDate: '',
    resolutionDate: '',
    estimatedTime: '',
    actualTime: '',
    trNo: '',
    finalResolution: '',
    description: '',
    billingStatus: '',
    assignTo2: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [clients, setClients] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [modules, setModules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [resolutionTypes, setResolutionTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [nextIssueNumber, setNextIssueNumber] = useState(1);
  const [nextTrNumber, setNextTrNumber] = useState(1000);

  const supportOptions = [
    'Application Support',
    'Development',
    'Fixed Basis Support',
    'New Functionality',
    'Paid Support',
    'Project'
  ];

  const fetchData = async (url) => {
    try {
      const userRole = localStorage.getItem('userRole');
      const loggedInUser = localStorage.getItem('loggedInUser'); // Username
      
      // Format date fields in the response data
      const formatDates = (data) => {
        return data.map(item => ({
          ...item,
          targetDate: item.targetDate?.split('T')[0] || '',
          dateReported: item.dateReported?.split('T')[0] || '',
          resolutionDate: item.resolutionDate?.split('T')[0] || ''
        }));
      };
  
      if (userRole === 'client' && url.includes('registerissue')) {
        // Fetch user details to get the company
        const userResponse = await axios.get(`${API_BASEURL}/userlist/users`);
        
        // Find the user's details by username
        const user = userResponse.data.find((u) => u.name === loggedInUser);
  
        // Ensure company exists
        if (!user || !user.company) {
          toast.error('Company not found for logged-in client.');
          return [];
        }
  
        // Fetch issues for the user's company
        const response = await axios.get(url, {
          params: { userRole, company: user.company },
        });
        
        // Format dates before returning
        return formatDates(response.data);
      }
  
      // Default fetch logic for other roles
      const response = await axios.get(url, {
        params: { userRole, loggedInUser },
      });
      
      // If this is the main registerissue endpoint, format the dates
      if (url.includes('registerissue')) {
        return formatDates(response.data);
      }
      
      // For other endpoints (clients, issues, etc.), return data as-is
      return response.data;
      
    } catch (error) {
      toast.error(`Error fetching data from ${url}: ${error.message}`);
      return [];
    }
  };
  
  
  

  useEffect(() => {
    const loadData = async () => {
      const registerissue = await fetchData(`${API_BASEURL}/registerissue`);
      setDataList(registerissue);
      
      if (registerissue.length > 0) {
        const maxIssueNumber = Math.max(...registerissue.map(issue => 
          parseInt(issue.issueNumber)));
        setNextIssueNumber(maxIssueNumber + 1);
        
        const maxTrNumber = Math.max(...registerissue.map(issue => 
          parseInt(issue.trNo) || 1000));
        setNextTrNumber(maxTrNumber + 1);
      }

      setClients(await fetchData(`${API_BASEURL}/client`));
      setIssueTypes(await fetchData(`${API_BASEURL}/issues`));
      setStatuses(await fetchData(`${API_BASEURL}/status`));
      setModules(await fetchData(`${API_BASEURL}/modules`));
      setEmployees(await fetchData(`${API_BASEURL}/employees`));
      setSizes(await fetchData(`${API_BASEURL}/size`));
      setResolutionTypes(await fetchData(`${API_BASEURL}/resolutionTypes`));
      setLevels(await fetchData(`${API_BASEURL}/levels`));
      setPriorities(await fetchData(`${API_BASEURL}/priority`

      ));
    };

    loadData();
  }, []); 

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      issueNumber: nextIssueNumber.toString(),
      dateReported: today  
    }));
  }, [nextIssueNumber]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Prevent modification of issueNumber and dateReported
    if (name === 'issueNumber' || name === 'dateReported') {
      return;
    }
  
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
      ...(name === 'status' && value !== 'Closed' ? { actualTime: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const requiredFields = [
      'client', 'contactPerson', 'issueType', 'description', 'dateReported',
      'targetDate', 'status', 'assignTo', 'estimatedTime'
    ];
    if (formData.status === 'Closed') {
      requiredFields.push('actualTime');
    }
    if (formData.status === 'Closed' && !formData.finalResolution.trim()) {
      toast.error('Final Resolution is required when status is Closed');
      return;
    }
  
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`${field} is required.`);
        return;
      }
    }
  
    const estimatedTime = parseFloat(formData.estimatedTime);
    if (estimatedTime <= 0) {
      toast.error('Estimated Time must be greater than 0.');
      return;
    }

    if (formData.status === 'Closed') {
      requiredFields.push('actualTime');
      
      const actualTime = parseFloat(formData.actualTime);
      if (!actualTime || actualTime <= 0) {
        toast.error('Actual Time must be greater than 0 when status is Closed.');
        return;
      }
    }

  
    if (formData.description.split(' ').length > 50 || 
        formData.finalResolution.split(' ').length > 50) {
      toast.error('Description and Final Resolution should not exceed 50 words.');
      return;
    }
  
    if (formData.supportType === 'Paid Support') {
      if (!formData.attachment) {
        toast.error('Attachment is required for Paid Support.');
        return;
      }
  
      if (!window.confirm('Email Approval required. Do you approve?')) {
        toast.error('Email approval declined.');
        return;
      }
    }
  
    try {
      const userRole = localStorage.getItem('userRole');
      const loggedInUser = localStorage.getItem('loggedInUser');
      const company = localStorage.getItem('company'); // Add this if not already present
  
      if (modalMode === 'edit') {
        const response = await axios.put(
          `${API_BASEURL}/registerissue/${formData.issueNumber}`,
          formData,
          {
            params: { userRole, loggedInUser, company }
          }
        );
        setDataList(prevList =>
          prevList.map(item => 
            item.issueNumber === formData.issueNumber ? response.data : item
          )
        );
      } else {
        const response = await axios.post(
          `${API_BASEURL}/registerissue`,
          formData,
          {
            params: { userRole, loggedInUser, company }
          }
        );
        setDataList(prevList => [...prevList, response.data]);
        setNextIssueNumber(prev => prev + 1);
        setNextTrNumber(prev => prev + 1);
      }
      
      handleReset();
      setIsModalOpen(false);
      toast.success(`Issue ${modalMode === 'create' ? 'submitted' : 'updated'} successfully!`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred';
      toast.error(`Error ${modalMode === 'create' ? 'submitting' : 'updating'} issue: ${errorMessage}`);
    }
  };
  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    setFormData({
      issueNumber: nextIssueNumber.toString(),
      client: '',
      email: '',
      issueType: '',
      contactPerson: '',
      dateReported: today,  // Set to today's date
      designation: '',
      status: '',
      department: '',
      phone: '',
      module: '',
      attachment: '',
      assignTo: '',
      resolutionType: '',
      supportType: '',
      level: '',
      priority: '',
      size: '',
      targetDate: '',
      resolutionDate: '',
      estimatedTime: '',
      actualTime: '',
      trNo: formData.trNo,
      finalResolution: '',
      description: '',
      billingStatus: '',
      assignTo2: '',
    });
  };

  const handleDelete = async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'admin') {
        toast.error('Only administrators can delete issues.');
        return;
      }
  
      if (!window.confirm('Are you sure you want to delete this issue?')) {
        return;
      }
  
      const issueNumber = formData.issueNumber;
      await axios.delete(`${API_BASEURL}/registerissue/${issueNumber}`, {
        params: { userRole }
      });
  
      setDataList(prevList => prevList.filter(item => item.issueNumber !== issueNumber));
      handleReset();
      setIsModalOpen(false);
      toast.success('Issue deleted successfully.');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred';
      toast.error(`Error deleting issue: ${errorMessage}`);
    }
  };
  
  
  

  const handleEdit = (issueNumber) => {
    const issueToEdit = dataList.find(item => item.issueNumber === issueNumber);
    if (issueToEdit) {
      setFormData(issueToEdit);
      setModalMode('edit');
      setIsModalOpen(true);
    }
  };

  const handleNewIssue = () => {
    setModalMode('create');
    handleReset();
    setIsModalOpen(true);
  };

  const calculateDaysOpen = (dateReported) => {
    const today = new Date();
    const reportedDate = new Date(dateReported);
    const diffTime = Math.abs(today - reportedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dataList); // Convert dataList to sheet
    const wb = XLSX.utils.book_new();  // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Register Issues'); // Append sheet to the workbook
    XLSX.writeFile(wb, 'Register_Issues.xlsx'); // Download Excel file
  };


  

  return (
    <div className="register-container">
      <h1>Register Issues</h1>
      
      {/* Main page content */}
      <div className="register-main-content">
      <div className="register-buttons-container">
        <button 
          className="register-new-button"
          onClick={handleNewIssue}
        >
          Register New Issue
        </button>
        <button 
          className="register-export-button"
          onClick={exportToExcel}
        >
          Download Excel
        </button>
        </div>

      

      {/* Modal for form */}
     <Modal
  isOpen={isModalOpen}
  onRequestClose={() => setIsModalOpen(false)}
  contentLabel="Register Issue Form"
  overlayClassName="ri-ReactModal__Overlay"
  className="ri-ReactModal__Content"
>
  <div className="ri-modal-header">
    <h2>{modalMode === 'create' ? 'Register New Issue' : 'Edit Issue'}</h2>
    <button 
      className="ri-modal-close-button"
      onClick={() => setIsModalOpen(false)}
    >
      ×
    </button>
  </div>
  <form onSubmit={handleSubmit} className="ri-modal-form">
    <div className="ri-modal-content-wrapper">
        <div className="register-form-grid">
        <div className="issue-number-display">
          <label>Current Issue Number:</label>
          <input
            type="text"
            value={formData.issueNumber}
            readOnly
            className="issue-number-input"
          />
        </div>
        </div>
        <div className="register-form-grid">
          {/* First column */}
          <div className="register-form-group">
            <label>Client: <span className="required">*</span></label>
            <select name="client" value={formData.client} onChange={handleChange}>
              <option value="">Select</option>
              {clients.map(client => (
                <option key={client.id} value={client.clientName}>{client.clientName}</option>
              ))}
            </select>
          </div>
          
          <div className="register-form-group">
            <label>Client's Email ID:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="register-form-group">
  <label>Date Reported: <span className="required">*</span></label>
  <input 
    type="date" 
    name="dateReported" 
    value={formData.dateReported} 
    readOnly 
    className="disabled-input"
  />
</div>

          <div className="register-form-group">
            <label>Target Date: <span className="required">*</span></label>
            <input type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} />
          </div>

          <div className="register-form-group">
            <label>Resolution Date:</label>
            <input type="date" name="resolutionDate" value={formData.resolutionDate} onChange={handleChange} />
          </div>

      <div className="register-form-group">
        <label>TR No.:</label>
        <input 
          type="text" 
          name="trNo" 
          value={formData.trNo} 
          onChange={handleChange}  // Make it editable
          placeholder="Enter TR Number"
        />
      </div>

         
          <div className="register-form-group">
            <label>Issue Type: <span className="required">*</span></label>
            <select name="issueType" value={formData.issueType} onChange={handleChange}>
              <option value="">Select</option>
              {issueTypes.map(issue => (
                <option key={issue.id} value={issue.issueName}>{issue.issueName}</option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label>Contact Person: <span className="required">*</span></label>
            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
          </div>

          <div className="register-form-group">
            <label>Designation:</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} />
          </div>

          <div className="register-form-group">
            <label>Status: <span className="required">*</span></label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="">Select</option>
              {statuses.map(status => (
                <option key={status.id} value={status.statusName}>{status.statusName}</option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label>Department:</label>
            <input type="text" name="department" value={formData.department} onChange={handleChange} />
          </div>

          <div className="register-form-group">
            <label>Phone:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="register-form-group">
            <label>Module:</label>
            <select name="module" value={formData.module} onChange={handleChange}>
              <option value="">Select</option>
              {modules.map(module => (
                <option key={module.id} value={module.moduleName}>{module.moduleName}</option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label>Attachment:</label>
            <input type="file" name="attachment" onChange={handleChange} />
          </div>

          <div className="register-form-group">
            <label>Assign To (1): <span className="required">*</span></label>
            <select name="assignTo" value={formData.assignTo} onChange={handleChange}>
              <option value="">Select</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.employeeName}>{employee.employeeName}</option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label>Assign To (2):</label>
            <select name="assignTo2" value={formData.assignTo2} onChange={handleChange}>
              <option value="">Select</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.employeeName}>{employee.employeeName}</option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label>Support Type:</label>
            <select name="supportType" value={formData.supportType} onChange={handleChange}>
              <option value="">Select</option>
              {supportOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label>Level:</label>
            <select name="level" value={formData.level} onChange={handleChange}>
              <option value="">Select</option>
              {levels.map(level => (
                <option key={level.id} value={level.levelName}>{level.levelName}</option>
              ))}
            </select>
          </div>

          <div className="register-form-group">
            <label>Size:</label>
            <select name="size" value={formData.size} onChange={handleChange}>
              <option value="">Select</option>
              {sizes.map(size => (
                <option key={size.id} value={size.sizeName}>{size.sizeName}</option>
              ))}
            </select>
          </div>

           <div className="register-form-group">
    <label>Priority:</label>
    <select name="priority" value={formData.priority} onChange={handleChange}>
      <option value="">Select</option>
      {priorities.map(priority => (
        <option key={priority.id} value={priority.priorityName}>
          {priority.priorityName}
        </option>
      ))}
    </select>
  </div>

          <div className="register-form-group">
            <label>Estimated Time(In Hours): <span className="required">*</span></label>
            <input type="text" name="estimatedTime" value={formData.estimatedTime} onChange={handleChange} />
          </div>

          <div className="register-form-group">
      <label>
        Actual Time(In Hours): {formData.status === 'Closed' && <span className="required">*</span>}
      </label>
      <input 
        type="text" 
        name="actualTime" 
        value={formData.actualTime} 
        onChange={handleChange}
        disabled={formData.status !== 'Closed'}
        className={`${formData.status === 'Closed' ? 'required-field' : ''} ${
          formData.status !== 'Closed' ? 'disabled-input' : ''
        }`}
      />
    </div>



          <div className="register-form-group">
            <label>Billing Status:</label>
            <select name="billingStatus" value={formData.billingStatus} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Billed">Billed</option>
              <option value="Unbilled">Unbilled</option>
            </select>
          </div>

          <div className="register-form-group">
            <label>Resolution Type:</label>
            <select name="resolutionType" value={formData.resolutionType} onChange={handleChange}>
              <option value="">Select</option>
              {resolutionTypes.map(resolutionType => (
                <option key={resolutionType.id} value={resolutionType.resolutionTypeName}>
                  {resolutionType.resolutionTypeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Textarea row */}
        <div className="textarea-row">
          <div className="textarea-column">
            <div className="register-form-group">
              <label>Description: <span className="required">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} />
            </div>
          </div>
          <div className="textarea-column">
            <div className="register-form-group">
              <label>Final Resolution: {formData.status === 'Closed' && <span className="required">*</span>}</label>
              <textarea 
                name="finalResolution" 
                value={formData.finalResolution} 
                onChange={handleChange}
                disabled={formData.status !== 'Closed'}
              />
            </div>
          </div>
        </div>

    <div className="ri-modal-actions">
      <button type="submit">{modalMode === 'create' ? 'Submit' : 'Update'}</button>
      <button type="button" onClick={handleReset}>Reset</button>
      <button 
  className="delete-button"
  onClick={handleDelete}
  style={{ display: localStorage.getItem('userRole') === 'admin' ? 'inline-block' : 'none' }}
>
  Delete
</button>
      <button type="button" onClick={() => setIsModalOpen(false)}>Close</button>
    </div>
    </div>
        </form>
      </Modal>

      

      {/* Data table */}
<div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Issue No.</th>
              <th>Client</th>
              <th>Issue Type</th>
              <th>Status</th>
              <th>Days Open</th>
              <th>Assigned To (1)</th>
              <th>Assigned To (2)</th>
              <th>Target Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported)).map(issue => (
              <tr key={issue.issueNumber}>
                <td>{issue.issueNumber}</td>
                <td>{issue.client}</td>
                <td>{issue.issueType}</td>
                <td>{issue.status}</td>
                <td>{calculateDaysOpen(issue.dateReported)}</td>
                <td>{issue.assignTo}</td>
                <td>{issue.assignTo2 || '-'}</td>
                <td>{new Date(issue.targetDate).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(issue.issueNumber)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ToastContainer position="top-right" />
    </div>
    </div>
  );
};

export default Register;