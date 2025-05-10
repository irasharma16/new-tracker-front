import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import 'react-toastify/dist/ReactToastify.css';
import './Process.css';
import { API_BASEURL } from '../../variables';

function Process() {
  const [processName, setProcessName] = useState('');
  const [processes, setProcesses] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/process`)
      .then(response => {
        setProcesses(response.data.data);
        setIsLoading(false);
      })
      .catch(() => {
        handleError('Error fetching processes');
        setIsLoading(false);
      });
  };

  const handleSaveOrUpdate = () => {
    if (processName) {
      const newOrUpdateProcess = { processName };

      if (isUpdate && selectedRow !== null) {
        axios.put(`${API_BASEURL}/process/update/${processes[selectedRow]._id}`, newOrUpdateProcess)
          .then(response => {
            const updatedProcesses = processes.map((process, index) =>
              index === selectedRow ? response.data.data : process
            );
            setProcesses(updatedProcesses);
            handleSuccess('Process updated successfully');
          })
          .catch(() => handleError('Error updating process'));
      } else {
        axios.post(`${API_BASEURL}/process`, newOrUpdateProcess)
          .then(response => {
            setProcesses([...processes, response.data.data]);
            handleSuccess('Process saved successfully');
          })
          .catch(() => handleError('Error saving process'));
      }
      resetForm();
    } else {
      handleError('Please fill in the Process Name.');
    }
  };

  const handleSelect = (index) => {
    setProcessName(processes[index].processName);
    setSelectedRow(index);
    setIsUpdate(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/process/softDelete/${processes[selectedRow]._id}`)
        .then(() => {
          setProcesses(processes.filter((_, index) => index !== selectedRow));
          handleSuccess('Process deleted successfully');
          resetForm();
        })
        .catch(() => handleError('Error deleting process'));
    } else {
      handleError('Please select a process to delete.');
    }
  };

  const resetForm = () => {
    setProcessName('');
    setSelectedRow(null);
    setIsUpdate(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading processes...</div>;
  }

  return (
    <div className="process-container">
      <ToastContainer />
      <h1>Manage Process</h1>

      <div className="processform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSaveOrUpdate(); }}>
          <div className="processform-row">
            <div className="processform-group">
              <label htmlFor="processCode">Process Code:</label>
              <input
                type="text"
                id="processCode"
                name="processCode"
                value={selectedRow !== null ? selectedRow + 1 : processes.length + 1}
                readOnly
              />
            </div>

            <div className="processform-group">
              <label htmlFor="processName">Process Name:</label>
              <input
                type="text"
                id="processName"
                name="processName"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="Process Name"
              />
            </div>
          </div>

          <div className="processbutton-group">
            <button type="submit" className="btn btn-save">{isUpdate ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="processtable-container">
        <table id="processTable">
          <thead>
            <tr>
              <th>Process Code</th>
              <th>Process Name</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {processes.length > 0 ? (
              processes.map((process, index) => (
                <tr key={process._id}>
                  <td>{index + 1}</td>
                  <td>{process.processName}</td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No processes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Process;
