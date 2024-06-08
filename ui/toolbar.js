function toolbarShowRoomCollectionActions(frameDocument) {
    // Hide all other divs except for the one showing the actions that can be performed on room toolbars
    let roomCollectionActionsDiv = frameDocument.getElementById("room-collection-actions");
    let roomActionsDiv = frameDocument.getElementById("room-actions");
    let newClientActionsDiv = frameDocument.getElementById("new-client-actions");
    let addedClientActionsDiv = frameDocument.getElementById("added-client-actions");

    roomCollectionActionsDiv.style.display = "block";
    roomActionsDiv.style.display = "none";
    newClientActionsDiv.style.display = "none";
    addedClientActionsDiv.style.display = "none";
}

function toolbarShowRoomActions(frameDocument) {
    // Hide all other divs except for the one showing the actions that can be performed on room toolbars
    let roomCollectionActionsDiv = frameDocument.getElementById("room-collection-actions");
    let roomActionsDiv = frameDocument.getElementById("room-actions");
    let newClientActionsDiv = frameDocument.getElementById("new-client-actions");
    let addedClientActionsDiv = frameDocument.getElementById("added-client-actions");

    roomCollectionActionsDiv.style.display = "none";
    roomActionsDiv.style.display = "block";
    newClientActionsDiv.style.display = "none";
    addedClientActionsDiv.style.display = "none";
}

function toolbarShowNewClientActions(frameDocument) {
    // Hide all other divs except for the one showing the actions that can be performed on room toolbars
    let roomCollectionActionsDiv = frameDocument.getElementById("room-collection-actions");
    let roomActionsDiv = frameDocument.getElementById("room-actions");
    let newClientActionsDiv = frameDocument.getElementById("new-client-actions");
    let addedClientActionsDiv = frameDocument.getElementById("added-client-actions");

    roomCollectionActionsDiv.style.display = "none";
    roomActionsDiv.style.display = "none";
    newClientActionsDiv.style.display = "block";
    addedClientActionsDiv.style.display = "none";
}

function toolbarShowAddedClientActions(frameDocument) {
    // Hide all other divs except for the one showing the actions that can be performed on room toolbars
    let roomCollectionActionsDiv = frameDocument.getElementById("room-collection-actions");
    let roomActionsDiv = frameDocument.getElementById("room-actions");
    let newClientActionsDiv = frameDocument.getElementById("new-client-actions");
    let addedClientActionsDiv = frameDocument.getElementById("added-client-actions");

    roomCollectionActionsDiv.style.display = "none";
    roomActionsDiv.style.display = "none";
    newClientActionsDiv.style.display = "none";
    addedClientActionsDiv.style.display = "block";
}

// Event handlers
function addRoomBtnClicked() {
    // Get the document of this iframe
    let frameDocument = window.parent.getToolBarFrameDocument();

    // Add new room by calling the function from window.parent
    window.parent.addNewRoom(frameDocument.getElementById("room-code-input").value);
}