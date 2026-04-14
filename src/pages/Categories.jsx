import { useState } from "react";
import { useStore } from "../context/StoreContext";
import CategoryProductsModal from "../components/CategoryProductsModal";

const Categories = () => {
  const { categories, addCategory, deleteCategory, updateCategory, products } = useStore();

  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ✅ Fixed: Moved this inside the component and added proper calculation
  const getProductCount = (categoryId) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory(name);
    setName("");
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditValue(cat.name);
  };

  const saveEdit = (id) => {
    if (!editValue.trim()) return;
    updateCategory(id, editValue);
    setEditId(null);
  };

  const filteredCategory = categories.filter(c => 
    c.name.toLowerCase().includes(name.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="p-12 lg:p-16 max-w-5xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-16">
          <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
            Organization
          </span>
          <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">Product Categories</h1>
        </header>

        {/* ADD CATEGORY FORM */}
        <section className="mb-20">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">New Category Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wellness & Apothecary"
                className="w-full py-3 bg-transparent border-b border-slate-200 focus:border-[#2D6A4F] outline-none transition-colors text-sm font-light italic placeholder:text-slate-300"
              />
            </div>

            <button className="bg-[#2D6A4F] text-white px-10 py-3 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1A3021] transition-all whitespace-nowrap">
              Define Category
            </button>
          </form>
        </section>

        {/* CATEGORY LISTING */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCategory.map((cat) => (
            <div
              key={cat.id}
              className="group p-8 border border-slate-100 bg-[#FBFDFA] hover:border-[#2D6A4F]/20 transition-all flex flex-col justify-between aspect-square md:aspect-video lg:aspect-square"
            >
              <div className="relative">
                {editId === cat.id ? (
                  <input
                    value={editValue}
                    autoFocus
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-transparent border-b border-[#2D6A4F] py-1 text-lg font-serif italic outline-none"
                  />
                ) : (
                  <>
                    <span className="text-[10px] text-[#2D6A4F]/40 font-mono mb-2 block italic">
                      Type: 0{categories.indexOf(cat) + 1}
                    </span>
                    <h3 className="text-xl font-serif text-slate-900 group-hover:text-[#2D6A4F] transition-colors uppercase tracking-tight">
                      {cat.name}
                    </h3>
                  </>
                )}
              </div>
              
              {/* ✅ Fixed: Product count display */}
              <p className="text-xs text-slate-400 mt-2">
                {getProductCount(cat.id)} items
              </p>

              {/* ACTIONS */}
              <div className="flex items-center gap-6 mt-6 opacity-60 group-hover:opacity-100 transition-opacity">
                {editId === cat.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(cat.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#2D6A4F]"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* ✅ 2. Add VIEW button - Added in suitable position */}
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                    >
                      Modify
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Archive
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>
      
      {selectedCategory && (
        <CategoryProductsModal
          category={selectedCategory}
          close={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default Categories;