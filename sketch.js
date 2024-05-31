// Fix the sketch size to 16:9 so we can scale the sprites on different screen sizes
const SKETCH_WIDTH = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight * 16 / 9);
const SKETCH_HEIGHT = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth * 9 / 16);

// Client spawning rate
let clientSpawnRate = 0.5;

// Declare variables to preload images
let clientHappyImg, clientIrritatedImg, clientAngryImg;

// Declare font variables
let interLight, interNormal, interBold;

// ClientCollection object for the "New Clients" section
let newClientsCollection;

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

	// Area where new clients are spawned
	newClientsCollection = new ClientCollection(width * 0.02, height * 0.02, 9, 3, "New clients", interBold);
}

function draw() {
	background('#202020');

	if (frameCount % (60 / clientSpawnRate) == 0 && newClientsCollection.canAddClient() == true) {
		// Add a new client
		let newClient =  new Client("User", "12345", newClientsCollection, clientHappyImg, clientIrritatedImg, clientAngryImg, interNormal);
		newClientsCollection.push(newClient);	
	}
}