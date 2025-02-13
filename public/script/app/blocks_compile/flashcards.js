var deckDataChangedSinceLastSync = false;
var deckData = {
    name: "flashcard name thing",
    flashcards: [
        {
            learningHistory: [],
            front: {
                type: "text",
                content: "Front of the amazing card",
            },
            back: {
                type: "text",
                content: "Back of the amazing card",
            },
        }
    ]
};

addEventListener("click", (e) => {
    if (document.activeElement != e.target && document.activeElement.classList.contains("label-input")) {
        document.activeElement.blur();
        e.preventDefault();
    }
}, {capture: true});

function createTextFlashcardSide(content, onchange, hint) {
    var div = document.createElement("div");
    div.classList.add("popup-flashcards-flashcard-side");
    var text = document.createElement("span");
    text.contentEditable = true;
    text.classList.add("popup-flashcards-flashcard-text", "label-input");
    text.innerText = content;
    if (hint)
        text.setAttribute("text-input-hint", hint);
    const changedState = {
        changed: false
    }
    text.addEventListener("input", ()=>changedState.changed = true);
    text.addEventListener("blur", (e)=>{
        if (changedState.changed) {
            onchange(text);
            changedState.changed = false;
        }
    });
    div.appendChild(text);
    return div;
}

function createFlashcardSideView(name, data) {
    return createTextFlashcardSide(data.content, (text) => {
        if (text.innerText.trim() == "") {
            text.innerText = name;
        }
        data.content = text.innerText;
        deckDataChangedSinceLastSync = true;
    });
}

function createFlashcardItem(data) {
    var div = document.createElement("div");
    div.classList.add("popup-flashcards-flashcard");

    var sides = document.createElement("div");
    sides.classList.add("popup-flashcards-flashcard-sides");
    sides.appendChild(createFlashcardSideView("Front", data.front));
    sides.appendChild(createFlashcardSideView("Back", data.back));
    div.appendChild(sides);

    var bottominfo = document.createElement("div");
    bottominfo.classList.add("popup-flashcards-bottom-info");
    div.appendChild(bottominfo);
    return div;
}

function createFlashcardPopupHeader(addNewCardBlock) {
    var deckHeader = document.createElement("div");
    deckHeader.classList.add("popup-flashcards-deck-header");

    var deckTitle = document.createElement("input");
    deckTitle.classList.add("popup-flashcards-deck-title", "label-input");
    deckTitle.value = deckData.name;
    deckTitle.contentEditable = true;
    deckTitle.addEventListener("change", (e) => {
        if (deckTitle.value.trim() == "") {
            deckTitle.value = "Untitled Deck";
        }
        deckData.name = deckTitle.value;
        deckDataChangedSinceLastSync = true;
    });
    deckHeader.appendChild(deckTitle);

    var deckHeaderLeft = document.createElement("div");
    const addNewCardButton = templateButton("Add new card", "popup-flashcards-add-new-card-button", ()=> {
        addNewCardBlock.style.display = addNewCardBlock.style.display == "block" ? "none" : "block";
        addNewCardButton.innerText = addNewCardBlock.style.display == "block" ? "Close" : "Add new card";
    });
    deckHeaderLeft.appendChild(addNewCardButton);
    deckHeaderLeft.appendChild(templateButton("Study", "popup-flashcards-open-study", ()=> {
        console.log("Clicked open study");
    }));
    deckHeader.appendChild(deckHeaderLeft);
    return deckHeader;
}

