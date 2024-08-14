import Product from "@/lib/models/products.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodeMailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "@/lib/scraper/utils";
import { User } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    connectToDB();
    const products = await Product.find({});
    if (!products) throw new Error(`No products found`);
    const updatedProducts = await Promise.all(
      products.map(async (current) => {
        const scrapedProducts = await scrapeAmazonProduct(current.url);
        if (!scrapedProducts) throw new Error("No product found");
        if (scrapedProducts) {
          const updatedPriceHistory: any = [
            ...current.priceHistory,
            { price: scrapedProducts.currentPrice },
          ];
          const newProduct = {
            ...scrapedProducts,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          };

          const updatedProduct = await Product.findOneAndUpdate(
            {
              url: scrapedProducts.url,
            },
            newProduct
          );
          //checking item status & mailing
          const emailNotify = getEmailNotifType(scrapedProducts, current);
          if (emailNotify && updatedProduct.user.length > 0) {
            const productInfo = {
              title: updatedProduct.title,
              url: updatedProduct.url,
            };
            const emailContent = await generateEmailBody(
              productInfo,
              emailNotify
            );
            const userEmails = updatedProduct.users.map((user: any) => {
              user.email;
            });

            await sendEmail(emailContent, userEmails);
          }
          return updatedProduct;
        }
      })
    );
    return NextResponse.json({
      message: "OK",
      data: updatedProducts,
    });
  } catch (error) {
    throw new Error(`Error in get cron,${error}`);
  }
}
