"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrdersPage() {

    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const totalOrders = orders.length;
    const totalRevenue = orders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");

        if (!token || role !== "admin") {
            router.replace("/");
            return;
        }

        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/orders", {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Orders fetch error:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await fetch(`/api/orders/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token")
                },
                body: JSON.stringify({ status: newStatus }),
            });
            loadOrders();
        } catch (err) {
            console.error("Update status error:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 animate-pulse">Loading Orders...</p>
            </div>
        );
    }

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(order => order.status === filter);

    // ===== COMPONENTS =====

    function StatCard({ title, value, highlight }) {
        return (
            <div className={`p-6 rounded-2xl border border-[#222] shadow-xl 
                ${highlight ? "bg-[#6B8E23] text-black" : "bg-[#1A1A1A]"}`}>
                <p className="text-sm text-gray-400">{title}</p>
                <h2 className="text-2xl font-bold mt-2">{value}</h2>
            </div>
        );
    }

    function StatusBadge({ status }) {
        const map = {
            pending: "bg-yellow-500",
            approved: "bg-blue-500",
            shipped: "bg-purple-500",
            delivered: "bg-green-600",
            cancelled: "bg-red-600",
        };
        return (
            <span className={`badge ${map[status] || "bg-gray-500"}`}>
                {status}
            </span>
        );
    }

    function ActionBtn({ children, color, onClick }) {
        const map = {
            green: "bg-[#6B8E23]",
            red: "bg-red-600",
            blue: "bg-blue-600",
            purple: "bg-purple-600",
        };
        return (
            <button
                onClick={onClick}
                className={`px-4 py-2 rounded-lg text-sm text-white ${map[color]} hover:opacity-80 transition`}
            >
                {children}
            </button>
        );
    }

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div>
                <h1 className="text-4xl font-bold text-[#6B8E23]">
                    Orders Management
                </h1>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Orders" value={totalOrders} />
                <StatCard title="Revenue" value={`₹ ${totalRevenue}`} highlight />
                <StatCard title="Pending" value={pendingOrders} />
                <StatCard title="Cancelled" value={cancelledOrders} />
            </div>

            {/* FILTER */}
            <div className="card flex flex-wrap gap-3">
                {["all", "pending", "approved", "shipped", "delivered", "cancelled"].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`filter-btn ${filter === s ? "active-filter" : ""}`}
                    >
                        {s.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* ORDERS LIST */}
            <div className="space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
                {filteredOrders.length === 0 && (
                    <p className="text-gray-400">No orders found.</p>
                )}

                {filteredOrders.map((order) => (
                    <div
                        key={order._id}
                        className="order-card cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                                <p className="text-lg font-semibold mt-1">
                                    {order.userEmail}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-[#6B8E23]">
                                    ₹{order.totalAmount}
                                </p>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-3 mt-4 flex-wrap">
                            {order.status === "pending" && (
                                <>
                                    <ActionBtn color="green" onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(order._id, "approved");
                                    }}>Approve</ActionBtn>
                                    <ActionBtn color="red" onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(order._id, "cancelled");
                                    }}>Cancel</ActionBtn>
                                </>
                            )}
                            {order.status === "approved" && (
                                <>
                                    <ActionBtn color="blue" onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(order._id, "shipped");
                                    }}>Ship</ActionBtn>
                                    <ActionBtn color="red" onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(order._id, "cancelled");
                                    }}>Cancel</ActionBtn>
                                </>
                            )}
                            {order.status === "shipped" && (
                                <ActionBtn color="purple" onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(order._id, "delivered");
                                }}>Deliver</ActionBtn>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ FIXED MODAL — parent is relative, close button positioned correctly */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="modal relative max-w-2xl w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CLOSE */}
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-5 text-xl font-bold hover:text-red-500 transition"
                        >
                            ✕
                        </button>

                        {/* HEADER */}
                        <h2 className="modal-title mb-6">Order Details</h2>

                        {/* ORDER INFO */}
                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                            <Info label="User" value={selectedOrder.userEmail} />
                            <Info label="Status" value={selectedOrder.status} highlight />
                            <Info label="Total Amount" value={`₹ ${selectedOrder.totalAmount}`} />
                            <Info label="Date" value={new Date(selectedOrder.createdAt).toLocaleString()} />
                        </div>

                        {/* PRODUCTS */}
                        <h3 className="text-lg font-semibold mb-3 text-[#6B8E23]">Products</h3>

                        <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar">
                            {selectedOrder.products?.map((p, i) => (
                                <div key={i} className="product-row">
                                    {p.image && (
                                        <img src={p.image} className="w-14 h-14 rounded-lg object-cover" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{p.name || "Product Deleted"}</p>
                                        <p className="text-xs text-gray-400">
                                            ₹{p.price || 0} × {p.quantity || 0}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-[#6B8E23]">
                                        ₹{(p.price || 0) * (p.quantity || 0)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* TOTAL */}
                        <div className="border-t border-[#333] mt-6 pt-4 flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span className="text-[#6B8E23]">₹{selectedOrder.totalAmount}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Info({ label, value, highlight }) {
    return (
        <div className="bg-[#111] p-3 rounded-lg border border-[#222]">
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`mt-1 font-medium ${highlight ? "text-[#6B8E23]" : ""}`}>
                {value}
            </p>
        </div>
    );
}