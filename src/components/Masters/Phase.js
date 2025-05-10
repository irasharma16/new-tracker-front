import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Phase.css';
import { API_BASEURL } from '../../variables';

function Phase() {
  const [phaseName, setPhaseName] = useState('');
  const [phases, setPhases] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  // Centralized error and success handling
  const handleError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

useEffect(() => {
  // code using fetchPhases
}, [fetchPhases]);

  const fetchPhases = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/phase`)
      .then(response => {
        setPhases(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        handleError('Error fetching phases');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (!phaseName.trim()) {
      handleError('Please fill in the Phase Name.');
      return;
    }
    
    const newOrUpdatePhase = { phaseName };
    
    if (isEditMode && selectedRow !== null) {
      // Update existing phase
      axios.put(`${API_BASEURL}/phase/update/${phases[selectedRow]._id}`, newOrUpdatePhase)
        .then(response => {
          const updatedPhases = phases.map((phase, index) =>
            index === selectedRow ? response.data : phase
          );
          setPhases(updatedPhases);
          handleSuccess('Phase updated successfully');
          resetForm();
        })
        .catch(error => {
          handleError('Error updating phase');
        });
    } else {
      // Save new phase
      axios.post(`${API_BASEURL}/phase`, newOrUpdatePhase)
        .then(response => {
          setPhases([...phases, response.data]);
          handleSuccess('Phase saved successfully');
          resetForm();
        })
        .catch(error => {
          handleError('Error saving phase');
        });
    }
  };

  const handleSelect = (index) => {
    const phase = phases[index];
    setPhaseName(phase.name);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/phase/softDelete/${phases[selectedRow]._id}`)
        .then(() => {
          setPhases(phases.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Phase deleted successfully');
        })
        .catch(error => handleError('Error deleting phase'));
    } else {
      handleError('Please select a phase to delete.');
    }
  };

  const resetForm = () => {
    setPhaseName('');
    setSelectedRow(null);
    setIsEditMode(false);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  if (isLoading) {
    return <div>Loading phases...</div>;
  }

  return (
    <div className='phase-container'>
      <ToastContainer />
      <h1>Manage Phase</h1>

      <div className="phase-form-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="phase-form-row">
            <div className="phase-form-group">
              <label htmlFor="phaseCode">Phase Code:</label>
              <input
                type="text"
                id="phaseCode"
                name="phaseCode"
                value={selectedRow !== null ? phases[selectedRow].code : phases.length + 1}
                readOnly
              />
            </div>

            <div className="phase-form-group">
              <label htmlFor="phaseName">Phase Name:</label>
              <input
                type="text"
                id="phaseName"
                name="phaseName"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="Phase Name"
              />
            </div>
          </div>

          <div className="phase-button-group">
            <button type="submit" className="btn btn-save">
              {isEditMode ? 'Update' : 'Save'}
            </button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>
              Reset
            </button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </form>
      </div>

      <div className="phase-table-container">
        <table id="phaseTable">
          <thead>
            <tr>
              <th>Phase Code</th>
              <th>Phase Name</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {phases.length > 0 ? (
              phases.map((phase, index) => (
                <tr key={phase._id}>
                  <td>{phase.code}</td>
                  <td>{phase.name}</td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No phases found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Phase;