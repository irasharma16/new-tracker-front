import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './login.css';
import { API_BASEURL } from '../variables';

function LoginForm() {
  const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    // Validation check
    if (!email || !password) {
      return toast.error('Email and password are required');
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASEURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Raw response:', errorResponse);

        try {
          const errorResult = JSON.parse(errorResponse);
          toast.error(errorResult.message || 'Login failed');
        } catch {
          toast.error('Login failed with an unknown error');
        }
        return;
      }

      
      

      const result = await response.json();
      const { jwtToken, name, role, message } = result;
      toast.success(message || 'Login successful!');
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('loggedInUser', name);
      localStorage.setItem('userRole', role);
      
      

      setTimeout(() => navigate('/home'), 1000);
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  console.log("test123",API_BASEURL)

  return (
    <div className="loginForm-container">
      <h1 className="loginh1">Welcome to Issue Tracker</h1>
      <h1 className="loginh1">Login</h1>
      <form className="loginForm" onSubmit={handleLogin}>
        <div className="form-group">
          <label className="loginlabel" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={loginInfo.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="loginlabel" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={loginInfo.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="loginButtons">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="form-group">
        <Link to="/forgot-password" className="forgotPassword">
          Forgot Password?
        </Link>
      </div>
      <footer className="login-footer">
        <p>Copyright &copy; Sage Technologies. All rights reserved.</p>
      </footer>

      <ToastContainer />
    </div>
  );
}

export default LoginForm;