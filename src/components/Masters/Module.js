import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Module.css';
import { API_BASEURL } from '../../variables';

function Module() {
  const [moduleName, setModuleName] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [modules, setModules] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  // Error and Success Toast Handlers
  const handleError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

useEffect(() => {
  // code using fetchModules
}, [fetchModules]);

  const fetchModules = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/modules`)
      .then(response => {
        setModules(response.data.map(module => ({
          ...module,
          cancelled: module.cancelled || false
        })));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Fetch Modules Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        handleError('Error fetching modules');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (moduleName) {
      const newOrUpdateModule = { 
        moduleName, 
        cancelled: isCancelled,
        moduleCode: selectedRow !== null ? selectedRow + 1 : modules.length + 1
      };

      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (isEditMode && selectedRow !== null) {
        axios.put(`${API_BASEURL}/modules/update/${modules[selectedRow]._id}`, newOrUpdateModule, config)
          .then(response => {
            const updatedModules = modules.map((module, index) =>
              index === selectedRow ? response.data : module
            );
            setModules(updatedModules);
            handleSuccess('Module updated successfully');
            resetForm();
          })
          .catch(error => {
            console.error('Update Module Error:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message
            });
            handleError(error.response?.data?.message || 'Error updating module');
          });
      } else {
        axios.post(`${API_BASEURL}/modules`, newOrUpdateModule, config)
          .then(response => {
            setModules([...modules, response.data]);
            handleSuccess('Module saved successfully');
            resetForm();
          })
          .catch(error => {
            console.error('Save Module Error:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message
            });
            handleError(error.response?.data?.message || 'Error saving module');
          });
      }
    } else {
      handleError('Please fill in the Module Name.');
    }
  };

  const handleCancelledChange = (index) => {
    const updatedModules = [...modules];
    updatedModules[index].cancelled = !updatedModules[index].cancelled;
    setModules(updatedModules);
  };

  const handleSelect = (index) => {
    const module = modules[index];
    setModuleName(module.moduleName);
    setIsCancelled(module.cancelled);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/modules/softDelete/${modules[selectedRow]._id}`)
        .then(() => {
          setModules(modules.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Module deleted successfully');
        })
        .catch(error => handleError('Error deleting module'));
    } else {
      handleError('Please select a module to delete.');
    }
  };

  const resetForm = () => {
    setModuleName('');
    setIsCancelled(false);
    setSelectedRow(null);
    setIsEditMode(false);
  };

  if (isLoading) {
    return <div>Loading modules...</div>;
  }

  return (
    <div className='module-container'>
      <ToastContainer />
      <h1>Manage Module</h1>

      <div className="moduleform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="moduleform-row">
            <div className="moduleform-group">
              <label htmlFor="moduleCode">Module Code:</label>
              <input
                type="text"
                id="moduleCode"
                name="moduleCode"
                value={selectedRow !== null ? selectedRow + 1 : modules.length + 1}
                readOnly
              />
            </div>

            <div className="moduleform-group">
              <label htmlFor="moduleName">Module Name:</label>
              <input
                type="text"
                id="moduleName"
                name="moduleName"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Module Name"
              />
            </div>

            <div className="moduleform-group">
              <label htmlFor="cancelled">Cancelled:</label>
              <input
                type="checkbox"
                id="cancelled"
                name="cancelled"
                checked={isCancelled}
                onChange={(e) => setIsCancelled(e.target.checked)}
              />
            </div>
          </div>

          <div className="modulebutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="moduletable-container">
        <table id="moduleTable">
          <thead>
            <tr>
              <th>Module Code</th>
              <th>Module Name</th>
              <th>Cancelled</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {modules.length > 0 ? (
              modules.map((module, index) => (
                <tr key={module._id}>
                  <td>{index + 1}</td>
                  <td>{module.moduleName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={module.cancelled}
                      onChange={() => handleCancelledChange(index)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No modules found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Module;