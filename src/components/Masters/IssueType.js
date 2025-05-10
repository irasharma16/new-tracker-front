import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import 'react-toastify/dist/ReactToastify.css';
import './IssueType.css'; 
import { API_BASEURL } from '../../variables';

function IssueType() {
  const [issueName, setIssueName] = useState('');
  const [trCheck, setTrCheck] = useState(false);
  const [issues, setIssues] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/issues`)
      .then(response => {
        setIssues(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        handleError('Error fetching issues');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (issueName) {
      const newOrUpdateIssue = { issueName, trCheck };
      if (isEditMode && selectedRow !== null) {
        axios.put(`${API_BASEURL}/issues/update/${issues[selectedRow]._id}`, newOrUpdateIssue)
          .then(response => {
            const updatedIssues = issues.map((issue, index) =>
              index === selectedRow ? response.data : issue
            );
            setIssues(updatedIssues);
            handleSuccess('Issue updated successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error updating issue');
          });
      } else {
        axios.post(`${API_BASEURL}/issues`, newOrUpdateIssue)
          .then(response => {
            setIssues([...issues, response.data]);
            handleSuccess('Issue saved successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error saving issue');
          });
      }
    } else {
      handleError('Please fill in the Issue Name.');
    }
  };

  const handleSelect = (index) => {
    const issue = issues[index];
    setIssueName(issue.issueName);
    setTrCheck(issue.trCheck);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/issues/softDelete/${issues[selectedRow]._id}`)
        .then(() => {
          setIssues(issues.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Issue deleted successfully');
        })
        .catch(error => handleError('Error deleting issue'));
    } else {
      handleError('Please select an issue to delete.');
    }
  };

  const handleTrCheckChange = (index) => {
    const updatedIssues = [...issues];
    updatedIssues[index].trCheck = !updatedIssues[index].trCheck;
    setIssues(updatedIssues);
  };

  const resetForm = () => {
    setIssueName('');
    setTrCheck(false);
    setSelectedRow(null);
    setIsEditMode(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading issues...</div>;
  }

  return (
    <div className='issuetype-container'>
      <ToastContainer />
      <h1>Manage Issue Type</h1>

      <div className="issuetypeform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="issuetypeform-row">
            <div className="issuetypeform-group">
              <label htmlFor="issueCode">Issue Code:</label>
              <input
                type="text"
                id="issueCode"
                name="issueCode"
                value={selectedRow !== null ? selectedRow + 1 : issues.length + 1}
                readOnly
              />
            </div>

            <div className="issuetypeform-group">
              <label htmlFor="issueName">Issue Name:</label>
              <input
                type="text"
                id="issueName"
                name="issueName"
                value={issueName}
                onChange={(e) => setIssueName(e.target.value)}
                placeholder="Issue Name"
              />
            </div>

            <div className="issuetypeform-group">
              <label htmlFor="trCheck">TR Check:</label>
              <input
                type="checkbox"
                id="trCheck"
                name="trCheck"
                checked={trCheck}
                onChange={(e) => setTrCheck(e.target.checked)}
              />
            </div>
          </div>
 
          <div className="issuetypebutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="issuetypetable-container">
        <table id="issueTable">
          <thead>
            <tr>
              <th>Issue Code</th>
              <th>Issue Name</th>
              <th>TR Check</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {issues.length > 0 ? (
              issues.map((issue, index) => (
                <tr key={issue._id}>
                  <td>{index + 1}</td>
                  <td>{issue.issueName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={issue.trCheck}
                      onChange={() => handleTrCheckChange(index)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No issues found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IssueType;
