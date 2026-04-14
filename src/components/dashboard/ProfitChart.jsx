import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import { useStore } from "../../context/StoreContext";
import { useState } from "react";

// ---------------- FILTER FUNCTION ----------------
const filterTransactions = (transactions, type) => {
  const now = new Date();

  if (type === "thisMonth") {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
  }

  if (type === "last6Months") {
    const past = new Date();
    past.setMonth(now.getMonth() - 5);

    return transactions.filter(t => {
      const d = new Date(t.date);
      return d >= past && d <= now;
    });
  }

  return transactions;
};

// ---------------- MONTHLY DATA (CORE LOGIC 🔥) ----------------
const getMonthlyData = (transactions) => {
  const months = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!months[key]) {
      months[key] = {
        month: date.toLocaleString("default", { month: "short" }),
        sales: 0,
        purchase: 0,
        returns: 0,
      };
    }

    if (t.type === "sale") {
      months[key].sales += t.total;
    }

    if (t.type === "purchase") {
      months[key].purchase += t.total;
    }

    if (t.type === "return") {
      months[key].returns += Math.abs(t.total);
    }
  });

  return Object.values(months).map((m) => ({
    month: m.month,
    sales: m.sales,
    profit: m.sales - m.purchase - m.returns,
  }));
};

const ProfitChart = () => {
  const { transactions } = useStore();
  const [filter, setFilter] = useState("thisMonth");

  // Apply filter
  const filteredTransactions = filterTransactions(transactions, filter);

  // Get final data
  const data = getMonthlyData(filteredTransactions);

  // ---------------- TOOLTIP ----------------
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const profit = payload.find(p => p.dataKey === "profit")?.value || 0;
      const sales = payload.find(p => p.dataKey === "sales")?.value || 0;

      return (
        <div className="bg-white border border-slate-100 p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
            {label}
          </p>
          <p className="text-sm font-serif text-[#2D6A4F]">
            Profit: ₹{profit}
          </p>
          <p className="text-sm text-slate-600">
            Sales: ₹{sales}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-10 border border-slate-100">

      {/* HEADER + FILTER */}
      <header className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
            Financial Growth
          </span>
          <h2 className="text-3xl font-serif mt-2 text-slate-800">
            Monthly <span className="italic">Performance</span>
          </h2>
        </div>

        {/* FILTER */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 text-xs uppercase tracking-widest text-slate-500"
        >
          <option value="thisMonth">This Month</option>
          <option value="last6Months">Last 6 Months</option>
        </select>
      </header>

      {/* CHART */}
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              dy={15}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* PROFIT LINE */}
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#2D6A4F"
              strokeWidth={2}
              dot={false}
            />

            {/* SALES LINE */}
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#94A3B8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitChart;