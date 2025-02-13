import { getUserIdOfToken } from "../../../backend/authentication.js";
import { buildPageApi } from "./page_api.js";
import { buildUserApi } from "./user_api.js";

const tokenOfCookieString = /authToken=([^;]+)/;
export function getTokenOfRequestCookie(req) {
    var cookie = req.get("cookie");
    if (!cookie) return null
    var match = cookie.match(tokenOfCookieString);
    if (!match) return null;
    var token = match[1].trim();
    if (!token) return null;
    return token;
}

export function addAuthorisedHandler(path, handler) {
    API_HANDLERS[path] = async function (req) {
        var token = getTokenOfRequestCookie(req);
        var userId = getUserIdOfToken(token);

        if (!userId) {
            return {
                status: "error",
                message: `invalid token ${getTokenOfRequestCookie(req)}`,
                non_fatal_error_id: "invalid_token",
            };
        }

        return await handler(req, userId, token);
    };
}

const API_HANDLERS = {};
export function addHandler(path, handler) {
    API_HANDLERS[path] = handler;
}

export function assertFieldFormat(body, fields, formats) {
    var i = 0;
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (!body[field]) {
            return {
                status: "error",
                message: `missing field in request '${field}'`
            }
        }
        if (!formats[i].test(body[field])) {
            return {
                status: "error",
                message: `field '${field}' has invalid format`
            }
        }
    }
    return null;
}

addAuthorisedHandler("ping_authorised", async function (req, userId) {
    return {
        status: "success",
        message: "pong but with auth! Hello user " + userId
    };
});

addHandler("ping", function (req) {
    return {
        status: "success",
        message: "pong!"
    };
});

export async function handleRestAPIRequest(target, req) {
    if (API_HANDLERS[target]) {
        return await API_HANDLERS[target](req);
    }

    return {
        status: "error",
        message: `invalid API endpoint '${target}'`
    }
}

buildUserApi();
buildPageApi();