// frontend/src/App.jsx
import React, { useState } from "react";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <div>
        {isAuthenticated ? <Home /> : <Login onLogin={handleLogin} />}
      </div>
    </>
  );
}

export default App;
