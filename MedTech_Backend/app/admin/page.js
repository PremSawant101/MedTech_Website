"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

export default function AdminDashboard() {

    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [animatedRevenue, setAnimatedRevenue] = useState(0);

    // ✅ AUTH CHECK
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");

        if (!token || role !== "admin") {
            router.replace("/");
            return;
        }

        loadData();
    }, []);

    const loadData = async () => {
        try {
            const p = await fetch("/api/products", {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            const o = await fetch("/api/orders", {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            setProducts(await p.json());

            const orderData = await o.json();
            setOrders(orderData);

            animateRevenue(orderData);

        } catch (err) {
            console.error("Dashboard load error:", err);
        }
    };

    // 🔥 Animated revenue
    const animateRevenue = (orderData) => {

        const total = orderData
            .filter(o => o.status === "delivered")
            .reduce((sum, o) => sum + o.totalAmount, 0);

        let start = 0;
        const step = total / 60;

        const interval = setInterval(() => {
            start += step;

            if (start >= total) {
                start = total;
                clearInterval(interval);
            }

            setAnimatedRevenue(Math.floor(start));

        }, 16);
    };

    // ===== STATS =====
    const totalRevenue = animatedRevenue;
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;

    // ===== CHART DATA =====
    const revenueByDate = {};

    orders.forEach(order => {
        if (order.status === "delivered") {
            const date = new Date(order.createdAt).toLocaleDateString();
            revenueByDate[date] =
                (revenueByDate[date] || 0) + order.totalAmount;
        }
    });

    const chartData = Object.keys(revenueByDate).map(date => ({
        date,
        revenue: revenueByDate[date],
    }));

    const statusData = [
        { name: "Pending", value: pendingOrders },
        { name: "Delivered", value: deliveredOrders },
    ];

    const COLORS = ["#FACC15", "#22C55E"];

    return (
        <div className="space-y-12">

            {/* HEADER */}
            <div>
                <h1 className="text-4xl font-bold text-[#6B8E23]">
                    Admin Dashboard
                </h1>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Revenue" value={`₹ ${totalRevenue}`} highlight />
                <StatCard title="Orders" value={totalOrders} />
                <StatCard title="Products" value={totalProducts} />
                <StatCard title="Pending Orders" value={pendingOrders} />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <GlassCard title="Revenue Growth">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6B8E23"
                                fill="#6B8E23"
                                fillOpacity={0.2}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6B8E23"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>

                <GlassCard title="Order Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>

            </div>

            {/* ACTIVITY */}
            <GlassCard title="Recent Activity">

                <div className="space-y-3">
                    {orders.slice(0, 5).map((o) => (
                        <div key={o._id} className="text-sm border-b border-[#222] pb-2">
                            <span className="text-[#6B8E23] font-semibold">
                                {o.userEmail}
                            </span>{" "}
                            placed order of ₹{o.totalAmount}

                            <div className="text-xs text-gray-500">
                                {new Date(o.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

            </GlassCard>

        </div>
    );
}

// ===== COMPONENTS (UNCHANGED) =====
function StatCard({ title, value, highlight }) {
    return (
        <div className={`p-6 rounded-2xl border border-[#222] shadow-xl hover:scale-[1.05] transition
        ${highlight ? "bg-[#6B8E23] text-black" : "bg-[#1A1A1A]"}`}>
            <p className={`${highlight ? "text-black/70" : "text-gray-400"} text-sm`}>
                {title}
            </p>
            <h2 className="text-3xl font-bold mt-3">
                {value}
            </h2>
        </div>
    );
}

function GlassCard({ title, children }) {
    return (
        <div className="bg-[#1A1A1A]/80 backdrop-blur-xl p-6 rounded-2xl border border-[#222] shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-[#6B8E23]">
                {title}
            </h2>
            {children}
        </div>
    );
}