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

function placeDraggingElement(element) {
    var placedY = element.getBoundingClientRect().top;

    var indexToPlaceAt = 0;
    var currentBlock = currentPage.blocks[draggingTargetIndex];

    for (var block of currentPage.blocks) {
        if (block == currentBlock) continue;

        var y = block.element.getBoundingClientRect().top;
        
        if (placedY < y) break;
        indexToPlaceAt++;
    }

    moveBlock(draggingTargetIndex, indexToPlaceAt);

    element.style.top = 0;
}
