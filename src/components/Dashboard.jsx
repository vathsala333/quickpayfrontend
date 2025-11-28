import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL; // Must be https://qpaybackend.onrender.com

  // =========================
  // Fetch Wallet Balance
  // =========================
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBalance(res.data.balance);
    } catch (err) {
      console.log("Balance Error:", err);
    }
  };

  // =========================
  // Add Money
  // =========================
  const addMoney = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/api/wallet/add`,
        { amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);
      fetchBalance();
      setAmount("");
    } catch (err) {
      console.log("Add Money Error:", err);
      alert("Failed to add money.");
    }
  };

  // =========================
  // Deduct Money
  // =========================
  const deductMoney = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/api/wallet/deduct`,
        { amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);
      fetchBalance();
      setAmount("");
    } catch (err) {
      console.log("Deduct Money Error:", err);
      alert("Not enough balance.");
    }
  };

  // =========================
  // Logout
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>💰 QuickPay Wallet</h1>
      <h2>Current Balance: ₹{balance}</h2>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginTop: 20, padding: 10 }}
      />

      <br />

      <button onClick={addMoney} style={{ margin: 10 }}>
        Add Money
      </button>

      <button onClick={deductMoney} style={{ margin: 10 }}>
        Pay / Deduct
      </button>

      <br />

      <button onClick={logout} style={{ marginTop: 30, background: "red", color: "white" }}>
        Logout
      </button>
    </div>
  );
}
