import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { verifyToken } from "@/lib/auth";

// ✅ CORS HEADERS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS
export async function OPTIONS() {
    return new Response(null, {
        headers: corsHeaders,
    });
}

// ✅ GET ALL BLOGS (PUBLIC)
export async function GET() {
    try {
        await connectDB();

        const blogs = await Blog.find().sort({ createdAt: -1 });

        return new Response(JSON.stringify(blogs), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (err) {
        console.error("GET BLOG ERROR:", err);

        return new Response(
            JSON.stringify({ message: "Failed to fetch blogs" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ✅ CREATE BLOG (ADMIN ONLY)
export async function POST(req) {
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

        const { title, content, image } = await req.json();

        // validation
        if (!title || !content || !image) {
            return new Response(
                JSON.stringify({ message: "All fields are required" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const blog = await Blog.create({
            title,
            content,
            image,
        });

        return new Response(JSON.stringify(blog), {
            status: 201,
            headers: corsHeaders,
        });

    } catch (err) {
        console.error("POST BLOG ERROR:", err);

        return new Response(
            JSON.stringify({ message: "Failed to create blog" }),
            { status: 500, headers: corsHeaders }
        );
    }
}