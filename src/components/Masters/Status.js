import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import 'react-toastify/dist/ReactToastify.css';
import './Status.css';
import { API_BASEURL } from '../../variables';

function Status() {
  const [setStatusCode] = useState('');
  const [statusName, setStatusName] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/status`)
      .then(response => {
        setStatuses(response.data);
        setStatusCode(response.data.length + 1); // Set the initial status code
        setIsLoading(false);
      })
      .catch(() => {
        handleError('Error fetching statuses');
        setIsLoading(false);
      });
  };

  const handleSaveOrUpdate = () => {
    if (!statusName) {
      handleError('Please fill in the Status Name.');
      return;
    }

    const statusData = { statusName };

    if (isEditing && selectedRow !== null) {
      // Update existing status
      axios.put(`${API_BASEURL}/status/${statuses[selectedRow]._id}`, statusData)
        .then(response => {
          setStatuses(response.data);
          handleSuccess('Status updated successfully');
          resetForm();
        })
        .catch(() => handleError('Error updating status'));
    } else {
      // Add new status
      axios.post(`${API_BASEURL}/status`, statusData)
        .then(response => {
          setStatuses(response.data);
          handleSuccess('Status saved successfully');
          resetForm();
        })
        .catch(() => handleError('Error saving status'));
    }
  };

  const handleSelect = (index) => {
    const status = statuses[index];
    setStatusCode(index + 1);
    setStatusName(status.statusName);
    setSelectedRow(index);
    setIsEditing(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/status/softDelete/${statuses[selectedRow]._id}`)
        .then(response => {
          setStatuses(response.data);
          handleSuccess('Status deleted successfully');
          resetForm();
        })
        .catch(() => handleError('Error deleting status'));
    } else {
      handleError('Please select a status to delete.');
    }
  };

  const resetForm = () => {
    setStatusCode('');
    setStatusName('');
    setSelectedRow(null);
    setIsEditing(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading statuses...</div>;
  }

  return (
    <div className="status-container">
      <ToastContainer />
      <h1>Manage Status</h1>

      <div className="statusform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSaveOrUpdate(); }}>
          <div className="statusform-row">
            <div className="statusform-group">
              <label htmlFor="statusCode">Status Code:</label>
              <input
                type="text"
                id="statusCode"
                name="statusCode"
                value={selectedRow !== null ? selectedRow + 1 : statuses.length + 1}
                readOnly
              />
            </div>

            <div className="statusform-group">
              <label htmlFor="statusName">Status Name:</label>
              <input
                type="text"
                id="statusName"
                name="statusName"
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                placeholder="Status Name"
              />
            </div>
          </div>

          <div className="statusbutton-group">
            <button type="submit" className="btn btn-save">{isEditing ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="statustable-container">
        <table id="statusTable">
          <thead>
            <tr>
              <th>Status Code</th>
              <th>Status Name</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {statuses.length > 0 ? (
              statuses.map((status, index) => (
                <tr key={status._id}>
                  <td>{index + 1}</td>
                  <td>{status.statusName}</td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No statuses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Status;
