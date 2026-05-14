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

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    browserWSEndpoint: browser.wsEndpoint(),
  },
});

client.on("qr", (qr) => {
  console.log("QR RECEIVED");
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("WHATSAPP READY");

  // FULL CHAT FETCH
  const chats = await client.getChats();

  console.log("CHAT TOTALI:", chats.length);

  for (const chat of chats) {
    console.log({
      id: chat.id._serialized,
      name: chat.name,
      unread: chat.unreadCount,
      archived: chat.archived,
      isGroup: chat.isGroup,
    });
  }
});

client.on("message", async (message) => {
  console.log("NEW MESSAGE:", message.body);
});

app.post("/send-message", async (req, res) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing number or message",
      });
    }

    const chatId = `${number}@c.us`;

    await client.sendMessage(chatId, message);

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("WhatsApp Bridge Online");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

client.initialize();
