import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Search, Check, X, RotateCcw } from "lucide-react";

const Offers = () => {
  const { products, offers, categories, fetchData } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [discount, setDiscount] = useState("");
  const [DisSearch, setDisSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const toggleProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setEditingOffer(null);
    setDiscount("");
    setSelectedProducts([]);
  };

  const addOffer = async () => {
    if (!discount || selectedProducts.length === 0) {
      alert("Please specify a discount and select at least one product.");
      return;
    }

    await fetch("http://localhost:3001/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${discount}% OFF`,
        discount: Number(discount),
        productIds: selectedProducts,
        isActive: true
      })
    });

    resetForm();
    fetchData();
    setShowForm(false);
  };

  const toggleActive = async (offer) => {
    await fetch(`http://localhost:3001/offers/${offer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !offer.isActive })
    });
    fetchData();
  };

  const deleteOffer = async (id) => {
    await fetch(`http://localhost:3001/offers/${id}`, { method: "DELETE" });
    fetchData();
  };

  const updateOffer = async () => {
    if (!editingOffer) return;

    await fetch(`http://localhost:3001/offers/${editingOffer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        discount: Number(discount),
        name: `${discount}% OFF`,
        productIds: selectedProducts
      })
    });

    resetForm();
    fetchData();
    setShowForm(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!category || p.categoryId === category)
  );

  const filteredOffers = offers.filter(o => {
    const query = DisSearch.toLowerCase();
    return (
      o.name.toLowerCase().includes(query) ||
      o.productIds.some(id => {
        const p = products.find(prod => prod.id === id);
        return p?.name.toLowerCase().includes(query);
      })
    );
  });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="p-12 lg:p-16 max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
              Promotional Strategy
            </span>
            <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">Campaign Offers</h1>
          </div>

          {/* SEARCH ACTIVE OFFERS */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Search active campaigns..."
              value={DisSearch}
              onChange={(e) => setDisSearch(e.target.value)}
              className="w-full py-2 pl-7 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic"
            />

          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingOffer(null);
              setDiscount("");
              setSelectedProducts([]);
            }}
            className=" bg-[#2D6A4F] text-white px-6 py-3 text-xs font-bold uppercase hover:bg-[#1A3021]"
          >
            {!showForm ? "Add Offer" : "Close"}
          </button>
        </header>

        {/* CREATE / EDIT OFFER SECTION */}
        {showForm && (
          <section className={`mb-20 border transition-all duration-500 p-8 ${editingOffer ? 'border-[#2D6A4F] bg-[#FBFDFA]' : 'border-slate-100 bg-[#FBFDFA]'}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {editingOffer ? "Modify Campaign Asset" : "Initialize New Campaign"}
              </h2>
              {editingOffer && (
                <button onClick={resetForm} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 font-bold hover:text-red-600 transition-colors">
                  <RotateCcw size={12} /> Abort Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Input Side */}
              <div className="lg:col-span-4 space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold">Reduction Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full py-3 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-3xl font-serif italic pr-8"
                    />
                    <span className="absolute right-0 bottom-3 font-serif italic text-slate-400 text-xl">%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold block">Selection Criteria</label>
                  <div className="relative">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input
                      type="text"
                      placeholder="Search product inventory..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full py-2 pl-6 bg-transparent border-b border-slate-100 focus:border-[#2D6A4F] outline-none text-xs font-light italic"
                    />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2 bg-transparent border-b border-slate-100 text-xs font-light italic outline-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product List Side */}
              <div className="lg:col-span-5">
                <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mb-4 italic">
                  Manifest: {selectedProducts.length} Items Selected
                </label>
                <div className="max-h-56 overflow-y-auto border border-slate-50 bg-white rounded-sm custom-scrollbar shadow-inner">
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`flex justify-between items-center p-3 cursor-pointer border-b border-slate-50 last:border-none transition-all
                        ${selectedProducts.includes(p.id) ? "bg-[#2D6A4F]/5" : "hover:bg-slate-50"}`}
                    >
                      <span className={`text-xs ${selectedProducts.includes(p.id) ? "text-[#2D6A4F] font-semibold" : "text-slate-500"}`}>
                        {p.name}
                      </span>
                      {selectedProducts.includes(p.id) && <Check size={14} className="text-[#2D6A4F]" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Side */}
              <div className="lg:col-span-3 flex items-end">
                <button
                  onClick={editingOffer ? updateOffer : addOffer}
                  className={`w-full py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all shadow-sm
                  ${editingOffer ? 'bg-blue-600 hover:bg-blue-800 text-white' : 'bg-[#2D6A4F] hover:bg-[#1A3021] text-white'}`}
                >
                  {editingOffer ? "Update Campaign" : "Deploy Campaign"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ACTIVE OFFERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredOffers.map(o => (
            <div key={o.id} className={`relative group p-8 border transition-all duration-300 flex flex-col justify-between min-h-70
              ${o.isActive ? 'border-slate-100 bg-[#FBFDFA]' : 'border-slate-50 bg-white opacity-60'}`}>

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] text-[#2D6A4F]/60 font-mono italic block mb-1">Asset ID: {o.id.toString().slice(-4)}</span>
                    <h2 className="text-3xl font-serif text-slate-900 italic tracking-tight">{o.name}</h2>
                  </div>
                  <button
                    onClick={() => toggleActive(o)}
                    className={`text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 border transition-all
                      ${o.isActive ? 'border-[#2D6A4F] text-[#2D6A4F] bg-[#2D6A4F]/5' : 'border-slate-200 text-slate-400'}`}
                  >
                    {o.isActive ? "Live" : "Paused"}
                  </button>
                </div>

                <div className="space-y-2 mb-8">
                  <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">Included Products</span>
                  <p className="text-[11px] leading-relaxed text-slate-500 italic font-light line-clamp-3">
                    {o.productIds.map((id, idx) => {
                      const p = products.find(prod => prod.id === id);
                      return p ? (idx === 0 ? "" : " • ") + p.name : "";
                    })}
                  </p>
                </div>
              </div>

              {/* ACTION TOOLBAR - Visible on Hover */}
              <div className="flex gap-6 border-t border-slate-50 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingOffer(o);
                    setDiscount(o.discount);
                    setSelectedProducts(o.productIds);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setShowForm(true)
                  }}
                  className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                >
                  Edit Asset
                </button>
                <button
                  onClick={() => deleteOffer(o.id)}
                  className="text-[9px] font-bold uppercase tracking-widest text-slate-300 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Offers;