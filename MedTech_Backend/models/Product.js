import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },       // e.g. "Bhringraj"
    description: { type: String, default: "" },   // paragraph about ingredient
    image: { type: String, default: "" },          // ingredient image URL
});

const ProductSchema = new mongoose.Schema(
    {
        name: String,
        category: {
            type: String,
            required: true,
        },
        description: String,
        price: Number,
        stock: Number,
        prescriptionRequired: Boolean,
        image: {
            type: String,
            required: true,
        },
        discount: {
            type: Number,
            default: 0
        },

        // ✅ NEW: Ingredients array
        ingredients: {
            type: [IngredientSchema],
            default: [],
        },

        // ✅ NEW: How to use text
        howToUse: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Product ||
    mongoose.model("Product", ProductSchema);