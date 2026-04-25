import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),

        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                await connectDB();

                const user = await User.findOne({ email: credentials.email });

                if (!user) return null;

                // 🔥 Google se register hua user credentials se login karne ki koshish kare
                if (!user.password) {
                    throw new Error("Please login with Google");
                }

                const isMatch = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isMatch) return null;

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        // ✅ Google login pe user DB mein save karo
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await connectDB();

                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    await User.create({
                        name: user.name,
                        email: user.email,
                        role: "user",
                    });
                }
            }
            return true;
        },

        // ✅ JWT mein role DB se lao — Google user ke liye bhi
        async jwt({ token, user, account }) {
            if (user) {
                // Credentials login — role seedha milta hai
                token.role = user.role;
            }

            if (account?.provider === "google") {
                // Google login — DB se role fetch karo
                await connectDB();
                const dbUser = await User.findOne({ email: token.email });
                token.role = dbUser?.role || "user";
            }

            return token;
        },

        // ✅ Session mein role set karo
        async session({ session, token }) {
            session.user.role = token.role || "user";
            return session;
        },
    },

    // ✅ Google login ke baad auth-callback.html pe bhejo
    pages: {
        signIn: "/auth/login.html",
    },

    secret: process.env.NEXTAUTH_SECRET,
};