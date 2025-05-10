import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import 'react-toastify/dist/ReactToastify.css';
import './Employee.css';
import { API_BASEURL } from '../../variables';

function EmployeeMaster() {
  const [employeeName, setEmployeeName] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/employees`)
      .then(response => {
        setEmployees(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        handleError('Error fetching employees');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (employeeName) {
      const newOrUpdateEmployee = { employeeName, cancelled };
      if (isEditMode && selectedRow !== null) {
        axios.put(`${API_BASEURL}/employees/update/${employees[selectedRow]._id}`, newOrUpdateEmployee)
          .then(response => {
            const updatedEmployees = employees.map((employee, index) =>
              index === selectedRow ? response.data : employee
            );
            setEmployees(updatedEmployees);
            handleSuccess('Employee updated successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error updating employee');
          });
      } else {
        axios.post(`${API_BASEURL}/employees`, newOrUpdateEmployee)
          .then(response => {
            setEmployees([...employees, response.data]);
            handleSuccess('Employee saved successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error saving employee');
          });
      }
    } else {
      handleError('Please fill in the Employee Name.');
    }
  };

  const handleSelect = (index) => {
    const employee = employees[index];
    setEmployeeName(employee.employeeName);
    setCancelled(employee.cancelled);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/employees/softDelete/${employees[selectedRow]._id}`)
        .then(() => {
          setEmployees(employees.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Employee deleted successfully');
        })
        .catch(error => handleError('Error deleting employee'));
    } else {
      handleError('Please select an employee to delete.');
    }
  };

  const handleCancelledChange = (index) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index].cancelled = !updatedEmployees[index].cancelled;
    setEmployees(updatedEmployees);
  };

  const resetForm = () => {
    setEmployeeName('');
    setCancelled(false);
    setSelectedRow(null);
    setIsEditMode(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div className='employee-container'>
      <ToastContainer />
      <h1>Manage Employee</h1>

      <div className="employeeform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="employeeform-row">
            <div className="employeeform-group">
              <label htmlFor="employeeCode">Employee Code:</label>
              <input
                type="text"
                id="employeeCode"
                name="employeeCode"
                value={selectedRow !== null ? selectedRow + 1 : employees.length + 1}
                readOnly
              />
            </div>

            <div className="employeeform-group">
              <label htmlFor="employeeName">Employee Name:</label>
              <input
                type="text"
                id="employeeName"
                name="employeeName"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Employee Name"
              />
            </div>

            <div className="employeeform-group">
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

          <div className="employeebutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="employeetable-container">
        <table id="employeeTable">
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Cancelled</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((employee, index) => (
                <tr key={employee._id}>
                  <td>{index + 1}</td>
                  <td>{employee.employeeName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={employee.cancelled}
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
                <td colSpan="4">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeMaster;
