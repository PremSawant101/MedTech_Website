import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

// ✅ CORS HEADERS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS
export async function OPTIONS() {
    return new Response(null, { headers: corsHeaders });
}

// ===== VALIDATE COUPON (PUBLIC) =====
export async function POST(req) {
    try {
        await connectDB();

        const { code, subtotal } = await req.json();

        // ✅ validation
        if (!code || subtotal == null) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    message: "Invalid request",
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        const normalizedCode = code.toUpperCase();
        const safeSubtotal = Number(subtotal);

        if (isNaN(safeSubtotal) || safeSubtotal <= 0) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    message: "Invalid subtotal",
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        const coupon = await Coupon.findOne({ code: normalizedCode });

        if (!coupon) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    message: "Invalid Coupon Code",
                }),
                { headers: corsHeaders }
            );
        }

        // ✅ expiry check
        const now = new Date();

        if (new Date(coupon.expiryDate) < now) {
            return new Response(
                JSON.stringify({
                    valid: false,
                    message: "Coupon Expired",
                }),
                { headers: corsHeaders }
            );
        }

        // ✅ discount calculate
        const discount = Math.round(
            safeSubtotal * (coupon.discountPercent / 100)
        );

        return new Response(
            JSON.stringify({
                valid: true,
                discount,
                message: `${coupon.discountPercent}% Discount Applied`,
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("COUPON VALIDATE ERROR:", error);

        return new Response(
            JSON.stringify({
                valid: false,
                message: "Server Error",
            }),
            { status: 500, headers: corsHeaders }
        );
    }
}