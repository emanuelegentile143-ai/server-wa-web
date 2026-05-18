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

    await fetch(
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

    console.log("MESSAGE SENT TO SUPABASE");
  } catch (err) {
    console.error("INGEST ERROR:", err);
  }
});
