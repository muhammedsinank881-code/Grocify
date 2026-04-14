import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Search} from "lucide-react";


const Returns = () => {
  const { transactions, createReturn, parties } = useStore();

  const [selectedBill, setSelectedBill] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [search, setSearch] = useState("");

  const handleQty = (item, qty) => {
    setReturnItems(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: Number(qty)
      }
    }));
  };

  const handleReturn = () => {
    const items = Object.values(returnItems).filter(i => i.quantity > 0);
    if (items.length === 0) return;

    createReturn(selectedBill, items);
    setSelectedBill(null);
    setReturnItems({});
  };

  const sales = transactions
  .filter(t => t.type === "sale")
  .filter((bill) => {
    const query = search.toLowerCase();

    const party = parties.find(p => p.id === bill.partyId);

    return (
      bill.id.toLowerCase().includes(query) ||

      bill.total.toString().includes(query) ||

      new Date(bill.date)
        .toLocaleDateString()
        .toLowerCase()
        .includes(query) ||

      (party?.name || "")
        .toLowerCase()  
        .includes(query) ||

      bill.items.some(item =>
        item.name.toLowerCase().includes(query)
      )
    );
  });

  // ✅ Calculate refund total
  const refundTotal = Object.values(returnItems).reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  // ✅ Find party for selected bill
  const party = selectedBill ? parties.find(p => p.id === selectedBill.partyId) : null;

  // pagination 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const reversedSales = [...sales].reverse()

  const currentSales = reversedSales.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(sales.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="p-12 lg:p-16 max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-16 flex items-center justify-between">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
            Post-Purchase
          </span>
          <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">Order Returns</h1>
          </div>
          <div className="relative w-80 md:max-w-xs lg:max-w-md pb-1">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search Bills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2 pl-8 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic"
              />
            </div>
        </header>

        {!selectedBill ? (
          /* BILL SELECTION GRID */
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Select an Order</h2>
              
              <span className="text-[10px] italic text-slate-300">Displaying recent transactions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentSales.map(bill => {
                const party = parties.find(p => p.id === bill.partyId);

                return (
                  <div
                    key={bill.id}
                    onClick={() => setSelectedBill(bill)}
                    className="group cursor-pointer border p-6 bg-[#FBFDFA] hover:border-[#2D6A4F]/30"
                  >
                    <p className="text-[10px] text-[#2D6A4F] mb-2">
                      #{bill.id.slice(-6)}
                    </p>

                    {/* ✅ CUSTOMER NAME */}
                    <p className="text-sm text-slate-400">
                      {party ? party.name : "Walk-in Customer"}
                    </p>

                    {/* TOTAL */}
                    <p className="text-xl font-serif mt-2">₹{bill.total}</p>

                    {/* DATE FIX */}
                    <p className="text-xs text-slate-400">
                      {new Date(bill.date).toLocaleDateString()}
                    </p>

                    {/* ITEMS PREVIEW */}
                    <p className="text-xs text-slate-300 mt-2">
                      {bill.items.length} items
                    </p>
                  </div>
                )
              })}
            </div>
             <div className="flex justify-end gap-2 mt-6">

            {/* PREV */}
            <button
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border text-xs  hover:border-[#2D6A4F]/30 hover:bg-[#FBFDFA]"
            >
              Prev
            </button>

            {/* PAGE NUMBERS */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 text-xs border ${currentPage === i + 1 ? "bg-[#2D6A4F] text-white" : ""
                  }`}
              >
                {i + 1}
              </button>
            ))}

            {/* NEXT */}
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border text-xs hover:border-[#2D6A4F]/30 hover:bg-[#FBFDFA]"
            >
              Next
            </button>

          </div>

          </section>
        ) : ( 
          /* RETURN ITEM ADJUSTMENT */
          <section className="max-w-3xl animate-fade-in">
            <button
              onClick={() => setSelectedBill(null)}
              className="mb-10 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
            >
              ← Back to Orders
            </button>

            <div className="mb-12">
              <span className="text-[10px] uppercase tracking-widest text-[#2D6A4F] font-bold">Adjusting Order</span>
              <h2 className="text-3xl font-serif italic text-[#1A3021]">#{selectedBill.id.toString().slice(-6)}</h2>

              {/* ✅ Display customer name */}
              <p className="text-sm text-slate-400 mt-2">
                Customer: {party ? party.name : "Walk-in Customer"}
              </p>
            </div>

            <div className="space-y-0 border-t border-slate-100">
              {selectedBill.items.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-slate-100 group">
                  <div className="mb-4 md:mb-0">
                    <h4 className="text-sm font-medium text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-400">Original Quantity: {item.quantity}</p>
                    <p className="text-xs text-slate-400">Price: ₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-[10px] uppercase tracking-widest text-slate-300">Return Qty</span>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      placeholder="0"
                      onChange={(e) => handleQty(item, e.target.value)}
                      className="w-20 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] py-2 text-center font-serif outline-none transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Refund Amount Section */}
            <div className="mt-6">
              <p className="text-xs text-slate-400">Refund Amount</p>
              <p className="text-xl font-serif text-red-500">
                ₹{refundTotal}
              </p>
            </div>

            <div className="mt-16 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">Status</p>
                <p className="text-sm italic font-serif">Awaiting reconciliation</p>
              </div>
              <button
                onClick={handleReturn}
                disabled={refundTotal === 0}
                className={`px-12 py-4 text-[11px] font-bold tracking-[0.3em] uppercase transition-all ${refundTotal === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#1A3021] text-white hover:bg-black'
                  }`}
              >
                Process Return (₹{refundTotal})
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Returns;