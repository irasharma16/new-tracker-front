import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './userwiseissues.css';
import { API_BASEURL } from '../../variables';

const IssueDetailsModal = ({ isOpen, onClose, issues, employee, month }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Issues for {employee} - {getMonthName(month)}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          {issues.length === 0 ? (
            <p>No issues found.</p>
          ) : (
            <table className="issue-details-table">
              <thead>
                <tr>
                  <th>Issue Number</th>
                  <th>Description</th>
                  <th>Date Reported</th>
                  <th>Status</th>
                  <th>Actual Time</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, index) => (
                  <tr key={index}>
                    <td>{issue.issueNumber}</td>
                    <td>{issue.description}</td>
                    <td>{new Date(issue.dateReported).toLocaleDateString()}</td>
                    <td>{issue.status}</td>
                    <td>{issue.actualTime || '-'} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const UserWiseIssues = () => {
  // Generate financial years dynamically
  const generateFinancialYears = (startYear = 2020, numberOfYears = 10) => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < numberOfYears; i++) {
      const year = startYear + i;
      years.push({
        label: `FY ${year}-${year + 1}`,
        value: year
      });
    }
    
    return years;
  };

  // Determine current financial year
  const getCurrentFinancialYear = () => {
    const now = new Date();
    return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  };

  const [userIssues, setUserIssues] = useState([]);
  const [financialYears] = useState(generateFinancialYears());
  const [currentFinancialYear, setCurrentFinancialYear] = useState(getCurrentFinancialYear());
  const [uniqueEmployees, setUniqueEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allIssues, setAllIssues] = useState([]);
  const [selectedIssueDetails, setSelectedIssueDetails] = useState({
    isOpen: false,
    issues: [],
    employee: '',
    month: null
  });

  useEffect(() => {
    const fetchUserIssues = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userRole = localStorage.getItem('userRole');
        const loggedInUser = localStorage.getItem('loggedInUser');

        const response = await axios.get(`${API_BASEURL}/registerissue`, {
          params: { 
            userRole, 
            loggedInUser 
          },
          timeout: 10000
        });

        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid data format received');
        }

        // Store all issues for detailed lookup
        setAllIssues(response.data);

        // Filter issues for the current financial year
        const filteredIssues = response.data.filter(issue => {
          if (!issue.dateReported) return false;
          const reportedDate = new Date(issue.dateReported);
          return isIssueInFinancialYear(reportedDate, currentFinancialYear);
        });

        const processedData = processIssuesData(filteredIssues);
        setUserIssues(processedData);

        const employees = [...new Set(filteredIssues.flatMap(issue => 
          [issue.assignTo, issue.assignTo2].filter(Boolean)
        ))];
        setUniqueEmployees(employees);

        setIsLoading(false);

      } catch (error) {
        console.error('Detailed error:', error);
        handleErrorNotification(error);
        setIsLoading(false);
      }
    };

    fetchUserIssues();
  }, [currentFinancialYear]);

  const handleErrorNotification = (error) => {
    if (error.response) {
      toast.error(`Server Error: ${error.response.status} - ${error.response.data}`);
      setError(`Server Error: ${error.response.status}`);
    } else if (error.request) {
      toast.error('No response received from server. Check your network connection.');
      setError('Network Error: No response');
    } else {
      toast.error(`Error: ${error.message}`);
      setError(error.message);
    }
  };

  const processIssuesData = (data) => {
    const userIssuesMap = {};

    data.forEach(issue => {
      const reportedDate = new Date(issue.dateReported);
      const financialMonth = getFinancialMonthIndex(reportedDate);
      const actualTime = parseFloat(issue.actualTime) || 0;

      [issue.assignTo, issue.assignTo2].forEach(assignedTo => {
        if (!assignedTo) return;

        if (!userIssuesMap[assignedTo]) {
          // Initialize with 12 months of issue counts and hours
          userIssuesMap[assignedTo] = [...Array(12)].reduce((monthAcc, _, index) => {
            monthAcc[index] = 0;
            monthAcc[`hours_${index}`] = 0; // Track hours for each month
            return monthAcc;
          }, {total: 0, totalHours: 0, monthlyHours: {}});
        }

        userIssuesMap[assignedTo][financialMonth]++;
        userIssuesMap[assignedTo].total++;
        
        // Distribute actual time proportionally if two assignees
        const timeToAdd = issue.assignTo2 ? actualTime / 2 : actualTime;
        userIssuesMap[assignedTo][`hours_${financialMonth}`] += timeToAdd;
        userIssuesMap[assignedTo].totalHours += timeToAdd;
        
        // Track monthly hours separately
        userIssuesMap[assignedTo].monthlyHours[financialMonth] = 
          (userIssuesMap[assignedTo].monthlyHours[financialMonth] || 0) + timeToAdd;
      });
    });

    return Object.entries(userIssuesMap).map(([employee, monthData]) => ({
      employee,
      ...monthData
    })).sort((a, b) => b.total - a.total);
  };

  const handleIssueClick = (employee, month) => {
    // Filter issues for the specific employee and month
    const filteredIssues = allIssues.filter(issue => {
      const reportedDate = new Date(issue.dateReported);
      
      return (
        (issue.assignTo === employee || issue.assignTo2 === employee) &&
        getFinancialMonthIndex(reportedDate) === month &&
        isIssueInFinancialYear(reportedDate, currentFinancialYear)
      );
    });

    setSelectedIssueDetails({
      isOpen: true,
      issues: filteredIssues,
      employee,
      month
    });
  };

  const handleCloseModal = () => {
    setSelectedIssueDetails({
      isOpen: false,
      issues: [],
      employee: '',
      month: null
    });
  };

  const handleFinancialYearChange = (event) => {
    const selectedYear = parseInt(event.target.value);
    setCurrentFinancialYear(selectedYear);
  };

  const exportToExcel = () => {
    import('xlsx').then(XLSX => {
      const workSheet = XLSX.utils.json_to_sheet(userIssues);
      const workBook = XLSX.utils.book_new();
      
      XLSX.utils.book_append_sheet(workBook, workSheet, `UserWise Issues FY ${currentFinancialYear}-${currentFinancialYear + 1}`);
      
      XLSX.writeFile(workBook, `UserWise_Issues_FY_${currentFinancialYear}-${currentFinancialYear + 1}.xlsx`);
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading issues...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Fetching Issues</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="userwise-issues-container">
      <div className="year-navigation">
        <div className="financial-year-selector">
          <label htmlFor="financial-year-dropdown">Select Financial Year: </label>
          <select 
            id="financial-year-dropdown"
            value={currentFinancialYear}
            onChange={handleFinancialYearChange}
            className="year-dropdown"
          >
            {financialYears.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
        <h2>Financial Year {currentFinancialYear}-{currentFinancialYear + 1} User-Wise Issues</h2>
      </div>

      <div className="export-section">
        <button onClick={exportToExcel} className="export-button">
          Export to Excel
        </button>
        <p>Total Unique Employees: {uniqueEmployees.length}</p>
      </div>

      {userIssues.length === 0 ? (
        <div className="no-data-container">
          <p>No issues found for Financial Year {currentFinancialYear}-{currentFinancialYear + 1}</p>
        </div>
      ) : (
        <div className="userwise-issues-table-container">
          <table className="userwise-issues-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th colSpan="2">Apr</th>
                <th colSpan="2">May</th>
                <th colSpan="2">Jun</th>
                <th colSpan="2">Jul</th>
                <th colSpan="2">Aug</th>
                <th colSpan="2">Sep</th>
                <th colSpan="2">Oct</th>
                <th colSpan="2">Nov</th>
                <th colSpan="2">Dec</th>
                <th colSpan="2">Jan</th>
                <th colSpan="2">Feb</th>
                <th colSpan="2">Mar</th>
                <th>Total Issues</th>
                <th>Total Hours</th>
              </tr>
              <tr>
                <th></th>
                {[...Array(12)].flatMap((_, monthIndex) => [
                  <th key={`issues-${monthIndex}`}>Issues</th>,
                  <th key={`hours-${monthIndex}`}>Hrs</th>
                ])}
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userIssues.map((userIssue, index) => (
                <tr key={index}>
                  <td>{userIssue.employee}</td>
                  {[...Array(12)].flatMap((_, monthIndex) => [
                    <td 
                      key={`issues-${monthIndex}`}
                      className={`${getColorClass(userIssue[monthIndex])} clickable`}
                      onClick={() => userIssue[monthIndex] > 0 && handleIssueClick(userIssue.employee, monthIndex)}
                    >
                      {userIssue[monthIndex] || 0}
                    </td>,
                    <td 
                      key={`hours-${monthIndex}`}
                      className="hours-column"
                    >
                      {userIssue[`hours_${monthIndex}`] ? userIssue[`hours_${monthIndex}`].toFixed(2) : 0}
                    </td>
                  ])}
                  <td className="total-column">{userIssue.total}</td>
                  <td className="total-column">{userIssue.totalHours ? userIssue.totalHours.toFixed(2) : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <IssueDetailsModal
        isOpen={selectedIssueDetails.isOpen}
        onClose={handleCloseModal}
        issues={selectedIssueDetails.issues}
        employee={selectedIssueDetails.employee}
        month={selectedIssueDetails.month}
      />
      
      <ToastContainer position="top-right" />
    </div>
  );
};

// Utility functions
const getColorClass = (count) => {
  if (count === 0) return 'zero-issues';
  if (count <= 3) return 'low-issues';
  if (count <= 6) return 'medium-issues';
  return 'high-issues';
};

const getMonthName = (monthIndex) => {
  const financialMonthNames = [
    'April', 'May', 'June', 'July', 'August', 'September', 
    'October', 'November', 'December', 'January', 'February', 'March'
  ];
  return financialMonthNames[monthIndex];
};

const getFinancialMonthIndex = (date) => {
  const month = date.getMonth();
  return month < 3 ? month + 9 : month - 3;
};

const isIssueInFinancialYear = (issueDate, financialYear) => {
  const issueYear = issueDate.getFullYear();
  const issueMonth = issueDate.getMonth();
  
  // Financial year is from April of first year to March of next year
  return (issueMonth >= 3 && issueYear === financialYear) || 
         (issueMonth < 3 && issueYear === financialYear + 1);
};

export default UserWiseIssues;