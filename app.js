import { Client  } from 'whatsapp-web.js';
import express from 'express';
import fs from 'fs';
import qrcode from 'qrcode-terminal';

const app = express();

const SESSION_FILE_PATH = './session.json';
let sessionCfg;

if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
    puppeteer: { headless: true },
    session: sessionCfg

});

client.initialize();

client.on('qr', (qr) => {
    console.log('Scan the QR code with your phone:');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', (session) => {
    console.log('Authenticated successfully!', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.on("auth_failure", (msg) =>{
    console.log("AUTH FAILURE", msg)
})
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Welcome to triangle sneacare API' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
