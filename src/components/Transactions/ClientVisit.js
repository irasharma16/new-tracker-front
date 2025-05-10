import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import { handleError, handleSuccess } from '../../utils';
import './ClientVisit.css';
import { API_BASEURL } from '../../variables';


const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

function ClientVisit() {
  const [assignTo, setAssignTo] = useState('');
  const [client, setClient] = useState('');
  const [purpose, setPurpose] = useState('');
  const [module, setModule] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [visitDateFrom, setVisitDateFrom] = useState(null);
  const [visitDateTo, setVisitDateTo] = useState(null);
  const [timeEstimate, setTimeEstimate] = useState('');
  const [remark, setRemark] = useState('');
  const [clientVisits, setClientVisits] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [moduleNames, setModuleNames] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const formRef = useRef(null);

  const purposeOptions = ["General", "Meeting", "Project Scope", "New Requirement", "Support", "Training"];

  useEffect(() => {
    fetchData();
    fetchEmployeeNames();
    fetchModuleNames();
    fetchClientNames();
  }, []);



    
  const fetchData = async () => {
    try {
      const userRole = localStorage.getItem('userRole');
      const loggedInUser = localStorage.getItem('loggedInUser');
      
      const response = await axios.get(`${API_BASEURL}/clientvisit`);
      
      
      if (userRole.toLowerCase() === 'admin') {
        setClientVisits(response.data);
      } 
      else if (userRole.toLowerCase() === 'user') {
        const filteredVisits = response.data.filter(visit => 
          visit.assignTo === loggedInUser
        );
        setClientVisits(filteredVisits);
      }
    } catch (error) {
      handleError('Failed to fetch data from the server. Please try again later.');
      console.error('Fetch Data Error:', error);
    }
  };


  const fetchEmployeeNames = async () => {
    try {
      const response = await axios.get(`${API_BASEURL}/employees`);
      setEmployeeNames(response.data);
    } catch (error) {
      handleError('Failed to fetch employee data. Please try again later.');
      console.error('Fetch Employee Names Error:', error);
    }
  };

  const fetchModuleNames = async () => {
    try {
      const response = await axios.get(`${API_BASEURL}/modules`);
      setModuleNames(response.data);
    } catch (error) {
      handleError('Failed to fetch module data. Please try again later.');
      console.error('Fetch Module Names Error:', error);
    }
  };

  const fetchClientNames = async () => {
    try {
      const response = await axios.get(`${API_BASEURL}/client`);
      setClientNames(response.data);
    } catch (error) {
      handleError('Failed to fetch client data. Please try again later.');
      console.error('Fetch Client Names Error:', error);
    }
  };

  const handleSave = async () => {
    if (assignTo && client && purpose && module && contactPerson && visitDateFrom && visitDateTo && timeEstimate && remark) {
      const visitData = {
        assignTo,
        client,
        purpose,
        module,
        contactPerson,
        visitDateFrom: visitDateFrom.toISOString(),
        visitDateTo: visitDateTo.toISOString(),
        timeEstimate,
        remark,
      };

      try {
        let response;
        if (selectedRow !== null) {
          response = await axios.put(`${API_BASEURL}/clientvisit/${clientVisits[selectedRow]._id}`, visitData);
        } else {
          response = await axios.post(`${API_BASEURL}/clientvisit`, visitData);
        }

        if (response.status === 200 || response.status === 201) {
          handleSuccess('Client Visit saved successfully');
          resetForm();
          await fetchData();
        } else {
          handleError('Failed to save data. Please try again later.');
        }
      } catch (error) {
        handleError('Failed to save data. Please try again later.');
        console.error('Save Data Error:', error);
      }
    } else {
      handleError('Please fill in all the fields.');
    }
  };

  const handleSelect = (index) => {
    const visit = clientVisits[index];
    setAssignTo(visit.assignTo);
    setClient(visit.client);
    setPurpose(visit.purpose);
    setModule(visit.module);
    setContactPerson(visit.contactPerson);
    setVisitDateFrom(new Date(visit.visitDateFrom));
    setVisitDateTo(new Date(visit.visitDateTo));
    setTimeEstimate(visit.timeEstimate);
    setRemark(visit.remark);
    setSelectedRow(index);
  };

  const handleReset = () => {
    resetForm();
  };

  const resetForm = () => {
    setAssignTo('');
    setClient('');
    setPurpose('');
    setModule('');
    setContactPerson('');
    setVisitDateFrom(null);
    setVisitDateTo(null);
    setTimeEstimate('');
    setRemark('');
    setSelectedRow(null);
  };
  // Export to Excel function
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(clientVisits.map(visit => ({
      'Assign To': visit.assignTo,
      'Client': visit.client,
      'Purpose': visit.purpose,
      'Module': visit.module,
      'Contact Person': visit.contactPerson,
      'Visit Date From': formatDate(visit.visitDateFrom),
      'Visit Date To': formatDate(visit.visitDateTo),
      'Time Estimate': visit.timeEstimate,
      'Remark': visit.remark,
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Client Visits');

    // Trigger file download
    XLSX.writeFile(wb, 'client_visits.xlsx');
  };

  return (
    <div className="client-visit-container">
      <ToastContainer />
      <h1>Manage Client Visits</h1>

      <div className="client-visit-form-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="client-visit-form-row">
            <div className="client-visit-form-group">
              <label htmlFor="assignTo">Assign to:</label>
              <select id="assignTo" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                <option value="">Select Employee</option>
                {employeeNames.map((employee, index) => (
                  <option key={index} value={employee.employeeName}>{employee.employeeName}</option>
                ))}
              </select>
            </div>

            <div className="client-visit-form-group">
              <label htmlFor="client">Client:</label>
              <select id="client" value={client} onChange={(e) => setClient(e.target.value)}>
                <option value="">Select Client</option>
                {clientNames.map((client, index) => (
                  <option key={index} value={client.clientName}>{client.clientName}</option>
                ))}
              </select>
            </div>

            <div className="client-visit-form-group">
              <label htmlFor="purpose">Purpose/Scope:</label>
              <select id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option value="">Select Purpose</option>
                {purposeOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="client-visit-form-group">
              <label htmlFor="module">Module:</label>
              <select id="module" value={module} onChange={(e) => setModule(e.target.value)}>
                <option value="">Select Module</option>
                {moduleNames.map((name, index) => (
                  <option key={index} value={name.moduleName}>{name.moduleName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="client-visit-form-row">
            

            <div className="client-visit-form-group">
              <label htmlFor="contactPerson">Contact Person:</label>
              <input type="text" id="contactPerson" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>

            <div className="client-visit-form-group">
              <label htmlFor="timeEstimate">Time Estimate (Hours):</label>
              <input type="text" id="timeEstimate" value={timeEstimate} onChange={(e) => setTimeEstimate(e.target.value)} />
            </div>
            <div className="client-visit-form-group">
              <label htmlFor="visitDateFrom">Visit Date (From):</label>
              <DatePicker
                selected={visitDateFrom}
                onChange={setVisitDateFrom}
                dateFormat="dd-MM-yyyy"
                isClearable
              />
            </div>
            <div className="client-visit-form-group">
              <label htmlFor="visitDateTo">Visit Date (To):</label>
              <DatePicker
                selected={visitDateTo}
                onChange={setVisitDateTo}
                dateFormat="dd-MM-yyyy"
                isClearable
              />
            </div>
          </div>

          <div className="client-visit-form-row">

            <div className="client-visit-form-group">
              <label htmlFor="remark">Remark:</label>
              <textarea id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
          </div>

          <div className="client-visit-button-group">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
            <button type="button" onClick={exportToExcel}>Export to Excel</button>
          </div>
        </form>
      </div>

      <div className="client-visit-table-container">
        <table className="client-visit-table">
          <thead>
            <tr>
              <th>Assign To</th>
              <th>Client</th>
              <th>Purpose</th>
              <th>Module</th>
              <th>Contact Person</th>
              <th>Visit Date From</th>
              <th>Visit Date To</th>
              <th>Time Estimate</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {clientVisits.map((visit, index) => (
              <tr key={index} onClick={() => handleSelect(index)}>
                <td>{visit.assignTo}</td>
                <td>{visit.client}</td>
                <td>{visit.purpose}</td>
                <td>{visit.module}</td>
                <td>{visit.contactPerson}</td>
                <td>{formatDate(visit.visitDateFrom)}</td>
                <td>{formatDate(visit.visitDateTo)}</td>
                <td>{visit.timeEstimate}</td>
                <td>{visit.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientVisit;
