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
let toolbarFrame;

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
	toolbarFrame.position((document.documentElement.clientWidth - width) / 2 + width * 0.06 + newClientsCollection.w + roomsCollection.w, 0);
}

function draw() {
	background('#202020');

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
				interNormal);

		newClientsCollection.push(newClient);
	}
}

// Helper functions
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}