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

function buildBlock(data) {
    var block = document.createElement("div");
    block.classList.add("app-block");

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
    while (pageElement.firstChild) {
        pageElement.firstChild.remove();
    }
    for (var block of currentPage.blocks) {
        block.element = buildBlock(block);
        pageElement.appendChild(block.element);
    }
}

function moveBlockAndNotify(from, to) {
    moveBlock(from, to);
    notifyMovedBlock(currentPage.blocks[to].id, to);
}

function moveBlock(from, to) {
    if (from == to) return;
    console.log(from, to);
    
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

async function insertNewBlockByUser(to, type) {
    var block = await insertNewBlock(to, type);
    onUserCreateBlock(block);
}

async function insertNewBlock(to, type) {
    if (currentPage.blocks.length == 0) {
        pageElement.children[0].remove();
    }

    var newBlock = {
        id: await getNextBlockId(),
        type: type,
        block_data: {}
    };
    sendNewBlockToServer(to, newBlock);
    insertNewBlockData(to, newBlock);
    return newBlock;
}

function insertNewBlockData(to, newBlock) {
    newBlock.element = buildBlock(newBlock);
    if (to == pageElement.children) {
        pageElement.appendChild(newBlock.element);
    } else {
        pageElement.insertBefore(newBlock.element, pageElement.children[to]);
    }
    currentPage.blocks.splice(to, 0, newBlock);
}

function refreshNewBlockData(blockId, blockData) {
    for (var block of currentPage.blocks) {
        if (block.id == blockId) {
            block.block_data = blockData.block_data;
            onDataChange(block);
            return;
        }
    }
}

function removeBlockAndNotify(blockId) {
    removeBlock(blockId);
    notifyRemovedBlock(blockId);
}

function removeBlock(blockId) {
    var index = currentPage.blocks.findIndex(item => item.id == blockId);
    var data = currentPage.blocks[index];

    data.element.remove();
    currentPage.blocks.splice(index, 1);

    if (currentPage.blocks.length == 0) {
        createEmptyPageHint();
    }
}