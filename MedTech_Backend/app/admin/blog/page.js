"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BlogAdmin() {

    const router = useRouter();

    const [blogs, setBlogs] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    const API = "/api/blogs";

    // ✅ AUTH CHECK
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");

        if (!token || role !== "admin") {
            router.replace("/");
            return;
        }

        loadBlogs();
    }, []);

    // ===== LOAD BLOGS =====
    const loadBlogs = async () => {
        try {
            const res = await fetch(API, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            const data = await res.json();

            const cleanData = Array.isArray(data)
                ? data.filter(b => b !== null)
                : [];

            setBlogs(cleanData);

        } catch (err) {
            console.error("Load error:", err);
        }
    };

    // ===== SUBMIT =====
    const handleSubmit = async () => {

        if (!title.trim() || !content.trim() || !image.trim()) {
            alert("All fields required ❌");
            return;
        }

        setLoading(true);

        try {

            const method = editId ? "PUT" : "POST";
            const url = editId ? `${API}/${editId}` : API;

            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token")
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    image: image.trim()
                })
            });

            await loadBlogs();

            // reset
            setTitle("");
            setContent("");
            setImage("");
            setEditId(null);

        } catch (err) {
            console.error("Submit error:", err);
        }

        setLoading(false);
    };

    // ===== DELETE =====
    const deleteBlog = async (id) => {

        if (!confirm("Delete this blog?")) return;

        try {
            await fetch(`${API}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            setBlogs(prev => prev.filter(b => b._id !== id));

        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // ===== EDIT =====
    const editBlog = (blog) => {

        setTitle(blog?.title || "");
        setContent(blog?.content || "");
        setImage(blog?.image || "");
        setEditId(blog?._id);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ===== STATS =====
    const totalBlogs = blogs.length;

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div className="flex justify-between items-center flex-wrap gap-4">

                <h1 className="text-4xl font-bold text-[#6B8E23]">
                    Blog Management
                </h1>

                <div className="bg-[#1A1A1A] border border-[#222] px-6 py-3 rounded-xl shadow-lg">
                    <p className="text-sm text-gray-400">Total Blogs</p>
                    <h2 className="text-2xl font-bold text-[#6B8E23]">
                        {totalBlogs}
                    </h2>
                </div>

            </div>

            {/* FORM */}
            <div className="card max-w-2xl">

                <h2 className="text-2xl font-semibold mb-6 text-[#6B8E23]">
                    {editId ? "Edit Blog" : "Create Blog"}
                </h2>

                <div className="grid gap-4">

                    <input
                        placeholder="Blog Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input"
                    />

                    <input
                        placeholder="Image URL"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="input"
                    />

                    <textarea
                        placeholder="Write blog content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="input min-h-[120px]"
                    />

                </div>

                <div className="flex gap-4 mt-6">

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading
                            ? "Saving..."
                            : editId
                                ? "Update Blog"
                                : "Publish Blog"}
                    </button>

                    {editId && (
                        <button
                            onClick={() => {
                                setEditId(null);
                                setTitle("");
                                setContent("");
                                setImage("");
                            }}
                            className="text-gray-400 underline"
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </div>

            {/* BLOG LIST */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {blogs.map((blog) => {

                    if (!blog) return null;

                    return (
                        <div
                            key={blog._id}
                            className="bg-[#1A1A1A]/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-[#222] hover:scale-[1.02] transition"
                        >

                            {/* IMAGE */}
                            {blog.image ? (
                                <img
                                    src={`${blog.image}`}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => e.target.src = "/images/fallback.png"}
                                />
                            ) : (
                                <div className="w-full h-48 bg-[#222] flex items-center justify-center text-gray-500">
                                    No Image
                                </div>
                            )}

                            {/* CONTENT */}
                            <div className="p-5">

                                <h3 className="text-lg font-bold text-[#6B8E23] line-clamp-2">
                                    {blog.title}
                                </h3>

                                <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                                    {blog.content}
                                </p>

                                {/* ACTIONS */}
                                <div className="flex gap-3 mt-5">

                                    <button
                                        onClick={() => editBlog(blog)}
                                        className="btn-blue"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteBlog(blog._id)}
                                        className="btn-red"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}