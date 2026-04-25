import jwt from "jsonwebtoken";

export function verifyToken(req) {
    try {
        const token = req.headers.get("authorization");

        if (!token) {
            return { error: "No token provided" };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return { user: decoded };

    } catch (err) {
        return { error: "Invalid token" };
    }
}