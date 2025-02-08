var BLOCK_DEFS = {};
function addBlockHandling(type, description, handler) {
    BLOCK_DEFS[type] = {description, handler};
}

//Use code from the whole directory using the compile system, helps to break down large defs
${COMPILE "/public/script/app/blocks_compile"}

function buildInnerBlock(data) {
    return BLOCK_DEFS[data.type].handler(data);
}

//Also put in the buttons to the add block menu
var addBlockList = document.getElementById("add_block_list");
for (var type in BLOCK_DEFS) {
    var block = BLOCK_DEFS[type];
    var card = document.createElement("div");
    card.classList.add("add-block-card");
    
    var title = document.createElement("h4");
    title.innerText = type;
    card.appendChild(title);

    var description = document.createElement("p");
    description.innerText = block.description;
    card.appendChild(description);

    card.addEventListener("mousedown", () => addBlockCardClicked(type));

    addBlockList.appendChild(card);
}