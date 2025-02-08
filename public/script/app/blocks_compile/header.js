addBlockHandling("header", "Larger text to structure your pages", (data) => {
    const textArea = document.createElement("div");
    textArea.contentEditable = "true";
    textArea.classList.add("app-block-header-textarea");
    textArea.innerText = data.typeContent.text;
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