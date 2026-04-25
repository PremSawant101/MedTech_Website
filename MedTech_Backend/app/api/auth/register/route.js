import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// ✅ PREFLIGHT
export async function OPTIONS() {
    return new Response(null, { headers: corsHeaders });
}

// ================= REGISTER =================
export async function POST(req) {
    try {
        await connectDB();

        const { name, email, password } = await req.json();

        // ✅ VALIDATION
        if (!name || !email || !password) {
            return new Response(
                JSON.stringify({ message: "All fields are required" }),
                { status: 400, headers: corsHeaders }
            );
        }

        // ✅ CHECK EXISTING USER
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return new Response(
                JSON.stringify({ message: "User already exists" }),
                { status: 400, headers: corsHeaders }
            );
        }

        // ✅ HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ CREATE USER
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });

        // ✅ GENERATE JWT TOKEN (auto login after signup)
        const token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return new Response(
            JSON.stringify({
                message: "Signup successful ✅",
                token, // 🔥 important
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            }),
            { status: 201, headers: corsHeaders }
        );

    } catch (error) {
        console.log("REGISTER ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Server error" }),
            { status: 500, headers: corsHeaders }
        );
    }
}