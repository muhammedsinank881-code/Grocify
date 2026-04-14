import { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext();

const BASE_URL = "http://localhost:3001";

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [parties, setParties] = useState([]);
  const [returns, setReturns] = useState([]);
  const [offers, setOffers] = useState([]);

  // ---------------- FETCH DATA ----------------
  const fetchData = async () => {
    try {
      const [prodRes, catRes, transRes, partiesRes, returnsRes, offersRes] = await Promise.all([
        fetch(`${BASE_URL}/products`),
        fetch(`${BASE_URL}/categories`),
        fetch(`${BASE_URL}/transactions`),
        fetch(`${BASE_URL}/parties`),
        fetch(`${BASE_URL}/returns`).catch(() => ({ json: () => [] })),
        fetch(`${BASE_URL}/offers`).catch(() => ({ json: () => [] }))
      ]);

      const productsData = await prodRes.json();
      const categoriesData = await catRes.json();
      const transactionsData = await transRes.json();
      const partiesData = await partiesRes.json();
      const returnsData = await returnsRes.json();
      const offersData = await offersRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
      setParties(partiesData);
      setReturns(returnsData);
      setOffers(offersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ DISCOUNT FUNCTION
  const getDiscountedPrice = (product) => {
    const offer = offers.find(o =>
      o.isActive && o.productIds.includes(product.id)
    );

    if (!offer) return product.price;

    const discount = (product.price * offer.discount) / 100;
    return product.price - discount;
  };

  // ---------------- PRODUCT CRUD ----------------
  const addProduct = async (product) => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });

    const data = await res.json();
    setProducts(prev => [...prev, data]);
  };

  const deleteProduct = async (id) => {
    await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE"
    });

    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = async (id, updatedData) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    const updated = await res.json();

    setProducts(prev =>
      prev.map(p => (p.id === id ? updated : p))
    );
  };

  const updateStock = async (id, qty) => {
    const product = products.find(p => p.id === id);
    const newStock = product.stock + qty;

    await fetch(`${BASE_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock })
    });

    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, stock: newStock } : p)
    );
  };

  // ---------------- CART OPERATIONS ----------------
  const addToCart = (product) => {
    const exist = cart.find(p => p.id === product.id);
    const currentQty = exist?.quantity || 0;

    if (currentQty >= product.stock) return;

    setCart(prev => {
      if (exist) {
        return prev.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1, quantityInput: String(p.quantity + 1) }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1, quantityInput: "1" }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };

  const clearCart = () => setCart([]);

  // ✅ NEW: handleQtyInput (replaces increaseQty and decreaseQty)
  const handleQtyInput = (id, value) => {
    // allow only numbers + dot
    if (!/^[0-9.]*$/.test(value)) return;

    // prevent multiple dots
    if ((value.match(/\./g) || []).length > 1) return;

    let v = value;

    // ".300" → "0.300"
    if (v.startsWith(".")) {
      v = "0" + v;
    }

    const num = parseFloat(v);
    const product = products.find(p => p.id === id);
    
    // Check if quantity exceeds stock
    if (!isNaN(num) && num > product.stock) return;

    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantityInput: value, // raw UI value
              quantity: isNaN(num) ? 0 : +num.toFixed(3)
            }
          : item
      )
    );
  };

  // ---------------- CATEGORY CRUD ----------------
  const addCategory = async (name) => {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const data = await res.json();
    setCategories(prev => [...prev, data]);
  };

  const deleteCategory = async (id) => {
    await fetch(`${BASE_URL}/categories/${id}`, {
      method: "DELETE"
    });

    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateCategory = async (id, newName) => {
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });

    const updated = await res.json();
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
  };

  // ---------------- PARTY CRUD ----------------
  const addParty = async (party) => {
    const res = await fetch(`${BASE_URL}/parties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...party, balance: 0 })
    });

    const data = await res.json();
    setParties(prev => [...prev, data]);
  };

  const deleteParty = async (id) => {
    await fetch(`${BASE_URL}/parties/${id}`, {
      method: "DELETE"
    });

    setParties(prev => prev.filter(p => p.id !== id));
  };

  const updateParty = async (id, updatedData) => {
    const res = await fetch(`${BASE_URL}/parties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    const updated = await res.json();
    setParties(prev => prev.map(p => p.id === id ? updated : p));
  };

  // ---------------- PURCHASE (Supplier Stock In) ----------------
  const createPurchase = async (partyId, items, total) => {
    const newTransaction = {
      type: "purchase",
      partyId,
      date: new Date().toISOString(),
      items,
      total
    };

    // Save transaction
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransaction)
    });

    const saved = await res.json();
    setTransactions(prev => [...prev, saved]);

    // 📦 Increase stock and update cost price
    for (let item of items) {
      const product = products.find(p => p.id === item.id);

      await fetch(`${BASE_URL}/products/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: product.stock + item.quantity,
          costPrice: item.costPrice // update cost
        })
      });

      // Update local state
      setProducts(prev =>
        prev.map(p =>
          p.id === item.id
            ? {
              ...p,
              stock: p.stock + item.quantity,
              costPrice: item.costPrice
            }
            : p
        )
      );
    }

    // 💸 Update supplier balance (you owe them, so balance decreases)
    const supplier = parties.find(p => p.id === partyId);
    const newBalance = supplier.balance - total;

    await fetch(`${BASE_URL}/parties/${partyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance })
    });

    // Update local state
    setParties(prev =>
      prev.map(p =>
        p.id === partyId ? { ...p, balance: newBalance } : p
      )
    );

    await fetchData();
  };

  // ---------------- BILLING / SALES (WITH DISCOUNTS) ----------------
  const createBill = async (paymentMethod = "cash", partyId = null) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // ✅ NEW: Calculate total with discounts
    const total = cart.reduce((sum, item) => {
      const price = getDiscountedPrice(item);
      return sum + price * item.quantity;
    }, 0);

    // ✅ NEW: Map cart items with discounted prices
    const discountedItems = cart.map(item => {
      const price = getDiscountedPrice(item);
      return {
        id: item.id,
        name: item.name,
        price, // ✅ discounted price
        quantity: item.quantity
      };
    });

    const newTransaction = {
      type: "sale",
      partyId: partyId || null,
      date: new Date().toISOString(),
      paymentMethod,
      items: discountedItems, // ✅ Using discounted items
      total
    };

    // Save transaction
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransaction)
    });

    const saved = await res.json();
    setTransactions(prev => [...prev, saved]);

    // 💰 CREDIT SYSTEM - Update party balance if credit payment
    if (paymentMethod === "credit" && partyId) {
      const party = parties.find(p => p.id === partyId);
      const newBalance = party.balance + total;

      await fetch(`${BASE_URL}/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance })
      });

      // Update local state
      setParties(prev =>
        prev.map(p =>
          p.id === partyId ? { ...p, balance: newBalance } : p
        )
      );
    }

    // 📦 UPDATE STOCK for all items in cart (using original product stock)
    for (let item of cart) {
      const product = products.find(p => p.id === item.id);
      const newStock = product.stock - item.quantity;

      await fetch(`${BASE_URL}/products/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });

      // Update local state
      setProducts(prev =>
        prev.map(p =>
          p.id === item.id ? { ...p, stock: newStock } : p
        )
      );
    }

    // Refresh all data to ensure consistency
    await fetchData();

    // Clear cart after successful billing
    clearCart();

    return saved;
  };

  const createPayment = async (partyId, amount, method) => {
    const party = parties.find(p => p.id === partyId);

    let newBalance = party.balance;

    if (party.type === "customer") {
      // customer pays → reduce balance
      newBalance = party.balance - amount;
    } else {
      // you pay supplier → increase balance towards zero
      newBalance = party.balance + amount;
    }

    const newPayment = {
      partyId,
      amount,
      method,
      date: new Date().toISOString()
    };

    // save payment
    await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPayment)
    });

    // update balance
    await fetch(`${BASE_URL}/parties/${partyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance })
    });

    fetchData();
  };

  // ---------------- RETURNS ----------------
  const createReturn = async (transaction, returnItems) => {
    // Calculate refund amount
    let refundAmount = 0;
    returnItems.forEach(item => {
      refundAmount += item.price * item.quantity;
    });

    const newReturn = {
      transactionId: transaction.id,
      date: new Date().toISOString(),
      items: returnItems,
      refundAmount
    };

    // Save return
    const res = await fetch(`${BASE_URL}/returns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReturn)
    });

    const savedReturn = await res.json();
    setReturns(prev => [...prev, savedReturn]);

    // Handle credit refund if original payment was credit
    if (transaction.paymentMethod === "credit" && transaction.partyId) {
      const party = parties.find(p => p.id === transaction.partyId);
      const newBalance = party.balance - refundAmount;

      await fetch(`${BASE_URL}/parties/${transaction.partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance })
      });

      setParties(prev =>
        prev.map(p =>
          p.id === transaction.partyId ? { ...p, balance: newBalance } : p
        )
      );
    }

    // Restore stock
    for (let item of returnItems) {
      const product = products.find(p => p.id === item.id);
      const newStock = product.stock + item.quantity;

      await fetch(`${BASE_URL}/products/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      });

      setProducts(prev =>
        prev.map(p =>
          p.id === item.id ? { ...p, stock: newStock } : p
        )
      );
    }

    // Create a credit note transaction for the return
    const creditNote = {
      type: "return",
      transactionId: transaction.id,
      date: new Date().toISOString(),
      paymentMethod: "credit_note",
      items: returnItems,
      total: -refundAmount
    };

    await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creditNote)
    });

    await fetchData();
  };

  // ---------------- UTILITIES ----------------
  const getPartyBalance = (partyId) => {
    const party = parties.find(p => p.id === partyId);
    return party ? party.balance : 0;
  };

  const getCustomerTransactions = (partyId) => {
    return transactions.filter(t => t.partyId === partyId && t.type === "sale");
  };

  const getOutstandingCredit = () => {
    return parties
      .filter(p => p.type === "customer")
      .reduce((sum, party) => sum + party.balance, 0);
  };

  // ---------------- EXPORT ----------------
  return (
    <StoreContext.Provider
      value={{
        // State
        products,
        categories,
        cart,
        parties,
        transactions,
        returns,
        offers,

        // Product functions
        addProduct,
        deleteProduct,
        updateProduct,
        updateStock,

        // Cart functions
        addToCart,
        removeFromCart,
        clearCart,
        handleQtyInput, 

        // Discount function
        getDiscountedPrice,

        // Category functions
        addCategory,
        deleteCategory,
        updateCategory,

        // Party functions
        addParty,
        deleteParty,
        updateParty,

        // Transaction functions
        createBill,
        createPurchase,
        createReturn,
        createPayment,

        // Utility functions
        getPartyBalance,
        getCustomerTransactions,
        getOutstandingCredit,
        fetchData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);