var currentPageId = 1;
var pageSocket = new WebSocket(`ws://localhost:8080/api/ws/page?page_id=${currentPageId}`);

//My own hash-like function to get a number from the string, used to verify the page contents are the same
function generateHashOfString(string) {
    var r = 0;
    for (var i = 0; i < string.length; i++) {
        r ^= (string.charCodeAt(i) << ((i+r) % 20));
    }
    return r;
}

function generateHashOfPageData() {
    var hashedObject = JSON.parse(JSON.stringify(currentPage));
    for (var block of hashedObject.blocks) {
        delete block.element;
    }
    return generateHashOfString(JSON.stringify(hashedObject));
}

function sendRefreshRequest() {
    console.info("Page became desynced with server, calling full page resync");
    pageSocket.send(JSON.stringify({type:"refresh"}));
}

function checkPageHash(hash) {
    var pageHash = generateHashOfPageData();
    if (hash != pageHash) {
        console.log("Failed check to", currentPage);
        sendRefreshRequest();
    }
}

addEventListener("load", () => {

    callAuthorisedApi("/api/get_page", { pageId: currentPageId })
        .then((response) => {
            console.log("Recived page data", response.content);
            document.getElementById("page_name").innerText = response.content.name;
            document.getElementById("page_owner").innerText = response.content.owner_name;
            currentPage = response.content;
            rebuildContents();
        });

    pageSocket.addEventListener("open", (e) => {
        console.log("Opened page edit socket");
    });
    pageSocket.addEventListener("close", (e) => {
        console.log("Closed page edit socket", e);
    });
    pageSocket.addEventListener("message", (e) => {
        var body = JSON.parse(e.data ? e.data : "");
        // if (body.type != "block_changed") console.log("Recived (Non block edit) message on page edit socket", body);
        
        if (body.type == "refresh_response") {
            currentPage = body.pageData;
            rebuildContents();
        } else if (body.type == "next_block_id") {
            var wrapped = nextBlockIdPromiseQueue.pop();
            wrapped.resolve(body.id);
        } else if (body.type == "new_block") {
            insertNewBlockData(body.to, body.block);
        } else if (body.type == "remove_block") {
            removeBlock(body.id);
        } else if (body.type == "move_block") {
            moveBlock(currentPage.blocks.findIndex(item => item.id == body.id), body.to);
        } else if (body.type == "block_changed") {
            refreshNewBlockData(body.block.id, body.block);
        }

        if (body.hash) {
            checkPageHash(body.hash);
        }
    });
});

var nextBlockIdPromiseQueue = [];
function getNextBlockId() {
    var promiseWrapper = {};
    promiseWrapper.promise = new Promise((resolve, reject) => {
        promiseWrapper.resolve = resolve;
        promiseWrapper.reject = reject;
    });
    nextBlockIdPromiseQueue.push(promiseWrapper);
    pageSocket.send(JSON.stringify({ type:"get_next_block_id" }));
    return promiseWrapper.promise;
}

function sendNewBlockToServer(to, newBlock) {
    var blockToSend = newBlock;
    delete blockToSend.element;
    pageSocket.send(JSON.stringify({
        type: "new_block",
        block: blockToSend,
        to: to
    }));
}

function notifyBlockChanged(blockData) {
    pageSocket.send(JSON.stringify({
        type: "block_changed",
        block: blockData
    }));
}

function notifyRemovedBlock(blockId) {
    pageSocket.send(JSON.stringify({
        type: "remove_block",
        id: blockId
    }));
}

function notifyMovedBlock(blockId, to) {
    pageSocket.send(JSON.stringify({
        type: "move_block",
        id: blockId,
        to: to
    }));
}