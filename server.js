app.get("/qr", (req, res) => {
  if (!qrCodeData) {
    return res.send(`
      <html>
        <head>
          <title>WhatsApp QR</title>
        </head>

        <body style="
          margin:0;
          background:#0f0f0f;
          color:white;
          display:flex;
          justify-content:center;
          align-items:center;
          height:100vh;
          font-family:Arial, sans-serif;
        ">
          <div style="
            text-align:center;
            padding:40px;
            border-radius:20px;
            background:#1a1a1a;
            box-shadow:0 0 30px rgba(0,0,0,0.5);
          ">
            <h2 style="margin:0 0 10px 0;">
              QR non ancora disponibile
            </h2>

            <p style="
              margin:0;
              color:#999;
            ">
              Attendi qualche secondo...
            </p>
          </div>
        </body>
      </html>
    `);
  }

  res.send(`
    <html>
      <head>
        <title>WhatsApp Connection</title>
      </head>

      <body style="
        margin:0;
        background:#0f0f0f;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        font-family:Arial, sans-serif;
      ">

        <div style="
          background:white;
          padding:30px;
          border-radius:24px;
          text-align:center;
          box-shadow:0 0 40px rgba(0,0,0,0.45);
          width:380px;
        ">

          <h1 style="
            margin-top:0;
            margin-bottom:20px;
            color:#111;
            font-size:28px;
          ">
            Collega WhatsApp
          </h1>

          <img 
            src="${qrCodeData}" 
            style="
              width:320px;
              height:320px;
              border-radius:12px;
            "
          />

          <p style="
            margin-top:20px;
            margin-bottom:0;
            color:#666;
            font-size:14px;
            line-height:1.5;
          ">
            Apri WhatsApp sul telefono <br />
            → Dispositivi collegati <br />
            → Collega un dispositivo
          </p>

        </div>

      </body>
    </html>
  `);
});
