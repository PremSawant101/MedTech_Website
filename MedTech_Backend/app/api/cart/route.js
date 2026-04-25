import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// ✅ CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
    return new Response(null, { headers: corsHeaders });
}

// ================= GET CART =================
export async function GET(req) {
    try {
        await connectDB();

        // ✅ FIX: email from query param (localStorage based auth)
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return new Response(JSON.stringify({ message: "Email required" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const cart = await Cart.findOne({ userEmail: email });

        return new Response(JSON.stringify(cart?.items || []), {
            headers: corsHeaders
        });

    } catch (err) {
        console.error("GET CART ERROR:", err);
        return new Response(JSON.stringify({ message: "Server error" }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// ================= ADD TO CART =================
export async function POST(req) {
    try {
        await connectDB();

        const body = await req.json();

        // ✅ FIX: email from body (localStorage based auth)
        const { email, item } = body;

        if (!email) {
            return new Response(JSON.stringify({ message: "Email required" }), {
                status: 401,
                headers: corsHeaders
            });
        }

        if (!item || !item._id) {
            return new Response(JSON.stringify({ message: "Invalid item" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // 🔐 FETCH PRODUCT FROM DB
        const product = await Product.findById(item._id);

        if (!product) {
            return new Response(JSON.stringify({ message: "Product not found" }), {
                status: 404,
                headers: corsHeaders
            });
        }

        const finalPrice = Math.round(
            product.price - (product.price * (product.discount || 0) / 100)
        );

        let cart = await Cart.findOne({ userEmail: email });

        if (!cart) {
            cart = await Cart.create({
                userEmail: email,
                items: [{
                    productId: product._id,
                    name: product.name,
                    price: finalPrice,
                    image: product.image,
                    quantity: 1
                }]
            });
        } else {
            const existingItem = cart.items.find(
                (i) => i.productId.toString() === product._id.toString()
            );

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.items.push({
                    productId: product._id,
                    name: product.name,
                    price: finalPrice,
                    image: product.image,
                    quantity: 1
                });
            }

            await cart.save();
        }

        return new Response(JSON.stringify({ message: "Cart updated" }), {
            headers: corsHeaders
        });

    } catch (err) {
        console.error("ADD TO CART ERROR:", err);
        return new Response(JSON.stringify({ message: "Server error" }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// ================= CLEAR CART =================
export async function DELETE(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return new Response(JSON.stringify({ message: "Email required" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        await Cart.findOneAndDelete({ userEmail: email });

        return new Response(JSON.stringify({ message: "Cart cleared" }), {
            headers: corsHeaders
        });

    } catch (err) {
        console.error("DELETE CART ERROR:", err);
        return new Response(JSON.stringify({ message: "Server error" }), {
            status: 500,
            headers: corsHeaders
        });
    }
}