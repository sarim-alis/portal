// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Gift from "./pages/Gift.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage on load
  useEffect(() => {
    const loggedIn = localStorage.getItem("isAuthenticated");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
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
            <Route path="/" element={<Home onLogout={handleLogout} />} />
            <Route path="/gift" element={<Gift />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
