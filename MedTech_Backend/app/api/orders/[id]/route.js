import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// ✅ CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ PREFLIGHT
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// ================= GET SINGLE ORDER =================
// 🔐 USER + ADMIN ACCESS CONTROL

export async function GET(req, context) {
    try {
        await connectDB();

        // 🔐 VERIFY TOKEN
        const { user, error } = verifyToken(req);

        if (error) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401, headers: corsHeaders }
            );
        }

        const { id } = context.params;

        // ✅ ID VALIDATION
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return new Response(
                JSON.stringify({ message: "Invalid ID format" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const order = await Order.findById(id);

        if (!order) {
            return new Response(
                JSON.stringify({ message: "Order not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        // 🔥 SECURITY CHECK
        if (user.role !== "admin" && order.userEmail !== user.email) {
            return new Response(
                JSON.stringify({ message: "Forbidden" }),
                { status: 403, headers: corsHeaders }
            );
        }

        return new Response(JSON.stringify(order), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error) {
        console.error("GET ORDER ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}
// ================= UPDATE ORDER =================
// 🔥 ADMIN ONLY
export async function PUT(req, context) {
    try {
        await connectDB();

        // 🔐 JWT VERIFY
        const { user, error } = verifyToken(req);

        if (error) {
            return new Response(
                JSON.stringify({ message: error }),
                { status: 401, headers: corsHeaders }
            );
        }

        if (user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Forbidden" }),
                { status: 403, headers: corsHeaders }
            );
        }

        const { id } = await context.params;
        const body = await req.json();

        // ✅ only allow status update (secure)
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: body.status },
            { new: true }
        );

        if (!updatedOrder) {
            return new Response(
                JSON.stringify({ message: "Order not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(
            JSON.stringify({
                message: "Order updated successfully",
                order: updatedOrder,
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("UPDATE ORDER ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}

// ================= DELETE ORDER =================
// 🔥 ADMIN ONLY
export async function DELETE(req, context) {
    try {
        await connectDB();

        // 🔐 JWT VERIFY
        const { user, error } = verifyToken(req);

        if (error) {
            return new Response(
                JSON.stringify({ message: error }),
                { status: 401, headers: corsHeaders }
            );
        }

        if (user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Forbidden" }),
                { status: 403, headers: corsHeaders }
            );
        }

        const { id } = await context.params;

        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return new Response(
                JSON.stringify({ message: "Order not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        return new Response(
            JSON.stringify({ message: "Order deleted successfully" }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("DELETE ORDER ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}