function resetToolbar(frameDocument) {
    // Hide all divs
    let roomCollectionActionsDiv = frameDocument.getElementById("room-collection-actions");
    let roomActionsDiv = frameDocument.getElementById("room-actions");
    let newClientActionsDiv = frameDocument.getElementById("new-client-actions");
    let addedClientActionsDiv = frameDocument.getElementById("added-client-actions");

    roomCollectionActionsDiv.style.display = "none";
    roomActionsDiv.style.display = "none";
    newClientActionsDiv.style.display = "none";
    addedClientActionsDiv.style.display = "none";
}

function toolbarShowRoomCollectionActions(frameDocument) {
    // Hide all other divs except for the one showing the actions that can be performed on room collection
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
    // Hide all other divs except for the one showing the actions that can be performed on rooms
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
    // Hide all other divs except for the one showing the actions that can be performed on new clients
    let roomCollectionActionsDiv = frameDocument.getElementById("room-collection-actions");
    let roomActionsDiv = frameDocument.getElementById("room-actions");
    let newClientActionsDiv = frameDocument.getElementById("new-client-actions");
    let addedClientActionsDiv = frameDocument.getElementById("added-client-actions");

    roomCollectionActionsDiv.style.display = "none";
    roomActionsDiv.style.display = "none";
    newClientActionsDiv.style.display = "block";
    addedClientActionsDiv.style.display = "none";

    // Get a list of all available room codes
    let roomCodes = window.parent.getAllRooms();
    let roomSelector = frameDocument.getElementById("room-selector");
    roomSelector.options.length = 0;
    roomSelector.add(new Option("Select a room", null, true));

    for (let i = 0; i < roomCodes.length; i++) {
        roomSelector.add(new Option("Room " + roomCodes[i], roomCodes[i], false))
    }
}

function toolbarShowAddedClientActions(frameDocument) {
    // Hide all other divs except for the one showing the actions that can be performed on added clients
    let roomCollectionActionsDiv = frameDocument.getElementById("room-collection-actions");
    let roomActionsDiv = frameDocument.getElementById("room-actions");
    let newClientActionsDiv = frameDocument.getElementById("new-client-actions");
    let addedClientActionsDiv = frameDocument.getElementById("added-client-actions");

    roomCollectionActionsDiv.style.display = "none";
    roomActionsDiv.style.display = "none";
    newClientActionsDiv.style.display = "none";
    addedClientActionsDiv.style.display = "block";

    // Get a list of all available room codes
    let roomCodes = window.parent.getAllRooms();
    let roomSelector = frameDocument.getElementById("room-selector-existing");
    roomSelector.options.length = 0;
    roomSelector.add(new Option("Select a room", null, true));

    for (let i = 0; i < roomCodes.length; i++) {
        roomSelector.add(new Option("Room " + roomCodes[i], roomCodes[i], false))
    }
}

function updateToolbar(frameDocument, userSatisfaction, clientsRemaining, level, timeRemaining) {
    // Try-catch in case frameDocument hasn't loaded yet when we call it from sketch.js
    try {
        frameDocument.getElementById("user-satisfaction-progress").value = userSatisfaction;
        frameDocument.getElementById("level-text").innerHTML = "Level: " + level;
        frameDocument.getElementById("new-clients-remaining-text").innerHTML = "Unspawned Clients Left: " + clientsRemaining;
        frameDocument.getElementById("time-remaining-text").innerHTML = "Time Remaining: " + Math.floor(timeRemaining / 60).toString() + "min " + (timeRemaining - Math.floor(timeRemaining / 60) * 60) + "s";
    } catch { }
}

function toolbarIsSoundFxChecked(frameDocument) {
    // Try-catch in case frameDocument hasn't loaded yet when we call it from sketch.js
    try { return frameDocument.getElementById("sfx-checkbox").checked; } catch { }
}

function toolbarIsBgmChecked(frameDocument) {
    // Try-catch in case frameDocument hasn't loaded yet when we call it from sketch.js
    try { return frameDocument.getElementById("bgm-checkbox").checked } catch { };
}

// Event handlers
function addRoomBtnClicked() {
    // Get the document of this iframe
    let frameDocument = window.parent.getToolBarFrameDocument();

    // Add new room by calling the function from window.parent
    window.parent.addNewRoom(frameDocument.getElementById("room-code-input").value);
    frameDocument.getElementById("room-code-input").value = "";
}

function deleteRoomBtnClicked() {
    // Remove the clicked room
    window.parent.removeClickedRoom();
}

function addNewClient() {
    // Get the document of this iframe
    let frameDocument = window.parent.getToolBarFrameDocument();

    // Get the selected option and add new client
    let roomSelector = frameDocument.getElementById("room-selector");
    window.parent.addNewClientToRoom(roomSelector.value);
}

function kickNewClient() {
    // Kick the client
    window.parent.kickNewClickedClient();
}

function moveExistingClient() {
    // Get the document of this iframe
    let frameDocument = window.parent.getToolBarFrameDocument();

    // Get the selected option and add new client
    let roomSelector = frameDocument.getElementById("room-selector-existing");
    window.parent.addNewClientToRoom(roomSelector.value);
}

function resolveClientRequests() {
    // Resolve requests
    window.parent.resolveClickedClientRequests();
}