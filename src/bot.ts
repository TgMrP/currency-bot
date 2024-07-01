import { config } from "dotenv";
config();
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { CronJob } from "cron";
import * as cheerio from "cheerio";

const token: string = process.env.TELEGRAM_BOT_TOKEN || "";
const chatId: string = process.env.TELEGRAM_CHAT_ID || "";

const bot = new TelegramBot(token, { polling: true });

let previousRate: number | null = null;

// Function to fetch exchange rate from Google Finance
const fetchExchangeRate = async (): Promise<number | null> => {
  try {
    const response = await axios.get(
      "https://www.google.com/finance/quote/EUR-ILS"
    );
    const html = response.data;
    const $ = cheerio.load(html);
    const rateString = $('div[data-source="EUR"] div[jsname="ip75Cb"] div')
      .first()
      .text();

    const rate = parseFloat(rateString.replace(",", ""));
    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
};

const FetchLeumi = async () => {
  try {
    const response = await axios.get(
      "https://www.bankleumi.co.il/Api/ATM/Rates"
    );
    const html = response.data;

    return html.ATMData?.Euro;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
};

// Function to check and notify about exchange rate changes
const checkExchangeRate = async () => {
  // const currentRate = await fetchExchangeRate();
  const currentRate = await FetchLeumi();
  console.log(`Start checking exchange rate at ${new Date()}`);
  if (currentRate && currentRate !== previousRate) {
    console.log(`Euro to NIS rate has changed: ${currentRate}`);
    bot.sendMessage(chatId, `Euro to NIS rate has changed: ${currentRate}`);
    previousRate = currentRate;
  }
};

FetchLeumi();

// // Schedule the rate check to run every 10 minutes
const job = new CronJob("* * * * *", checkExchangeRate);
checkExchangeRate();
job.start();

console.log("Bot is running...");
