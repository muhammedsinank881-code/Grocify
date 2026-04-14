import React from 'react';

const OnlineStore = () => {
  const products = [
    { id: 1, name: 'Organic Matcha Whisk', price: '$24', img: 'https://images.unsplash.com/photo-1515696680311-664448559039?auto=format&fit=crop&q=80&w=400' },
    { id: 2, name: 'Forest Therapy Candle', price: '$38', img: 'https://images.unsplash.com/photo-1603006905393-c90666687050?auto=format&fit=crop&q=80&w=400' },
    { id: 3, name: 'Eucalyptus Linen Spray', price: '$19', img: 'https://images.unsplash.com/photo-1595981267035-21045a666d1d?auto=format&fit=crop&q=80&w=400' },
    { id: 4, name: 'Ceramic Sage Vase', price: '$45', img: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800">
      
      <main className="flex-1 p-16 overflow-y-auto">
        
        {/* Hero Section */}
        <header className="mb-20">
          <span className="text-[#2D6A4F] font-semibold tracking-widest text-xs uppercase">Curated Collections</span>
          <h2 className="text-6xl font-serif mt-4 leading-tight max-w-2xl">
            Bring the <span className="italic text-[#1A3021]">Outdoors</span> Inside.
          </h2>
        </header>

        {/* Product Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative overflow-hidden aspect-[4/5] bg-[#F0F7F4] mb-4">
                <img 
                  src={product.img} 
                  alt={product.name}
                  className="object-cover w-full h-full grayscale hover:grayscale-0 transition duration-700" 
                />
                <button className="absolute bottom-0 left-0 w-full bg-[#2D6A4F] text-white py-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 uppercase text-xs font-bold tracking-widest">
                  Quick Add
                </button>
              </div>
              <h3 className="text-sm font-medium mb-1">{product.name}</h3>
              <p className="text-slate-500 text-sm">{product.price}</p>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
};

export default OnlineStore;