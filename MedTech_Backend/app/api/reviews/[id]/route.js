import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";

// ✅ CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ PREFLIGHT
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// ================= UPDATE REVIEW =================
// 🔐 ADMIN ONLY
export async function PUT(req, { params }) {
    try {
        await connectDB();

        // 🔐 VERIFY TOKEN
        const { user, error } = verifyToken(req);

        if (error || user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 403, headers: corsHeaders }
            );
        }

        const { id } = await params;

        // ✅ ID VALIDATION
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const { name, rating, comment, product } = await req.json();

        const updated = await Review.findByIdAndUpdate(
            id,
            { name, rating, comment, product },
            { new: true }
        );

        if (!updated) {
            return new Response(
                JSON.stringify({ message: "Review not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(JSON.stringify(updated), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error) {
        console.error("UPDATE REVIEW ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ================= DELETE REVIEW =================
// 🔐 ADMIN ONLY
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        // 🔐 VERIFY TOKEN
        const { user, error } = verifyToken(req);

        if (error || user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 403, headers: corsHeaders }
            );
        }

        const { id } = await params;

        // ✅ ID VALIDATION
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const deleted = await Review.findByIdAndDelete(id);

        if (!deleted) {
            return new Response(
                JSON.stringify({ message: "Review not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(
            JSON.stringify({ message: "Deleted successfully" }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("DELETE REVIEW ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}