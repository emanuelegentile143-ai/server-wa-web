import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import qr from "qrcode";
import puppeteer from "puppeteer";

const { Client, LocalAuth } = pkg;

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

let qrCodeData = null;

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
  ],
});

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    browserWSEndpoint: browser.wsEndpoint(),
  },
});

client.on("qr", async (qrCode) => {
  console.log("QR RECEIVED");

  qrcode.generate(qrCode, { small: true });

  qrCodeData = await qr.toDataURL(qrCode);
});

client.on("ready", () => {
  console.log("WHATSAPP READY");
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTH FAILURE", msg);
});

client.on("disconnected", (reason) => {
  console.log("DISCONNECTED", reason);
});

client.on("message", async (msg) => {
  try {
    if (!msg.from.endsWith("@c.us")) return;

    const contact = await msg.getContact();

    const payload = {
      type: "message_in",
      instance_id: "essential_main",
      sede: "montenero",
      wa_chat_id: msg.from,
      wa_message_id: msg.id._serialized,
      from: msg.from,
      body: msg.body || "",
      timestamp: new Date().toISOString(),
      contact_name:
        contact.pushname ||
        contact.name ||
        contact.number ||
        "Unknown",
      contact_phone: `+${contact.number}`,
    };

    console.log("INGEST PAYLOAD:", payload);

    const response = await fetch(
      "https://vxoyeupdgzhnrircuzjl.supabase.co/functions/v1/wa-web-ingest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ingest-key": process.env.WA_WEB_INGEST_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.text();

    console.log("SUPABASE RESPONSE:", result);
  } catch (err) {
    console.error("INGEST ERROR:", err);
  }
});

client.initialize();

app.get("/", (req, res) => {
  res.send("WhatsApp Web Server Running");
});

app.get("/qr", (req, res) => {
  if (!qrCodeData) {
    return res.status(404).json({
      success: false,
      message: "QR not ready yet",
    });
  }

  res.json({
    success: true,
    qr: qrCodeData,
  });
});

app.get("/status", async (req, res) => {
  try {
    const state = await client.getState();

    res.json({
      success: true,
      state,
    });
  } catch (e) {
    res.json({
      success: false,
      error: String(e),
    });
  }
});

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
