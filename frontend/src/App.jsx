// frontend/src/App.jsx
import React, { useState } from "react";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import { ToastContainer } from 'react-toastify';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <div>
        {isAuthenticated ? <Home /> : <Login onLogin={handleLogin} />}
        <ToastContainer />
      </div>
    </>
  );
}

export default App;
