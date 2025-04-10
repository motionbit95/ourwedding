const functions = require("firebase-functions");
const app = require("./app");

exports.api = functions.https.onRequest(
  { memory: "512MiB", timeoutSeconds: 120 },
  app
);
