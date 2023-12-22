const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
let isClientReady = false;


const client = new Client({
    puppeteer: { headless: true },
    authStrategy: new LocalAuth()

});

client.initialize();

client.on('qr', (qr) => {
    console.log('Scan the QR code with your phone:');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', (session) => {
    console.log('Authenticated successfully!', session);
});
client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isClientReady = true; // Update the readiness flag
});

client.on("auth_failure", (msg) => {
    console.log("AUTH FAILURE", msg)
})
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Welcome to triangle sneacare API' });
});

app.post("/send", (req, res) => {
    if (!isClientReady) {
        return res.status(400).json({ message: 'Client not ready yet' });
    }

    let destination = req.query.customerNumber;
    let message = req.query.message;

    try {
        destination = destination.substring(1);
        destination = `62${destination}@c.us`;
        console.log(destination);
        console.log(message);
        
        client.sendMessage(destination, message).then(() => {
            res.status(200).json({ message: "success" });
        }).catch((error) => {
            res.status(400).json({ message: error });
        });
    } catch (e) {
        res.status(400).json({ message: e });
    }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
