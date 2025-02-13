//Page block format
// {
//     blockId: "<UUID>"
//     type: "text",
//     element?: ...,
//     blockData: {
//         content: "HI"
//     }
// }

var pageElement = document.getElementById("app_blocks");
var currentPage = {
    blocks: [
    ]
}

var emptyPageHintPresent = true;

var pageChanged = false;
function notifyPageChanged() {
    pageChanged = true;
}

function buildBlock(data) {
    var block = document.createElement("div");
    block.classList.add("app-block");
    block.id = "block-" + data.blockId;

    var blockInner = document.createElement("div");
    blockInner.classList.add("app-block-inner");
    blockInner.appendChild(buildInnerBlock(data));
    block.appendChild(blockInner);

    var blockOptions = document.createElement("div");
    blockOptions.classList.add("app-block-options");
    blockOptions.innerHTML = `<div class="app-block-drag">⋯</div><div class="app-block-add">+</div>`;
    block.appendChild(blockOptions);

    addDraggerFunction(block, data);
    addAddBlockFunction(block, ()=>(currentPage.blocks.indexOf(data) + 1));

    return block;
}

function createEmptyPageHint() {
    var hintBlock = document.createElement("div");
    hintBlock.classList.add("app-block");

    var blockInner = document.createElement("div");
    blockInner.classList.add("app-block-inner");
    blockInner.id = "empty_hint_block_inner";
    blockInner.innerText = "Looks like the page is empty, click the + below to get started!";
    hintBlock.appendChild(blockInner);

    var blockOptions = document.createElement("div");
    blockOptions.id = "empty_hint_block_options";
    blockOptions.classList.add("app-block-options");
    blockOptions.innerHTML = `<div id="empty_hint_add_button" class="app-block-add">+</div>`;
    hintBlock.appendChild(blockOptions);
    addAddBlockFunction(hintBlock, ()=>0);

    pageElement.appendChild(hintBlock);
}

function rebuildContents() {
    if (currentPage.blocks.length == 0) {
        createEmptyPageHint();
    }
    for (var block of currentPage.blocks) {
        if (block.element) block.element.remove();
        block.element = buildBlock(block);
        pageElement.appendChild(block.element);
    }
}

function moveBlock(from, to) {
    if (from == to) return;

    var fromElement = currentPage.blocks[from].element;
    pageElement.removeChild(fromElement);

    if (to == pageElement.children.length) {
        pageElement.appendChild(fromElement);
    } else {
        var toElement = pageElement.children[to];
        pageElement.insertBefore(fromElement, toElement);
    }

    var movedElement = currentPage.blocks.splice(from, 1)[0];
    currentPage.blocks.splice(to, 0, movedElement);
}

function insertNewBlockByUser(to, type) {
    var block = insertNewBlock(to, type);
    onUserCreateBlock(block);
}

function insertNewBlock(to, type) {
    if (currentPage.blocks.length == 0) {
        pageElement.children[0].remove();
    }

    var newBlock = {
        block_id: undefined,
        type: type,
        block_data: {}
    };
    newBlock.element = buildBlock(newBlock);
    if (to == pageElement.children) {
        pageElement.appendChild(newBlock.element);
    } else {
        pageElement.insertBefore(newBlock.element, pageElement.children[to]);
    }
    currentPage.blocks.splice(to, 0, newBlock);
    return newBlock;
}

function removeBlock(data) {
    var index = currentPage.blocks.indexOf(data);

    data.element.remove();
    currentPage.blocks.splice(index, 1);

    if (currentPage.blocks.length == 0) {
        createEmptyPageHint();
    }
}

addEventListener("load", () => {
    var currentPageId = 1;

    callAuthorisedApi("/api/get_page", { pageId: currentPageId })
        .then((response) => {
            console.log("Recived page data", response.content);
            document.getElementById("page_name").innerText = response.content.name;
            document.getElementById("page_owner").innerText = response.content.owner_name;
            currentPage = response.content;
            rebuildContents();
        });

    var pageSocket = new WebSocket(`ws://localhost:8080/api/ws/page?page_id=${currentPageId}`);
    pageSocket.addEventListener("open", (e) => {
        console.log("Opened page edit socket");
    });
    pageSocket.addEventListener("close", (e) => {
        console.log("Closed page edit socket", e);
    });
    pageSocket.addEventListener("message", (e) => {
        console.log("Recived message on page edit socket", e);
    });
});
