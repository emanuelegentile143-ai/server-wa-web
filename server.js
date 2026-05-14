import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import puppeteer from "puppeteer";

const { Client, LocalAuth } = pkg;

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--single-process",
    "--no-zygote"
  ]
});

const wsEndpoint = browser.wsEndpoint();

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    browserWSEndpoint: wsEndpoint
  }
});

client.on("qr", (qr) => {
  console.log("QR RECEIVED");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
});

client.initialize();

app.get("/", (req, res) => {
  res.send("WhatsApp Bridge Online");
});

app.post("/send-message", async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: "Numero o messaggio mancanti"
      });
    }

    const chatId = number.includes("@c.us")
      ? number
      : `${number}@c.us`;

    await client.sendMessage(chatId, message);

    res.json({
      success: true,
      sent_to: number
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
