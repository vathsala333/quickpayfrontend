import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState("");
  const token = localStorage.getItem("token"); // JWT token stored after login

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API}/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Fetch balance error:", err.response?.data?.message || err.message);
    }
  };

  const handleAddMoney = async () => {
    if (!addAmount) return alert("Enter amount");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/wallet/add`,
        { amount: Number(addAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(res.data.balance);
      setAddAmount("");
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => { fetchBalance(); }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Wallet Dashboard</h2>
      <p><strong>Balance:</strong> ₹{balance}</p>

      <input
        type="number"
        value={addAmount}
        placeholder="Add money"
        onChange={(e) => setAddAmount(e.target.value)}
      />
      <button onClick={handleAddMoney}>Add Money</button>
    </div>
  );
}
