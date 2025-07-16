const {Client, LocalAuth} = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
let isClientReady = false;


const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    },
    authStrategy: new LocalAuth()

});

client.initialize();

client.on('qr', (qr) => {
    console.log('Scan the QR code with your phone:');
    qrcode.generate(qr, {small: true});
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
    res.status(200).json({msg: 'Welcome to triangle sneacare API'});
});

app.post("/send", async (req, res) => {
    if (!isClientReady) {
        return res.status(400).json({message: 'Client not ready yet'});
    }

    try {
        let destination = req.query.destination;
        let message = req.query.message;

        if (!destination || !message) {
            return res.status(400).json({message: 'Destination or message missing'});
        }

        destination = destination.substring(1);
        destination = `62${destination}@c.us`;

        console.log(destination);
        console.log(message);

        const checkUser = await client.isRegisteredUser(destination);
        if (!checkUser) {
            return res.status(400).json({message: "User not registered"});
        }

        await client.sendMessage(destination, message);
        res.status(200).json({message: "Message sent successfully"});
    } catch (error) {
        res.status(400).json({message: error.message || 'An error occurred'});
    }
});

app.post("/sendConfirmation", async (req, res) => {
    if (!isClientReady) {
        return res.status(400).json({message: 'Client not ready yet'});
    }

    try {
        let destination = req.query.destination.trim();
        let courierName = req.query.courier;
        let trackNumber = req.query.tn
        let sendMessage = `permisi kak kami dari Lazada Express mau mengonfirmasi apakah sudah menerima paket dengan resi ${trackNumber} ? cs. ${courierName} `;


        if (!destination || !courierName) {
            return res.status(400).json({message: 'Destination or message missing'});
        }

        destination = destination.substring(1);
        destination = `62${destination}@c.us`;

        console.log(destination);
        console.log(sendMessage);
        console.log(courierName);

        const checkUser = await client.isRegisteredUser(destination);
        if (!checkUser) {
            return res.status(400).json({message: "User not registered"});
        }

        await client.sendMessage(destination, sendMessage);
        res.status(200).json({message: "Message sent successfully"});
    } catch (error) {
        res.status(400).json({message: error.message || 'An error occurred'});
    }
});

app.post("/sendOverloadConfirmation", async (req, res) => {
    if (!isClientReady) {
        return res.status(400).json({message: 'Client not ready yet'});
    }

    try {
        let destination = req.query.destination.trim();
        let message = "permisi kak kami dari Lazada Express mau mengonfirmasi bahwa kurir kami overload, jadi paket kakak akan dikirmkan besok. Terimakasih.";


        if (!destination) {
            return res.status(400).json({message: 'Destination or message missing'});
        }

        destination = destination.substring(1);
        destination = `62${destination}@c.us`;

        console.log(destination);
        console.log(message);


        const checkUser = await client.isRegisteredUser(destination);
        if (!checkUser) {
            return res.status(400).json({message: "User not registered"});
        }

        await client.sendMessage(destination, message);
        res.status(200).json({message: "Message sent successfully"});
    } catch (error) {
        res.status(400).json({message: error.message || 'An error occurred'});
    }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
