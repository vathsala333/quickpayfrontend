import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentHistory() {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token"); // JWT token

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API}/payment/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Payment history fetch error:", err.response?.data?.message || err.message);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Payment History</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((tx) => (
            <tr key={tx._id}>
              <td>{tx.orderId}</td>
              <td>₹{tx.amount}</td>
              <td>{tx.status}</td>
              <td>{new Date(tx.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
