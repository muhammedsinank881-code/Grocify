import { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { Search, ArrowLeft } from "lucide-react";

const Returns = () => {
  const { transactions, createReturn, createPurchaseReturn, parties } = useStore();

  const [selectedBill, setSelectedBill] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("sale");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleQty = (item, qty) => {
    const quantity = Number(qty);
    if (isNaN(quantity)) return;
    
    setReturnItems(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: quantity,
        originalQuantity: item.originalQuantity
      }
    }));
  };

  const handleReturn = async () => {
    setError("");
    setSuccess("");
    
    const items = Object.values(returnItems).filter(i => i.quantity > 0);
    if (items.length === 0) {
      setError("Please select at least one item to return");
      return;
    }

    // Validate quantities
    for (const item of items) {
      if (item.quantity > item.originalQuantity) {
        setError(`Return quantity for ${item.name} cannot exceed original quantity (${item.originalQuantity})`);
        return;
      }
    }

    try {
      if (mode === "sale") {
        await createReturn(selectedBill, items);
        setSuccess("Sales return processed successfully! Stock increased and profit adjusted.");
      } else {
        await createPurchaseReturn(selectedBill, items);
        setSuccess("Purchase return processed successfully! Stock decreased and balance adjusted.");
      }
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedBill(null);
        setReturnItems({});
        setSuccess("");
      }, 2000);
      
    } catch (err) {
      console.error("Return error:", err);
      setError(err.message || "Failed to process return. Please try again.");
    }
  };

  const filteredTransactions = transactions.filter(t =>
    mode === "sale"
      ? t.type === "sale"
      : t.type === "purchase"
  );

  const sales = filteredTransactions
    .filter((bill) => {
      const query = search.toLowerCase();
      const party = parties.find(p => p.id === bill.partyId);

      return (
        bill.id?.toLowerCase().includes(query) ||
        bill.total?.toString().includes(query) ||
        new Date(bill.date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(query) ||
        (party?.name || "")
          .toLowerCase()  
          .includes(query) ||
        bill.items?.some(item =>
          item.name?.toLowerCase().includes(query)
        )
      );
    });

  // Calculate refund total
  const refundTotal = Object.values(returnItems).reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity || 0)),
    0
  );

  // Find party for selected bill
  const party = selectedBill ? parties.find(p => p.id === selectedBill.partyId) : null;

  // Reset return items when selected bill changes
  useEffect(() => {
    setReturnItems({});
    setError("");
    setSuccess("");
  }, [selectedBill]);

  // Pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const reversedSales = [...sales].reverse()
  const currentSales = reversedSales.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  // Reset page when mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [mode, search]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="py-4 px-16 max-w-6xl mx-auto">

        {/* MODE SELECTION BUTTONS */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => {
              setMode("sale");
              setSelectedBill(null);
              setReturnItems({});
              setError("");
              setSuccess("");
              setSearch("");
            }}
            className={`px-4 py-2 text-xs border transition-all ${
              mode === "sale"
                ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
            }`}
          >
            Sales Returns
          </button>

          <button
            onClick={() => {
              setMode("purchase");
              setSelectedBill(null);
              setReturnItems({});
              setError("");
              setSuccess("");
              setSearch("");
            }}
            className={`px-4 py-2 text-xs border transition-all ${
              mode === "purchase"
                ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
            }`}
          >
            Purchase Returns
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md animate-fade-in">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md animate-fade-in">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* HEADER */}
        <header className="mb-16 flex items-center justify-between">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
              Post-Purchase
            </span>
            <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">
              {mode === "sale" ? "Order Returns" : "Purchase Returns"}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              {mode === "sale" 
                ? "Returns will increase stock and adjust profit calculations" 
                : "Returns will decrease stock and adjust supplier balance"}
            </p>
          </div>
          <div className="relative w-80 md:max-w-xs lg:max-w-md pb-1">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder={`Search ${mode === "sale" ? "Bills" : "Purchase Orders"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 pl-8 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic"
            />
          </div>
        </header>

        {!selectedBill ? (
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Select a {mode === "sale" ? "Order" : "Purchase Order"}
              </h2>
              <span className="text-[10px] italic text-slate-300">
                {sales.length} {mode === "sale" ? "orders" : "purchases"} found
              </span>
            </div>

            {sales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 italic">
                  No {mode === "sale" ? "sales" : "purchase"} transactions found
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {currentSales.map(bill => {
                    const party = parties.find(p => p.id === bill.partyId);

                    return (
                      <div
                        key={bill.id}
                        onClick={() => setSelectedBill(bill)}
                        className="group cursor-pointer border p-6 bg-[#FBFDFA] hover:border-[#2D6A4F]/30 transition-all hover:shadow-lg"
                      >
                        <p className="text-[10px] text-[#2D6A4F] mb-2 font-mono">
                          #{bill.id?.slice(-6) || 'N/A'}
                        </p>

                        <p className="text-sm text-slate-400">
                          {party ? party.name : (mode === "sale" ? "Walk-in Customer" : "Unknown Supplier")}
                        </p>

                        <p className="text-xl font-serif mt-2">₹{bill.total || 0}</p>

                        <p className="text-xs text-slate-400">
                          {bill.date ? new Date(bill.date).toLocaleDateString() : 'No date'}
                        </p>

                        <p className="text-xs text-slate-300 mt-2">
                          {bill.items?.length || 0} items
                        </p>
                      </div>
                    )
                  })}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border text-xs hover:border-[#2D6A4F]/30 hover:bg-[#FBFDFA] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Prev
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-xs border transition-all ${
                            currentPage === pageNum 
                              ? "bg-[#2D6A4F] text-white border-[#2D6A4F]" 
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border text-xs hover:border-[#2D6A4F]/30 hover:bg-[#FBFDFA] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        ) : ( 
          <section className="max-w-3xl animate-fade-in">
            <button
              onClick={() => {
                setSelectedBill(null);
                setReturnItems({});
                setError("");
                setSuccess("");
              }}
              className="mb-10 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={12} /> Back to {mode === "sale" ? "Orders" : "Purchase Orders"}
            </button>

            <div className="mb-12">
              <span className="text-[10px] uppercase tracking-widest text-[#2D6A4F] font-bold">
                Adjusting {mode === "sale" ? "Order" : "Purchase Order"}
              </span>
              <h2 className="text-3xl font-serif italic text-[#1A3021]">#{selectedBill.id?.toString().slice(-6) || 'N/A'}</h2>

              <p className="text-sm text-slate-400 mt-2">
                {mode === "sale" ? "Customer" : "Supplier"}: {party ? party.name : (mode === "sale" ? "Walk-in Customer" : "Unknown Supplier")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Original Bill Total: ₹{selectedBill.total || 0}
              </p>
            </div>

            <div className="space-y-0 border-t border-slate-100">
              {selectedBill.items?.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-slate-100 group">
                  <div className="mb-4 md:mb-0">
                    <h4 className="text-sm font-medium text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-400">Original Quantity: {item.quantity}</p>
                    <p className="text-xs text-slate-400">
                      {mode === "sale" ? "Selling Price" : "Cost Price"}: ₹{item.price}
                    </p>
                    {mode === "sale" && item.costPrice && (
                      <p className="text-xs text-green-600">
                        Profit per unit: ₹{(item.price - item.costPrice).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-[10px] uppercase tracking-widest text-slate-300">Return Qty</span>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={returnItems[item.id]?.quantity || 0}
                      onChange={(e) => handleQty({
                        ...item,
                        originalQuantity: item.quantity
                      }, e.target.value)}
                      className="w-20 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] py-2 text-center font-serif outline-none transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Refund Amount Section */}
            <div className="mt-6 p-4 bg-slate-50 rounded-md">
              <p className="text-xs text-slate-400">Total Refund Amount</p>
              <p className="text-2xl font-serif text-red-500">
                ₹{refundTotal.toFixed(2)}
              </p>
              {mode === "sale" && refundTotal > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  This will reduce profit by approximately ₹{(refundTotal * 0.2).toFixed(2)} (estimated)
                </p>
              )}
            </div>

            <div className="mt-16 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">Status</p>
                <p className="text-sm italic font-serif">Awaiting reconciliation</p>
              </div>
              <button
                onClick={handleReturn}
                disabled={refundTotal === 0}
                className={`px-12 py-4 text-[11px] font-bold tracking-[0.3em] uppercase transition-all ${
                  refundTotal === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#1A3021] text-white hover:bg-black'
                }`}
              >
                Process Return (₹{refundTotal.toFixed(2)})
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Returns;