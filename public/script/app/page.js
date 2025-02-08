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
        {
            blockId: "5aca6fb9-1134-437a-b3f2-df8ae87f27ec",
            type: "text",
            typeContent: {
                text: "HI 5aca6fb9-1134-437a-b3f2-df8ae87f27ec"
            }
        },
        {
            blockId: "8ba7ebca-5cbe-41a0-ae00-888945561bb1",
            type: "text",
            typeContent: {
                text: "HI 8ba7ebca-5cbe-41a0-ae00-888945561bb1"
            }
        }
    ]
}

var pageChanged = false
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
    addAddBlockFunction(block, data);

    return block;
}

function rebuildContents() {
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
        var toElement = currentPage.blocks[to].element;
        console.log(fromElement);
        pageElement.insertBefore(fromElement, toElement);
    }

    var movedElement = currentPage.blocks.splice(from, 1)[0];
    currentPage.blocks.splice(to, 0, movedElement);
}

function insertNewBlock(to, type) {
    var newBlock = {
        blockId: crypto.randomUUID(),
        type: type,
        typeContent : {}
    };
    newBlock.element = buildBlock(newBlock);
    if (to == pageElement.children) {
        pageElement.appendChild(newBlock.element);
    } else {
        pageElement.insertBefore(newBlock.element, pageElement.children[to]);
    }
    currentPage.blocks.splice(to, 0, newBlock);
}

addEventListener("load", () => {
    rebuildContents();
})
