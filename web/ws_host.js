import { getUserIdOfToken } from "../backend/authentication.js";
import { getTokenOfRequestCookie } from "./api/rest/rest_api.js";
import { handleNewConnection } from "./api/websocket/editor.js";

const pageIdParamOfUrl = /\?[^&]*page_id=([0-9]+)/

export function addWebsocketRoute(app) {
    app.ws("/api/ws/page", function (ws, req) {
        try {
            var token = getTokenOfRequestCookie(req);
            var userId = getUserIdOfToken(token);
            console.log("New websocket connection UID:", userId);
    
            if (!userId) {
                ws.send(JSON.stringify({
                    status: "error",
                    message: `invalid token ${token}`,
                }));
                ws.close();
                console.log("Bad connection token, terminated");
            } else {
                var pageId = parseInt(pageIdParamOfUrl.exec(req.url)[1]);
                if (pageId == undefined || pageId == NaN) {
                    ws.send(JSON.stringify({
                        status: "error",
                        message: `invalid pageid ${pageIdParamOfUrl.exec(req.url)[1]}`,
                    }));
                    ws.close();
                    console.log("Bad connection page, terminated");
                } else {
                    handleNewConnection(ws, pageId, req, userId);
                }
            }
        } catch (e) {
            //The normal errors are taken by app.ws, so this makes sure i can see if anything goes wrong
            console.error(e);
        }
    });
}