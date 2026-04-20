import { useState } from "react";
import { useStore } from "../context/StoreContext";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const Reports = () => {
  const { transactions, products } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ---------------- FILTER BY MONTH ----------------
  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth;
  });

  const sales = filteredTransactions.filter(t => t.type === "sale");
  const purchases = filteredTransactions.filter(t => t.type === "purchase");

  // ✅ FIX: correct type strings — "sale_return" and "purchase_return"
  const saleReturns = filteredTransactions.filter(t => t.type === "sale_return");
  const purchaseReturns = filteredTransactions.filter(t => t.type === "purchase_return");

  // ---------------- TOTALS ----------------
  const totalSales = sales.reduce((s, t) => s + t.total, 0);
  const totalPurchase = purchases.reduce((s, t) => s + t.total, 0);

  // Total value returned by customers this month
  const totalSaleReturns = saleReturns.reduce((s, t) => s + Math.abs(t.total), 0);
  // Total value returned to suppliers this month
  const totalPurchaseReturns = purchaseReturns.reduce((s, t) => s + Math.abs(t.total), 0);

  // ✅ Net revenue = sales minus what customers returned
  const netRevenue = totalSales - totalSaleReturns;

  // ✅ Net procurement cost = purchases minus what we returned to suppliers
  const netPurchase = totalPurchase - totalPurchaseReturns;

  // ✅ Accurate profit
  const profit = netRevenue - netPurchase;

  // ---------------- MONTHLY CHART ----------------
  const monthlyData = months.map((m, i) => {
    const monthTx = transactions.filter(t => new Date(t.date).getMonth() === i);
    const s = monthTx.filter(t => t.type === "sale").reduce((a, b) => a + b.total, 0);
    const p = monthTx.filter(t => t.type === "purchase").reduce((a, b) => a + b.total, 0);
    // ✅ FIX: subtract sale_return and add back purchase_return for accurate monthly profit
    const sr = monthTx.filter(t => t.type === "sale_return").reduce((a, b) => a + Math.abs(b.total), 0);
    const pr = monthTx.filter(t => t.type === "purchase_return").reduce((a, b) => a + Math.abs(b.total), 0);
    return { month: m, profit: (s - sr) - (p - pr) };
  });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="p-12 lg:p-16 max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
              Financial Ledger
            </span>
            <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">Analytics & Growth</h1>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Reporting Period</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-b border-slate-200 py-1 pr-8 outline-none text-sm font-light italic focus:border-[#2D6A4F] appearance-none cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m} 2026</option>
              ))}
            </select>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Gross Revenue", val: totalSales, color: "text-slate-900" },
            { label: "Net Revenue", val: netRevenue, color: "text-slate-700", sub: totalSaleReturns > 0 ? `-₹${totalSaleReturns.toLocaleString()} returned` : null },
            { label: "Net Procurement", val: netPurchase, color: "text-slate-500", sub: totalPurchaseReturns > 0 ? `-₹${totalPurchaseReturns.toLocaleString()} returned` : null },
            { label: "Net Margin", val: profit, color: profit >= 0 ? "text-[#2D6A4F]" : "text-red-600", highlighted: true }
          ].map((stat, idx) => (
            <div key={idx} className={`p-8 border border-slate-100 ${stat.highlighted ? 'bg-[#FBFDFA]' : 'bg-white'}`}>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">{stat.label}</p>
              <h2 className={`text-3xl font-serif italic ${stat.color}`}>₹{stat.val.toLocaleString()}</h2>
              {stat.sub && (
                <p className="text-[10px] text-red-400 mt-1">{stat.sub}</p>
              )}
            </div>
          ))}
        </section>

        {/* CHART SECTION */}
        <section className="mb-20">
          <h2 className="text-[10px] uppercase tracking-widest text-[#2D6A4F] font-bold mb-8">Performance Trajectory</h2>
          <div className="h-[350px] w-full bg-[#FBFDFA] p-8 border border-slate-50">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{ border: 'none', backgroundColor: '#1A3021', color: '#fff', fontSize: '12px', borderRadius: '0' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#2D6A4F', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#2D6A4F"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#2D6A4F', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Reports;
