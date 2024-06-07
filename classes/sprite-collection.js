class SpriteCollection {
    constructor(x, y, numRows, numCols, childWidth, childHeight, tileChar, collectionHeader, fontStyle) {
        // Assign variables in args
        this.x = x;
        this.y = y;
        this.numRows = numRows;
        this.numCols = numCols;
        this.collectionHeader = collectionHeader;
        this.fontStyle = fontStyle;

        // Define arrays to store childs
        this.childArr = [];

        // Configure child sprite length
        this.childSpriteWidth = childWidth;
        this.childSpriteHeight = childHeight;

        // Create a Tile object to display childs
        this.childPlaceholder = new Group();
        this.childPlaceholder.w = this.childSpriteWidth;
        this.childPlaceholder.h = this.childSpriteHeight;
        this.childPlaceholder.tile = tileChar;
        this.childPlaceholder.collider = 'static';
        this.childPlaceholder.overlaps(allSprites);
        this.childPlaceholder.color = "#2b2b2b";

        this.tileGap = width * 1 / 6 * 1 / 4 * 1 / 4;

        // Create a sprite for the background
        this.bgWidth = this.numCols * this.childSpriteWidth + (this.numCols + 1) * this.tileGap;
        // Include space for text at the top
        this.topMargin = width * 1 / 6 * 1 / 4;
        this.bgHeight = this.numRows * this.childSpriteHeight + (this.numRows + 2) * this.tileGap + this.topMargin;
        this.backgroundSprite = new Sprite();
        this.backgroundSprite.pos.x = this.x + this.bgWidth / 2;
        this.backgroundSprite.pos.y = this.y + this.bgHeight / 2;
        this.backgroundSprite.collider = "none";
        this.backgroundSprite.layer = -999;
        this.backgroundSprite.draw = () => {
            push();
            let rectW = this.bgWidth;
            let rectH = this.bgHeight;

            // Draw rect
            fill("#1c1c1c");
            rect(0, 0, rectW, rectH);

            // Draw header text
            fill("white");
            textFont(this.fontStyle);
            textSize(height * 0.035);
            text(this.collectionHeader, -rectW / 2 + this.tileGap, -rectH / 2 + this.tileGap * 3);
            pop();
        }

        // Create an array of strings to create the tiles from
        this.cleanTileArr = [];
        for (let i = 0; i < this.numRows; i++) {
            let string = "";
            for (let j = 0; j < this.numCols; j++) {
                string += tileChar;
            }

            this.cleanTileArr.push(string);
        }

        this.childGridView = new Tiles(
            this.cleanTileArr,
            this.x + this.childSpriteWidth / 2 + this.tileGap,
            this.y + this.childSpriteHeight / 2 + this.tileGap + this.topMargin + this.tileGap,
            this.childSpriteWidth + this.tileGap,
            this.childSpriteHeight + this.tileGap
        );

        // Assign width and height of this sprite
        this.w = this.bgWidth;
        this.h = this.bgHeight;
    }

    canAddchild() {
        return this.childArr.length < this.childGridView.length;
    }

    push(child) {
        if (this.childArr.length < this.childGridView.length) {
            // Push a child to the array
            this.childArr.push(child);

            this.empty();
            this.update();
        }
    }

    remove(child) {
        const index = this.childArr.indexOf(child);
        if (index > -1) { // only splice array when item is found
            this.childArr.splice(index, 1);
        }

        this.empty();
        this.update();
    }

    update() {
        // Update the childGridView based on the childArr
        for (let i = 0; i < this.childArr.length; i++) {
            // The child arr stores new childs at the back, however, in the array of tiles created, the first tile created is the top left most tile,
            // and since we are adding new childs from the top, we must account for this in our array indices
            let currSprite = this.childGridView[this.childGridView.length - 1 - i];
            let newSprite = this.childArr[i].sprite;
            newSprite.position.x = currSprite.position.x;
            newSprite.position.y = currSprite.position.y;

            // Replace the sprite in-place
            this.childGridView[this.childGridView.length - 1 - i] = newSprite;
            currSprite.remove();
        }

        this.childGridView.update();
    }

    empty() {
        this.childGridView = new Tiles(
            this.cleanTileArr,
            this.x + this.childSpriteWidth / 2 + this.tileGap,
            this.y + this.childSpriteHeight / 2 + this.tileGap + this.topMargin + this.tileGap,
            this.childSpriteWidth + this.tileGap,
            this.childSpriteHeight + this.tileGap
        );
    }

    removeAllSprites() {
        this.childGridView.removeAll();
        this.backgroundSprite.remove();
    }
}