var draggingIndex = 0;
var draggingElement = undefined;
var startDraggingPos = undefined;

for (var i = 0; i < currentPage.blocks.length; i++) {
    const currentPageIndex = i;
    const block = currentPage.blocks[i];
    const element = block.element;
    const dragTarget = element.getElementsByClassName("app-block-drag")[0];
    dragTarget.addEventListener("mousedown", (e) => {
        e.preventDefault();
        startDraggingPos = [e.clientX, e.clientY];
        element.style.position = "relative";
        draggingIndex = currentPageIndex;
        draggingElement = element;
    })
}

document.addEventListener("mousemove", (e) => {
    if (draggingElement == undefined) return;
    var newOffset = [e.clientX - startDraggingPos[0], e.clientY - startDraggingPos[1]]
    draggingElement.style.top = newOffset[1] + "px";
});

document.addEventListener("mouseup", (e) => {
    if (draggingElement == undefined) return;
    e.preventDefault();
    placeDraggingElement(draggingElement);
    draggingElement = undefined;
});

function placeDraggingElement(element) {
    var placedY = element.getBoundingClientRect().top;
    console.log(placedY);
    var indexToPlaceAt = 0;

    var currentBlock = currentPage.blocks.splice(draggingIndex, 1);

    for (var block of currentPage.blocks) {
        var y = block.element.getBoundingClientRect().top;
        console.log(placedY, y);
        if (placedY < y) break;
        indexToPlaceAt++;
    }

    currentPage.blocks.splice(indexToPlaceAt, 0, currentBlock[0]);
    rebuildPage();

    element.style.left = "0";
    element.style.top = "0";
}
