// Fix the sketch size to 16:9 so we can scale the sprites on different screen sizes
const SKETCH_WIDTH = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight * 16 / 9);
const SKETCH_HEIGHT = Math.min(document.documentElement.clientHeight, document.documentElement.clientWidth * 9 / 16);

function setup() {
	new Canvas(SKETCH_WIDTH, SKETCH_HEIGHT);

	let ball = new Sprite();
	ball.diameter = 50;
}

function draw() {
	background('grey');
}