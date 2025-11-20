// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [tx, setTx] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return navigate("/admin-login");

    // Fetch users
    axios.get("https://quickpaybackend-gtda.onrender.com/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 403) navigate("/admin-login");
      });

    // Fetch transactions
    axios.get("https://quickpaybackend-gtda.onrender.com/api/admin/transactions", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTx(res.data))
      .catch(err => console.error(err));
  }, [navigate]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-700">Admin Dashboard</h1>
        <button className="bg-red-600 text-white px-3 py-2 rounded" onClick={() => { sessionStorage.clear(); navigate("/admin-login"); }}>
          Logout
        </button>
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="bg-white rounded shadow p-4 mt-2">
          {users.length === 0 ? <p>No users</p> : users.map(u => (
            <div key={u._id} className="flex justify-between py-2 border-b">
              <div>{u.name} <span className="text-sm text-gray-500">({u.email})</span></div>
              <div>{u.isAdmin ? "Admin" : "User"}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <div className="bg-white rounded shadow p-4 mt-2">
          {tx.length === 0 ? <p>No transactions</p> : tx.map(t => (
            <div key={t._id} className="flex justify-between py-2 border-b">
              <div>{t.customerName} — ₹{t.amount}</div>
              <div className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
