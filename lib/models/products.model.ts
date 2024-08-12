import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: false,
    },
    priceHistory: [
      {
        price: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lowestPrice: {
      type: Number,
    },
    highestPrice: {
      type: Number,
    },
    averagePrice: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    reviewCount: {
      type: Number,
      required: true,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        email: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
