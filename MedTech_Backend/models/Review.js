import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        name: String,         // customer name
        rating: Number,       // 1 to 5
        comment: String,      // review text
        product: String,      // optional (product name)
    },
    { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);