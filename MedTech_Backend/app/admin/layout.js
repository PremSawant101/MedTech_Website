"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({ children }) {

    const FRONTEND_URL = "http://127.0.0.1:5500/MedTech_Frontend/index.html";

    const router = useRouter();
    const pathname = usePathname();

    const [authorized, setAuthorized] = useState(null);
    const [name, setName] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get("token");
            const urlRole = urlParams.get("role");
            const urlName = urlParams.get("name");
            const urlEmail = urlParams.get("email");

            if (urlToken && urlRole) {
                localStorage.setItem("token", urlToken);
                localStorage.setItem("userRole", urlRole);
                localStorage.setItem("userName", urlName || "Admin");
                localStorage.setItem("userEmail", urlEmail || "");
                window.history.replaceState({}, document.title, "/admin");
            }

            const role = localStorage.getItem("userRole");
            const token = localStorage.getItem("token");
            const userName = localStorage.getItem("userName");

            if (!token || !role) { setAuthorized(false); router.replace("/"); return; }
            if (role !== "admin") { setAuthorized(false); router.replace("/"); return; }

            try {
                const parts = token.split(".");
                if (parts.length !== 3) throw new Error("Invalid token");
                const payload = JSON.parse(atob(parts[1]));
                if (!payload.exp || payload.exp * 1000 < Date.now()) {
                    localStorage.clear(); router.replace("/"); return;
                }
                if (payload.role !== "admin") {
                    localStorage.clear(); router.replace("/"); return;
                }
            } catch (e) {
                localStorage.clear(); router.replace("/"); return;
            }

            setName(userName || "Admin");
            setAuthorized(true);
        };

        setTimeout(checkAuth, 300);
    }, []);

    // ⏳ LOADING
    if (authorized === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#060A09]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-16 h-16">
                        <div className="w-16 h-16 border-4 border-[#6B8E23]/20 rounded-full absolute"></div>
                        <div className="w-16 h-16 border-4 border-t-[#6B8E23] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-[#6B8E23] font-semibold">Checking access...</p>
                        <p className="text-gray-600 text-xs mt-1">Verifying your credentials</p>
                    </div>
                </div>
            </div>
        );
    }

    if (authorized === false) return null;

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: "▦" },
        { name: "Products", href: "/admin/products", icon: "📦" },
        { name: "Orders", href: "/admin/orders", icon: "🛒" },
        { name: "Coupons", href: "/admin/coupons", icon: "🎫" },
        { name: "Users", href: "/admin/users", icon: "👥" },
        { name: "Blogs", href: "/admin/blog", icon: "📝" },
        { name: "Reviews", href: "/admin/reviews", icon: "⭐" },
    ];

    const currentPage = navItems.find(i => i.href === pathname)?.name || "Dashboard";

    return (
        <div className="h-screen flex bg-[#060A09] text-white overflow-hidden">

            {/* ══════════════ SIDEBAR ══════════════ */}
            <aside className={`
                ${sidebarOpen ? "w-72" : "w-20"}
                flex flex-col bg-[#0B0F0E] border-r border-[#1A2620]
                transition-all duration-300 ease-in-out relative z-20 flex-shrink-0
            `}>

                {/* LOGO ROW */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-[#1A2620]">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#6B8E23] flex items-center justify-center text-black font-black text-sm shadow-lg shadow-[#6B8E23]/30">
                                M
                            </div>
                            <span className="text-lg font-extrabold tracking-wide">
                                MED<span className="text-[#6B8E23]">TECH</span>
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-8 h-8 rounded-lg bg-[#1A2620] hover:bg-[#243320] flex items-center justify-center text-gray-500 hover:text-white transition text-xs ml-auto"
                    >
                        {sidebarOpen ? "◀" : "▶"}
                    </button>
                </div>

                {/* USER CARD */}
                <div className={`mx-3 mt-3 p-3 rounded-xl bg-gradient-to-br from-[#6B8E23]/12 to-transparent border border-[#6B8E23]/15 ${!sidebarOpen && "flex justify-center"}`}>
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#6B8E23] text-black flex items-center justify-center font-black text-sm shadow-lg shadow-[#6B8E23]/25 flex-shrink-0">
                                {name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0"></span>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#6B8E23] text-black flex items-center justify-center font-black text-sm">
                            {name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                    )}
                </div>

                {/* NAV LABEL */}
                {sidebarOpen && (
                    <p className="text-xs text-gray-600 uppercase tracking-widest px-5 mt-5 mb-2">
                        Navigation
                    </p>
                )}

                {/* NAV LINKS */}
                <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-3">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={!sidebarOpen ? item.name : ""}
                                className={`
                                    flex items-center gap-3 px-3 py-3 rounded-xl
                                    transition-all duration-200 group relative
                                    ${active
                                        ? "bg-[#6B8E23] text-black font-semibold shadow-lg shadow-[#6B8E23]/20"
                                        : "text-gray-400 hover:bg-[#1A2620] hover:text-gray-100"
                                    }
                                    ${!sidebarOpen && "justify-center"}
                                `}
                            >
                                <span className={`text-base flex-shrink-0 ${!active && "opacity-60 group-hover:opacity-100"}`}>
                                    {item.icon}
                                </span>
                                {sidebarOpen && <span className="text-sm flex-1">{item.name}</span>}
                                {active && sidebarOpen && <span className="w-1.5 h-1.5 bg-black/40 rounded-full"></span>}
                                {active && !sidebarOpen && (
                                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#6B8E23] rounded-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* BOTTOM BUTTONS */}
                <div className="p-3 border-t border-[#1A2620] space-y-2">
                    <button
                        onClick={() => window.open(FRONTEND_URL, "_blank")}
                        className={`w-full bg-[#6B8E23] text-black py-2.5 rounded-xl font-semibold hover:bg-[#7ca028] active:scale-95 transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#6B8E23]/15`}
                    >
                        <span>🌐</span>
                        {sidebarOpen && <span>Go to Website</span>}
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("userRole");
                            localStorage.removeItem("userName");
                            localStorage.removeItem("userEmail");
                            window.location.href = FRONTEND_URL;
                        }}
                        className="w-full border border-[#1A2620] py-2.5 rounded-xl text-gray-500 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 active:scale-95 transition text-sm flex items-center justify-center gap-2"
                    >
                        <span>🚪</span>
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ══════════════ MAIN ══════════════ */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER */}
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-[#1A2620] bg-[#0B0F0E]/60 backdrop-blur-xl">

                    {/* Left: breadcrumb + title */}
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                            <span>Admin</span>
                            <span>/</span>
                            <span className="text-[#6B8E23]">{currentPage}</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">{currentPage}</h1>
                    </div>

                    {/* Right: status + user */}
                    <div className="flex items-center gap-3">

                        {/* Live badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs text-green-400 font-medium">Live</span>
                        </div>

                        <div className="w-px h-6 bg-[#1A2620]"></div>

                        {/* User pill */}
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#111815] border border-[#1A2620]">
                            <div className="w-7 h-7 rounded-lg bg-[#6B8E23] text-black flex items-center justify-center font-bold text-xs">
                                {name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <span className="text-sm text-gray-300">
                                <span className="text-gray-500">Hi, </span>
                                <span className="text-white font-medium">{name}</span>
                            </span>
                        </div>

                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}