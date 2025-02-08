var addBlockFloat = document.getElementById("add_block_float");

var isAddBlockActive = false;
var addBlockTargetIndex = undefined;

function addAddBlockFunction(blockElement, targetIndexGetter) {
    const addTarget = blockElement.getElementsByClassName("app-block-add")[0];
    
    addTarget.addEventListener("mousedown", (event) => {
        event.preventDefault();
        addBlockFloat.style.display = "block";
        addBlockFloat.style.top = event.clientY + "px";
        addBlockTargetIndex = targetIndexGetter();
        isAddBlockActive = true;
    });
}

function addBlockCardClicked(type) {
    if (!isAddBlockActive) return;
    insertNewBlockByUser(addBlockTargetIndex, type);
    addBlockFloat.style.display = "none";
    addBlockTargetIndex = undefined;
    isAddBlockActive = false;
}