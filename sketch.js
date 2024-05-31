// Fix the sketch size to 16:9 so we can scale the sprites on different screen sizes
const SKETCH_WIDTH = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight * 16 / 9);
const SKETCH_HEIGHT = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth * 9 / 16);

// Declare variables to preload images
let clientHappyImg, clientIrritatedImg, clientAngryImg;

function preload() {
	clientHappyImg = loadImage("../images/client/happy.png");
	clientIrritatedImg = loadImage("../images/client/irritated.png");
	clientAngryImg = loadImage("../images/client/angry.png");
}

let client;
function setup() {
	new Canvas(SKETCH_WIDTH, SKETCH_HEIGHT);
	
	client = new Client("User", "12345", clientHappyImg, clientIrritatedImg, clientAngryImg);	
}

function draw() {
	background('#202020');
}