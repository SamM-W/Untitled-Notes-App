addBlockHandling("header", "Larger text to structure your pages", (data) => {
    return handleGenericTextBox("app-block-header-textarea", data);
}).withOnCreate((data) => {
    focusNewTextbox(data.element.getElementsByClassName("app-block-header-textarea")[0]);
});