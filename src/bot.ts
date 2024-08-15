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
let previousRateDollar: number | null = null;

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

    return {
      euro: html.ATMData?.Euro,
      dollar: html.ATMData?.Dollar,
    };
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
};

// Function to check and notify about exchange rate changes
const checkExchangeRate = async () => {
  const currentRate = await FetchLeumi();
  console.log(`Start checking exchange rate at ${new Date()}`);

  if (currentRate?.euro && currentRate.euro !== previousRate) {
    let message = `Euro to NIS rate has changed: ${currentRate.euro}`;
    if (previousRate !== null) {
      if (currentRate.euro > previousRate) {
        message += " 📈🟢"; // Green arrow up
      } else {
        message += " 📉🔴"; // Red arrow down
      }
    }

    console.log(message);
    bot.sendMessage(chatId, message);
    previousRate = currentRate.euro;
  }

  if (currentRate?.dollar && currentRate.dollar !== previousRateDollar) {
    let message = `Dollar to NIS rate has changed: ${currentRate.dollar}`;
    if (previousRateDollar !== null) {
      if (currentRate.dollar > previousRateDollar) {
        message += " 📈🟢"; // Green arrow up
      } else {
        message += " 📉🔴"; // Red arrow down
      }
    }

    console.log(message);
    bot.sendMessage(chatId, message);
    previousRateDollar = currentRate.dollar;
  }
};

// // Schedule the rate check to run every 10 minutes
const job = new CronJob("*/1 9-21 * * *", checkExchangeRate);
checkExchangeRate();
job.start();

console.log("Bot is running...");
