import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { extractPrice, getCategory, getCurrencySymbol } from "./utils";

dotenv.config();

export async function scrapeAmazonProduct(productUrl: string) {
  const prices: any[] = [];
  if (!productUrl) return;
  //brightdata proxy configuration
  const username = process.env.username;
  const password = process.env.password;
  const host = process.env.host;
  const port = 22225;
  const sessionId = 1000000 * Math.random() || 0;
  const option = {
    auth: {
      username: `${username}-session-${sessionId}`,
      password,
    },
    host,
    port,
    rejectUnauthorized: false,
  };
  try {
    //fetch product page
    const response = await axios.get(productUrl);
    const $ = cheerio.load(response.data);

    let symbol = getCurrencySymbol(productUrl);
    const title = $("#productTitle").text().trim();

    //cateogry
    const category = await getCategory($);
    //Extract discounted prices
    const currentPrice = extractPrice(
      $(".priceToPay .a-price-whole"),

      $(".a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );

    let originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const discountedPriceElements =
      $(".priceToPay .a-price-whole") ||
      $(".a.size.base.a-color-price") ||
      $(".a-button-selected .a-color-base ");
    //Add discounted prices
if (!currentPrice && !originalPrice) {
      currentPrice = 0;
    }
    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";
    const image =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      $(".a-dynamic-image").attr("data-a-dynamic-image") ||
      "{}";
    const imageUrls = Object.keys(JSON.parse(image));

    const discountPercentage = $(".savingsPercentage")
      .text()
      .replace(/[-%]/g, "");
    // console.log({
    //   title,
    //   priceInfo: formattedPrice,
    //   outOfStock,
    //   imageUrls,
    //   discountPercentage,
    // });

    //CONSTRUCT DATA OBJECT WITH SCRAPED DATA
    const data = {
      url: productUrl,
      currency: symbol,
      image: imageUrls[0],
      title,

      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(currentPrice) || Number(originalPrice),
      priceHistory: [],
      discountRate: Number(discountPercentage),
      category: category || "Uncategorized",
      reviewCount: 0,
      stars: 0,
      isOutOfStock: outOfStock,
      description: "to-be-added",
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(currentPrice) || Number(originalPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };
    return data;
  } catch (error: any) {
    console.log(error);
  }
}
