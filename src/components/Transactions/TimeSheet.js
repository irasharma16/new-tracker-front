import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import DatePicker from 'react-datepicker';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import "react-datepicker/dist/react-datepicker.css";
import { handleError, handleSuccess } from '../../utils';
import './TimeSheet.css';
import { API_BASEURL } from '../../variables';



function TimeSheet() {
  const [dateOfSubmission, setDateOfSubmission] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [month, setMonth] = useState('');
  const [remark, setRemark] = useState('');
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // New state for client dropdown
  const [clients, setClients] = useState([]);

  const formRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchClients();
  }, []);

  // Fetch data from the server
  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASEURL}/timesheet`);
      setSubmittedData(response.data);
    } catch (error) {
      handleError('Failed to fetch data from the server. Please try again later.');
      console.error('Fetch Data Error:', error);
    }
  };

  // Fetch clients from the server
const fetchClients = async () => {
  try {
    const response = await axios.get(`${API_BASEURL}/client`);
    console.log('Clients fetched:', response.data);  // Add logging
    setClients(response.data);
  } catch (error) {
    console.error('Error fetching clients:', error);
    handleError('Failed to fetch clients. Please try again later.');
  }
};

  // Populate form with selected row data
  const handleSelect = (index) => {
    const entry = submittedData[index];
    setDateOfSubmission(new Date(entry.dateOfSubmission));
    setProjectName(entry.projectName);
    setClientName(entry.clientName);
    setMonth(entry.month);
    setRemark(entry.remark);
    setFileName(entry.uploadedFile || '');
    setFile(null);
    setSelectedRow(index);
    
    if (entry.uploadedFile) {
      setFile(entry.uploadedFile);
    }
  };

  // Save data to the server
  const handleSave = async () => {
    const formattedDate = dayjs(dateOfSubmission).format('YYYY-MM-DD');

    if (dateOfSubmission && projectName && clientName && month) {
      const formData = new FormData();
      formData.append('dateOfSubmission', formattedDate);
      formData.append('projectName', projectName);
      formData.append('clientName', clientName);
      formData.append('month', month);

      if (remark) {
        formData.append('remark', remark);
      }

      if (file) {
        formData.append('uploadedFile', file);
      }

      try {
        let response;
        if (selectedRow !== null) {
          response = await axios.put(
            `${API_BASEURL}/timesheet/${submittedData[selectedRow]._id}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );

          if (response.status === 200) {
            setSubmittedData((prevData) =>
              prevData.map((entry, index) =>
                index === selectedRow ? response.data : entry
              )
            );
            handleSuccess('Timesheet updated successfully');
          }
        } else {
          response = await axios.post(`${API_BASEURL}/timesheet`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (response.status === 201) {
            setSubmittedData((prevData) => [...prevData, response.data]);
            handleSuccess('Timesheet saved successfully');
          }
        }

        resetForm();
      } catch (error) {
        handleError('Failed to save data. Please try again later.');
        console.error('Save Data Error:', error);
      }
    } else {
      handleError('Please fill in all the required fields.');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setDateOfSubmission(null);
    setProjectName('');
    setClientName('');
    setMonth('');
    setRemark('');
    setFile(null);
    setFileName('');
    setSelectedRow(null);
  };

  // Export data to Excel
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      submittedData.map((entry) => ({
        DateOfSubmission: formatDate(entry.dateOfSubmission),
        ProjectName: entry.projectName,
        ClientName: entry.clientName,
        Month: entry.month,
        Remark: entry.remark,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timesheet');
    XLSX.writeFile(workbook, 'Timesheet.xlsx');
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
  };

  // Format date function
  const formatDate = (date) => {
    const newDate = new Date(date);
    return newDate.toLocaleDateString('en-GB');
  };

  return (
    <div className="timesheet-container">
      <ToastContainer />
      <h1>Manage Timesheets</h1>

      <div className="timesheet-form-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="timesheet-form-row">
            <div className="timesheet-form-group">
              <label htmlFor="dateOfSubmission">Date of Submission:</label>
              <DatePicker
                selected={dateOfSubmission}
                onChange={setDateOfSubmission}
                dateFormat="dd-MM-yyyy"
                isClearable
                id="dateOfSubmission"
              />
            </div>

            <div className="timesheet-form-group">
              <label htmlFor="projectName">Project Name:</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="timesheet-form-group">
              <label htmlFor="clientName">Client Name:</label>
              <select
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="timesheet-form-group">
            <label htmlFor="month">Month:</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Select Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

<div className="timesheet-form-group">
            <label htmlFor="remark">Remark:</label>
            <textarea
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

          <div className="timesheet-form-group">
            <label htmlFor="uploadedFile">Upload File:</label>
            <input 
              type="file" 
              id="uploadedFile" 
              onChange={handleFileUpload}  
            />
            {fileName && <span>Selected file: {fileName}</span>}
          </div>

          <div className="timesheet-button-group">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>Reset</button>
            <button type="button" className="btn btn-success" onClick={downloadExcel}>Download Excel</button>
          </div>
        </form>
      </div>

      <div className="timesheet-table-container">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th>Date of Submission</th>
              <th>Project Name</th>
              <th>Client Name</th>
              <th>Month</th>
              <th>Remark</th>
              <th>Uploaded File</th>
            </tr>
          </thead>
          <tbody>
            {submittedData.map((entry, index) => (
              <tr key={index} onClick={() => handleSelect(index)}>
                <td>{formatDate(entry.dateOfSubmission)}</td>
                <td>{entry.projectName}</td>
                <td>{entry.clientName}</td>
                <td>{entry.month}</td>
                <td>{entry.remark}</td>
                <td>
                  {entry.uploadedFile ? (
                    <>
                      {/* View File */}
                      <a
                        href={`${API_BASEURL}/uploads/timesheets/${entry.uploadedFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-view-link"
                      >
                        View File
                      </a>
                      <br />
                      {/* Download File */}
                      <a
                        href={`${API_BASEURL}/download/${entry.uploadedFile}`}
                        download
                        className="file-download-link"
                      >
                        Download File
                      </a>
                    </>
                  ) : (
                    'No File'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TimeSheet;