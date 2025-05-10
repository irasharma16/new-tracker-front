import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import './SizeMaster.css';
import { API_BASEURL } from '../../variables';

function SizeMaster() {
  const [sizeName, setSizeName] = useState('');
  const [sizes, setSizes] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchSizes();
  }, []);

  const fetchSizes = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/size`)
      .then(response => {
        if (Array.isArray(response.data)) {
          setSizes(response.data.filter(size => !size.isDeleted));
        } else {
          console.error('API did not return an array:', response.data);
          setSizes([]);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sizes:', error.response ? error.response.data : error.message);
        handleError('Error fetching sizes');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (!sizeName) {
      handleError('Size Name is required');
      return;
    }

    const sizeData = { sizeName };

    if (isEditMode) {
      axios.put(`${API_BASEURL}/size/${sizes[selectedRow]._id}`, sizeData)
        .then(response => {
          const updatedSizes = sizes.map((size, index) => 
            index === selectedRow ? response.data : size
          );
          setSizes(updatedSizes);
          handleSuccess('Size updated successfully');
          resetForm();
        })
        .catch(error => {
          console.error('Error updating size:', error.response ? error.response.data : error.message);
          handleError('Error updating size');
        });
    } else {
      axios.post(`${API_BASEURL}/size`, sizeData)
        .then(response => {
          setSizes([...sizes, response.data]);
          handleSuccess('Size saved successfully');
          resetForm();
        })
        .catch(error => {
          console.error('Error saving size:', error.response ? error.response.data : error.message);
          handleError('Error saving size');
        });
    }
  };

  const handleSelect = (index) => {
    const size = sizes[index];
    setSizeName(size.sizeName);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/size/softDelete/${sizes[selectedRow]._id}`)
        .then(() => {
          const updatedSizes = sizes.filter((_, index) => index !== selectedRow);
          setSizes(updatedSizes);
          resetForm();
          handleSuccess('Size deleted successfully');
        })
        .catch(error => {
          console.error('Error deleting size:', error.response ? error.response.data : error.message);
          handleError('Error deleting size');
        });
    } else {
      handleError('Please select a size to delete.');
    }
  };

  const resetForm = () => {
    setSizeName('');
    setSelectedRow(null);
    setIsEditMode(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading sizes...</div>;
  }

  return (
    <div className="sizemaster-container">
      <h1>Size Master</h1>

      <div className="sizemasterform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="sizemasterform-row">
            <div className="sizemasterform-group">
              <label htmlFor="sizeCode">Size Code:</label>
              <input
                type="text"
                id="sizeCode"
                name="sizeCode"
                value={selectedRow !== null ? selectedRow + 1 : sizes.length + 1}
                readOnly
              />
            </div>

            <div className="sizemasterform-group">
              <label htmlFor="sizeName">Size Name:</label>
              <input
                type="text"
                id="sizeName"
                name="sizeName"
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
              />
            </div>
          </div>

          <div className="sizemasterbutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="sizemastertable-container">
        <table id="sizemasterTable">
          <thead>
            <tr>
              <th>Size Code</th>
              <th>Size Name</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {sizes.length > 0 ? (
              sizes.map((size, index) => (
                <tr key={size._id}>
                  <td>{index + 1}</td>
                  <td>{size.sizeName}</td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No sizes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  );
}

export default SizeMaster;
