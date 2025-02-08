var addBlockFloat = document.getElementById("add_block_float");

var isAddBlockActive = false;
var addBlockTargetIndex = undefined;

function addAddBlockFunction(blockElement, blockData) {
    const addTarget = blockElement.getElementsByClassName("app-block-add")[0];
    
    addTarget.addEventListener("mousedown", (event) => {
        event.preventDefault();
        addBlockFloat.style.display = "block";
        addBlockFloat.style.top = event.clientY + "px";
        addBlockTargetIndex = currentPage.blocks.indexOf(blockData) + 1;
        isAddBlockActive = true;
    });
}

function addBlockCardClicked(type) {
    if (!isAddBlockActive) return;
    insertNewBlock(addBlockTargetIndex, type);
    addBlockFloat.style.display = "none";
    addBlockTargetIndex = undefined;
    isAddBlockActive = false;
}