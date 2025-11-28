import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchBalance = async () => {
    try {
      const token = sessionStorage.getItem("token"); // ← changed

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

  const addMoney = async () => {
    try {
      const token = sessionStorage.getItem("token"); // ← changed

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

  const deductMoney = async () => {
    try {
      const token = sessionStorage.getItem("token"); // ← changed

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

  const logout = () => {
    sessionStorage.removeItem("token"); // ← changed
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

      <button
        onClick={logout}
        style={{ marginTop: 30, background: "red", color: "white" }}
      >
        Logout
      </button>
    </div>
  );
}
