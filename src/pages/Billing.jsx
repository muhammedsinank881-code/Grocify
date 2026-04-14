import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Search, Plus, Minus, CreditCard, Banknote, Smartphone, ChevronDown } from "lucide-react";

const Billing = () => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    handleQtyInput,
    createBill,
    parties,
    getDiscountedPrice,
  } = useStore();

  const [search, setSearch] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((sum, item) => sum + getDiscountedPrice(item) * item.quantity, 0);

  const getLiveStock = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    return product.stock - (cartItem?.quantity || 0);
  };

  const handleCreateBill = (method = paymentMethod) => {
    if (method === "credit" && !selectedParty) {
      alert("Please select a customer for credit payment");
      return;
    }
    createBill(method, selectedParty);
    setSelectedParty("");
    setPaymentMethod("cash");
  };

  // ✅ Helper function to format quantity for display (grams/kg)
  const formatQuantity = (quantity) => {
    if (quantity >= 1) {
      return `${quantity.toFixed(3)} kg`;
    } else {
      return `${(quantity * 1000).toFixed(0)} g`;
    }
  };

  // ✅ Parse input value and return numeric quantity
  const parseQuantityInput = (value) => {
    if (!value) return 0;

    // Handle .300 format -> 0.300
    let processed = value;
    if (processed.startsWith(".")) {
      processed = "0" + processed;
    }

    const num = parseFloat(processed);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800">
      {/* LEFT: CURATED INVENTORY */}
      <div className="flex-1 px-12 lg:px-16 pt-6 border-r border-slate-100 ">
        <header className="mb-12">
          <span className="text-[#2D6A4F] font-semibold tracking-widest text-xs uppercase block mb-4">
            Storefront
          </span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            {/* Heading */}
            <h2 className="text-5xl font-serif leading-tight">
              Select <span className="italic text-[#1A3021]">Items</span>.
            </h2>

            {/* Search Input */}
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
          </div>
        </header>

        <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <div className="divide-y border border-slate-200">
            {filteredProducts.map((product) => {
              const discounted = getDiscountedPrice(product);
              const hasOffer = discounted !== product.price;
              const stockLeft = getLiveStock(product);

              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between px-4 py-3 ${stockLeft === 0 ? "bg-slate-100 opacity-60" : "bg-white"
                    }`}
                >
                  {/* LEFT → NAME + INFO */}
                  <div className="flex flex-col w-[40%]">
                    <span className="font-semibold text-sm uppercase">
                      {product.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Stock: {formatQuantity(stockLeft)}
                    </span>
                  </div>

                  {/* CENTER → PRICE */}
                  <div className="text-right w-[25%]">
                    <p className="text-sm font-bold text-[#2D6A4F]">
                      ₹{discounted}
                    </p>
                    {hasOffer && (
                      <p className="text-[10px] line-through text-slate-300">
                        ₹{product.price}
                      </p>
                    )}
                  </div>

                  {/* RIGHT → BUTTON */}
                  <div className="w-[25%] flex justify-end">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={stockLeft === 0}
                      className={`px-4 py-2 text-xs font-bold uppercase transition-all
                        ${stockLeft === 0
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-[#2D6A4F] text-white hover:bg-[#1A3021]"
                        }`}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: THE CHECKOUT SLIP */}
      <div className="w-100 p-8 flex flex-col bg-[#FBFDFA] border-l border-slate-50 shadow-2xl shadow-slate-200/50">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-[#2D6A4F] mb-6 border-b border-[#2D6A4F]/10 pb-6">
          Current Order
        </h2>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-300 italic text-sm font-serif">Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => {
              const discountedPrice = getDiscountedPrice(item);
              const numericQuantity = item.quantity || 0;

              return (
                <div key={item.id} className="group animate-in fade-in slide-in-from-right-4 duration-500 relative pb-2 border-b border-slate-100 last:border-0">
                  {/* Top Row: Product Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="max-w-[40%]">
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-wider leading-tight">
                        {item.name}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <p className="text-[10px] text-[#2D6A4F] font-mono uppercase bg-[#F0F7F4] px-2 py-0.5 rounded">
                          Rate: ₹{discountedPrice}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 mx-4">
                      <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Quantity (kg/g)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="e.g., .500"
                          value={item.quantityInput !== undefined ? item.quantityInput : (numericQuantity === 0 ? "" : numericQuantity.toString())}
                          onChange={(e) => handleQtyInput(item.id, e.target.value)}
                          className="w-full border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2D6A4F] transition-all rounded-sm bg-white"
                        />
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="text-lg font-serif text-[#1A3021] font-bold whitespace-nowrap">
                      ₹{(discountedPrice * numericQuantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CUSTOMER & PAYMENT - ONE ROW WITH TWO SELECTS */}
        <div className="mt-2 pt-4 border-t-2 border-dashed border-slate-200 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT COLUMN: CLIENT SELECTION */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D6A4F] font-bold block mb-4">
                Select Client
              </label>
              <div className="relative">
                <select
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-4 text-xs font-medium focus:outline-none focus:border-[#2D6A4F] transition-all appearance-none cursor-pointer rounded-sm"
                >
                  <option value="">Walk-in Customer</option>
                  {parties
                    .filter((p) => p.type === "customer")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name.toUpperCase()} (Bal: ₹{p.balance})
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PAYMENT METHOD SELECT */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#2D6A4F] font-bold block mb-4">
                Payment Mode
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-slate-200 p-4 text-xs font-medium focus:outline-none focus:border-[#2D6A4F] transition-all appearance-none cursor-pointer rounded-sm"
                >
                  <option value="cash">CASH</option>
                  <option value="upi"> UPI</option>
                  <option value="credit"> CREDIT</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL & FINALIZE SECTION */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">Grand Total</span>
              <span className="text-4xl font-serif text-[#1A3021] font-black">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => handleCreateBill()}
              disabled={cart.length === 0 || (paymentMethod === "credit" && !selectedParty)}
              className="w-full py-5 bg-[#1A3021] text-white text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-[#2D6A4F] transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xl shadow-black/5"
            >
              Finalize Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;