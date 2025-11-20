import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedMonth, setSelectedMonth] = useState("");

  const navigate = useNavigate();

  // Load history
  useEffect(() => {
    const fetchHistory = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please log in again.");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/payment/history",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTransactions(data);
        setFiltered(data);
      } catch (err) {
        setError("Failed to load transaction history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  // Generate months list
  const months = [
    "January 2025", "February 2025", "March 2025", "April 2025",
    "May 2025", "June 2025", "July 2025", "August 2025",
    "September 2025", "October 2025", "November 2025", "December 2025",
  ];

  // Apply month filter
  const applyMonthFilter = (month) => {
    setSelectedMonth(month);

    const [monthName, year] = month.split(" ");
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

    const f = transactions.filter((tx) => {
      const date = new Date(tx.createdAt);
      return (
        date.getMonth() === monthIndex &&
        date.getFullYear() === parseInt(year)
      );
    });

    setFiltered(f);
  };

  // Apply search + sort
  const finalData = filtered
    .filter(
      (tx) =>
        tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
        tx.amount.toString().includes(search)
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "high") return b.amount - a.amount;
      if (sortBy === "low") return a.amount - b.amount;
    });

  // Export PDF
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.text("Transaction History", 10, 10);
    let y = 20;

    finalData.forEach((tx) => {
      pdf.text(
        `${tx.customerName} | ₹${tx.amount} | ${tx.status} | ${new Date(
          tx.createdAt
        ).toLocaleString()}`,
        10,
        y
      );
      y += 10;
    });

    pdf.save("transactions.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Transaction History
      </h1>

      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 bg-gray-700 text-white px-4 py-2 rounded"
      >
        ← Back to Dashboard
      </button>

      {/* Filter + Search + Sort + Export */}
      <div className="flex flex-wrap gap-3 items-center w-full max-w-3xl mb-4">

        {/* Filter by month */}
        <select
          value={selectedMonth}
          onChange={(e) => applyMonthFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Filter by Month</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or amount..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded flex-1"
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="high">Amount High → Low</option>
          <option value="low">Amount Low → High</option>
        </select>

        {/* PDF only */}
        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-green-100 text-left">
              <th className="p-2">Customer</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>

          <tbody>
            {finalData.map((tx) => (
              <tr key={tx._id} className="border-t">
                <td className="p-2">{tx.customerName}</td>
                <td className="p-2 font-semibold">₹{tx.amount}</td>
                <td
                  className={`p-2 font-semibold ${
                    tx.status === "COMPLETED"
                      ? "text-green-600"
                      : tx.status === "FAILED"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {tx.status}
                </td>
                <td className="p-2">
                  {new Date(tx.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {finalData.length === 0 && (
          <p className="text-center text-gray-600 mt-4">
            No transactions found.
          </p>
        )}
      </div>
    </div>
  );
}
