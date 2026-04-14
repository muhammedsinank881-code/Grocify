import { useState } from "react";
import { useStore } from "../context/StoreContext";
import PartyDetailsModal from "../components/PartyDetailsModal";
import { Search} from "lucide-react";


const Parties = () => {
  const { parties, addParty, deleteParty, updateParty } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [search , setSearch] = useState("")

  const [form, setForm] = useState({
    name: "",
    phone: "",
    type: "customer"
  });

  const [editId, setEditId] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addParty(form);
    setForm({ name: "", phone: "", type: "customer" });
    setShowForm(false); 
  };

  const startEdit = (e, p) => {
    e.stopPropagation(); // Prevents modal from opening when clicking edit
    setEditId(p.id);
    setForm(p);
    setShowForm(true);
  };

  const saveEdit = () => {
    updateParty(editId, form);
    setEditId(null);
    setForm({ name: "", phone: "", type: "customer" });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: "", phone: "", type: "customer" });
    setShowForm(false);
  };

  const filteredParties = parties.filter( p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="p-12 lg:p-16 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-16 flex justify-between">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
            Relationship Registry
          </span>
          <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">Trading Parties</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-80 md:max-w-xs lg:max-w-md pb-1">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search our collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2 pl-8 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic"
              />
            </div>

          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditId(null)
              setForm({ name: "", phone: "", type: "customer" })
            }}
            className="bg-[#2D6A4F] text-white px-10 h-14 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1A3021] transition-all"
          >
            {!showForm ? "Add New Party" : "Close Form"}
          </button>
          </div>
        </header>

        

        {/* ADD / EDIT FORM */}
       { showForm && (
         <section className="mb-20 bg-[#FBFDFA] p-8 border border-slate-100">
          <h2 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-8">
            {editId ? "Modify Existing Entity" : "Register New Entity"}
          </h2>
          <form onSubmit={handleAdd} className="flex flex-col lg:flex-row gap-8 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Julian Thorne"
                className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic"
              />
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold">Contact Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 00000 00000"
                className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic"
              />
            </div>

            <div className="w-full lg:w-48 space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold">Entity Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full py-2 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic appearance-none cursor-pointer"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
              {editId ? (
                <>
                  <button 
                    type="button"
                    onClick={saveEdit}
                    className="flex-1 bg-[#2D6A4F] text-white px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#1A3021] transition-all whitespace-nowrap"
                  >
                    Update
                  </button>
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-slate-200 text-slate-600 px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-slate-300 transition-all whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="w-full bg-[#2D6A4F] text-white px-10 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#1A3021] transition-all whitespace-nowrap">
                  Register Party
                </button>
              )}
            </div>
          </form>
        </section>
       )}

        {/* PARTY LISTING */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredParties.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedParty(p)}
              className="group p-8 border border-slate-100 bg-[#FBFDFA] hover:border-[#2D6A4F]/20 transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] text-[#2D6A4F] font-mono tracking-tighter uppercase px-2 py-1 bg-[#2D6A4F]/5 italic">
                    {p.type}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${p.balance > 0 ? "text-red-400" : "text-[#2D6A4F]"}`}>
                    {p.balance > 0 ? "Receivable" : "Settled"}
                  </span>
                </div>
                
                <h3 className="text-xl font-serif text-slate-900 group-hover:text-[#2D6A4F] transition-colors uppercase tracking-tight leading-tight">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-light italic">{p.phone}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-[9px] uppercase tracking-widest text-slate-400">Ledger Balance</span>
                  <span className={`text-lg font-serif italic ${p.balance > 0 ? "text-red-500" : "text-slate-900"}`}>
                    ₹{Math.abs(p.balance)}
                  </span>
                </div>

                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => startEdit(e, p)}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800"
                  >
                    Modify
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteParty(p.id); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-400"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedParty && (
        <PartyDetailsModal
          party={selectedParty}
          close={() => setSelectedParty(null)}
        />
      )}
    </div>
  );
};

export default Parties;