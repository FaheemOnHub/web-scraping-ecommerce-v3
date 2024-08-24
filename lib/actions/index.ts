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
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodeMailer";

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
    let existing = await Product.findOne({ url: scrapedProduct.url });
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
      revalidatePath(`/products/${existing._id}`);
      return JSON.parse(JSON.stringify(existing));
    } else {
      const newProduct = await Product.findOneAndUpdate(
        {
          url: scrapedProduct.url,
        },
        product,
        {
          upsert: true,
          new: true,
        }
      );
      revalidatePath(`/products/${newProduct._id}`);
      return JSON.parse(JSON.stringify(newProduct));
    }
  } catch (error: any) {
    console.error(error);
    // throw new Error("❌ Failed to create/update product");
  }
};

export async function getProductById(productId: string) {
  try {
    //edge functions
    connectToDB();
    const product = await Product.findOne({ _id: productId });
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();
    const products = await Product.find({});
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

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) return; // Handle case where product is not found

    // Check if the user already exists
    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );
    if (!userExists) {
      // Add the user to the product's user list
      product.users.push({ email: userEmail });
      await product.save(); // Save the updated product

      // Generate the email content using the appropriate notification type
      const emailContent = generateEmailBody(product, "WELCOME");

      // Send the email notification
      await sendEmail([userEmail], emailContent.subject, emailContent.body);
    } else {
      console.log(
        `User with email ${userEmail} already exists for product ${productId}.`
      );
      const emailContent = generateEmailBody(product, "WELCOME");

      await sendEmail([userEmail], emailContent.subject, emailContent.body);
    }
  } catch (error) {
    console.error(`Error adding user email to product: ${error}`);
  }
}
