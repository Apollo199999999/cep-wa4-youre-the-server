// Fix the sketch size to 16:9 so we can scale the sprites on different screen sizes
const SKETCH_WIDTH = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight * 16 / 9);
const SKETCH_HEIGHT = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth * 9 / 16);

// To generate random username
let randomWordClass;

// Client spawning rate
let clientSpawnRate = 0.25 * GV_GameLevel;

// Declare variables to preload images
let clientHappyImg, clientIrritatedImg, clientAngryImg, clientAni;

// Declare font variables
let interLight, interNormal, interBold;

// ClientCollection object for the "New Clients" section
let newClientsCollection;

// RoomCollection object so users can create new rooms
let roomsCollection;

// Array of valid room codes that the clients can take (player will create rooms based on these codes)
let validRoomCodes = [];

// iframe to display toolbar
let toolbarFrame, toolbarDocument;

// Variable that stores the current item that is being clicked
let clickedItem = null

function preload() {
	// Preload resources
	clientHappyImg = loadImage("./images/client/happy.png");
	clientIrritatedImg = loadImage("./images/client/irritated.png");
	clientAngryImg = loadImage("./images/client/angry.png");
	clientAni = loadImage("./images/client/bubbleAnimation.png")

	interLight = loadFont("./resources/fonts/Inter-Thin.ttf");
	interNormal = loadFont("./resources/fonts/Inter-Regular.ttf");
	interBold = loadFont("./resources/fonts/Inter-Bold.ttf");
}

function setup() {
	new Canvas(SKETCH_WIDTH, SKETCH_HEIGHT);
	frameRate(60);

	randomWordClass = new RandomWords();

	// Create test room and client sprites so we can get their width
	let testClientSprite = new Client("Test",
		validRoomCodes[Math.floor(random(0, validRoomCodes.length))],
		null,
		clientHappyImg,
		clientIrritatedImg,
		clientAngryImg,
		interNormal,
		true,
		clientAni);

	// Area where new clients are spawned
	newClientsCollection = new SpriteCollection(width * 0.02, height * 0.02, 9, 3, testClientSprite.w, testClientSprite.h, '=', "New clients", interBold);
	let testRoomSprite = new SpriteCollection(width * 0.02, height * 0.02, 3, 3, testClientSprite.w, testClientSprite.h, 'x', "Room", interBold);
	// Areas where rooms are held
	roomsCollection = new SpriteCollection(width * 0.04 + newClientsCollection.w, height * 0.02, 2, 3, testRoomSprite.w, testRoomSprite.h, '#', "Rooms", interBold);

	testClientSprite.remove();
	testRoomSprite.removeAllSprites();

	// Generate room codes
	generateValidRoomCodes();

	// Create a iframe to display toolbar
	toolbarFrame = createElement('iframe').size(width - width * 0.06 - newClientsCollection.w - roomsCollection.w, height);
	toolbarFrame.attribute('frameBorder', '0');
	toolbarFrame.attribute('src', './ui/toolbar.html');
	toolbarFrame.position((document.documentElement.clientWidth - width) / 2 + width * 0.06 + newClientsCollection.w + roomsCollection.w, (document.documentElement.clientHeight - height) / 2);

	// Game timer
	setInterval(() => { GV_LevelTimeRemaining -= 1; }, 1000);
}

function draw() {
	background('#202020');

	// Assign toolbar frame document
	toolbarDocument = toolbarFrame.elt.contentDocument || toolbarFrame.elt.contentWindow.document;

	// Whether to spawn new clients
	if (frameCount % (60 / clientSpawnRate) == 0 && newClientsCollection.canAddchild() == true && GV_NewClientsRemaining > 0) {
		// Add a new client
		// Username should be max 6 chars long
		let username = capitalizeFirstLetter(randomWordClass.generateWordWithMaxLength(4)) + Math.floor(random(10, 100));
		let newClient =
			new Client(username,
				validRoomCodes[Math.floor(random(0, validRoomCodes.length))],
				newClientsCollection,
				clientHappyImg,
				clientIrritatedImg,
				clientAngryImg,
				interNormal,
				true,
				clientAni);

		newClientsCollection.push(newClient);
		GV_NewClientsRemaining -= 1;
	}

	// If an item that was clicked has already been removed, we need to clear the toolbar
	if (clickedItem != null && clickedItem.spriteRemoved == true) {
		clickedItem = null;
		resetToolbar(toolbarDocument);
	}

	// Update the toolbar
	updateToolbar(toolbarDocument, GV_UserSatisfaction, GV_NewClientsRemaining, GV_GameLevel, GV_LevelTimeRemaining);

	// Trigger gameover if applicable
	if (GV_UserSatisfaction <= 0) {
		window.location.href = "gameOver.html";
	}

	// If no time is remaining, progress to the next level
	if (GV_LevelTimeRemaining <= 0) {
		// Remove everything
		roomsCollection.removeAllSprites();
		newClientsCollection.removeAllSprites();
		clickedItem = null;
		resetToolbar(toolbarDocument);

		// Re-init everything
		initCollections();
		generateValidRoomCodes();
		GV_UserSatisfaction = 100;
		GV_GameLevel = 2;
		GV_LevelTimeRemaining = 4 * 60;
		clientSpawnRate = 0.25 * GV_GameLevel;
		GV_NewClientsRemaining = 17 * GV_GameLevel;
	}
}

