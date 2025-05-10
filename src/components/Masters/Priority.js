import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleError, handleSuccess } from '../../utils';
import './Priority.css';
import { API_BASEURL } from '../../variables';

function Priority() {
  const [priorityName, setPriorityName] = useState('');
  const [priorities, setPriorities] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/priority`)
      .then(response => {
        setPriorities(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        handleError('Error fetching priorities');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (priorityName) {
      const newOrUpdatePriority = { priorityName };
      
      if (isEditMode && selectedRow !== null) {
        axios.put(`${API_BASEURL}/priority/update/${priorities[selectedRow]._id}`, newOrUpdatePriority)
          .then(response => {
            const updatedPriorities = priorities.map((priority, index) =>
              index === selectedRow ? response.data : priority
            );
            setPriorities(updatedPriorities);
            handleSuccess('Priority updated successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error updating priority');
          });
      } else {
        axios.post(`${API_BASEURL}/priority`, newOrUpdatePriority)
          .then(response => {
            setPriorities([...priorities, response.data]);
            handleSuccess('Priority saved successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error saving priority');
          });
      }
    } else {
      handleError('Please fill in the Priority Name.');
    }
  };

  const handleSelect = (index) => {
    const priority = priorities[index];
    setPriorityName(priority.priorityName);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/priority/softDelete/${priorities[selectedRow]._id}`)
        .then(() => {
          setPriorities(priorities.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Priority deleted successfully');
        })
        .catch(error => handleError('Error deleting priority'));
    } else {
      handleError('Please select a priority to delete.');
    }
  };

  const resetForm = () => {
    setPriorityName('');
    setSelectedRow(null);
    setIsEditMode(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading priorities...</div>;
  }

  return (
    <div className='priority-container'>
      <ToastContainer />
      <h1>Manage Priority</h1>

      <div className="priorityform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="priorityform-row">
            <div className="priorityform-group">
              <label htmlFor="priorityCode">Priority Code:</label>
              <input
                type="text"
                id="priorityCode"
                name="priorityCode"
                value={selectedRow !== null ? selectedRow + 1 : priorities.length + 1}
                readOnly
              />
            </div>

            <div className="priorityform-group">
              <label htmlFor="priorityName">Priority Name:</label>
              <input
                type="text"
                id="priorityName"
                name="priorityName"
                value={priorityName}
                onChange={(e) => setPriorityName(e.target.value)}
                placeholder="Priority Name"
              />
            </div>
          </div>

          <div className="prioritybutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="prioritytable-container">
        <table id="priorityTable">
          <thead>
            <tr>
              <th>Priority Code</th>
              <th>Priority Name</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {priorities.length > 0 ? (
              priorities.map((priority, index) => (
                <tr key={priority._id}>
                  <td>{index + 1}</td>
                  <td>{priority.priorityName}</td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No priorities found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Priority;









