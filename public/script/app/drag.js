var draggingTargetIndex;
var draggingElement;
var startDraggingPosY;

function addDraggerFunction(blockElement, blockData) {
    const dragTarget = blockElement.getElementsByClassName("app-block-drag")[0];
    
    dragTarget.addEventListener("mousedown", (event) => {
        event.preventDefault();
        startDraggingPosY = event.clientY;
        draggingTargetIndex = currentPage.blocks.indexOf(blockData);
        draggingElement = blockElement;
        draggingElement.classList.add("dragged-app-block");
    })
}

document.addEventListener("mousemove", (event) => {
    if (draggingElement == undefined) return;

    draggingElement.style.top = (event.clientY - startDraggingPosY) + "px";
});

document.addEventListener("mouseup", (event) => {
    if (draggingElement == undefined) return;
    event.preventDefault();

    placeDraggingElement(draggingElement);

    draggingElement = undefined;
    draggingTargetIndex = undefined;
});

function getYCenter(rect) {
    return rect.top + rect.height/2;
}

function placeDraggingElement(element) {
    var placedY = getYCenter(element.getBoundingClientRect());

    var indexToPlaceAt = 0;
    var currentBlock = currentPage.blocks[draggingTargetIndex];

    for (var block of currentPage.blocks) {
        if (block == currentBlock) continue;
        
        var y = getYCenter(block.element.getBoundingClientRect());   
        if (placedY < y) break;
        indexToPlaceAt++;
    }

    moveBlock(draggingTargetIndex, indexToPlaceAt);

    element.classList.remove("dragged-app-block");
    element.style.top = 0;
}
