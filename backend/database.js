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

function promisedAll(query, params) {
    return new Promise((accept, reject) => {
        database.all(query, params, (err, data) => {
            if (err) reject(err)
            else accept(data)
        })
    });
}

setInterval(() => {
    if (needsCommitToFile) {
        console.log("Committing to file");
        database.serialize();
        needsCommitToFile = false;
    }
}, 2000);

function getLastInsertedRowId() {
    needsCommitToFile = true;
    return promisedGet("SELECT last_insert_rowid() as id", [])
}

export default {
    getLastInsertedRowId, promisedGet, promisedAll
}