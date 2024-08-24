import axios from "axios";
import Product from "../models/products.model";
import { EmailContent, EmailProductInfo, NotificationType } from "@/types";

export const THRESHOLD_PERCENTAGE = 10;
export const Notification = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
};

export const generateEmailBody = (
  product: EmailProductInfo,
  type: NotificationType
) => {
  const shortenedTitle =
    product.title.length > 20
      ? `${product.title.substring(0, 20)}...`
      : product.title;
  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `Welcome to Price Tracking for ${shortenedTitle}`;
      body = `
        <div>
          <h2>Welcome to PriceAnalyzer 🚀</h2>
          <p>You are now tracking ${product.title}.</p>
          <p>Here's an example of how you'll receive updates:</p>
          <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
            <h3>${product.title} is back in stock!</h3>
            <p>We're excited to let you know that ${product.title} is now back in stock.</p>
            <p>Don't miss out - <a href="${product.url}" target="_blank" rel="noopener noreferrer">buy it now</a>!</p>
            <img src="https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png" alt="Product Image" style="max-width: 100%;" />
          </div>
          <p>Stay tuned for more updates on ${product.title} and other products you're tracking.</p>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} is now back in stock!`;
      body = `
          <div>
            <h4>Hey, ${product.title} is now restocked! Grab yours before they run out again!</h4>
            <p>See the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
          </div>
        `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Lowest Price Alert for ${shortenedTitle}`;
      body = `
          <div>
            <h4>Hey, ${product.title} has reached its lowest price ever at ${product.currentPrice}!!</h4>
            <p>Grab the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a> now.</p>
          </div>
        `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Discount Alert for ${shortenedTitle}`;
      body = `
          <div>
            <h4>Hey, ${product.title} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
            <p>Grab it right away from <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
          </div>
        `;
      break;

    default:
      throw new Error("Invalid notification type.");
  }

  return { subject, body };
};

// New sendEmail function using Resend
export const sendEmail = async (
  sendTo: string[],
  subject: string,
  body: string
) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY; // Store your API key in .env
  const RESEND_API_URL = "https://api.resend.com/emails";

  try {
    const response = await axios.post(
      RESEND_API_URL,
      {
        from: process.env.EMAIL, // Your verified sender email
        to: sendTo,
        subject: subject,
        html: body,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    return response.data; // Return the response from Resend
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email");
  }
};

// export const sendEmailNotification = async (
//   product: EmailProductInfo,
//   notificationType: NotificationType,
//   userEmails: string[]
// ) => {
//   const emailContent = generateEmailBody(product, notificationType);

//   // Send email to all users
//   await Promise.all(
//     userEmails.map((email) =>
//       sendEmail(email, emailContent.subject, emailContent.body)
//     )
//   );
// };
