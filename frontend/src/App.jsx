// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Voucher from "./pages/Voucher.jsx";
import Customer from "./pages/Customer.jsx";
import { ToastContainer } from "react-toastify";
import 'antd/dist/reset.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  // Check localStorage on load
  useEffect(() => {
    const loggedIn = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
      setRole(userRole);
    }
  }, []);

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    setRole(localStorage.getItem("userRole"));
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole")
    localStorage.removeItem("username");
  };

  return (
   <Router>
      <ToastContainer />
      <Routes>
        {/* Login route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Protected routes */}
        {isAuthenticated ? (
          <>
            {role === "customer" ? (
              <Route path="/" element={<Customer onLogout={handleLogout} />} />
            ) : (
              <Route path="/" element={<Home onLogout={handleLogout} />} />
            )}
            <Route path="/gift" element={<Voucher />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
