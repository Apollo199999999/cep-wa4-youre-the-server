// Modified p5js class from https://editor.p5js.org/Apollo199999999/sketches/hpA33F5QB to work with p5play
class Particle {
    constructor(x, y, vx, vy, m) {
        // Create a sprite to be displayed
        let randomColor = color(random(255), random(255), random(255));
    
        this.particleSprite = new Sprite();
        this.particleSprite.diameter = m * 3;
        this.particleSprite.color = randomColor;
        this.particleSprite.stroke = randomColor;
        this.particleSprite.x = x;
        this.particleSprite.y = y;
        this.particleSprite.vel.x = vx;
        this.particleSprite.vel.y = vy;
    }

    applyForce(x, y) {
        this.particleSprite.applyForce(x, y);
    }

    // Remove sprite
    remove() {
        this.particleSprite.remove();
    }
}