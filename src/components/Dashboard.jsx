import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  // ⭐ Added this line
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  const [balance, setBalance] = useState(0);
  const [showWallet, setShowWallet] = useState(false);

  const [addAmount, setAddAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  const [message, setMessage] = useState("");

  // -----------------------------
  // Fetch Wallet Balance
  // -----------------------------
  const fetchBalance = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const { data } = await axios.get(
        "http://localhost:5000/api/wallet/balance",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBalance(data.balance);

    } catch (err) {
      console.error(err);
      alert("Unable to fetch wallet balance");
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // -----------------------------
  // Inactivity Logout
  // -----------------------------
  useEffect(() => {
    let timeout;

    const reset = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.clear();
        alert("Session expired due to inactivity.");
        navigate("/login", { replace: true });
      }, 60000);
    };

    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);

    reset();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [navigate]);

  // -----------------------------
  // Add Money
  // -----------------------------
  const handleAddMoney = async () => {
    if (!addAmount || addAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/wallet/add",
        { amount: parseInt(addAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddAmount("");
      fetchBalance();
      alert("Money added!");

    } catch (err) {
      console.error(err);
      alert("Failed to add money");
    }
  };

  // -----------------------------
  // Razorpay Payment
  // -----------------------------
  const handlePayment = async () => {
    const token = sessionStorage.getItem("token");

    if (!customerName || !mobile || !amount) {
      alert("Please fill all fields");
      return;
    }

    if (amount > balance) {
      alert("Insufficient balance");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        { amount, customerName, mobile, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,

        amount: order.amount,
        currency: "INR",
        name: "QuickPay",
        order_id: order.id,

        handler: async function (response) {
          if (!response.razorpay_payment_id) {
            alert("Payment failed");
            return;
          }

          await axios.post(
            "https://quickpaybackend-gtda.onrender.com/api/payment/update-status",
            {
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              status: "COMPLETED",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          await axios.post(
            "http://localhost:5000/api/wallet/deduct",
            { amount: parseInt(amount) },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setMessage("Payment Successful!");
          fetchBalance();
        },

        modal: {
          ondismiss: function () {
            alert("Payment cancelled!");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment failed!");
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">

      <div className="absolute top-4 right-4 flex gap-3">

        {/* ⭐ Admin Button Here */}
        {isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            Admin Panel
          </button>
        )}

        <button
          onClick={() => navigate("/history")}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          View History
        </button>

        <button
          onClick={() => { sessionStorage.clear(); navigate("/login"); }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold text-green-600 text-center">
        QuickPay Dashboard
      </h1>

      <div className="text-center mt-3">
        <button
          onClick={() => setShowWallet(!showWallet)}
          className="underline text-blue-600"
        >
          {showWallet ? "Hide Wallet" : "Show Wallet"}
        </button>
      </div>

      {showWallet && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-4">
          <h3 className="text-xl font-semibold">💰 Wallet Balance</h3>
          <p className="text-3xl font-bold mt-2">₹{balance}</p>
        </div>
      )}

      {/* Add Money */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-6">
        <h3 className="text-xl font-semibold">➕ Add Money</h3>

        <input
          type="number"
          placeholder="Amount"
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
          className="border p-2 w-full rounded mt-3"
        />

        <button
          onClick={handleAddMoney}
          className="w-full bg-blue-600 text-white py-2 rounded mt-3"
        >
          Add Money
        </button>
      </div>

      {/* Send Money */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl mx-auto mt-6">
        <h3 className="text-xl font-semibold mb-3">Send Money</h3>

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="tel"
          placeholder="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded mb-4"
        />

        <button
          onClick={handlePayment}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Send Money
        </button>

        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
