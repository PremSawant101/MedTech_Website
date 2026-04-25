import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ PREFLIGHT
export async function OPTIONS() {
    return new Response(null, {
        headers: corsHeaders,
    });
}

// ================= LOGIN =================
export async function POST(req) {
    try {
        await connectDB();

        const { email, password } = await req.json();

        // ✅ VALIDATION
        if (!email || !password) {
            return new Response(
                JSON.stringify({ message: "All fields are required" }),
                { status: 400, headers: corsHeaders }
            );
        }

        // ✅ FIND USER
        const user = await User.findOne({ email });

        console.log("DB USER:", user); // 🔥 debug

        if (!user) {
            return new Response(
                JSON.stringify({ message: "User not found" }),
                { status: 404, headers: corsHeaders }
            );
        }

        // ✅ PASSWORD CHECK
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return new Response(
                JSON.stringify({ message: "Invalid credentials" }),
                { status: 401, headers: corsHeaders }
            );
        }

        // 🔥 JWT TOKEN
        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 🔥 SAFE USER OBJECT (IMPORTANT FIX)
        const safeUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        };

        console.log("RESPONSE USER:", safeUser); // 🔥 debug

        // ✅ RESPONSE
        return new Response(
            JSON.stringify({
                message: "Login successful ✅",
                token,
                user: safeUser,
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}