import { getPageData, savePageData } from "../../../backend/interface/page_database.js";

var activeSessions = {};

//My own hash-like function to get a number from the string, used to verify the page contents are the same
function createHashCodeOfString(string) {
    var r = 0;
    for (var i = 0; i < string.length; i++) {
        r ^= (string.charCodeAt(i) << ((i+r) % 20));
    }
    return r;
}

class ActiveSessionSocket {
    constructor(ws, userId) {
        this.ws = ws;
        this.userId = userId;
    }
}

class LivePageSession {
    constructor(pageId, pageData) {
        this.pageId = pageId;
        this.pageData = pageData;
        this.maxBlockId = 1;
        for (var block of pageData.blocks) {
            this.maxBlockId = Math.max(block.id + 1, this.maxBlockId);
        }
        this.activeSockets = [];
        this.debugUUID = crypto.randomUUID();
        this.nextSyncTimeout = undefined;
    }

    addConnection(ws, userId) {
        var socket = new ActiveSessionSocket(ws, userId);
        this.bindEvents(socket);
        this.activeSockets.push(socket);
    }

    processClientMessage(socket, body) {
        if (body.type == "get_next_block_id") {
            socket.ws.send(JSON.stringify({
                type: "next_block_id",
                id: this.nextBlockId()
            }));
        } else if (body.type == "refresh") {
            this.sendPageUpdate(socket, "refresh_response", { pageData: this.pageData });
        } else if (body.type == "new_block") {
            this.pageData.blocks.splice(body.to, 0, body.block);
            this.sendPageUpdateToOthers(socket, "new_block", { to: body.to, block: body.block });
        } else if (body.type == "remove_block") {
            this.pageData.blocks = this.pageData.blocks.filter(item => item.id != body.id);
            this.sendPageUpdateToOthers(socket, "remove_block", { id: body.id });
        } else if (body.type == "move_block") {
            var from = this.pageData.blocks.findIndex(item => item.id == body.id)
            var movedBlock = this.pageData.blocks.splice(from, 1)[0];
            this.pageData.blocks.splice(body.to, 0, movedBlock);

            for (var otherSocket of this.activeSockets) {
                if (otherSocket == socket) continue;
                otherSocket.ws.send(JSON.stringify({
                    type: "move_block",
                    id: body.id,
                    to: body.to
                }));
            }
        } else if (body.type == "block_changed") {
            this.blockOfId(body.block.id).block_data = body.block.block_data;
            this.sendPageUpdateToOthers(socket, "block_changed", { block: body.block })
        }

        if (!this.nextSyncTimeout) {
            var session = this;
            this.nextSyncTimeout = setTimeout(()=>{
                savePageData(session.pageData)
                    .catch((err)=>{if (err) console.log("Error in page serialisation", err)});
                this.nextSyncTimeout = undefined;
            }, 10000);
        }
    }

    bindEvents(socketToBind) {
        const socket = socketToBind;
        socket.ws.on("message", (e) => {
            var body = JSON.parse(e);
            this.processClientMessage(socket, body);
        });
        socket.ws.on("close", (e) => {
            console.log("Session member closed connection", e);
            this.activeSockets = this.activeSockets.filter(item => item != socket)
        })
        socket.ws.on("error", (e) => console.error(e));
    }

    sendPageUpdateToOthers(socket, type, data) {
        for (var otherSocket of this.activeSockets) {
            if (otherSocket == socket) continue;
            this.sendPageUpdate(otherSocket, type, data);
        }
    }

    sendPageUpdate(socket, type, data) {
        data.type = type;
        data.hash = this.getPageHash();
        socket.ws.send(JSON.stringify(data));
    }

    blockOfId(blockId) {
        return this.pageData.blocks.find(item => item.id == blockId);
    }

    getPageHash() {
        return createHashCodeOfString(JSON.stringify(this.pageData));
    }

    nextBlockId() {
        this.maxBlockId++;
        return this.maxBlockId;
    }
}

export async function handleNewConnection(ws, pageId, req, userId) {
    var session = activeSessions[pageId]
    if (!session) {
        //Load the page from the database
        var pageData = await getPageData(pageId);
        //Create the session
        session = new LivePageSession(pageId, pageData);
        activeSessions[pageId] = session;
    }
    session.addConnection(ws, userId);
}

export function getOpenSessionPageData(pageId) {
    if (activeSessions[pageId]) return activeSessions[pageId].pageData;
}