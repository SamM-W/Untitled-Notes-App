import { getUserIdOfToken } from "../backend/authentication.js";
import { getTokenOfRequestCookie } from "./api/rest/rest_api.js";

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
                    non_fatal_error_id: "invalid_token",
                }));
                ws.close();
                console.log("Bad connection token, terminated");
            } else {
                console.log("valid token");
            }
        } catch (e) {
            //The normal errors are taken by app.ws and there is no return value
            console.error(e);
        }
    });
}