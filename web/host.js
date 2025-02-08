import express from "express";
import { useStaticCompiles } from "./partialTemplates.js";
import { handleAPIRequest } from "./api.js";

console.log("Starting web...");

const app = express();

app.use(express.json());
app.all("/api/*", async (req, res) => {
    var apiTarget = req.url.substring(5);
    var apiResponse = await handleAPIRequest(apiTarget, req);
    res.end(JSON.stringify(apiResponse));
});

app.use((req, res, next) => {
    //If the request is to /, send request to /index.html
    if (req.path == '/') {
        req.url = '/index.html';
    }
    //Add .html in the case that the request path doesent include a file extension
    if (!req.path.includes('.')) {
        req.url += '.html';
    }
    next();
})
useStaticCompiles(app);
app.use(express.static('public', {
    setHeaders: (res) => {
        res.set("Referrer-Policy", "no-referrer-when-downgrade");
    }
}));

app.listen(8080, () => {
    console.log("Listening on 8080, and serving ./public");
})