import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import 'react-toastify/dist/ReactToastify.css';
import './Level.css';
import { API_BASEURL } from '../../variables';


function Level() {
  const [levelName, setLevelName] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [levels, setLevels] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/levels`)
      .then(response => {
        setLevels(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        handleError('Error fetching levels');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (levelName) {
      const newOrUpdateLevel = { levelName, cancelled };
      if (isEditMode && selectedRow !== null) {
        axios.put(`${API_BASEURL}/levels/update/${levels[selectedRow]._id}`, newOrUpdateLevel)
          .then(response => {
            const updatedLevels = levels.map((level, index) =>
              index === selectedRow ? response.data : level
            );
            setLevels(updatedLevels);
            handleSuccess('Level updated successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error updating level');
          });
      } else {
        axios.post(`${API_BASEURL}/levels`, newOrUpdateLevel)
          .then(response => {
            setLevels([...levels, response.data]);
            handleSuccess('Level saved successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error saving level');
          });
      }
    } else {
      handleError('Please fill in the Level Name.');
    }
  };

  const handleSelect = (index) => {
    const level = levels[index];
    setLevelName(level.levelName);
    setCancelled(level.cancelled);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/levels/softDelete/${levels[selectedRow]._id}`)
        .then(() => {
          setLevels(levels.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Level deleted successfully');
        })
        .catch(error => handleError('Error deleting level'));
    } else {
      handleError('Please select a level to delete.');
    }
  };

  const resetForm = () => {
    setLevelName('');
    setCancelled(false);
    setSelectedRow(null);
    setIsEditMode(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading levels...</div>;
  }

  return (
    <div className='level-container'>
      <ToastContainer />
      <h1>Manage Level</h1>

      <div className="levelform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="levelform-row">
            <div className="levelform-group">
              <label htmlFor="levelCode">Level Code:</label>
              <input
                type="text"
                id="levelCode"
                name="levelCode"
                value={selectedRow !== null ? selectedRow + 1 : levels.length + 1}
                readOnly
              />
            </div>

            <div className="levelform-group">
              <label htmlFor="levelName">Level Name:</label>
              <input
                type="text"
                id="levelName"
                name="levelName"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="Level Name"
              />
            </div>

            <div className="levelform-group">
              <label htmlFor="cancelled">Cancelled:</label>
              <input
                type="checkbox"
                id="cancelled"
                name="cancelled"
                checked={cancelled}
                onChange={(e) => setCancelled(e.target.checked)}
              />
            </div>
          </div>

          <div className="levelbutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="leveltable-container">
        <table id="levelTable">
          <thead>
            <tr>
              <th>Level Code</th>
              <th>Level Name</th>
              <th>Cancelled</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {levels.length > 0 ? (
              levels.map((level, index) => (
                <tr key={level._id}>
                  <td>{index + 1}</td>
                  <td>{level.levelName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={level.cancelled}
                      onChange={() => setCancelled(!cancelled)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No levels found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Level;
