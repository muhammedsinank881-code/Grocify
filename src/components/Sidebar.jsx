import React from 'react'
import { ShoppingBag, User, Search, Leaf, Menu } from 'lucide-react';
import { NavLink } from "react-router-dom";


const Sidebar = () => {
    const navItems = [
        { name: "Dashboard", path: "/" },
        { name: "Billing", path: "/billing" },
        { name: "Products", path: "/products" },
        { name: "Categories", path: "/categories" },
        { name: "Purchase", path: "/purchase" },
        { name: "Returns", path: "/returns" },
        { name: "Customers", path: "/customers" },
        { name: "Offers", path: "/offers" },
        { name: "Reports", path: "/reports" },
        { name: "Expenses", path: "/expenses" },

    ];
    return (
        <div>
            <aside className="w-72 bg-[#1A3021] text-white flex flex-col justify-between p-10 fixed h-full">
                <div>
                    <div className="flex items-center gap-2 mb-12">
                        <Leaf className="text-[#40916C]" size={28} />
                        <h1 className="text-2xl font-bold tracking-tight">GROCIFY</h1>
                    </div>

                    <nav className="space-y-6 text-sm font-medium uppercase tracking-widest text-slate-300">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `block transition ${isActive
                                        ? "text-white"
                                        : "hover:text-[#40916C]"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-6">
                        <Search size={20} className="cursor-pointer hover:text-[#40916C]" />
                        <User size={20} className="cursor-pointer hover:text-[#40916C]" />
                        <div className="relative cursor-pointer hover:text-[#40916C]">
                            <ShoppingBag size={20} />
                            <span className="absolute -top-2 -right-2 bg-[#40916C] text-[10px] rounded-full h-4 w-4 flex items-center justify-center">2</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">© 2026 Verdant Studio</p>
                </div>
            </aside>
        </div>
    )
}

export default Sidebar
