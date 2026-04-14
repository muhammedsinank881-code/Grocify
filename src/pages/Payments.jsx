import { useState } from "react";
import { useStore } from "../context/StoreContext";

const Payments = () => {
  const { parties, createPayment } = useStore();

  const [selectedParty, setSelectedParty] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const party = parties.find((p) => p.id === selectedParty);

  const handlePayment = () => {
    if (!selectedParty || !amount) {
      alert("Please select a party and specify the amount.");
      return;
    }

    createPayment(selectedParty, Number(amount), method);

    setAmount("");
    setSelectedParty("");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT SIDE: SELECTION & LEDGER INFO */}
        <section className="flex-1 p-8 lg:p-16 border-r border-slate-100">
          <header className="mb-12">
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
              Financial Settlement
            </span>
            <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">Disbursements</h1>
          </header>

          <div className="max-w-md space-y-10">
            {/* PARTY SELECTION */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold">
                Select Counterparty
              </label>
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="w-full bg-transparent border-b border-slate-200 py-4 outline-none text-lg font-light italic focus:border-[#2D6A4F] appearance-none cursor-pointer"
              >
                <option value="">Choose an entity...</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* BALANCE DISPLAY */}
            {party ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Current Ledger Standing
                </p>
                <div className={`p-8 border ${
                  party.balance > 0 ? "bg-red-50/30 border-red-100" : "bg-emerald-50/30 border-emerald-100"
                }`}>
                  <span className="text-xs font-mono text-slate-500 block mb-1">Outstanding Balance</span>
                  <h2 className="text-4xl font-serif italic text-slate-900">
                    ₹{Math.abs(party.balance).toLocaleString()}
                  </h2>
                  <p className="mt-4 text-[10px] uppercase font-bold tracking-widest">
                    {party.balance > 0 
                      ? "• Receivable from Customer" 
                      : "• Payable to Supplier"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 border border-dashed border-slate-100 flex items-center justify-center">
                <p className="text-xs text-slate-300 italic uppercase tracking-widest">
                  Select a party to view balance
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT SIDE: PAYMENT FORM */}
        <aside className="w-full lg:w-96 bg-[#FBFDFA] p-8 lg:p-12 flex flex-col">
          <div className="mb-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
              Transaction Manifest
            </h2>

            <div className="space-y-8">
              {/* AMOUNT INPUT */}
              <div className="group">
                <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold block mb-2">
                  Settlement Amount
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-serif italic">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-200 pl-5 py-3 outline-none text-2xl font-serif italic focus:border-[#2D6A4F] transition-colors"
                  />
                </div>
              </div>

              {/* METHOD SELECTION */}
              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold block mb-4">
                  Payment Protocol
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["cash", "upi"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`py-3 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                        method === m 
                        ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" 
                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="mb-8 flex justify-between items-end">
               <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Net Transfer</span>
               <span className="text-2xl font-serif italic text-[#1A3021]">₹{Number(amount || 0).toLocaleString()}</span>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={!selectedParty || !amount}
              className="w-full bg-[#2D6A4F] text-white py-5 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1A3021] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed shadow-xl shadow-[#2D6A4F]/10"
            >
              Authorize Payment
            </button>
            <p className="text-center text-[8px] text-slate-300 mt-4 uppercase tracking-[0.1em]">
              Secured Digital Ledger Entry
            </p>
          </div>
        </aside>

      </main>
    </div>
  );
};

export default Payments;