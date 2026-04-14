import React from 'react';
import { useStore } from "../context/StoreContext";
import ProfitChart from '../components/dashboard/ProfitChart';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const navigate = useNavigate()
  const { products, transactions, parties } = useStore();

  const totalProducts = products.length;
  const today = new Date().toISOString().split("T")[0];
  const todayBills = transactions.filter(b => b.date.startsWith(today));

  const todayTransactions = transactions.filter(t => t.date.startsWith(today));

  const todaySales = todayTransactions
    .filter(t => t.type === "sale")
    .reduce((sum, t) => sum + t.total, 0);

  const todayPurchase = todayTransactions
    .filter(t => t.type === "purchase")
    .reduce((sum, t) => sum + t.total, 0);

  const todayReturns = todayTransactions
    .filter(t => t.type === "return")
    .reduce((sum, t) => sum + t.total, 0);
  const lowStock = products.filter(p => p.stock < 5);

  const todayProfit = todaySales - todayPurchase + todayReturns;
  
  // ✅ FIXED: Added null/undefined checks for parties
  const receivable = parties
  .filter(p => p.type === "customer" && p.balance > 0)
  .reduce((sum, p) => sum + p.balance, 0);

const payable = parties
  .filter(p => p.balance < 0)
  .reduce((sum, p) => sum + Math.abs(p.balance), 0);

  const stats = [
    { label: "Today's Profit", value: `₹${todayProfit}`, bg: "bg-[#F0F7F4]" },
    { label: "Today's Sales", value: `₹${todaySales}`, bg: "bg-white" },
    { label: "Inventory Items", value: totalProducts, bg: "bg-[#F0F7F4]" },
    { label: "Low Stock Alert", value: lowStock.length, bg: "bg-white" },
    { label: "Receivable", value: `₹${receivable}`, bg: "bg-[#F0F7F4]" },
    { label: "Payable", value: `₹${payable}`, bg: "bg-white" },
  ];

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-800">
      <main className="flex-1 p-12 lg:p-16 overflow-y-auto">

        {/* Header / Hero Section */}
        <header className="mb-16">
          <span className="text-[#2D6A4F] font-semibold tracking-widest text-xs uppercase">
            Management Overview
          </span>
          <h2 className="text-5xl font-serif mt-4 leading-tight max-w-2xl">
            Business <span className="italic text-[#1A3021]">Insights</span> & Operations.
          </h2>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bg} border border-slate-100 p-8 transition-all hover:shadow-sm`}
            >
              <p className="text-[#2D6A4F] font-semibold tracking-widest text-[10px] uppercase mb-2">
                {stat.label}
              </p>
              <h3 className="text-3xl font-serif text-slate-900">{stat.value}</h3>
            </div>
          ))}
        </section>

        {/* Action Bar */}
        <div className="flex gap-6 mb-20 border-b border-slate-100 pb-10">
          <button
            onClick={() => navigate("/billing")}
            className="bg-[#2D6A4F] text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#1A3021] transition-colors">
            Create New Bill
          </button>
          <button 
            onClick={() => navigate("/products")} 
            className="border border-[#2D6A4F] text-[#2D6A4F] px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#F0F7F4] transition-colors">
            Add Product
          </button>
        </div>

        {/* Recent Activity Table style */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-serif italic text-[#1A3021]">Recent Transactions</h2>
            <span className="text-xs text-slate-400 uppercase tracking-widest">Last 5 records</span>
          </div>

          <div className="space-y-4">
            {transactions && transactions.slice(-5).reverse().map((b) => ( // ✅ FIXED: Added check
              <div
                key={b.id}
                className="group flex justify-between items-center p-6 border border-slate-50 hover:border-[#2D6A4F]/20 transition-all cursor-default"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">Transaction #{b.id.toString().slice(-4)}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-tighter mt-1">{b.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-serif text-[#2D6A4F]">₹{b.total}</p>
                  <p className="text-[10px] text-slate-300 uppercase italic">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ProfitChart />

      </main>
    </div>
  );
};

export default Dashboard;