import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { verifyToken } from "@/lib/auth";

// ✅ CORS HEADERS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (preflight)
export async function OPTIONS() {
    return new Response(null, {
        headers: corsHeaders,
    });
}

// ================= GET (ADMIN ONLY) =================
export async function GET(req) {
    try {
        await connectDB();

        const { user, error } = verifyToken(req);

        if (error || user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 403, headers: corsHeaders }
            );
        }

        const coupons = await Coupon.find().sort({ createdAt: -1 });

        return new Response(JSON.stringify(coupons), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error) {
        console.error("GET COUPON ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ================= POST (ADMIN ONLY) =================
export async function POST(req) {
    try {
        await connectDB();

        const { user, error } = verifyToken(req);

        if (error || user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 403, headers: corsHeaders }
            );
        }

        const { code, discountPercent, expiryDate } = await req.json();

        // ✅ validation
        if (!code || !discountPercent || !expiryDate) {
            return new Response(
                JSON.stringify({ message: "All fields are required" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const normalizedCode = code.toUpperCase();

        // ✅ duplicate check
        const existingCoupon = await Coupon.findOne({ code: normalizedCode });

        if (existingCoupon) {
            return new Response(
                JSON.stringify({ message: "Coupon already exists" }),
                { status: 400, headers: corsHeaders }
            );
        }

        // ✅ expiry validation
        if (new Date(expiryDate) <= new Date()) {
            return new Response(
                JSON.stringify({ message: "Expiry must be in future" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const coupon = await Coupon.create({
            code: normalizedCode,
            discountPercent: Number(discountPercent),
            expiryDate,
        });

        return new Response(
            JSON.stringify({
                message: "Coupon created successfully",
                coupon,
            }),
            { status: 201, headers: corsHeaders }
        );

    } catch (error) {
        console.error("CREATE COUPON ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}