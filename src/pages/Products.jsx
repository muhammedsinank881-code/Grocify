import { useState } from "react";
import { useStore } from "../context/StoreContext";
import AddProductModal from "../components/AddProductModal";


const Products = () => {
  const { products, deleteProduct, categories } = useStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);


  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Priority sorting
      if (a.stock === 0 && b.stock !== 0) return -1;
      if (b.stock === 0 && a.stock !== 0) return 1;

      if (a.stock < 5 && b.stock >= 5) return -1;
      if (b.stock < 5 && a.stock >= 5) return 1;

      return 0;
    });


  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <main className="p-12 lg:p-16 max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[10px] uppercase">
              Inventory Management
            </span>
            <h1 className="text-5xl font-serif mt-2 italic text-[#1A3021]">The Collection</h1>

          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-100 py-3 border-b border-slate-200 focus:border-[#2D6A4F] outline-none text-sm"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#2D6A4F] text-white px-10 py-4 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#1A3021] transition-all"
          >
            Add New Product
          </button>
        </header>

        {/* PRODUCT LISTING */}
        <div className="border-t border-slate-100">
          <div className="grid grid-cols-1 gap-0">
            {products.length === 0 ? (
              <div className="py-20 text-center border-b border-slate-100">
                <p className="font-serif italic text-slate-400">Your collection is currently empty.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col md:flex-row items-center py-10 border-b border-slate-100 hover:bg-[#FBFDFA] transition-colors px-4"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="w-20 h-24 bg-[#F0F7F4] mb-4 md:mb-0 md:mr-10 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                    🌿
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg font-serif text-slate-900">{product.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                      {categories.find(c => c.id === product.categoryId)?.name || "Uncategorized"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-[#2D6A4F] font-bold mt-1">
                      Current Stock: <span className={product.stock < 5 ? "text-red-400" : ""}>{product.stock} units</span>
                    </p>

                    {/* ✅ 1. Low Stock Badge */}
                    {product.stock < 5 && product.stock > 0 && (
                      <span className="text-red-400 text-[10px] uppercase font-bold ml-2">
                        Low Stock ⚠
                      </span>
                    )}

                    {/* ✅ 2. Out of Stock Badge */}
                    {product.stock === 0 && (
                      <span className="text-red-500 text-xs uppercase font-bold ml-2">
                        Out of stock
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="my-4 md:my-0 md:px-12">
                    <p className="text-lg font-serif italic text-slate-600">₹{product.price}</p>
                    <p className="text-[10px] text-slate-400">
                      Cost: ₹{product.costPrice}
                    </p>
                    <p className="text-[10px] text-green-600">
                      Profit: ₹{product.price - product.costPrice}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-8 items-center">
                    {/* ✅ 3. Navigation to Purchase - Replaced text with button */}
                    <button
                      onClick={() => {
                        setEditProduct(product);
                        setShowModal(true);
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOOTER STAT */}
        <footer className="mt-12 text-right">
          <p className="text-[10px] text-slate-300 uppercase tracking-widest">
            Total Unique SKUs: {products.length}
          </p>
        </footer>

      </main>

      {/* MODAL */}
      {showModal && (
        <AddProductModal
          close={() => {
            setShowModal(false);
            setEditProduct(null);
          }}
          editProduct={editProduct}
        />
      )}
    </div>
  );
};

export default Products;