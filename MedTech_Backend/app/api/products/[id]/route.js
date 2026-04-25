import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return new Response(null, { headers: corsHeaders });
}

// ================= GET single product =================
export async function GET(req, context) {
    try {
        await connectDB();

        const params = await context.params;
        const product = await Product.findById(params.id);

        if (!product) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(product, { headers: corsHeaders });

    } catch (error) {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// ================= PUT =================
export async function PUT(req, context) {
    try {
        await connectDB();

        const params = await context.params;
        const { user, error } = verifyToken(req);
        if (error) {
            return NextResponse.json(
                { message: error },
                { status: 401, headers: corsHeaders }
            );
        }

        if (user.role !== "admin") {
            return NextResponse.json(
                { message: "Forbidden. Admin only." },
                { status: 403, headers: corsHeaders }
            );
        }

        const {
            name,
            description,
            price,
            image,
            category,
            stock,
            discount,
            ingredients,
            howToUse,
        } = await req.json();

        const updated = await Product.findByIdAndUpdate(
            params.id,
            {
                name,
                description,
                price,
                image,
                category,
                stock,
                discount: discount || 0,
                ingredients: ingredients || [],
                howToUse: howToUse || "",
            },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { message: "Product updated successfully", product: updated },
            { headers: corsHeaders }
        );

    } catch (error) {
        console.error("PRODUCT UPDATE ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}

// ================= DELETE =================
export async function DELETE(req, context) {
    try {
        await connectDB();

        const params = await context.params;
        const { user, error } = verifyToken(req);
        if (error) {
            return NextResponse.json(
                { message: error },
                { status: 401, headers: corsHeaders }
            );
        }

        if (user.role !== "admin") {
            return NextResponse.json(
                { message: "Forbidden. Admin only." },
                { status: 403, headers: corsHeaders }
            );
        }

        await Product.findByIdAndDelete(params.id);

        return NextResponse.json(
            { message: "Product deleted successfully" },
            { headers: corsHeaders }
        );

    } catch (error) {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}