  import { useState } from "react";
  import { useStore } from "../context/StoreContext";
  import { Search } from "lucide-react";


  const Purchase = () => {
    const { products, parties, createPurchase } = useStore();
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");


    const addItem = (product) => {
      const exist = cart.find((p) => p.id === product.id);
      if (exist) {
        setCart((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          )
        );
      } else {
        setCart([...cart, { ...product, quantity: 1, costPrice: product.costPrice }]);
      }
    };

    const updateItem = (id, field, value) => {
      setCart((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, [field]: Number(value) } : p
        )
      );
    };

    const removeItem = (id) => {
      setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

    const handlePurchase = () => {
      if (!selectedSupplier) {
        alert("Please select a supplier to proceed.");
        return;
      }
      if (cart.length === 0) return;
      createPurchase(selectedSupplier, cart, total);
      setCart([]);
      setSelectedSupplier("");
    };

   const LOW_STOCK_LIMIT = 10;

const filteredProducts = products
  .filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    const aLow = a.stock <= LOW_STOCK_LIMIT;
    const bLow = b.stock <= LOW_STOCK_LIMIT;

    // Low stock items first
    if (aLow && !bLow) return -1;
    if (!aLow && bLow) return 1;

    // Then sort by stock ascending
    return a.stock - b.stock;
  });

    return (
      <div className="min-h-screen bg-white font-sans text-slate-800">
        <main className="max-w-1400px mx-auto flex flex-col lg:flex-row h-screen">

          {/* LEFT SIDE: PRODUCT SELECTION */}
          <section className="flex-1 p-8 lg:p-16 border-r border-slate-100 flex flex-col">
            <header className="mb-8 flex items-center justify-between">
              <div>
                <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
                  Inventory Sourcing
                </span>
                <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">Procurement</h1>
              </div>
              <div className="relative w-80 md:max-w-xs lg:max-w-md mt-10">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  placeholder="Search our collection..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2 pl-8 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic"
                />
              </div>
            </header>

            {/* FLEX TABLE HEADER */}
            <div className="flex border-b border-slate-200 pb-4 mb-2">
              <div className="w-24 text-[9px] uppercase tracking-widest text-slate-400 font-bold">SKU</div>
              <div className="flex-1 text-[9px] uppercase tracking-widest text-slate-400 font-bold">Product Name</div>
              <div className="w-28 text-[9px] uppercase tracking-widest text-slate-400 font-bold text-right">Base Cost</div>
              <div className="w-20"></div>
            </div>

            {/* FLEX TABLE BODY (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center py-4 border-b border-slate-50 hover:bg-[#FBFDFA] transition-colors group"
                >
                  <div className="w-24 text-[10px] font-mono text-slate-400">SKU-{p.id.toString().slice(-4)}</div>
                  <div className="flex-1 text-sm font-bold text-slate-900 group-hover:text-[#2D6A4F] transition-colors uppercase tracking-tight">
                    {p.name}
                  </div>
                  <div className="w-28 text-xs italic text-slate-500 text-right">₹{p.costPrice}</div>
                  <div className="w-20 text-right">
                    <button
                      onClick={() => addItem(p)}
                      className="text-[9px] uppercase tracking-widest text-[#2D6A4F] hover:font-bold transition-all"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT SIDE: PURCHASE CART (Stays same) */}
          <aside className="w-full lg:w-100 bg-[#FBFDFA] p-8 lg:p-12 flex flex-col h-screen">
            <div className="mb-10">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
                Purchase Manifest
              </h2>
              <div className="space-y-2 mb-8">
                <label className="text-[9px] uppercase tracking-widest text-[#2D6A4F] font-bold">Supplier Entity</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-200 py-2 outline-none text-sm font-light italic focus:border-[#2D6A4F] appearance-none cursor-pointer"
                >
                  <option value="">Select a partner...</option>
                  {parties
                    .filter((p) => p.type === "supplier")
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {cart.length === 0 ? (
                <p className="text-sm italic text-slate-300 py-10 text-center">No items selected for procurement.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="group animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-tight text-slate-700">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[9px] text-slate-300 hover:text-red-400 uppercase tracking-widest transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[8px] uppercase text-slate-400 block mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                          className="w-full bg-white border border-slate-100 p-2 text-xs outline-none focus:border-[#2D6A4F]/30"
                        />
                      </div>
                      <div className="flex-[1.5]">
                        <label className="text-[8px] uppercase text-slate-400 block mb-1">Unit Cost (₹)</label>
                        <input
                          type="number"
                          value={item.costPrice}
                          onChange={(e) => updateItem(item.id, "costPrice", e.target.value)}
                          className="w-full bg-white border border-slate-100 p-2 text-xs outline-none focus:border-[#2D6A4F]/30"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-200">
              <div className="flex justify-between items-end mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Total Valuation</span>
                <span className="text-3xl font-serif italic text-[#1A3021]">₹{total.toLocaleString()}</span>
              </div>
              <button
                onClick={handlePurchase}
                disabled={cart.length === 0}
                className="w-full bg-[#2D6A4F] text-white py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1A3021] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Complete Acquisition
              </button>
            </div>
          </aside>
        </main>
      </div>
    );
  };

  export default Purchase;