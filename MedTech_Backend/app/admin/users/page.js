"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UsersPage() {

    const router = useRouter();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 6;

    // ✅ LOAD USERS (JWT)
    const loadUsers = async () => {
        try {
            const res = await fetch("/api/users", {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
            setUsers([]);
        }
    };

    // ✅ AUTH CHECK
    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");

        if (!token || role !== "admin") {
            router.replace("/");
            return;
        }

        loadUsers();
    }, []);

    // FILTER
    const filteredUsers = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    // PAGINATION
    const indexOfLast = currentPage * usersPerPage;
    const indexOfFirst = indexOfLast - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // SEARCH RESET
    const handleSearch = (val) => {
        setSearch(val);
        setCurrentPage(1);
    };

    const totalUsers = users.length;

    return (
        <div className="space-y-10">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
                <h1 className="text-4xl font-bold text-[#6B8E23]">
                    Users Management
                </h1>
                <div className="bg-[#1A1A1A] border border-[#222] px-6 py-3 rounded-xl shadow-lg">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <h2 className="text-2xl font-bold text-[#6B8E23]">{totalUsers}</h2>
                </div>
            </div>

            {/* SEARCH */}
            <div className="card flex items-center gap-3">
                <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-[#1A1A1A] border border-[#222] focus:outline-none focus:border-[#6B8E23] transition"
                />
            </div>

            {/* TABLE */}
            <div className="card overflow-hidden">

                <div className="hidden md:grid grid-cols-4 px-6 py-4 bg-[#6B8E23] text-black text-sm font-semibold">
                    <span>#</span>
                    <span>Name</span>
                    <span>Email</span>
                    <span className="text-center">Joined</span>
                </div>

                <div className="divide-y divide-[#222]">
                    {currentUsers.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No users found.
                        </div>
                    ) : (
                        currentUsers.map((user, index) => (
                            <div
                                key={user._id}
                                className="flex flex-col md:grid md:grid-cols-4 px-6 py-4 gap-1 md:gap-0 md:items-center hover:bg-[#1A1A1A]/60 transition"
                            >
                                <span className="text-gray-400 text-sm">
                                    #{indexOfFirst + index + 1}
                                </span>

                                <span className="font-semibold">
                                    {user.name || "N/A"}
                                </span>

                                <span className="text-gray-400 text-sm break-all">
                                    {user.email || "N/A"}
                                </span>

                                <span className="md:text-center text-gray-400 text-sm">
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : "-"}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 flex-wrap">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-40 transition"
                    >
                        ← Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 2
                        )
                        .reduce((acc, page, idx, arr) => {
                            if (idx > 0 && page - arr[idx - 1] > 1) {
                                acc.push("...");
                            }
                            acc.push(page);
                            return acc;
                        }, [])
                        .map((item, idx) =>
                            item === "..." ? (
                                <span key={`dots-${idx}`} className="px-2 py-2 text-gray-500">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    onClick={() => setCurrentPage(item)}
                                    className={`px-4 py-2 rounded-lg text-sm transition ${currentPage === item
                                        ? "bg-[#6B8E23] text-black font-bold"
                                        : "bg-[#1A1A1A] hover:bg-[#333]"
                                        }`}
                                >
                                    {item}
                                </button>
                            )
                        )}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-40 transition"
                    >
                        Next →
                    </button>

                </div>
            )}
        </div>
    );
}