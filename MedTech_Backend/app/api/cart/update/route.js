import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
    return new Response(null, { headers: corsHeaders });
}

export async function POST(req) {
    try {
        await connectDB();

        // ✅ FIX: email from body instead of token
        const { email, productId, action } = await req.json();

        if (!email) {
            return new Response(
                JSON.stringify({ message: "Email required" }),
                { status: 401, headers: corsHeaders }
            );
        }

        if (!productId) {
            return new Response(
                JSON.stringify({ message: "Product ID required" }),
                { status: 400, headers: corsHeaders }
            );
        }

        if (!["increase", "decrease"].includes(action)) {
            return new Response(
                JSON.stringify({ message: "Invalid action" }),
                { status: 400, headers: corsHeaders }
            );
        }

        const cart = await Cart.findOne({ userEmail: email });

        if (!cart) {
            return new Response(
                JSON.stringify({ message: "Cart not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        const item = cart.items.find(
            (i) => i.productId.toString() === productId.toString()
        );

        if (!item) {
            return new Response(
                JSON.stringify({ message: "Item not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        if (action === "increase") {
            item.quantity += 1;
        } else if (action === "decrease") {
            item.quantity -= 1;
        }

        // Remove if zero
        cart.items = cart.items.filter(i => i.quantity > 0);

        await cart.save();

        return new Response(
            JSON.stringify({ message: "Cart updated", items: cart.items }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("CART UPDATE ERROR:", error);
        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}