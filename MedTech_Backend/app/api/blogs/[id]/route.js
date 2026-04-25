import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return new Response(null, { headers: corsHeaders });
}

// ✅ GET SINGLE BLOG (PUBLIC)
export async function GET(req, { params }) {
    try {
        await connectDB();

        // ✅ FIX: await params (Next.js 15)
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return new Response(
                JSON.stringify({ message: "Not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(JSON.stringify(blog), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (err) {
        console.error("GET ERROR:", err);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ✅ UPDATE BLOG (ADMIN ONLY)
export async function PUT(req, { params }) {
    try {
        await connectDB();

        const { user, error } = verifyToken(req);
        if (error || user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 403, headers: corsHeaders }
            );
        }

        // ✅ FIX: await params
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const body = await req.json();

        const updated = await Blog.findByIdAndUpdate(
            id,
            { title: body.title, content: body.content, image: body.image },
            { new: true }
        );

        return new Response(JSON.stringify(updated), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (err) {
        console.error("PUT ERROR:", err);
        return new Response(
            JSON.stringify({ message: "Update failed" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ✅ DELETE BLOG (ADMIN ONLY)
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { user, error } = verifyToken(req);
        if (error || user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 403, headers: corsHeaders }
            );
        }

        // ✅ FIX: await params
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        await Blog.findByIdAndDelete(id);

        return new Response(
            JSON.stringify({ message: "Deleted successfully" }),
            { status: 200, headers: corsHeaders }
        );

    } catch (err) {
        console.error("DELETE ERROR:", err);
        return new Response(
            JSON.stringify({ message: "Delete failed" }),
            { status: 500, headers: corsHeaders }
        );
    }
}