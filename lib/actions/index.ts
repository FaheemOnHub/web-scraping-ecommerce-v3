"use server";
import { revalidatePath } from "next/cache";
import Product from "../models/products.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import {
  getAveragePrice,
  getHighestPrice,
  getLowestPrice,
} from "../scraper/utils";

//all the code written here will run only on server
export const scrapeAndStoreProduct = async (productUrl: string) => {
  if (!productUrl) {
    return;
  }
  try {
    connectToDB();
    const scrapedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrapedProduct) return;

    let product = scrapedProduct;
    let existing = await Product.findOne({ url: scrapedProduct.productUrl });
    if (!existing) {
      // If no product is found by ID, try to find by title
      existing = await Product.findOne({ title: scrapedProduct.title });
    }
    if (existing) {
      const updatedPriceHistory: any = [
        ...existing.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];
      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }
    const newProduct = await Product.findOneAndUpdate(
      {
        url: scrapedProduct.productUrl,
      },
      product,
      {
        upsert: true,
        new: true,
      }
    );
    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error("❌ Failed to create/update product");
  }
};

export async function getProductById(productId: string) {
  try {
    //edge functions
    connectToDB();
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;
    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();
    const products = await Product.find();
    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return null;

    // Get the category of the current product
    const category = currentProduct.category;

    // Find other products in the same category
    const similarProducts = await Product.find({
      _id: { $ne: currentProduct._id },
      category: category,
    })
      .sort({ averagePrice: 1 })
      .limit(4);

    return similarProducts;
  } catch (error) {
    console.log(error);
    return null;
  }
}
