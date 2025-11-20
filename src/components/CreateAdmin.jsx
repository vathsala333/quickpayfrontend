// src/components/CreateAdmin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await axios.post("https://quickpaybackend-gtda.onrender.com/api/admin-setup/create-admin", {
        name, email, password, adminSecret
      });

      if (data.success) {
        // store token and redirect to admin dashboard
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userId", data.user.id);
        sessionStorage.setItem("userName", data.user.name);
        sessionStorage.setItem("isAdmin", data.user.isAdmin ? "true" : "false");
        setMsg("Admin created. Redirecting...");
        setTimeout(() => navigate("/admin"), 900);
      } else {
        setMsg(data.message || "Failed");
      }
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold text-green-600 mb-4">Create Admin</h2>
        <form onSubmit={handleCreate}>
          <input className="w-full border p-2 rounded mb-2" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full border p-2 rounded mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border p-2 rounded mb-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" />
          <input className="w-full border p-2 rounded mb-3" placeholder="Admin Secret" value={adminSecret} onChange={e=>setAdminSecret(e.target.value)} />
          <button className="w-full bg-purple-600 text-white p-2 rounded" type="submit">Create Admin</button>
        </form>
        {msg && <p className="mt-3 text-sm text-gray-700">{msg}</p>}
      </div>
    </div>
  );
}
