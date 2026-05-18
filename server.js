import express from "express";
import pkg from "whatsapp-web.js";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

let qrCodeData = null;

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

client.on("ready", () => {
  console.log("WHATSAPP READY");
});

client.on("message", async (msg) => {
  console.log("NEW MESSAGE:", msg.body);
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
