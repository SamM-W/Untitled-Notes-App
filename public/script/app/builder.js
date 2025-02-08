function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}

function textBlockTemplate(content) {
    return `<div class="app-block" id="test-text-block-2">
        <div class="app-block-inner">
            <div class="app-block-text-textarea" contenteditable>
                ${escapeHtml(content)} 
            </div>
        </div>
        <div class="app-block-options">
            <div class="app-block-drag">⋯</div>
            <div class="app-block-add">+</div>
        </div>
    </div>`;
}

function applyInputListener(index, element) {
    var inner = element.getElementsByClassName("app-block-inner")[0];
    var textInput = inner.getElementsByClassName("app-block-text-textarea")[0];
    
    console.log(textInput);
    if (textInput != undefined) {
        textInput.onchange = () => {
            currentPage.blocks[index].content = textInput.innerText;
        }
    }
}

function rebuildPage() {
    var content = "";
    for (var pageElement of currentPage.blocks) {
        console.log(pageElement.content);
        content += textBlockTemplate(pageElement.content);
    }
    document.getElementById("app_blocks").innerHTML = content;
    var blockElements = document.getElementById("app_blocks").children;
    for (var i = 0; i < blockElements; i++) {
        applyInputListener(i, block);
    }
}