import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth } = pkg;

const app = express();

const PORT = process.env.PORT || 3000;

const client = new Client({
  authStrategy: new LocalAuth(),

  puppeteer: {
    executablePath: "/usr/bin/chromium",
    headless: true,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu"
    ]
  }
});

client.on("qr", (qr) => {
  console.log("QR RECEIVED");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated!");
});

client.on("auth_failure", (msg) => {
  console.error("AUTH FAILURE", msg);
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp disconnected:", reason);
});

client.initialize();

app.get("/", (req, res) => {
  res.send("WhatsApp Bridge Online");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
