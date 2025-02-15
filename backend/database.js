import sqlite3 from "sqlite3";

const database = new sqlite3.Database("./database.db");
database.serialize();

var needsCommitToFile = false;;

async function promisedGet(query, params) {
    return new Promise((accept, reject) => {
        database.get(query, params, (err, data) => {
            if (err) reject(err)
            else accept(data)
        })
    }).catch((err)=>{if (err) console.log("Error in sql statement", query, params, err)});
}

async function promisedAll(query, params) {
    return new Promise((accept, reject) => {
        database.all(query, params, (err, data) => {
            if (err) reject(err)
            else accept(data)
        })
    }).catch((err)=>{if (err) console.log("Error in sql statement", query, params, err)});
}

async function promisedRun(query, params) {
    return new Promise((accept, reject) => {
        database.run(query, params, (err) => {
            if (err) reject(err)
            else accept()
        })
    }).catch((err)=>{console.log("Error in sql statement", query, params, err)});
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
    getLastInsertedRowId, promisedGet, promisedAll, promisedRun
}