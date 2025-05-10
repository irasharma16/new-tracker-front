import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { handleError, handleSuccess } from '../../utils';
import './ResolutionType.css';
import { API_BASEURL } from '../../variables';

function ResolutionType() {
  const [resolutionTypeName, setResolutionTypeName] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [resolutionTypes, setResolutionTypes] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchResolutionTypes();
  }, []);

  const fetchResolutionTypes = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/resolutionTypes`)
      .then(response => {
        setResolutionTypes(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        handleError('Error fetching resolution types');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (resolutionTypeName) {
      const newOrUpdateResolutionType = { resolutionTypeName, isCancelled };
      if (isEditMode && selectedRow !== null) {
        axios.put(`${API_BASEURL}/resolutionTypes/update/${resolutionTypes[selectedRow]._id}`, newOrUpdateResolutionType)
          .then(response => {
            const updatedResolutionTypes = resolutionTypes.map((type, index) =>
              index === selectedRow ? response.data : type
            );
            setResolutionTypes(updatedResolutionTypes);
            handleSuccess('Resolution Type updated successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error updating resolution type');
          });
      } else {
        axios.post(`${API_BASEURL}/resolutionTypes`, newOrUpdateResolutionType)
  .then(response => {
    handleSuccess('Resolution Type saved successfully');
    resetForm();
    fetchResolutionTypes(); // Refresh data from backend
  })
  .catch(error => {
    handleError('Error saving resolution type');
  });

      }
    } else {
      handleError('Please fill in the Resolution Type Name.');
    }
  };
  

  const handleSelect = (index) => {
    const resolutionType = resolutionTypes[index];
    setResolutionTypeName(resolutionType.resolutionTypeName);
    setIsCancelled(resolutionType.cancelled);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/resolutionTypes/softDelete/${resolutionTypes[selectedRow]._id}`)
        .then(() => {
          setResolutionTypes(resolutionTypes.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Resolution Type deleted successfully');
        })
        .catch(error => handleError('Error deleting resolution type'));
    } else {
      handleError('Please select a resolution type to delete.');
    }
  };

  const handleCancelledChange = (index) => {
    const updatedResolutionTypes = [...resolutionTypes];
    updatedResolutionTypes[index].cancelled = !updatedResolutionTypes[index].cancelled;
    setResolutionTypes(updatedResolutionTypes);
  };
  

  const resetForm = () => {
    setResolutionTypeName('');
    setIsCancelled(false);
    setSelectedRow(null);
    setIsEditMode(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading resolution types...</div>;
  }

  return (
    <div className='resolutiontype-container'>
      <ToastContainer />
      <h1>Manage Resolution Type</h1>
  
      <div className="resolutiontypeform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="resolutiontypeform-row">
            <div className="resolutiontypeform-group">
              <label htmlFor="resolutionTypeCode">Resolution Type Code:</label>
              <input
                type="text"
                id="resolutionTypeCode"
                name="resolutionTypeCode"
                value={selectedRow !== null ? selectedRow + 1 : resolutionTypes.length + 1}
                readOnly
              />
            </div>
  
            <div className="resolutiontypeform-group">
              <label htmlFor="resolutionTypeName">Resolution Type Name:</label>
              <input
                type="text"
                id="resolutionTypeName"
                name="resolutionTypeName"
                value={resolutionTypeName || ""}  // Ensure it's always defined
                onChange={(e) => setResolutionTypeName(e.target.value)}
                placeholder="Resolution Type Name"
              />
            </div>
  
            <div className="resolutiontypeform-group">
              <label htmlFor="isCancelled">Cancelled:</label>
              <input
                type="checkbox"
                id="isCancelled"
                name="isCancelled"
                checked={!!isCancelled}  // Ensure it's always a boolean
                onChange={(e) => setIsCancelled(e.target.checked)}
              />
            </div>
          </div>
  
          <div className="resolutiontypebutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>
  
      <div className="resolutiontypetable-container">
        <table id="resolutionTypeTable">
          <thead>
            <tr>
              <th>Resolution Type Code</th>
              <th>Resolution Type Name</th>
              <th>Cancelled</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {resolutionTypes.length > 0 ? (
              resolutionTypes.map((resolutionType, index) => (
                <tr key={resolutionType._id}>
                  <td>{index + 1}</td>
                  <td>{resolutionType.resolutionTypeName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={resolutionType.cancelled || false}  // Ensure boolean value
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
                <td colSpan="4">No resolution types found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResolutionType; 