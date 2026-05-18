import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

let qrCodeData = null;

const SUPABASE_INGEST_URL =
  "https://vxoyeupdgzhnrircuzjl.supabase.co/functions/v1/wa-web-ingest";

const INGEST_KEY = "ESSENTIAL_WA_SECRET";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  },
});

client.on("qr", async (qr) => {
  console.log("QR RECEIVED");

  qrCodeData = await qrcode.toDataURL(qr);
});

client.on("ready", async () => {
  console.log("WHATSAPP READY");

  await fetch(SUPABASE_INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ingest-key": INGEST_KEY,
    },
    body: JSON.stringify({
      type: "instance_status",
      instance_id: "essential_main",
      status: "connected",
    }),
  });
});

client.on("message", async (msg) => {
  console.log("NEW MESSAGE:", msg.body);

  try {
    await fetch(SUPABASE_INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ingest-key": INGEST_KEY,
      },
      body: JSON.stringify({
        type: "message_in",
        instance_id: "essential_main",
        wa_chat_id: msg.from,
        wa_message_id: msg.id.id,
        from: msg.from,
        body: msg.body,
        timestamp: new Date().toISOString(),
        contact_name: msg._data.notifyName || null,
      }),
    });

    console.log("MESSAGE SENT TO SUPABASE");
  } catch (err) {
    console.error("SUPABASE INGEST ERROR", err);
  }
});

app.get("/", (req, res) => {
  res.send("WhatsApp Web Server Online");
});

app.get("/qr", (req, res) => {
  if (!qrCodeData) {
    return res.send(`
      <html>
        <body style="
          background:#111;
          color:white;
          display:flex;
          justify-content:center;
          align-items:center;
          height:100vh;
          font-family:Arial;
        ">
          <h1>QR non disponibile...</h1>
        </body>
      </html>
    `);
  }

  return res.send(`
    <html>
      <body style="
        margin:0;
        background:#111;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        font-family:Arial;
      ">

        <div style="
          background:white;
          padding:30px;
          border-radius:24px;
          text-align:center;
          box-shadow:0 0 40px rgba(0,0,0,0.5);
        ">

          <h1 style="
            color:#111;
            margin-bottom:20px;
          ">
            Collega WhatsApp
          </h1>

          <img
            src="${qrCodeData}"
            width="320"
            style="
              border-radius:12px;
            "
          />

          <p style="
            margin-top:20px;
            color:#666;
            font-size:14px;
          ">
            WhatsApp → Dispositivi collegati → Collega dispositivo
          </p>

        </div>

      </body>
    </html>
  `);
});

client.initialize();

app.listen(PORT, () => {
  console.log("SERVER RUNNING ON PORT", PORT);
});
