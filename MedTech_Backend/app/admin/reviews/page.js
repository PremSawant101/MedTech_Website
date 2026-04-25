"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewsAdmin() {
    const router = useRouter();

    const [reviews, setReviews] = useState([]);
    const [name, setName] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [product, setProduct] = useState("");
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");
        if (!token || role !== "admin") { router.replace("/"); return; }
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const res = await fetch("/api/reviews", {
                headers: { Authorization: localStorage.getItem("token") }
            });
            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) { console.error("Load error:", err); }
    };

    const showMsg = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !comment.trim()) { showMsg("Name and comment required ❌"); return; }
        setLoading(true);
        try {
            const method = editId ? "PUT" : "POST";
            const url = editId ? `/api/reviews/${editId}` : "/api/reviews";
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: localStorage.getItem("token") },
                body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim(), product: product.trim() })
            });
            await loadReviews();
            resetForm();
            showMsg(editId ? "Review updated ✓" : "Review added ✓");
        } catch (err) { showMsg("Error saving review ❌"); }
        setLoading(false);
    };

    const deleteReview = async (id) => {
        if (!confirm("Delete this review?")) return;
        try {
            await fetch(`/api/reviews/${id}`, {
                method: "DELETE",
                headers: { Authorization: localStorage.getItem("token") }
            });
            setReviews(prev => prev.filter(r => r._id !== id));
            showMsg("Review deleted ✓");
        } catch (err) { console.error("Delete error:", err); }
    };

    const editReview = (review) => {
        setName(review.name || ""); setRating(review.rating || 5);
        setComment(review.comment || ""); setProduct(review.product || "");
        setEditId(review._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetForm = () => {
        setName(""); setRating(5); setComment(""); setProduct(""); setEditId(null);
    };

    const StarRating = ({ value, clickable = false, onChange = null, size = "text-xl" }) => (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <span
                    key={i}
                    onClick={() => clickable && onChange && onChange(i + 1)}
                    className={`${size} transition-all duration-150 ${clickable ? "cursor-pointer hover:scale-125" : ""} ${i < value ? "text-yellow-400" : "text-gray-600"}`}
                >★</span>
            ))}
        </div>
    );

    const totalReviews = reviews.length;
    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingDist = [5, 4, 3, 2, 1].map(r => ({
        star: r,
        count: reviews.filter(rv => rv.rating === r).length,
        pct: reviews.length ? Math.round((reviews.filter(rv => rv.rating === r).length / reviews.length) * 100) : 0
    }));

    const filteredReviews = filter === "all" ? reviews
        : reviews.filter(r => r.rating === Number(filter));

    return (
        <div className="space-y-8">

            {/* ── HEADER ── */}
            <div>
                <h1 className="text-4xl font-bold text-[#6B8E23]">Reviews Management</h1>
                <p className="text-gray-500 text-sm mt-1">Manage customer reviews across all products</p>
            </div>

            {/* ── STATS ROW ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div className="bg-[#111815] border border-[#1E2A24] rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Reviews</p>
                    <h2 className="text-3xl font-bold text-white">{totalReviews}</h2>
                </div>

                <div className="bg-[#6B8E23] rounded-2xl p-5 shadow-lg shadow-[#6B8E23]/20">
                    <p className="text-xs text-black/60 uppercase tracking-widest mb-1">Avg Rating</p>
                    <h2 className="text-3xl font-bold text-black">{avgRating} <span className="text-yellow-600">★</span></h2>
                </div>

                <div className="bg-[#111815] border border-[#1E2A24] rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">5 Star</p>
                    <h2 className="text-3xl font-bold text-yellow-400">{reviews.filter(r => r.rating === 5).length}</h2>
                </div>

                <div className="bg-[#111815] border border-[#1E2A24] rounded-2xl p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">This Month</p>
                    <h2 className="text-3xl font-bold text-white">
                        {reviews.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length}
                    </h2>
                </div>

            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* ── LEFT: FORM + DISTRIBUTION ── */}
                <div className="space-y-6">

                    {/* FORM */}
                    <div className="bg-[#111815] border border-[#1E2A24] rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-[#6B8E23] mb-5">
                            {editId ? "✏️ Edit Review" : "✍️ Add Review"}
                        </h2>

                        <div className="space-y-3">
                            <input
                                placeholder="Customer Name *"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input"
                            />
                            <input
                                placeholder="Product (optional)"
                                value={product}
                                onChange={e => setProduct(e.target.value)}
                                className="input"
                            />

                            {/* Star Rating */}
                            <div className="bg-[#0F1412] rounded-xl p-3 border border-[#1E2A24]">
                                <p className="text-xs text-gray-500 mb-2">Rating</p>
                                <StarRating value={rating} clickable onChange={setRating} size="text-2xl" />
                            </div>

                            <textarea
                                placeholder="Write the review... *"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                className="input min-h-[100px]"
                            />
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? "Saving..." : editId ? "Update" : "Add Review"}
                            </button>
                            {editId && (
                                <button onClick={resetForm} className="btn-secondary">Cancel</button>
                            )}
                        </div>

                        {message && (
                            <p className={`mt-3 text-sm text-center ${message.includes("❌") ? "text-red-400" : "text-green-400"}`}>
                                {message}
                            </p>
                        )}
                    </div>

                    {/* RATING DISTRIBUTION */}
                    <div className="bg-[#111815] border border-[#1E2A24] rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-widest">Rating Breakdown</h3>
                        <div className="space-y-3">
                            {ratingDist.map(({ star, count, pct }) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-xs text-yellow-400 w-4">{star}★</span>
                                    <div className="flex-1 h-2 bg-[#1E2A24] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#6B8E23] rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ── RIGHT: REVIEWS LIST ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Filter tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {["all", "5", "4", "3", "2", "1"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f
                                    ? "bg-[#6B8E23] text-black"
                                    : "bg-[#111815] border border-[#1E2A24] text-gray-400 hover:border-[#6B8E23]"
                                    }`}
                            >
                                {f === "all" ? "All" : `${f} ★`}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-gray-500 self-center">
                            {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Reviews */}
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">

                        {filteredReviews.length === 0 && (
                            <div className="bg-[#111815] border border-[#1E2A24] rounded-2xl p-10 text-center text-gray-500">
                                No reviews found.
                            </div>
                        )}

                        {filteredReviews.map((review) => (
                            <div
                                key={review._id}
                                className="bg-[#111815] border border-[#1E2A24] rounded-2xl p-5 hover:border-[#6B8E23]/40 transition-all duration-200"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-[#6B8E23]/20 border border-[#6B8E23]/30 flex items-center justify-center text-[#6B8E23] font-bold text-sm flex-shrink-0">
                                            {(review.name || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-sm">{review.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {review.product || "General Review"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <StarRating value={review.rating || 5} size="text-sm" />
                                        <p className="text-xs text-gray-600 mt-1">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-300 mt-3 leading-relaxed line-clamp-3">
                                    "{review.comment}"
                                </p>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-[#1E2A24]">
                                    <button
                                        onClick={() => editReview(review)}
                                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteReview(review._id)}
                                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}