var activePopup;

function createPopup(name, content) {
    var popupContainer = document.createElement("div");
    popupContainer.classList.add("app-popup-container");

    var popup = document.createElement("div");
    popup.classList.add("app-popup");
    
    var topBar = document.createElement("div");
    topBar.classList.add("app-popup-topbar");

    var title = document.createElement("h1");
    title.classList.add("app-popup-title");
    title.innerText = name;
    topBar.appendChild(title);

    var closeButton = document.createElement("button");
    closeButton.classList.add("app-popup-close");
    closeButton.innerText = "X";
    closeButton.onclick = () => {
        activePopup.remove();
        activePopup = undefined;
    };
    topBar.appendChild(closeButton);

    popup.appendChild(topBar);

    var contentContainerDiv = document.createElement("div");
    contentContainerDiv.classList.add("app-popup-content");
    contentContainerDiv.appendChild(content);
    popup.appendChild(contentContainerDiv);

    popupContainer.appendChild(popup);
    document.body.appendChild(popupContainer);
    activePopup = popupContainer;
    return popup;
}