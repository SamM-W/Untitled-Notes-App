addBlockHandling("text", "Simple block of text", (data) => {
    return handleGenericTextBox("app-block-text-textarea", data);
}).withOnCreate((data) => {
    focusNewTextbox(data.element.getElementsByClassName("app-block-text-textarea")[0]);
}).withOnDataChange((data) => {
    data.element.getElementsByClassName("app-block-text-textarea")[0].innerText = data.block_data.text_content;
});