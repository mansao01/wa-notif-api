const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const cors = require("cors");
const app = express();
app.use(cors());
let isClientReady = false;
let QrCodeData = null;

const client = new Client({
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
  authStrategy: new LocalAuth(),
});

client.initialize();

client.on("qr", (qr) => {
  QrCodeData = qr;
});

client.on("authenticated", (session) => {
  console.log("Berhasil terautentikasi!", session);
});
client.on("loading_screen", (percent, message) => {
  console.log("SCREEN LOADING", percent, message);
});

client.on("ready", () => {
  console.log("Klien WhatsApp siap!");
  isClientReady = true;
});

client.on("auth_failure", (msg) => {
  console.log("KEGAGALAN OTENTIKASI", msg);
});

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Selamat datang di API triangle sneacare" });
});

app.get("/getqr", (req, res) => {
  if (!QrCodeData) {
    return res.status(400).json({ message: "Tidak ada data QR code tersedia" });
  }

  res.status(200).send(QrCodeData);
});

app.post("/send", async (req, res) => {
  if (!isClientReady) {
    return res.status(400).json({ message: "Client not ready yet" });
  }

  try {
    let destination = req.query.destination;
    let message = req.query.message;

    if (!destination || !message) {
      return res.status(400).json({ message: "Destination or message missing" });
    }

    destination = destination.substring(1);
    destination = `62${destination}@c.us`;

    console.log(destination);
    console.log(message);

    const checkUser = await client.isRegisteredUser(destination);
    if (!checkUser) {
      return res.status(400).json({ message: "User not registered" });
    }

    await client.sendMessage(destination, message);
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message || "An error occurred" });
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
module.exports = app;
