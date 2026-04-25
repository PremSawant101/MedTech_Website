import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";

// ✅ CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ PREFLIGHT
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

// ================= UPLOAD PRESCRIPTION =================
export async function PUT(req, context) {
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
                JSON.stringify({ message: "Invalid ID" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const { prescriptionFile } = await req.json();

        const order = await Order.findById(id);

        if (!order) {
            return new Response(
                JSON.stringify({ message: "Order not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        // 🔥 OWNER CHECK (VERY IMPORTANT)
        if (order.userEmail !== user.email && user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Forbidden" }),
                { status: 403, headers: corsHeaders }
            );
        }

        if (order.status !== "waiting_for_prescription") {
            return new Response(
                JSON.stringify({
                    message: "Prescription not required for this order",
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        // ✅ UPDATE
        order.prescriptionUploaded = true;
        order.prescriptionFile = prescriptionFile;
        order.status = "pending";

        await order.save();

        return new Response(
            JSON.stringify({
                message: "Prescription uploaded successfully",
                order,
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("PRESCRIPTION ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}