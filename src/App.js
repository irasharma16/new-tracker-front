import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { API_BASEURL } from './variables';
import Login from './start/login';
import Home from './components/Home/home';
import RefrshHandler from './RefrshHandler'; 
import LayoutWithHeader from './components/Layouts/LayoutWithHeader';
import LayoutWithoutHeader from './components/Layouts/LayoutWithoutHeader';
import Client from './components/Masters/Client';
import Phase from './components/Masters/Phase';
import Priority from './components/Masters/Priority';
import IssueType from './components/Masters/IssueType';
import Employee from './components/Masters/Employee';
import Process from './components/Masters/Process';
import SizeMaster from './components/Masters/SizeMaster';
import Status from './components/Masters/Status';
import Level from './components/Masters/Level';
import Module from './components/Masters/Module';
import ResolutionType from './components/Masters/ResolutionType';
import Team from './components/Masters/Team';
import Project from './components/Project/AddProject';
import RegisterIssue from './components/Transactions/RegisterIssue';
import ClientVisit from './components/Transactions/ClientVisit';
import IssueDetails from './components/Reports/IssueDetails';
import TimeSheet from './components/Transactions/TimeSheet';
import TransportRequestForm from './components/Transactions/TransportRequest';
import Userlist from './components/Security/UserList';
import EditProfile from './components/userprofile/EditProfile';
import ForgotPassword from './start/ForgotPassword';
import ResetPassword from './start/ResetPassword';
import Graph from './components/Graph/graphs';
import UserwiseIssues from './components/Reports/userwiseissues'




function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  
  const isAuthenticatedFunc = () => {
    return !!localStorage.getItem('token');
  };

  useEffect(() => {
    setIsAuthenticated(isAuthenticatedFunc());
  }, []);

  // PrivateRoute component to protect routes
 const PrivateRoute = ({ element }) => {
    console.log("🚀 ~ PrivateRoute ~ element:", element)
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route element={<LayoutWithoutHeader />}>
          <Route path='/' element={<Navigate to="/login" />} />
          <Route path='/login' element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
        <Route element={<LayoutWithHeader />}>
          <Route path='/home' element={<PrivateRoute element={<Home />} />} />
          <Route path='/client' element={<PrivateRoute element={<Client />} />} />
          <Route path='/phase' element={<PrivateRoute element={<Phase />} />} />
          <Route path='/priority' element={<PrivateRoute element={<Priority />} />} />
          <Route path='/issueType' element={<PrivateRoute element={<IssueType />} />} />
          <Route path='/employee' element={<PrivateRoute element={<Employee />} />} />
          <Route path='/process' element={<PrivateRoute element={<Process />} />} />
          <Route path='/sizeMaster' element={<PrivateRoute element={<SizeMaster />} />} />
          <Route path='/status' element={<PrivateRoute element={<Status />} />} />
          <Route path='/level' element={<PrivateRoute element={<Level />} />} />
          <Route path='/module' element={<PrivateRoute element={<Module />} />} />
          <Route path='/resolutionType' element={<PrivateRoute element={<ResolutionType />} />} />
          <Route path='/team' element={<PrivateRoute element={<Team />} />} />
          <Route path='/projects' element={<PrivateRoute element={<Project />} />} />      
          <Route path='/registerIssue' element={<PrivateRoute element={<RegisterIssue />} />} />
          <Route path='/clientvisit' element={<PrivateRoute element={<ClientVisit />} />} />
          <Route path='/issuedetails' element={<PrivateRoute element={<IssueDetails />} />} />
          <Route path='/timesheet' element={<PrivateRoute element={<TimeSheet />} />} />
          <Route path='/transportrequest' element={<PrivateRoute element={<TransportRequestForm/>} />} />
          <Route path='/userlists' element={<PrivateRoute element={<Userlist/>} />} />
          <Route path='/edit-profile' element={<PrivateRoute element={<EditProfile/>} />} />
          <Route path='/graph' element={<PrivateRoute element={<Graph/>} />} />
          <Route path='/userwiseIssues' element={<PrivateRoute element={<UserwiseIssues/>} />} />

        </Route>
      </Routes> 
    </div>
  );
}

export default App;