var addCardInfo = {
    front: "",
    back: ""
};
function createAddNewCard() {
    var div = document.createElement("div");
    div.classList.add("popup-flashcards-add-new-card");

    var addNewCardInputs = document.createElement("div");
    div.classList.add("popup-flashcards-add-new-card-inputs");
    var frontCard = createTextFlashcardSide("", (text) => {
        addCardInfo.front = text.innerText.trim();
    }, "Front");
    var backCard = createTextFlashcardSide("", (text) => {
        addCardInfo.back = text.innerText.trim();
    }, "Back");
    div.appendChild(frontCard);
    div.appendChild(backCard);
    div.appendChild(addNewCardInputs);

    var addNewCardOptionsFooter = document.createElement("div");
    addNewCardOptionsFooter.classList.add("popup-flashcards-add-new-card-header");
    addNewCardOptionsFooter.appendChild(templateButton("Add", "popup-flashcards-new-card", () => {
        if (addCardInfo.front.trim() == "") {
            tippy(frontCard, {
                content: "Front must not be empty",
                trigger: "manual",
                delay: 500,
                theme: "light",
            }).show();
        } else if (addCardInfo.back.trim() == "") {
            tippy(backCard, {
                content: "Back must not be empty",
                trigger: "manual",
                delay: 500,
                theme: "light",
            }).show();
        } else {
            deckData.flashcards.push({
                learningHistory: [],
                front: {
                    type: "text",
                    content: addCardInfo.front
                },
                back: {
                    type: "text",
                    content: addCardInfo.back
                }
            });
            addCardInfo = {
                front: "",
                back: ""
            };
            frontCard.children[0].innerText = "";
            backCard.children[0].innerText = "";
            rebuildDeckContent();
            deckDataChangedSinceLastSync = true;
        }
    }));
    addNewCardOptionsFooter.appendChild(templateButton("Change to handwriting", "popup-flashcards-new-card", () => {
        console.log("Requested to change to handwriting block")
    }));
    div.appendChild(addNewCardOptionsFooter);
    
    div.style.display = "none";
    return div;
}

function rebuildDeckContent() {
    while (currentDeckContentContainer.firstChild) {
        currentDeckContentContainer.removeChild(currentDeckContentContainer.lastChild);
      }
    for (var card of deckData.flashcards) {
        currentDeckContentContainer.appendChild(createFlashcardItem(card));
    }
}

var flashcardPopupContainer;
var currentDeckContentContainer;
function createFlashcardPopup() {
    flashcardPopupContainer = document.createElement("div");

    var addNewCard = createAddNewCard();
    
    flashcardPopupContainer.appendChild(createFlashcardPopupHeader(addNewCard));
    flashcardPopupContainer.appendChild(addNewCard);

    currentDeckContentContainer = document.createElement("div");
    currentDeckContentContainer.classList.add("popup-flashcards-deck-content");

    rebuildDeckContent();

    flashcardPopupContainer.appendChild(currentDeckContentContainer);

    return flashcardPopupContainer;
}

function createProgressViewGroup(count, color, tooltip) {
    var div = document.createElement("div");
    div.classList.add("app-block-flashcards-progress-group");
    div.style.setProperty("--progress-group-color", color);
    div.innerText = count;
    tippy(div, {
        content: tooltip,
        placement: "bottom",
    });
    return div;
}

addBlockHandling("flashcards", "Add a group of flashcards intergrated into your notes", (data) => {
    var div = document.createElement("div");
    div.classList.add("app-block-flashcards-container");

    var content = document.createElement("div");
    content.classList.add("app-block-flashcards-info");

    var title = document.createElement("h4");
    title.innerText = "Flashcards (50% complete)";
    content.appendChild(title);

    var progressView = document.createElement("span");
    content.appendChild(createProgressViewGroup(2, "grey", "Not started"));
    content.appendChild(createProgressViewGroup(3, "#ff7766", "Not confident"));
    content.appendChild(createProgressViewGroup(2, "orange", "Learning"));
    content.appendChild(createProgressViewGroup(5, "#55aa55", "Learned"));
    content.appendChild(progressView);

    div.appendChild(content);

    var options = document.createElement("div");
    options.classList.add("app-block-flashcards-buttons");

    var editButon = document.createElement("button");
    editButon.classList.add("app-block-flashcards-option-edit");
    editButon.innerText = "Open";
    editButon.addEventListener("click", () => {
        createPopup("Flashcards", createFlashcardPopup());
    });
    options.appendChild(editButon);

    div.appendChild(options);

    return div;
})
// .withOnCreate((data) => {
//     // focusNewTextbox(data.element.getElementsByClassName("app-block-text-textarea")[0]);
// });