// Mouse press event handler
function mousePressed() {
	// Reset stuff first
	clickedItem = null;
	resetToolbar(toolbarDocument);
	newClientsCollection.removeAllStroke();
	roomsCollection.removeAllStroke();

	// Check which sprite is being clicked
	if (newClientsCollection.isChildMousePressed()) {
		// Client in new clients section is being clicked
		clickedItem = newClientsCollection.getClickedChild();
		toolbarShowNewClientActions(toolbarDocument);
	}
	else {
		// Manually check if any of the clients in the rooms are being clicked
		for (let i = 0; i < roomsCollection.childArr.length; i++) {
			if (roomsCollection.childArr[i].isChildMousePressed() == true) {
				// Clients in rooms are being clicked
				clickedItem = roomsCollection.childArr[i].getClickedChild();
				toolbarShowAddedClientActions(toolbarDocument);
				clickedItem.stroke = "#0078d4";
				return;
			}
		}
	}

	if (roomsCollection.isChildMousePressed()) {
		// Rooms are being clicked
		clickedItem = roomsCollection.getClickedChild();
		toolbarShowRoomActions(toolbarDocument);
	}
	else if (roomsCollection.isCollectionMousePressed()) {
		// Check room collection last because we are relying on mouseX and mouseY to do so
		// Room collection is being clicked
		clickedItem = roomsCollection;
		toolbarShowRoomCollectionActions(toolbarDocument);
	}

	if (clickedItem != null) {
		// Set the stroke colour of the clicked item to indicate it is being clicked
		clickedItem.stroke = "#0078d4";
	}
}

// Function to generate random room codes
function generateValidRoomCodes() {
	validRoomCodes = [];
	while (validRoomCodes.length < 6) {
		let randomRoomCode = Math.floor(random(10000, 100000)).toString();
		if (validRoomCodes.includes(randomRoomCode) == false) {
			validRoomCodes.push(randomRoomCode);
		}
	}
}

// Function to init roomsCollection and newClientsCollection
function initCollections() {
	// Create test room and client sprites so we can get their width
	let testClientSprite = new Client("Test",
		validRoomCodes[Math.floor(random(0, validRoomCodes.length))],
		null,
		clientHappyImg,
		clientIrritatedImg,
		clientAngryImg,
		interNormal,
		true,
		clientAni);

	// Area where new clients are spawned
	newClientsCollection = new SpriteCollection(width * 0.02, height * 0.02, 9, 3, testClientSprite.w, testClientSprite.h, '=', "New clients", interBold);
	let testRoomSprite = new SpriteCollection(width * 0.02, height * 0.02, 3, 3, testClientSprite.w, testClientSprite.h, 'x', "Room", interBold);
	// Areas where rooms are held
	roomsCollection = new SpriteCollection(width * 0.04 + newClientsCollection.w, height * 0.02, 2, 3, testRoomSprite.w, testRoomSprite.h, '#', "Rooms", interBold);

	testClientSprite.remove();
	testRoomSprite.removeAllSprites();
}

// Function to add new room (called from toolbar.js)
function addNewRoom(roomCode) {
	// Check if roomCode is empty
	if (roomCode == "") {
		// Show error message using Swal
		Swal.fire({
			title: "Empty room code",
			text: "No room code input into the textbox.",
			icon: "error"
		});
	}
	else if (roomsCollection.canAddchild() == true) {
		// Create test client sprite to get dimensions
		let testClientSprite = new Client("Test",
			validRoomCodes[Math.floor(random(0, validRoomCodes.length))],
			null,
			clientHappyImg,
			clientIrritatedImg,
			clientAngryImg,
			interNormal,
			true,
			clientAni);

		// Add new room
		// x and y for the new room doesn't matter -- they will get updated when the roomscollection gets updated
		let newRoom = new SpriteCollection(0, 0, 3, 3, testClientSprite.w, testClientSprite.h, 'x', roomCode, interBold);
		roomsCollection.push(newRoom);

		testClientSprite.remove();
	}
	else if (roomsCollection.canAddchild() == false) {
		Swal.fire({
			title: "No more space available!",
			text: "No more space to add another room.",
			icon: "error"
		});
	}
}

