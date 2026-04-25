import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
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

// ================= POST (USER) =================
export async function POST(req) {
    try {
        await connectDB();

        const { user, error } = verifyToken(req);

        if (error) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401, headers: corsHeaders }
            );
        }

        const body = await req.json();
        const { products, couponCode } = body;

        if (!products || !products.length) {
            return new Response(
                JSON.stringify({ message: "Invalid data" }),
                { status: 400, headers: corsHeaders }
            );
        }

        let totalAmount = 0;
        let requiresPrescription = false;
        const enrichedProducts = [];

        for (let item of products) {

            const product = await Product.findById(item.productId);

            if (!product) {
                return new Response(
                    JSON.stringify({ message: "Product not found" }),
                    { status: 404, headers: corsHeaders }
                );
            }

            const quantity = Number(item.quantity) || 1;

            totalAmount += product.price * quantity;

            if (product.prescriptionRequired) {
                requiresPrescription = true;
            }

            enrichedProducts.push({
                productId: product._id,
                quantity,
                name: product.name,
                price: Number(product.price),
                image: product.image,
            });
        }

        // ===== COUPON =====
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode });

            if (!coupon) {
                return new Response(
                    JSON.stringify({ message: "Invalid coupon code" }),
                    { status: 400, headers: corsHeaders }
                );
            }

            if (new Date(coupon.expiryDate) < new Date()) {
                return new Response(
                    JSON.stringify({ message: "Coupon expired" }),
                    { status: 400, headers: corsHeaders }
                );
            }

            const discountAmount =
                (totalAmount * coupon.discountPercent) / 100;

            totalAmount -= discountAmount;
        }

        // ===== CREATE ORDER =====
        const order = await Order.create({
            userEmail: user.email,
            products: enrichedProducts,
            totalAmount,
            status: requiresPrescription
                ? "waiting_for_prescription"
                : "pending",
        });

        return new Response(
            JSON.stringify({
                message: "Order placed successfully",
                order,
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("ORDER CREATE ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}


// ================= GET =================
export async function GET(req) {
    try {
        await connectDB();

        const { user, error } = verifyToken(req);

        if (error) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401, headers: corsHeaders }
            );
        }

        // 🔥 CHECK QUERY PARAM
        const { searchParams } = new URL(req.url);
        const mine = searchParams.get("mine");

        // ================= USER ORDERS =================
        if (mine === "true") {

            const orders = await Order.find({ userEmail: user.email })
                .sort({ createdAt: -1 });

            return new Response(JSON.stringify(orders), {
                status: 200,
                headers: corsHeaders,
            });
        }

        // ================= ADMIN ONLY =================
        if (user.role !== "admin") {
            return new Response(
                JSON.stringify({ message: "Forbidden" }),
                { status: 403, headers: corsHeaders }
            );
        }

        const orders = await Order.find().sort({ createdAt: -1 });

        return new Response(JSON.stringify(orders), {
            status: 200,
            headers: corsHeaders,
        });

    } catch (error) {
        console.error("ORDER FETCH ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}