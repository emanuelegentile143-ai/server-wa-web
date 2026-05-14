import express from "express";
import pkg from "whatsapp-web.js";
import QRCode from "qrcode";
import puppeteer from "puppeteer";

const { Client, LocalAuth } = pkg;

const app = express();

const PORT = process.env.PORT || 8080;

let latestQr = null;

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
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

client.on("qr", async (qr) => {
  console.log("QR RECEIVED");
  latestQr = await QRCode.toDataURL(qr);
});

client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
  latestQr = null;
});

client.initialize();

app.get("/", (req, res) => {
  if (latestQr) {
    res.send(`
      <html>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111;color:white;font-family:sans-serif;flex-direction:column;">
          <h2>Scan WhatsApp QR</h2>
          <img src="${latestQr}" width="350" />
        </body>
      </html>
    `);
  } else {
    res.send("WhatsApp Bridge Online");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