// Function to remove clicked room (called from toolbar.js)
function removeClickedRoom() {
	if (clickedItem != null && clickedItem instanceof SpriteCollection) {
		// Tank the user satisfaction
		GV_UserSatisfaction -= clickedItem.childArr.length;

		// Remove the room from roomsCollection
		roomsCollection.remove(clickedItem);
		clickedItem.removeAllSprites();
	}
}

// Function to get all available rooms (called from toolbar.js)
function getAllRooms() {
	// Iterate through the array of rooms in roomsCollection, then use the collectionHeader property of each room to get the room code
	let roomCodes = [];

	for (let i = 0; i < roomsCollection.childArr.length; i++) {
		roomCodes.push(roomsCollection.childArr[i].collectionHeader);
	}

	return roomCodes;
}

// Function to add the clicked new client to a room (called from toolbar.js)
function addNewClientToRoom(roomCode) {
	if (roomCode != "null" && clickedItem instanceof Client && clickedItem.clientCollection.collectionHeader != roomCode) {
		for (let i = 0; i < roomsCollection.childArr.length; i++) {
			if (roomsCollection.childArr[i].collectionHeader == roomCode) {
				// Create a new client to push into the room
				let newClient =
					new Client(clickedItem.username,
						clickedItem.roomCode,
						roomsCollection.childArr[i],
						clientHappyImg,
						clientIrritatedImg,
						clientAngryImg,
						interNormal,
						false,
						clientAni);

				// Check if the added client is added to the correct room
				if (clickedItem.roomCode != roomCode) {
					newClient.startChangeStateTimer();
				}
				else {
					GV_UserSatisfaction += (3 - clickedItem.clientState);
				}

				roomsCollection.childArr[i].push(newClient);
				clickedItem.remove();
				break;
			}
		}
	}
	else if (roomCode == "null") {
		Swal.fire({
			title: "No room selected!",
			text: "No room selected in the dropdown.",
			icon: "error"
		});
	}
}

// Called from toolbar.js, does what the function name says
function kickNewClickedClient() {
	if (clickedItem instanceof Client) {
		clickedItem.remove();
	}
}

// Called from toolbar.js, does what the function name says
function resolveClickedClientRequests() {
	if (clickedItem instanceof Client) {
		if (clickedItem.hasRequest == true) {
			createResolveWindow();
		}
		else {
			Swal.fire({
				title: "No requests to resolve!",
				text: "Client has no active requests.",
				icon: "info"
			});
		}
	}
}

function getToolBarFrameDocument() {
	return toolbarFrame.elt.contentDocument || toolbarFrame.elt.contentWindow.document;
}

// Function to capitialise first letter of a string (duh)
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Resolve Client Requests Window related code
function createResolveWindow() {
	// Code based on outdated p5js code from my last year CEP WA3 Orbit Simulator: https://editor.p5js.org/Apollo199999999/sketches/K6hNOWJeI
	// Remove any existing windows first
	clickedItem.removeResolveWindow();

	// Clone the window template
	let windowTemplate = document.getElementById("resolve-window");
	let resolveWindow = windowTemplate.cloneNode(true);
	resolveWindow.classList.remove("hidden");
	resolveWindow.removeAttribute("id");

	// Position the window correctly
	resolveWindow.style.left = ((document.documentElement.clientWidth - width) / 2 + random(width / 4)).toString() + "px";
	resolveWindow.style.top = ((document.documentElement.clientHeight - height) / 2 + random(height / 4)).toString() + "px";

	// Attach the client's id and room code to the window using the dataset attribute
	resolveWindow.dataset.clientRoomCode = clickedItem.roomCode;
	resolveWindow.dataset.clientUUID = clickedItem.resolveWindowId;

	// Make the window draggable via the titlebar
	let titlebar = resolveWindow.getElementsByClassName("titlebar")[0];
	dragElement(resolveWindow, titlebar);

	document.body.appendChild(resolveWindow);
}

function dragElement(windowDiv, titlebar) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	titlebar.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		// set the element's new position:
		windowDiv.style.top = (windowDiv.offsetTop - pos2) + "px";
		windowDiv.style.left = (windowDiv.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}