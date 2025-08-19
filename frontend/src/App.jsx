// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import { ToastContainer } from 'react-toastify';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage on load.
  useEffect(() => {
    const loggedIn = localStorage.getItem("isAuthenticated");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
    }
  }, []);


  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <>
      <div>
        {isAuthenticated ? <Home onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
        <ToastContainer />
      </div>
    </>
  );
}

export default App;
