process.env.VAPID_PUBLIC_KEY = 'BBDoTTPbc2hd8CKh6EiKMYnxX05DxKk81GzM1PHCfjf5R38Pu4LLunYGEiHnr3egXUZW4_dkuoRHzIPGF0QRc8M';
process.env.VAPID_PRIVATE_KEY = '4OLIXR_JkfsXVRIvaxWe9bRMabiM5NxwSgRoMf8lhQc';

const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY '
        + 'environment variables. You can use the following ones:');
    console.log(webPush.generateVAPIDKeys());
    process.exit();
}

// Set the keys used for encrypting the push messages.


webPush.setVapidDetails('https://serviceworke.rs/', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/vapidPublicKey', (req, res) => {
    res.send(process.env.VAPID_PUBLIC_KEY);
});

app.post('/register', (req, res) => {
    // A real world application would store the subscription info.
    res.sendStatus(201);
});

app.post('/sendNotification', (req, res) => {
    const t = 0;
    const { subscription, payload } = req.body;
    const options = { TTL: req.body.ttl };
    setTimeout(() => {
        webPush.sendNotification(subscription, payload, options)
            .then(() => {
                res.sendStatus(201);
            })
            .catch((error) => {
                console.log(error);
                res.sendStatus(500);
            });
    }, req.body.delay * 1000);
});


app.get('/favicon.ico', (req, res) => res.status(204));

app.use(require('express-static')('./'));

console.log('listening ...');
app.listen(5500);
