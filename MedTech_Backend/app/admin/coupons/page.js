"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponsPage() {

    const router = useRouter();

    const [coupons, setCoupons] = useState([]);
    const [code, setCode] = useState("");
    const [discount, setDiscount] = useState("");
    const [expiry, setExpiry] = useState("");
    const [message, setMessage] = useState("");
    const [editId, setEditId] = useState(null);

    // ✅ AUTH CHECK
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");

        if (!token || role !== "admin") {
            router.replace("/");
            return;
        }

        loadCoupons();
    }, []);

    // ===== LOAD COUPONS =====
    const loadCoupons = async () => {
        try {
            const res = await fetch("/api/coupons", {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            const data = await res.json();
            setCoupons(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error("LOAD ERROR:", err);
        }
    };

    // ===== SAVE COUPON =====
    const saveCoupon = async () => {

        if (!code || !discount || !expiry) {
            setMessage("Please fill all fields");
            return;
        }

        const method = editId ? "PUT" : "POST";
        const url = editId
            ? `/api/coupons/${editId}`
            : "/api/coupons";

        try {

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token")
                },
                body: JSON.stringify({
                    code,
                    discountPercent: Number(discount),
                    expiryDate: expiry,
                }),
            });

            const data = await res.json();
            setMessage(data.message);

            if (res.ok) {
                setCode("");
                setDiscount("");
                setExpiry("");
                setEditId(null);
                loadCoupons();
            }

        } catch (err) {
            console.error("SAVE ERROR:", err);
        }
    };

    // ===== DELETE COUPON =====
    const deleteCoupon = async (id) => {

        if (!confirm("Delete this coupon?")) return;

        try {
            const res = await fetch(`/api/coupons/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            if (res.ok) {
                loadCoupons();
            }

        } catch (err) {
            console.error("DELETE ERROR:", err);
        }
    };

    // ===== STAT CARD =====
    function StatCard({ title, value }) {
        return (
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl p-6 rounded-2xl border border-[#222] shadow-xl">
                <p className="text-sm text-gray-400">{title}</p>
                <h2 className="text-3xl font-bold mt-2 text-[#6B8E23]">{value}</h2>
            </div>
        );
    }

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <h1 className="text-4xl font-bold text-[#6B8E23]">
                Coupons Management
            </h1>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Coupons" value={coupons.length} />
                <StatCard
                    title="Active"
                    value={coupons.filter(c => new Date(c.expiryDate) > new Date()).length}
                />
                <StatCard
                    title="Expired"
                    value={coupons.filter(c => new Date(c.expiryDate) < new Date()).length}
                />
            </div>

            {/* FORM */}
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl p-8 rounded-3xl border border-[#222] shadow-2xl max-w-2xl">

                <h2 className="text-2xl font-semibold mb-6 text-[#6B8E23]">
                    {editId ? "Edit Coupon" : "Create Coupon"}
                </h2>

                <div className="grid gap-4">

                    <input
                        placeholder="Coupon Code"
                        className="input"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />

                    <input
                        type="number"
                        placeholder="Discount %"
                        className="input"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    />

                    <input
                        type="date"
                        className="input"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                    />

                </div>

                <div className="flex gap-4 mt-6">

                    <button onClick={saveCoupon} className="btn-primary">
                        {editId ? "Update" : "Create"}
                    </button>

                    {editId && (
                        <button
                            onClick={() => {
                                setEditId(null);
                                setCode("");
                                setDiscount("");
                                setExpiry("");
                            }}
                            className="text-gray-400 underline"
                        >
                            Cancel
                        </button>
                    )}

                </div>

                {message && (
                    <p className="mt-4 text-green-400">{message}</p>
                )}

            </div>

            {/* LIST */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {coupons.map((c) => {

                    const isExpired = new Date(c.expiryDate) < new Date();

                    return (
                        <div key={c._id} className={`coupon-card ${isExpired && "opacity-60"}`}>

                            <div className="flex justify-between mb-4">
                                <h2 className="text-xl font-bold text-[#6B8E23]">
                                    {c.code}
                                </h2>

                                <span className={`status-badge ${isExpired ? "expired" : "active"}`}>
                                    {isExpired ? "Expired" : "Active"}
                                </span>
                            </div>

                            <p className="text-gray-400">
                                Discount:
                                <span className="text-[#6B8E23] ml-2">
                                    {c.discountPercent}%
                                </span>
                            </p>

                            <p className="text-gray-500 text-sm mb-4">
                                {new Date(c.expiryDate).toDateString()}
                            </p>

                            <div className="flex gap-2 flex-wrap">

                                <button
                                    onClick={() => navigator.clipboard.writeText(c.code)}
                                    className="btn-secondary"
                                >
                                    Copy
                                </button>

                                <button
                                    onClick={() => {
                                        setEditId(c._id);
                                        setCode(c.code);
                                        setDiscount(c.discountPercent);
                                        setExpiry(c.expiryDate?.split("T")[0]);
                                    }}
                                    className="btn-blue"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteCoupon(c._id)}
                                    className="btn-red"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}