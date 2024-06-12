// Fix the sketch size to 16:9 so we can scale the sprites on different screen sizes
const SKETCH_WIDTH = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight * 16 / 9);
const SKETCH_HEIGHT = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth * 9 / 16);

// To generate random username
let randomWordClass;

// Client spawning rate
let clientSpawnRate = 2;

// Declare variables to preload images
let clientHappyImg, clientIrritatedImg, clientAngryImg;

// Declare font variables
let interLight, interNormal, interBold;

// ClientCollection object for the "New Clients" section
let newClientsCollection;

// RoomCollection object so users can create new rooms
let roomsCollection;

// Array of valid room codes that the clients can take (player will create rooms based on these codes)
let validRoomCodes = ["19283", "58124", "92641", "38201", "10358", "72912"];

// iframe to display toolbar
let toolbarFrame, toolbarDocument;

// Variable that stores the current item that is being clicked
let clickedItem = null

function preload() {
	// Preload resources
	clientHappyImg = loadImage("../images/client/happy.png");
	clientIrritatedImg = loadImage("../images/client/irritated.png");
	clientAngryImg = loadImage("../images/client/angry.png");

	interLight = loadFont("../resources/Inter-Thin.ttf");
	interNormal = loadFont("../resources/Inter-Regular.ttf");
	interBold = loadFont("../resources/Inter-Bold.ttf");
}

function setup() {
	new Canvas(SKETCH_WIDTH, SKETCH_HEIGHT);

	randomWordClass = new RandomWords();

	// Create test room and client sprites so we can get their width
	let testClientSprite = new Client("Test",
		validRoomCodes[Math.floor(random(0, validRoomCodes.length))],
		null,
		clientHappyImg,
		clientIrritatedImg,
		clientAngryImg,
		interNormal);

	// Area where new clients are spawned
	newClientsCollection = new SpriteCollection(width * 0.02, height * 0.02, 9, 3, testClientSprite.w, testClientSprite.h, '=', "New clients", interBold);
	let testRoomSprite = new SpriteCollection(width * 0.02, height * 0.02, 3, 3, testClientSprite.w, testClientSprite.h, 'x', "Room", interBold);
	// Areas where rooms are held
	roomsCollection = new SpriteCollection(width * 0.04 + newClientsCollection.w, height * 0.02, 2, 3, testRoomSprite.w, testRoomSprite.h, '#', "Rooms", interBold);

	testClientSprite.remove();
	testRoomSprite.removeAllSprites();

	// Create a iframe to display toolbar
	toolbarFrame = createElement('iframe').size(width - width * 0.06 - newClientsCollection.w - roomsCollection.w, height);
	toolbarFrame.attribute('frameBorder', '0');
	toolbarFrame.attribute('src', './ui/toolbar.html');
	toolbarFrame.position((document.documentElement.clientWidth - width) / 2 + width * 0.06 + newClientsCollection.w + roomsCollection.w, (document.documentElement.clientHeight - height) / 2);
}

function draw() {
	background('#202020');

	// Assign toolbar frame document
	toolbarDocument = toolbarFrame.elt.contentDocument || toolbarFrame.elt.contentWindow.document;

	if (frameCount % (60 / clientSpawnRate) == 0 && newClientsCollection.canAddchild() == true) {
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
				interNormal, true);

		newClientsCollection.push(newClient);
	}

	// If an item that was clicked has already been removed, we need to clear the toolbar
	if (clickedItem != null && clickedItem.spriteRemoved == true) {
		clickedItem = null;
		resetToolbar(toolbarDocument);
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

	// Set the stroke colour of the clicked item to indicate it is being clicked
	clickedItem.stroke = "#0078d4";
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
			interNormal);

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
	if (roomCode != null) {
		for (let i = 0; i < roomsCollection.childArr.length; i++) {
			if (roomsCollection.childArr[i].collectionHeader == roomCode && clickedItem instanceof Client) {
				// Create a new client to push into the room
				let newClient =
					new Client(clickedItem.username,
						clickedItem.roomCode,
						roomsCollection.childArr[i],
						clientHappyImg,
						clientIrritatedImg,
						clientAngryImg,
						interNormal, false);

				roomsCollection.childArr[i].push(newClient);
				newClientsCollection.remove(clickedItem);

				// Reset toolbar
				clickedItem = null;
				resetToolbar(toolbarDocument);
				break;
			}
		}
	}
	else {
		Swal.fire({
			title: "No room selected!",
			text: "No room selected to add the new client to",
			icon: "error"
		});
	}
}

function kickNewClickedClient() {
	if (clickedItem instanceof Client) {
		clickedItem.remove();
	}
}

function getToolBarFrameDocument() {
	return toolbarFrame.elt.contentDocument || toolbarFrame.elt.contentWindow.document;
}

// Function to capitialise first letter of a string (duh)
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}