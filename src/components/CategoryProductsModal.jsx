import { useStore } from "../context/StoreContext";

const CategoryProductsModal = ({ close, category }) => {
  const { products } = useStore();

  const filtered = products.filter((p) => p.categoryId === category.id);

  return (
    <div className="fixed inset-0 bg-[#1A3021]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-[#FBFDFA]">
          <div>
            <span className="text-[#2D6A4F] font-semibold tracking-[0.2em] text-[9px] uppercase">
              Collection Archive
            </span>
            <h2 className="text-3xl font-serif italic text-[#1A3021] mt-1">
              {category.name}
            </h2>
          </div>
          <button 
            onClick={close}
            className="text-slate-400 hover:text-red-500 transition-colors p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* MODAL BODY / PRODUCT LIST */}
        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm italic text-slate-300">No entries found in this collection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="group border-b border-slate-50 py-4 flex justify-between items-center hover:bg-[#FBFDFA] px-2 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-[#2D6A4F]/40 uppercase mb-1">
                      SKU-{p.id.toString().slice(-4)}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-tight text-slate-700 group-hover:text-[#2D6A4F] transition-colors">
                      {p.name}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block mb-1 uppercase tracking-widest">Market Value</span>
                    <span className="font-serif italic text-lg text-[#1A3021]">
                      ₹{p.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-[#FBFDFA] flex justify-between items-center">
          <span className="text-[9px] font-mono text-slate-400 uppercase italic">
            Total Items: {filtered.length}
          </span>
          <button
            onClick={close}
            className="px-8 py-2 border border-[#2D6A4F] text-[#2D6A4F] text-[10px] font-bold uppercase tracking-widest hover:bg-[#2D6A4F] hover:text-white transition-all"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryProductsModal;