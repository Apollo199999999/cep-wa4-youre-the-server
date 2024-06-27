// Disable the FES to reduce lag
p5.disableFriendlyErrors = true;

// Fix the sketch size to 16:9 so we can scale the sprites on different screen sizes
const SKETCH_WIDTH = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight * 16 / 9);
const SKETCH_HEIGHT = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth * 9 / 16);

// To generate random username
let randomWordClass;

// Client spawning rate
let clientSpawnRate = 0.15 + 0.10 * GV_GameLevel;

// Declare variables to preload images
let clientHappyImg, clientIrritatedImg, clientAngryImg, clientAni;

// Declare font variables
let interLight, interNormal, interBold;

// Declare sound variables
let sfx_usDecrease, sfx_usIncrease, sfx_clientRequest, sfx_clientHappy, sfx_clientIrritated, sfx_clientAngry, sfx_levelUp, bgm;

// ClientCollection object for the "New Clients" section
let newClientsCollection;

// RoomCollection object so users can create new rooms
let roomsCollection;

// Array of valid room codes that the clients can take (player will create rooms based on these codes)
let validRoomCodes = [];
let validRoomTileChars = ['a', 'b', 'c', 'd', 'e', 'f'];

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

	sfx_usDecrease = loadSound("./resources/sfx/us_decrease.ogg");
	sfx_usIncrease = loadSound("./resources/sfx/us_increase.ogg");
	sfx_clientRequest = loadSound("./resources/sfx/client_request.ogg");
	sfx_clientHappy = loadSound("./resources/sfx/client_happy.ogg");
	sfx_clientIrritated = loadSound("./resources/sfx/client_irritated.ogg");
	sfx_clientAngry = loadSound("./resources/sfx/client_angry.ogg");
	sfx_levelUp = loadSound("./resources/sfx/level_up.mp3")
	bgm = loadSound("./resources/bgm/bgm.mp3");
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
		clientAni,
		sfx_clientIrritated,
		sfx_clientAngry,
		sfx_clientRequest,
		sfx_usDecrease);

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

	bgm.setVolume(0.35);
	bgm.loop();
}

