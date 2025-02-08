import sqlite3 from "sqlite3";

const database = new sqlite3.Database("./database.db");
database.serialize();

var needsCommitToFile = false;;

function promisedGet(query, params) {
    return new Promise((accept, reject) => {
        database.get(query, params, (err, data) => {
            if (err) reject(err)
            else accept(data)
        })
    });
}

function getUserOfGsub(gsub) {
    return promisedGet("SELECT * FROM users WHERE Gsub = ?", [gsub])
}

function getUserOfId(userId) {
    return promisedGet("SELECT * FROM users WHERE Id = ?", [userId])
}

function createUser(name, email, picture, gsub) {
    needsCommitToFile = true;
    return promisedGet("INSERT INTO users (Id, Name, Email, ProfilePicture, Gsub) VALUES (NULL, ?, ?, ?, ?)", [name, email, picture, gsub]);
}

function getLastInsertedRowId() {
    needsCommitToFile = true;
    return promisedGet("SELECT last_insert_rowid() as id", [])
}

setInterval(() => {
    if (needsCommitToFile) {
        console.log("Committing to file");
        database.serialize();
        needsCommitToFile = false;
    }
}, 2000);

export default {
    getUserOfGsub, getUserOfId, createUser, getLastInsertedRowId
}