addBlockHandling("text", "Simple block of text", (data) => {
    const textArea = document.createElement("div");
    textArea.contentEditable = "true";
    textArea.classList.add("app-block-text-textarea");
    textArea.innerText = data.typeContent.text ? data.typeContent.text : "EMPTY";
    textArea.addEventListener("input", (e) => {
        data.typeContent.text = textArea.innerText;
        notifyPageChanged();
    });
    textArea.addEventListener("paste", (event) => {
        event.preventDefault();
        const plaintext = (event.clipboardData || window.clipboardData).getData("text/plain");
        document.execCommand("insertText", false, plaintext);
    });
    return textArea;
})