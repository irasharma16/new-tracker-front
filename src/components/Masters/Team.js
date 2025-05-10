import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import 'react-toastify/dist/ReactToastify.css';
import './Team.css';
import { API_BASEURL } from '../../variables';

function Team() {
  const [teamName, setTeamName] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = () => {
    setIsLoading(true);
    axios.get(`${API_BASEURL}/teams`)
      .then(response => {
        setTeams(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        handleError('Error fetching teams');
        setIsLoading(false);
      });
  };

  const handleSave = () => {
    if (teamName) {
      const newOrUpdateTeam = { teamName, isCancelled };
      if (isEditMode && selectedRow !== null) {
        axios.put(`${API_BASEURL}/teams/update/${teams[selectedRow]._id}`, newOrUpdateTeam)
          .then(response => {
            const updatedTeams = teams.map((team, index) =>
              index === selectedRow ? response.data : team
            );
            setTeams(updatedTeams);
            handleSuccess('Team updated successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error updating team');
          });
      } else {
        axios.post(`${API_BASEURL}/teams`, newOrUpdateTeam)
          .then(response => {
            setTeams([...teams, response.data]);
            handleSuccess('Team saved successfully');
            resetForm();
          })
          .catch(error => {
            handleError('Error saving team');
          });
      }
    } else {
      handleError('Please fill in the Team Name.');
    }
  };

  const handleSelect = (index) => {
    const team = teams[index];
    setTeamName(team.teamName);
    setIsCancelled(team.isCancelled);
    setSelectedRow(index);
    setIsEditMode(true);
  };

  const handleReset = () => {
    resetForm();
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      axios.put(`${API_BASEURL}/teams/softDelete/${teams[selectedRow]._id}`)
        .then(() => {
          setTeams(teams.filter((_, index) => index !== selectedRow));
          resetForm();
          handleSuccess('Team deleted successfully');
        })
        .catch(error => handleError('Error deleting team'));
    } else {
      handleError('Please select a team to delete.');
    }
  };

  const resetForm = () => {
    setTeamName('');
    setIsCancelled(false);
    setSelectedRow(null);
    setIsEditMode(false);
    formRef.current.reset();
  };

  if (isLoading) {
    return <div>Loading teams...</div>;
  }

  return (
    <div className="team-container">
      <ToastContainer />
      <h1>Manage Team</h1>

      <div className="teamform-container">
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="teamform-row">
            <div className="teamform-group">
              <label htmlFor="teamCode">Team Code:</label>
              <input
                type="text"
                id="teamCode"
                name="teamCode"
                value={selectedRow !== null ? selectedRow + 1 : teams.length + 1}
                readOnly
              />
            </div>

            <div className="teamform-group">
              <label htmlFor="teamName">Team Name:</label>
              <input
                type="text"
                id="teamName"
                name="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team Name"
              />
            </div>

            <div className="teamform-group">
              <label htmlFor="isCancelled">Cancelled:</label>
              <input
                type="checkbox"
                id="isCancelled"
                name="isCancelled"
                checked={isCancelled}
                onChange={(e) => setIsCancelled(e.target.checked)}
              />
            </div>
          </div>

          <div className="teambutton-group">
            <button type="submit" className="btn btn-save">{isEditMode ? 'Update' : 'Save'}</button>
            <button type="button" className="btn btn-reset" onClick={handleReset}>Reset</button>
            <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        </form>
      </div>

      <div className="teamtable-container">
        <table id="teamTable">
          <thead>
            <tr>
              <th>Team Code</th>
              <th>Team Name</th>
              <th>Cancelled</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {teams.length > 0 ? (
              teams.map((team, index) => (
                <tr key={team._id}>
                  <td>{index + 1}</td>
                  <td>{team.teamName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={team.isCancelled}
                      readOnly
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSelect(index)}>Select</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No teams found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Team;
