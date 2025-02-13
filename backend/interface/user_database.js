import database from "../database.js";

export function getUserOfGsub(gsub) {
    return database.promisedGet("SELECT * FROM users WHERE Gsub = ?", [gsub])
}

export function getUserOfId(userId) {
    return database.promisedGet("SELECT * FROM users WHERE Id = ?", [userId])
}

export function getUserNameOfId(userId) {
    return database.promisedGet("SELECT name FROM users WHERE Id = ?", [userId]).then((data) => data.name)
}

export function createUser(name, email, picture, gsub) {
    needsCommitToFile = true;
    return database.promisedGet("INSERT INTO users (id, name, email, profile_picture, gsub) VALUES (NULL, ?, ?, ?, ?)", [name, email, picture, gsub]);
}