# Price-Analyzer

**Price-Analyzer** is a web application that tracks the prices of products on Amazon and sends email alerts to users when the price of a monitored product drops. This tool helps users save money by notifying them of the best time to purchase their desired products.
<img width="1430" alt="Screenshot 2024-08-28 at 4 51 38 PM" src="https://github.com/user-attachments/assets/bf08c139-1805-4ffa-8472-54880bc75519">

## Features

- **Amazon Price Tracking**: Automatically scrape the prices of products listed on Amazon at regular intervals.
- **Email Notifications**: Receive an email alert when the price of a product drops or meets your desired threshold.
- **Product History**: View the price history of tracked products to analyze trends and make informed purchasing decisions.
- **Responsive UI**: A modern and responsive user interface built with Next.js, featuring easy navigation and a user-friendly experience.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/price-analyzer.git
   cd price-analyzer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   MONGODB_URI=<your-mongodb-uri>
  EMAIL_USER=<your-email-address>
  EMAIL_PASS=<your-email-password>
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

1. **Add Products**: Use the search bar to find and add products you want to track.

2. **View Products**: Browse the list of tracked products and view detailed price history.

3. **Receive Alerts**: Get notified via email when the price of a tracked product drops.

## API Overview

### Price Scraping API

- **Endpoint**: `/api/cron/route.ts`
- **Method**: `GET`
- **Description**: This endpoint scrapes the current price of all tracked products from Amazon, updates the product details in the database, and triggers email notifications if there are any significant price changes.

### Utility Functions

- **scrapeAmazonProduct(url)**: Scrapes price and product details from the given Amazon URL.
- **sendEmail(recipients, subject, body)**: Sends an email to the specified recipients with the provided subject and body.
- **getEmailNotifType(newProduct, oldProduct)**: Determines the type of email notification to send based on price changes.

## Technologies Used

- **Next.js**: Framework for building server-side rendered React applications.
- **MongoDB**: Database for storing product data and user information.
- **Resend**: Module for sending emails.
- **Cheerio**: Library for parsing and manipulating HTML to scrape Amazon product details.

## Contributing

Contributions are welcome! Please fork this repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries or feedback, feel free to reach out via email: [faheemmushtaq89@gmail.com](mailto:faheemmushtaq89@gmail.com).
