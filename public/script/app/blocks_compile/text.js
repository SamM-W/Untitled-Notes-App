addBlockHandling("text", "Simple block of text", (data) => {
    return handleGenericTextBox("app-block-text-textarea", data);
}).withOnCreate((data) => {
    focusNewTextbox(data.element.getElementsByClassName("app-block-text-textarea")[0]);
});