function draw() {
	background('#202020');

	// Assign toolbar frame document
	toolbarDocument = toolbarFrame.elt.contentDocument || toolbarFrame.elt.contentWindow.document;

	// Whether to spawn new clients
	if (frameCount % Math.floor(60 / clientSpawnRate) == 0 && newClientsCollection.canAddchild() == true && GV_NewClientsRemaining > 0) {
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
				clientAni,
				sfx_clientIrritated,
				sfx_clientAngry,
				sfx_clientRequest,
				sfx_usDecrease);

		if (GV_ShouldPlaySfx) sfx_clientHappy.play();
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

	// Update game sound variables
	GV_ShouldPlaySfx = toolbarIsSoundFxChecked(toolbarDocument);
	GV_ShouldPlayBgm = toolbarIsBgmChecked(toolbarDocument);

	// Trigger gameover if applicable
	if (GV_UserSatisfaction <= 0) {
		window.location.href = "gameOver.html";
	}

	// If no time is remaining, progress to the next level
	if (GV_LevelTimeRemaining <= 0) {
		// Remove everything
		clickedItem = null;
		roomsCollection.removeAllSprites();
		newClientsCollection.removeAllSprites();
		allSprites.removeAll();
		resetToolbar(toolbarDocument);
		bgm.stop();

		// Re-init everything
		initCollections();
		generateValidRoomCodes();
		GV_UserSatisfaction = 100;
		GV_GameLevel += 1;
		GV_LevelTimeRemaining = Math.min(2 * 60 + GV_GameLevel * 30, 4 * 60);
		clientSpawnRate = 0.15 + 0.10 * GV_GameLevel;
		GV_NewClientsRemaining = 17 * GV_GameLevel;
		bgm.loop();
		displayConfetti();
	}

	// Update bgmusic
	if (GV_ShouldPlayBgm == true && bgm.isPlaying() == false) {
		bgm.loop();
	}
	else if (GV_ShouldPlayBgm == false && bgm.isPlaying() == true) {
		bgm.pause();
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

// Function to display confetti
function displayConfetti() {
	let particles = [];

	for (let i = 0; i < 100; i++) {
		// Random position localised at the centre of the screen
		let x = random(width / 2 - 10, width / 2 + 10);
		let y = random(height / 2 - 10, height / 2 + 10);

		// Random direction of velocity, based on polar coords
		let theta = random(2 * Math.PI);
		let r = random(-20, 20);
		let vx = r * cos(theta);
		let vy = r * sin(theta);

		// Push new particle
		let particle = new Particle(x, y, vx, vy, 1, 6);
		particles.push(particle);
	}

	if (GV_ShouldPlaySfx){
		sfx_levelUp.setVolume(8.0);
		sfx_levelUp.play();
	} 
	
	// Apply force on particles
	let timer = setInterval(() => {
		for (let i = particles.length - 1; i >= 0; i--) {
			particles[i].applyForce(0, 0.2);
		}
	}, 7000 / 60);

	// Remove all particles at a later time
	setTimeout(() => {
		for (let i = particles.length - 1; i >= 0; i--) {
			particles[i].remove();
			particles.splice(i, 1);
		}
		clearInterval(timer);
	}, 7000)
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
		clientAni,
		sfx_clientIrritated,
		sfx_clientAngry,
		sfx_clientRequest,
		sfx_usDecrease);

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
		// Disallow adding duplicate rooms
		if (getAllRooms().includes(roomCode) == false) {
			// Create test client sprite to get dimensions
			let testClientSprite = new Client("Test",
				validRoomCodes[Math.floor(random(0, validRoomCodes.length))],
				null,
				clientHappyImg,
				clientIrritatedImg,
				clientAngryImg,
				interNormal,
				true,
				clientAni,
				sfx_clientIrritated,
				sfx_clientAngry,
				sfx_clientRequest,
				sfx_usDecrease);

			// Add new room
			// x and y for the new room doesn't matter -- they will get updated when the roomscollection gets updated
			let newRoom = new SpriteCollection(0, 0, 3, 3, testClientSprite.w, testClientSprite.h, validRoomTileChars[roomsCollection.childArr.length], roomCode, interBold);
			roomsCollection.push(newRoom);

			testClientSprite.remove();
		}
		else {
			Swal.fire({
				title: "Room already exists!",
				text: "You are trying to create a room that already exists.",
				icon: "error"
			});
		}
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
		if (clickedItem.childArr.length > 0) {
			if (GV_ShouldPlaySfx) sfx_usDecrease.play();
		}

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
						clientAni,
						sfx_clientIrritated,
						sfx_clientAngry,
						sfx_clientRequest,
						sfx_usDecrease);

				// Check if the added client is added to the correct room
				if (clickedItem.roomCode != roomCode) {
					newClient.startChangeStateTimer();
				}
				else {
					GV_UserSatisfaction += (3 - clickedItem.clientState);
					if (GV_ShouldPlaySfx) sfx_usIncrease.play();
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
			// Only open window if window not opened (wow so eloquent)
			if (clickedItem.resolveWindowOpened == false) {
				createResolveWindow(clickedItem.requestContentType);
			}
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
function createResolveWindow(contentType) {
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

	// Load room options when the input selector is clicked
	let roomSelector = resolveWindow.getElementsByClassName("room-selector")[0];
	roomSelector.addEventListener("focus", (event) => {
		// Load all room options
		let roomCodes = getAllRooms();
		roomSelector.options.length = 0;
		roomSelector.add(new Option("Select a room to update", null, true));

		for (let i = 0; i < roomCodes.length; i++) {
			roomSelector.add(new Option("Room " + roomCodes[i], roomCodes[i], false))
		}
	});

	// Process what type of request the client is making
	let requestImg = resolveWindow.getElementsByClassName("request-img")[0];
	let requestText = resolveWindow.getElementsByClassName("request-text")[0];

	if (contentType < 1 / 3) {
		// Text request
		requestImg.src = "./images/client/text.png";
		requestText.textContent = "Client " + clickedItem.username + " has sent a text message to Room " + clickedItem.roomCode + ".";
		resolveWindow.dataset.contentSafe = "true";
	}
	else if (contentType < 2 / 3) {
		// Image request
		requestImg.src = "./images/client/image.png";
		requestText.textContent = "Client " + clickedItem.username + " has sent an image to Room " + clickedItem.roomCode + ".";

		// Determine if content is safe
		let safeProbability = Math.random();
		if (safeProbability < 0.2) {
			resolveWindow.dataset.contentSafe = "false";
		}
		else {
			resolveWindow.dataset.contentSafe = "true";
		}
	}
	else if (contentType < 1) {
		// File request
		requestImg.src = "./images/client/file.png";
		requestText.textContent = "Client " + clickedItem.username + " has sent a file to Room " + clickedItem.roomCode + ".";

		// Determine if content is safe
		let safeProbability = Math.random();
		if (safeProbability < 0.4) {
			resolveWindow.dataset.contentSafe = "false";
		}
		else {
			resolveWindow.dataset.contentSafe = "true";
		}
	}

	// Implement scanning
	let scanBtn = resolveWindow.getElementsByClassName("scan-btn")[0];
	let scanText = resolveWindow.getElementsByClassName("scan-text")[0];
	let scanProgress = 0;

	scanBtn.addEventListener("click", (event) => {
		scanBtn.disabled = true;

		let progress = setInterval(() => {
			scanProgress += 2;
			scanText.textContent = "Scan progress: " + scanProgress.toString() + "%";

			if (scanProgress == 100) {
				if (resolveWindow.dataset.contentSafe == "true") {
					scanText.classList.add("text-success");
					scanText.textContent = "Scan did not find harmful content. Content is safe.";
				}
				else {
					scanText.classList.add("text-error");
					scanText.textContent = "Scan found harmful content.";
				}

				clearInterval(progress)
			}

		}, 10)
	});


	// Implement approve and deny buttons
	let approveBtn = resolveWindow.getElementsByClassName("approve-btn")[0];
	let denyBtn = resolveWindow.getElementsByClassName("deny-btn")[0];

	// Approve btn
	approveBtn.addEventListener("click", (event) => {
		// Get the selected room code
		let selectedRoomCode = roomSelector.value;

		// Retreieve client data from window
		let clientRoomCode = resolveWindow.dataset.clientRoomCode;
		let clientUUID = resolveWindow.dataset.clientUUID;

		// Get the requesting client and its room
		let correctRoom = findRoomFromCode(clientRoomCode);
		let client = findClientFromWindow(clientRoomCode, clientUUID);

		// Different scenarios if content is harmful or not
		if (resolveWindow.dataset.contentSafe == "true" && selectedRoomCode) {
			// Content is safe
			// Check whether player selected correct room
			if (selectedRoomCode == clientRoomCode) {
				// Safe content, Correct room, award user satisfaction points
				GV_UserSatisfaction += correctRoom.childArr.length * (-0.5 * client.clientState + 2);
				if (GV_ShouldPlaySfx) sfx_usIncrease.play();
				client.clientState = client.clientStates.Happy;
			}
			else {
				// Safe content, wrong room, deduct user satisfaction points
				let wrongRoom = findRoomFromCode(selectedRoomCode);
				GV_UserSatisfaction -= wrongRoom.childArr.length;
				if (GV_ShouldPlaySfx) sfx_usDecrease.play();
				for (let i = 0; i < wrongRoom.childArr.length; i++) {
					let clientInRoom = wrongRoom.childArr[i];
					if (clientInRoom != client) {
						clientInRoom.changeStateNoPenalty();
					}
				}

				client.clientState = client.clientStates.Happy;
			}
		}
		else if (resolveWindow.dataset.contentSafe == "false" && selectedRoomCode) {
			// Harmful content
			// Check whether player selected correct room
			if (selectedRoomCode == clientRoomCode) {
				// Correct room but harmful content, deduct user satisfaction points
				GV_UserSatisfaction -= correctRoom.childArr.length;
				if (GV_ShouldPlaySfx) sfx_usDecrease.play();
				for (let i = 0; i < correctRoom.childArr.length; i++) {
					let clientInRoom = correctRoom.childArr[i];
					if (clientInRoom != client) {
						clientInRoom.changeStateNoPenalty();
					}
				}

				client.clientState = client.clientStates.Happy;
			}
			else {
				// Wrong room, harmful content, deduct user satisfaction points
				let wrongRoom = findRoomFromCode(selectedRoomCode);
				GV_UserSatisfaction -= wrongRoom.childArr.length * 1.5;
				if (GV_ShouldPlaySfx) sfx_usDecrease.play();
				for (let i = 0; i < wrongRoom.childArr.length; i++) {
					let clientInRoom = wrongRoom.childArr[i];
					if (clientInRoom != client) {
						clientInRoom.changeStateNoPenalty();
					}
				}

				client.clientState = client.clientStates.Happy;
			}
		}

		// Update calling client
		if (client) {
			client.hasRequest = false;
			client.resolveWindowOpened = false;
			clearInterval(client.clientTimer);
		}
		resolveWindow.remove();

	});

	// Deny btn
	denyBtn.addEventListener("click", (event) => {
		let clientRoomCode = resolveWindow.dataset.clientRoomCode;
		let clientUUID = resolveWindow.dataset.clientUUID;

		let correctRoom = findRoomFromCode(clientRoomCode);
		let client = findClientFromWindow(clientRoomCode, clientUUID);

		// Different scenarios if content is harmful or not
		if (resolveWindow.dataset.contentSafe == "true") {
			// Safe content, but wrongly denied request, decrease user satisfaction
			client.changeStateNoPenalty();
		}
		else if (resolveWindow.dataset.contentSafe == "false") {
			// Unsafe content, correctly blocked, award user satisfaction 
			GV_UserSatisfaction += correctRoom.childArr.length * (-0.5 * client.clientState + 2);
			if (GV_ShouldPlaySfx) sfx_usIncrease.play();
			client.clientState = client.clientStates.Happy;
		}

		// Update calling client
		if (client) {
			client.hasRequest = false;
			client.resolveWindowOpened = false;
			clearInterval(client.clientTimer);
		}
		resolveWindow.remove();
	});

	// Close Window Btn
	let closeBtn = resolveWindow.getElementsByClassName("close-btn")[0];
	closeBtn.addEventListener("click", (event) => {
		let clientRoomCode = resolveWindow.dataset.clientRoomCode;
		let clientUUID = resolveWindow.dataset.clientUUID;

		let client = findClientFromWindow(clientRoomCode, clientUUID);

		if (client) {
			client.resolveWindowOpened = false;
		}

		resolveWindow.remove();
	});


	clickedItem.resolveWindowOpened = true;
	document.body.appendChild(resolveWindow);
}

function findClientFromWindow(roomCode, uuid) {
	for (let i = 0; i < roomsCollection.childArr.length; i++) {
		if (roomsCollection.childArr[i].collectionHeader == roomCode) {
			let room = roomsCollection.childArr[i];

			for (let i = 0; i < room.childArr.length; i++) {
				let client = room.childArr[i];
				if (client.resolveWindowId == uuid) {
					return client;
				}
			}
		}
	}
}

function findRoomFromCode(roomCode) {
	for (let i = 0; i < roomsCollection.childArr.length; i++) {
		if (roomsCollection.childArr[i].collectionHeader == roomCode) {
			let room = roomsCollection.childArr[i];
			return room;
		}
	}
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