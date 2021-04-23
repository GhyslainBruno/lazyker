// Import Admin SDK
// const admin = require("firebase-admin");
import * as admin from 'firebase-admin';

// Get a database reference to our blog
const db = admin.database();
const usersRef = db.ref("/users");

module.exports = (app: any) => {
    app.get('/api/test', function(req: any, res: any) {

        usersRef.set({
            alanisawesome: {
                date_of_birth: "June 23, 1912",
                full_name: "Alan Turing"
            },
            gracehop: {
                date_of_birth: "December 9, 1906",
                full_name: "Grace Hopper"
            }
        });

        res.send();
    });
};
