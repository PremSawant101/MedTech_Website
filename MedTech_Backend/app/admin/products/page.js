"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {

    const { data: session, status } = useSession();
    const router = useRouter();

    // ✅ JWT token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState("");
    const [discount, setDiscount] = useState("");
    const [howToUse, setHowToUse] = useState("");
    const [ingredients, setIngredients] = useState([
        { name: "", description: "", image: "" }
    ]);

    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const loadProducts = async () => {
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Load products error:", err);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const resetForm = () => {
        setEditId(null);
        setName(""); setPrice(""); setImage("");
        setCategory(""); setDescription("");
        setStock(""); setDiscount("");
        setHowToUse("");
        setIngredients([{ name: "", description: "", image: "" }]);
    };

    const showMessage = (msg, type = "success") => {
        setMessage(msg); setMessageType(type);
        setTimeout(() => setMessage(""), 3000);
    };

    const addIngredient = () => setIngredients([...ingredients, { name: "", description: "", image: "" }]);
    const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
    const updateIngredient = (index, field, value) => {
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    };

    // ✅ ADD — token in header
    const addProduct = async () => {
        if (!name || !price || !category) { showMessage("Name, price and category are required.", "error"); return; }
        try {
            await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token          // ✅ JWT
                },
                body: JSON.stringify({
                    name, category, description,
                    price: Number(price),
                    stock: Number(stock) || 0,
                    discount: Number(discount) || 0,
                    prescriptionRequired: false,
                    image, howToUse,
                    ingredients: ingredients.filter(i => i.name.trim()),
                }),
            });
            showMessage("Product added successfully ✓");
            resetForm(); loadProducts();
        } catch (err) {
            showMessage("Failed to add product.", "error");
        }
    };

    // ✅ UPDATE — token in header
    const updateProduct = async () => {
        if (!name || !price) { showMessage("Name and price are required.", "error"); return; }
        try {
            const res = await fetch(`/api/products/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token          // ✅ JWT
                },
                body: JSON.stringify({
                    name, description,
                    price: Number(price), image, category,
                    stock: Number(stock) || 0,
                    discount: Number(discount) || 0,
                    howToUse,
                    ingredients: ingredients.filter(i => i.name.trim()),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                showMessage(data.message || "Failed to update.", "error");
                return;
            }

            showMessage("Product updated successfully ✓");
            resetForm(); loadProducts();
        } catch (err) {
            showMessage("Failed to update product.", "error");
        }
    };

    // ✅ DELETE — token in header
    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await fetch(`/api/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": token          // ✅ JWT
                }
            });
            loadProducts();
        } catch (err) {
            showMessage("Failed to delete product.", "error");
        }
    };

    const startEdit = (p) => {
        setEditId(p._id); setName(p.name); setPrice(p.price);
        setImage(p.image); setCategory(p.category);
        setDescription(p.description); setStock(p.stock);
        setDiscount(p.discount || 0);
        setHowToUse(p.howToUse || "");
        setIngredients(p.ingredients?.length ? p.ingredients : [{ name: "", description: "", image: "" }]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .filter(p => filterCategory === "all" ? true : p.category === filterCategory);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 animate-pulse">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold text-[#6B8E23]">Product Management</h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* ===== FORM ===== */}
                <div className="card lg:col-span-1 overflow-y-auto" style={{ maxHeight: "90vh" }}>
                    <h2 className="section-title">{editId ? "Edit Product" : "Add Product"}</h2>

                    <Input value={name} set={setName} placeholder="Product Name *" />
                    <Input value={price} set={setPrice} placeholder="Price *" type="number" />
                    <Input value={stock} set={setStock} placeholder="Stock" type="number" />
                    <Input value={discount} set={setDiscount} placeholder="Discount (%)" type="number" />
                    <Input value={image} set={setImage} placeholder="Main Image URL" />

                    <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                        <option value="">Select Category *</option>
                        <option>Hair Oil</option>
                        <option>Hair Tablet</option>
                        <option>Hair Lepa</option>
                        <option>New Pack</option>
                        <option>Kit</option>
                    </select>

                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Product Description"
                        className="input h-20"
                    />

                    <div className="mt-5">
                        <p className="text-sm font-semibold text-[#6B8E23] mb-2">📋 How To Use</p>
                        <textarea
                            value={howToUse}
                            onChange={e => setHowToUse(e.target.value)}
                            placeholder="Describe how to use this product step by step..."
                            className="input h-28"
                        />
                    </div>

                    <div className="mt-5">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-semibold text-[#6B8E23]">🌿 Ingredients ({ingredients.length})</p>
                            <button onClick={addIngredient} className="text-xs px-3 py-1.5 rounded-lg bg-[#6B8E23] text-black font-semibold hover:opacity-80 transition">
                                + Add Ingredient
                            </button>
                        </div>

                        <div className="space-y-4">
                            {ingredients.map((ing, index) => (
                                <div key={index} className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-[#6B8E23] font-semibold">Ingredient {index + 1}</span>
                                        {ingredients.length > 1 && (
                                            <button onClick={() => removeIngredient(index)} className="text-xs text-red-500 hover:text-red-400 transition">
                                                ✕ Remove
                                            </button>
                                        )}
                                    </div>
                                    <input type="text" value={ing.name} onChange={e => updateIngredient(index, "name", e.target.value)} placeholder="Name (e.g. Bhringraj)" className="input !mb-0" />
                                    <textarea value={ing.description} onChange={e => updateIngredient(index, "description", e.target.value)} placeholder="Description about this ingredient..." className="input h-16 !mb-0" />
                                    <input type="text" value={ing.image} onChange={e => updateIngredient(index, "image", e.target.value)} placeholder="Ingredient Image URL" className="input !mb-0" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={editId ? updateProduct : addProduct} className="btn-primary">
                            {editId ? "Update Product" : "Add Product"}
                        </button>
                        {editId && <button onClick={resetForm} className="btn-secondary">Cancel</button>}
                    </div>

                    {message && (
                        <p className={`mt-3 text-sm ${messageType === "error" ? "text-red-500" : "text-green-500"}`}>
                            {message}
                        </p>
                    )}
                </div>

                {/* ===== PRODUCTS LIST ===== */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="card flex flex-wrap gap-4 mb-6 items-center w-full">
                        <input placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} className="input !mb-0 flex-1 min-w-[160px]" />
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input !mb-0 flex-1 min-w-[160px]">
                            <option value="all">All Categories</option>
                            <option>Hair Oil</option>
                            <option>Hair Tablet</option>
                            <option>Hair Lepa</option>
                            <option>New Pack</option>
                            <option>Kit</option>
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
                        {filteredProducts.length === 0 && <p className="text-gray-400 col-span-2">No products found.</p>}

                        {filteredProducts.map((p) => (
                            <div key={p._id} className="product-card">
                                <div className="relative">
                                    <img src={`${p.image}`} alt={p.name} className="w-full h-44 object-cover rounded-xl" />
                                    {p.discount > 0 && <span className="discount-badge">-{p.discount}%</span>}
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-semibold text-lg">{p.name}</h3>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.ingredients?.length ? "bg-green-900 text-green-300" : "bg-[#222] text-gray-500"}`}>
                                            🌿 {p.ingredients?.length || 0} ingredients
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.howToUse ? "bg-blue-900 text-blue-300" : "bg-[#222] text-gray-500"}`}>
                                            📋 {p.howToUse ? "How to use ✓" : "No how to use"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-3 items-center">
                                        <Price p={p} />
                                        <StockBadge stock={p.stock} />
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button onClick={() => startEdit(p)} className="btn-edit">Edit</button>
                                        <button onClick={() => handleDelete(p._id)} className="btn-delete">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Input({ value, set, placeholder, type = "text" }) {
    return <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} className="input" />;
}

function Price({ p }) {
    if (p.discount > 0) {
        return (
            <div>
                <p className="text-gray-400 line-through text-sm">₹{p.price}</p>
                <p className="text-[#6B8E23] font-bold">₹{Math.round(p.price - (p.price * p.discount) / 100)}</p>
            </div>
        );
    }
    return <p className="text-[#6B8E23] font-bold">₹{p.price}</p>;
}

function StockBadge({ stock }) {
    let style = "bg-green-600", text = "In Stock";
    if (stock === 0) { style = "bg-red-600"; text = "Out of Stock"; }
    else if (stock < 5) { style = "bg-yellow-500"; text = "Low Stock"; }
    return <span className={`badge ${style}`}>{text}</span>;
}