const admin = require("firebase-admin");
const serviceAccount = require("../lazyker-568c4-firebase-adminsdk-b7xs7-03f3744551");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lazyker-568c4.firebaseio.com"
});

const debrid = require('./debrid_links');

test('get user torrents', async () => {
    expect(debrid.getTorrents(await admin.auth().getUser('TFbtVsqJfPMpUhsoWh7ETYMipqY2'))).not.toBeNull();
});

