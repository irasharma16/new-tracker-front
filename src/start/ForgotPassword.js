import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import "./ForgotPassword.css";
import { API_BASEURL } from "../variables";


function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASEURL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (data.success) {
        handleSuccess("Password reset link sent to your email");
      } else {
        handleError(data.message);
      }
    } catch (error) {
      handleError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="forgot-password-page">
      <main className="fp-content">
        <div className="forgot-password-container">
          <div className="box-1">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
              <div className="fp-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="fp-form-group">
                <button type="submit" className="btn-submit">
                  Get Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <footer className="forgot-password-footer">
        <p>Copyright &copy; Sage Technologies. All rights reserved.</p>
      </footer>

      <ToastContainer />
    </div>
  );
}

export default ForgotPassword;
