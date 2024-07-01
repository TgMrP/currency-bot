import { config } from "dotenv";
config();
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { CronJob } from "cron";

const token: string = process.env.TELEGRAM_BOT_TOKEN || "";
const chatId: string = process.env.TELEGRAM_CHAT_ID || "";

const bot = new TelegramBot(token, { polling: true });

let previousRate: number | null = null;

interface ExchangeRateResponse {
  key: string;
  currentExchangeRate: number;
  currentChange: number;
  unit: number;
  lastUpdate: string;
}

// Function to fetch exchange rate
const fetchExchangeRate = async (): Promise<number | null> => {
  try {
    const response = await axios.get<ExchangeRateResponse>(
      "https://boi.org.il/PublicApi/GetExchangeRate?key=eur"
    );
    const rate = response.data.currentExchangeRate;
    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
};

// Function to check and notify about exchange rate changes
const checkExchangeRate = async () => {
  const currentRate = await fetchExchangeRate();
  console.log(`Start checking exchange rate at ${new Date()}`);
  if (currentRate && currentRate !== previousRate) {
    console.log(`Euro to NIS rate has changed: ${currentRate}`);
    bot.sendMessage(chatId, `Euro to NIS rate has changed: ${currentRate}`);
    previousRate = currentRate;
  }
};

// Schedule the rate check to run every minute
const job = new CronJob("* * * * *", checkExchangeRate);
checkExchangeRate();
job.start();

console.log("Bot is running...");
