import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* Default Route Logic */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/dashboard" /> : <Navigate to="/signup" />
          }
        />

        {/* Signup Page */}
        <Route
          path="/signup"
          element={ token ? <Navigate to="/dashboard" /> : <Signup /> }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={ token ? <Navigate to="/dashboard" /> : <Login /> }
        />

        {/* Dashboard (Protected Route) */}
        <Route
          path="/dashboard"
          element={ token ? <Dashboard /> : <Navigate to="/login" /> }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
