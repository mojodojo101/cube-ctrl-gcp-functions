const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original
exports.webhooks = functions.https.onRequest(async (req, res) => {
    const postParamtext = req.body.text;
    const postParamwebhook = req.body.webhook;


    const docRef = admin.firestore().collection("Webhooks").doc(postParamwebhook);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {

        res.json({result: `Could not find Webhooks document with ID: ${docRef.id}`});
        return
    }
   
    const data = snapshot.data();
    const updateKey = data.updateKey;
    
    const viewSnapshot = await data.view.get();
    if (!viewSnapshot.exists) {
        res.json({result: `Could not find CubeViews document with ID: ${data.view.id}`});
        return
    }
    
    const view = viewSnapshot.data();
    view.flags["file"] = postParamtext;
    const viewRes = await data.view.set(view);
    

    const userSnapshot = await data.user.get();
    if (!userSnapshot.exists) {
        res.json({result: `Could not find Users document with ID: ${data.user.id}`});
        return
    }
        
    const user = userSnapshot.data();
    user.currentView=data.view.id;
    const userRes = await data.user.set(user);
    
    res.json({result: `Message with ID: ${snapshot.id} added.`});
  });