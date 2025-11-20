// src/components/AdminLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await axios.post("https://quickpaybackend-gtda.onrender.com/api/admin-setup/admin-login", { email, password });
      if (data.success) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userId", data.user.id);
        sessionStorage.setItem("userName", data.user.name);
        sessionStorage.setItem("isAdmin", data.user.isAdmin ? "true" : "false");
        navigate("/admin");
      } else {
        setMsg(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold text-purple-700 mb-4">Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <input className="w-full border p-2 rounded mb-2" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-purple-600 text-white p-2 rounded" type="submit">Login as Admin</button>
        </form>
        {msg && <p className="mt-3 text-sm text-gray-700">{msg}</p>}
      </div>
    </div>
  );
}
