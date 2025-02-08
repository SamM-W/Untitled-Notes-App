//Reflection: this should be replaced with a database system, that way tokens persist and can be renewed whenever the user uses it.
import crypto from "crypto";

var issuedTokensMap = {
    //Uncomment this to test code without signing in every server restart
    // "680d86ad26d189f47180aedaba3c76fb": { userId: 7, timeout: Date.now() + 65 * 1000 * 60 * 60 * 24 }
};

function generateRandomToken() {
    return crypto.randomBytes(16).toString('hex');
}

export function invalidateToken(token) {
    delete issuedTokensMap[token];
}

export function issueNewToken(userId) {
    var token = generateRandomToken();
    issuedTokensMap[token] = {
        userId: userId,
        timeout: Date.now() + 65 * 1000 * 60 * 60 * 24
    };
    return token;
}

export function getUserIdOfToken(token) {
    var tokenData = issuedTokensMap[token];

    if (!tokenData) return null;

    if (tokenData.timeout < Date.now()) {
        delete issuedTokensMap[token];
        return null;
    }

    return tokenData.userId;
}