import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import { verifyToken } from "@/lib/auth";

// ✅ CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ PREFLIGHT
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// ================= GET ALL REVIEWS =================
// 🔓 Public (frontend display)
export async function GET() {
    try {
        await connectDB();

        const reviews = await Review.find().sort({ createdAt: -1 });

        return new Response(JSON.stringify(reviews), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error) {
        console.error("GET REVIEW ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ================= CREATE REVIEW =================
// 🔐 ADMIN ONLY
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

        const { name, rating, comment, product } = await req.json();

        // ✅ VALIDATION
        if (!name || !comment) {
            return new Response(
                JSON.stringify({ message: "Name and comment required" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const review = await Review.create({
            name,
            rating: rating || 5,
            comment,
            product,
        });

        return new Response(JSON.stringify(review), {
            status: 201,
            headers: corsHeaders,
        });

    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}