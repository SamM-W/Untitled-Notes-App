var addBlockFloat = document.getElementById("add_block_float");

var isAddBlockActive = false;
var isListeningForClickOff = false;
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

addEventListener("mousedown", (event) => {
    if (!isAddBlockActive) return;
    if (isListeningForClickOff  && !addBlockFloat.contains(event.target)) {
        addBlockFloat.style.display = "none";
        addBlockTargetIndex = undefined;
        isAddBlockActive = false;
        isListeningForClickOff = false;
    } else {    
        isListeningForClickOff = true;   
    }
});