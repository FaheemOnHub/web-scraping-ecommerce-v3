"use server";
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
import { NextResponse } from "next/server";

// const maxDuration = 1000 * 60 * 60 * 24; // 24 hours
const maxDuration = 1000 * 60 * 60; // 1 hour
const dynamic = "force-dynamic";
const revalidate = 0;
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});
    if (!products || products.length === 0)
      throw new Error("No products found");

    const updatedProducts = [];
    for (const current of products) {
      const scrapedProduct = await scrapeAmazonProduct(current.url);
      if (!scrapedProduct) return null;
      if (
        scrapedProduct.currentPrice == null ||
        scrapedProduct.currentPrice == 0
      ) {
        const newProduct = {
          ...scrapedProduct,

          isOutOfStock: true,
        };
        const updatedProduct = await Product.findOneAndUpdate(
          { url: newProduct.url },
          newProduct,
          { new: true }
        );
        updatedProducts.push(updatedProduct);
      } else {
        const updatedPriceHistory = [
          ...current.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];

        const newProduct = {
          ...scrapedProduct,
          currentPrice: scrapedProduct.currentPrice,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
          isOutOfStock: scrapedProduct.isOutOfStock,
        };
        const updatedProduct = await Product.findOneAndUpdate(
          { url: newProduct.url },
          newProduct,
          { new: true }
        );

        //Check item status & send email
        const emailNotify = getEmailNotifType(scrapedProduct, current);
        if (
          emailNotify &&
          updatedProduct.users &&
          updatedProduct.users.length > 0
        ) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
            currentPrice: updatedProduct.currentPrice,
          };
          const emailContent = await generateEmailBody(
            productInfo,
            emailNotify
          );
          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );
          await sendEmail(userEmails, emailContent.subject, emailContent.body);
        }
        updatedProducts.push(updatedProduct);
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    }

    const filteredProducts = updatedProducts.filter(
      (product) => product !== null
    );

    return NextResponse.json({
      message: "OK",
      data: filteredProducts,
    });
  } catch (error: any) {
    console.error(`Error in GET cron job: ${error.message}`);
    return NextResponse.json(
      {
        message: "Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// "use server";
// import Product from "@/lib/models/products.model";
// import { connectToDB } from "@/lib/mongoose";
// import { generateEmailBody, sendEmail } from "@/lib/nodeMailer";
// import { scrapeAmazonProduct } from "@/lib/scraper";
// import {
//   getAveragePrice,
//   getEmailNotifType,
//   getHighestPrice,
//   getLowestPrice,
// } from "@/lib/scraper/utils";
// import { NextResponse } from "next/server";

// const dynamic = "force-dynamic";
// const revalidate = 0;

// async function scrapeWithRetry(url: any, maxRetries = 3) {
//   for (let i = 0; i < maxRetries; i++) {
//     try {
//       return await scrapeAmazonProduct(url);
//     } catch (error) {
//       console.error(`Attempt ${i + 1} failed for ${url}:`, error);
//       if (i === maxRetries - 1) throw error;
//       await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
//     }
//   }
// }

// export async function GET() {
//   try {
//     await connectToDB();
//     const products = await Product.find({});
//     if (!products || products.length === 0)
//       throw new Error("No products found");

//     const updatedProducts = [];

//     for (const current of products) {
//       console.log(`Processing product: ${current.url}`);

//       try {
//         const scrapedProduct = await scrapeWithRetry(current.url);
//         if (!scrapedProduct) {
//           console.log(`Failed to scrape product: ${current.url}`);
//           continue;
//         }

//         console.log(
//           `Scraped price for ${current.url}: ${scrapedProduct.currentPrice}`
//         );

//         const updatedPriceHistory = [
//           ...current.priceHistory,
//           {
//             price: scrapedProduct.currentPrice,
//             date: new Date(),
//           },
//         ];

//         const newProductData = {
//           currentPrice: scrapedProduct.currentPrice,
//           priceHistory: updatedPriceHistory,
//           lowestPrice: getLowestPrice(updatedPriceHistory),
//           highestPrice: getHighestPrice(updatedPriceHistory),
//           averagePrice: getAveragePrice(updatedPriceHistory),
//           title: scrapedProduct.title,
//           image: scrapedProduct.image,
//           isOutOfStock: scrapedProduct.isOutOfStock,
//           discountRate: scrapedProduct.discountRate,
//           category: scrapedProduct.category,
//         };

//         const updatedProduct = await Product.findOneAndUpdate(
//           { url: current.url },
//           { $set: newProductData },
//           { new: true }
//         );

//         console.log(
//           `Updated product ${updatedProduct._id}: ${updatedProduct.currentPrice}`
//         );

//         // Check item status & send email
//         const emailNotify = getEmailNotifType(scrapedProduct, current);
//         if (
//           emailNotify &&
//           updatedProduct.users &&
//           updatedProduct.users.length > 0
//         ) {
//           const productInfo = {
//             title: updatedProduct.title,
//             url: updatedProduct.url,
//             currentPrice: updatedProduct.currentPrice,
//           };
//           const emailContent = await generateEmailBody(
//             productInfo,
//             emailNotify
//           );
//           const userEmails = updatedProduct.users.map(
//             (user: any) => user.email
//           );
//           await sendEmail(userEmails, emailContent.subject, emailContent.body);
//         }

//         updatedProducts.push(updatedProduct);
//       } catch (error) {
//         console.error(`Error processing ${current.url}:`, error);
//       }

//       // Add a delay to avoid rate limiting
//       await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
//     }

//     const filteredProducts = updatedProducts.filter(
//       (product) => product !== null
//     );

//     return NextResponse.json({
//       message: "OK",
//       data: filteredProducts,
//     });
//   } catch (error) {
//     console.error(`Error in GET cron job: ${error}`);
//     return NextResponse.json(
//       {
//         message: "Error",
//         error: error,
//       },
//       { status: 500 }
//     );
//   }
// }
