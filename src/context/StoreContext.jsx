import { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext();

const BASE_URL = "https://grocify-backend-597n.onrender.com";

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

  const handleQtyInput = (id, value) => {
    if (!/^[0-9.]*$/.test(value)) return;
    if ((value.match(/\./g) || []).length > 1) return;

    let v = value;
    if (v.startsWith(".")) {
      v = "0" + v;
    }

    const num = parseFloat(v);
    const product = products.find(p => p.id === id);

    if (!isNaN(num) && num > product.stock) return;

    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantityInput: value,
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

    const res = await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransaction)
    });

    const saved = await res.json();
    setTransactions(prev => [...prev, saved]);

    for (let item of items) {
      const product = products.find(p => p.id === item.id);

      await fetch(`${BASE_URL}/products/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: product.stock + item.quantity,
          costPrice: item.costPrice
        })
      });

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

    const supplier = parties.find(p => p.id === partyId);
    const newBalance = supplier.balance - total;

    await fetch(`${BASE_URL}/parties/${partyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance })
    });

    setParties(prev =>
      prev.map(p =>
        p.id === partyId ? { ...p, balance: newBalance } : p
      )
    );

    await fetchData();
  };

  // ---------------- PURCHASE RETURN ----------------
  const createPurchaseReturn = async (transaction, returnItems) => {
    let refundAmount = 0;

    returnItems.forEach(item => {
      refundAmount += item.costPrice * item.quantity;
    });

    const newReturn = {
      type: "purchase_return",
      transactionId: transaction.id,
      partyId: transaction.partyId,
      date: new Date().toISOString(),
      items: returnItems,
      refundAmount
    };

    // Save in returns table
    await fetch(`${BASE_URL}/returns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReturn)
    });

    // Update returnedQty on the original purchase transaction
    const updatedItems = transaction.items.map(originalItem => {
      const returnedItem = returnItems.find(r => r.id === originalItem.id);
      if (returnedItem) {
        return {
          ...originalItem,
          returnedQty: Math.min(
            originalItem.quantity,
            (originalItem.returnedQty || 0) + returnedItem.quantity
          )
        };
      }
      return originalItem;
    });

    await fetch(`${BASE_URL}/transactions/${transaction.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: updatedItems })
    });

    // ✅ FIX: Update local transactions state immediately so useEffect in Returns.jsx fires
    setTransactions(prev =>
      prev.map(t =>
        t.id === transaction.id ? { ...t, items: updatedItems } : t
      )
    );

    // 📦 DECREASE stock for purchase returns (items going back to supplier)
    for (let item of returnItems) {
      const product = products.find(p => p.id === item.id);
      const newStock = product.stock - item.quantity;

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

    // 💰 Adjust supplier balance (we get money back, so balance increases toward zero)
    const supplier = parties.find(p => p.id === transaction.partyId);

    if (supplier) {
      const newBalance = supplier.balance + refundAmount;

      await fetch(`${BASE_URL}/parties/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance })
      });

      setParties(prev =>
        prev.map(p =>
          p.id === supplier.id ? { ...p, balance: newBalance } : p
        )
      );
    }

    // Add transaction log for purchase return (negative total)
    const returnTransaction = {
      type: "purchase_return",
      partyId: transaction.partyId,
      date: new Date().toISOString(),
      items: returnItems,
      total: -refundAmount
    };

    await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(returnTransaction)
    });

    // Update local returns state
    setReturns(prev => [...prev, newReturn]);

    // Refresh all data
    await fetchData();
  };

  // ---------------- BILLING / SALES (WITH DISCOUNTS) ----------------
  const createBill = async (paymentMethod = "cash", partyId = null) => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const total = cart.reduce((sum, item) => {
      const price = getDiscountedPrice(item);
      return sum + price * item.quantity;
    }, 0);

    const discountedItems = cart.map(item => {
      const price = getDiscountedPrice(item);
      return {
        id: item.id,
        name: item.name,
        price,
        quantity: item.quantity,
        costPrice: item.costPrice
      };
    });

    const newTransaction = {
      type: "sale",
      partyId: partyId || null,
      date: new Date().toISOString(),
      paymentMethod,
      items: discountedItems,
      total
    };

    const res = await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTransaction)
    });

    const saved = await res.json();
    setTransactions(prev => [...prev, saved]);

    // Update party balance for credit payments
    if (paymentMethod === "credit" && partyId) {
      const party = parties.find(p => p.id === partyId);
      const newBalance = party.balance + total;

      await fetch(`${BASE_URL}/parties/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance })
      });

      setParties(prev =>
        prev.map(p =>
          p.id === partyId ? { ...p, balance: newBalance } : p
        )
      );
    }

    // Update stock
    for (let item of cart) {
      const product = products.find(p => p.id === item.id);
      const newStock = product.stock - item.quantity;

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

    await fetchData();
    clearCart();
    return saved;
  };

  // ---------------- SALES RETURN ----------------
  const createReturn = async (transaction, returnItems) => {
    let refundAmount = 0;
    let profitLoss = 0;

    returnItems.forEach(item => {
      refundAmount += item.price * item.quantity;

      const originalItem = transaction.items.find(i => i.id === item.id);
      if (originalItem && originalItem.costPrice) {
        const profitPerItem = originalItem.price - originalItem.costPrice;
        profitLoss += profitPerItem * item.quantity;
      }
    });

    const newReturn = {
      type: "sale_return",
      transactionId: transaction.id,
      partyId: transaction.partyId,
      date: new Date().toISOString(),
      items: returnItems,
      refundAmount,
      profitLoss: -profitLoss
    };

    // Save return
    const res = await fetch(`${BASE_URL}/returns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReturn)
    });

    const savedReturn = await res.json();
    setReturns(prev => [...prev, savedReturn]);

    // Update original bill with returned qty
    const updatedItems = transaction.items.map(originalItem => {
      const returnedItem = returnItems.find(r => r.id === originalItem.id);

      if (returnedItem) {
        return {
          ...originalItem,
          returnedQty: Math.min(
            originalItem.quantity,
            (originalItem.returnedQty || 0) + returnedItem.quantity
          )
        };
      }

      return originalItem;
    });

    // PATCH original transaction
    await fetch(`${BASE_URL}/transactions/${transaction.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: updatedItems })
    });

    // ✅ FIX: Update local transactions state immediately so useEffect in Returns.jsx fires
    setTransactions(prev =>
      prev.map(t =>
        t.id === transaction.id ? { ...t, items: updatedItems } : t
      )
    );

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

    // ✅ INCREASE stock for sales returns (items coming back)
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

    // Create a return transaction (negative total)
    const returnTransaction = {
      type: "sale_return",
      transactionId: transaction.id,
      partyId: transaction.partyId || null,
      date: new Date().toISOString(),
      paymentMethod: "return",
      items: returnItems,
      total: -refundAmount
    };

    await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(returnTransaction)
    });

    // Refresh all data to ensure consistency
    await fetchData();

    return savedReturn;
  };

  const createPayment = async (partyId, amount, method) => {
    const party = parties.find(p => p.id === partyId);

    let newBalance = party.balance;

    if (party.type === "customer") {
      newBalance = party.balance - amount;
    } else {
      newBalance = party.balance + amount;
    }

    const newPayment = {
      partyId,
      amount,
      method,
      date: new Date().toISOString()
    };

    await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPayment)
    });

    await fetch(`${BASE_URL}/parties/${partyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance })
    });

    fetchData();
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
        createPurchaseReturn,
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
