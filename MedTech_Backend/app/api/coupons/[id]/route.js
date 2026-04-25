import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";

// ✅ CORS HEADERS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS
export async function OPTIONS() {
    return new Response(null, { headers: corsHeaders });
}

// ===== UPDATE COUPON (ADMIN ONLY) =====
export async function PUT(req, context) {
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

        const { id } = context.params;

        // ✅ ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const { code, discountPercent, expiryDate } = await req.json();

        // ✅ validation
        if (!discountPercent || !expiryDate) {
            return new Response(
                JSON.stringify({ message: "All fields required" }),
                { status: 400, headers: corsHeaders }
            );
        }

        // ✅ expiry check
        if (new Date(expiryDate) <= new Date()) {
            return new Response(
                JSON.stringify({ message: "Expiry must be future date" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            {
                code: code?.toUpperCase(),
                discountPercent: Number(discountPercent),
                expiryDate,
            },
            { new: true }
        );

        if (!updatedCoupon) {
            return new Response(
                JSON.stringify({ message: "Coupon not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(
            JSON.stringify({
                message: "Coupon updated successfully",
                coupon: updatedCoupon,
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("UPDATE COUPON ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ===== DELETE COUPON (ADMIN ONLY) =====
export async function DELETE(req, context) {
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

        const { id } = context.params;

        // ✅ ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return new Response(
                JSON.stringify({ message: "Coupon not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(
            JSON.stringify({ message: "Coupon deleted successfully" }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("DELETE COUPON ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}