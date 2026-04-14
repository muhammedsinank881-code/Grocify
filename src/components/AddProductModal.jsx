import { useState } from "react";
import { useStore } from "../context/StoreContext";

const AddProductModal = ({ close, editProduct }) => {
  const { categories, addProduct, updateProduct } = useStore();
  const isEdit = !!editProduct;

  const [form, setForm] = useState({
    name: editProduct?.name || "",
    price: editProduct?.price || "",
    categoryId: editProduct?.categoryId || ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      updateProduct(editProduct.id, {
        ...editProduct,
        name: form.name,
        price: Number(form.price),
        categoryId: form.categoryId
      });
    } else {
      addProduct({
        id: Date.now().toString(),
        name: form.name,
        price: Number(form.price),
        costPrice: 0,
        stock: 0,
        categoryId: form.categoryId
      });
    }

    close();
  };

  const inputClass = "w-full py-3 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic placeholder:text-slate-300";

  return (
    <div className="fixed inset-0 bg-[#1A3021]/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">

      <div className="bg-white p-10 lg:p-12 w-full max-w-[450px] shadow-2xl relative">

        {/* Decorative Corner Element */}
        <div className="absolute top-0 right-0 p-4 opacity-10 text-2xl italic font-serif text-[#2D6A4F]">
          Inventory
        </div>

        <header className="mb-10">
          <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
            {isEdit ? "Edit Entry" : "New Entry"}
          </span>
          {/* 🔥 CHANGE TITLE (UX) */}
          <h2 className="text-3xl font-serif mt-2 italic text-[#1A3021]">
            {isEdit ? "Edit Product" : "Register Product"}
          </h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Product Title</label>
            <input 
              name="name" 
              value={form.name}
              placeholder="e.g. Hand-poured Soy Candle" 
              onChange={handleChange} 
              className={inputClass} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Retail Price</label>
              <input 
                name="price" 
                type="number" 
                value={form.price}
                placeholder="₹ 0.00" 
                onChange={handleChange} 
                className={inputClass} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Category</label>
              <select 
                name="categoryId" 
                value={form.categoryId}
                onChange={handleChange} 
                className={`${inputClass} appearance-none cursor-pointer`} 
                required
              >
                <option value="">Select Curated List</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-12">
            {/* 🔥 CHANGE BUTTON TEXT */}
            <button className="w-full bg-[#2D6A4F] text-white py-4 text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-[#1A3021] transition-all">
              {isEdit ? "Update Product" : "Save Product"}
            </button>
            <button
              type="button"
              onClick={close}
              className="w-full text-slate-400 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:text-slate-800 transition-all"
            >
              Discard Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProductModal;