var BLOCK_DEFS = {};
function addBlockHandling(type, description, handler) {
    BLOCK_DEFS[type] = {description, handler};
    return {
        withOnCreate: (onCreate) => { BLOCK_DEFS[type].onCreate = onCreate; }
    }
}

//Provide some generic functions for the blocks
function handleGenericTextBox(className, data) {
    const textArea = document.createElement("div");
    textArea.contentEditable = "true";
    textArea.classList.add(className);
    textArea.innerText = data.typeContent.text ? data.typeContent.text : "";
    textArea.addEventListener("input", (e) => {
        data.typeContent.text = textArea.innerText;
        notifyPageChanged();
    });
    textArea.addEventListener("keydown", (e) => {
        if (e.code == "Backspace" && textArea.innerText == "") {
            removeBlock(data);
        } else if (e.code == "Enter") {
            e.preventDefault();
            insertNewBlockByUser(currentPage.blocks.indexOf(data) + 1, "text");
        }
    });
    textArea.addEventListener("paste", (event) => {
        event.preventDefault();
        const plaintext = (event.clipboardData || window.clipboardData).getData("text/plain");
        document.execCommand("insertText", false, plaintext);
    });
    return textArea;
}

function focusNewTextbox(element) {
    element.focus();

    const selection = window.getSelection();
    const range = document.createRange();

    range.setStart(element, 0);
    range.setEnd(element, 0);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
}

//Use code from the whole directory using the compile system, helps to break down large defs
${COMPILE "/public/script/app/blocks_compile"}

function buildInnerBlock(data) {
    return BLOCK_DEFS[data.type].handler(data);
}

function onUserCreateBlock(data) {
    (BLOCK_DEFS[data.type].onCreate ? BLOCK_DEFS[data.type].onCreate : ()=>{})(data);
}

//Also put in the buttons to the add block menu
var addBlockList = document.getElementById("add_block_list");
for (const type in BLOCK_DEFS) {
    var block = BLOCK_DEFS[type];
    var card = document.createElement("div");
    card.classList.add("add-block-card");
    
    var title = document.createElement("h4");
    title.innerText = type;
    card.appendChild(title);

    var description = document.createElement("p");
    description.innerText = block.description;
    card.appendChild(description);

    card.addEventListener("mousedown", (e) => {e.preventDefault();addBlockCardClicked(type)});

    addBlockList.appendChild(card);
}