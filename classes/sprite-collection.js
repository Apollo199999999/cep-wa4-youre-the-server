class SpriteCollection {
    constructor(x, y, numRows, numCols, childWidth, childHeight, tileChar, collectionHeader, fontStyle) {
        // Assign variables in args
        this.x = x;
        this.y = y;
        this.numRows = numRows;
        this.numCols = numCols;
        this.collectionHeader = collectionHeader;
        this.fontStyle = fontStyle;

        // spriteRemoved property - same as client
        this.spriteRemoved = false;

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
        this.childPlaceholder.layer = -1;
        this.childPlaceholder.color = "#2b2b2b";

        this.tileGap = width * 1 / 6 * 1 / 4 * 1 / 4;

        // stroke property to outline sprite
        this.stroke = null;

        // Create a sprite for the background
        this.bgWidth = this.numCols * this.childSpriteWidth + (this.numCols + 1) * this.tileGap;
        // Include space for text at the top
        this.topMargin = width * 1 / 6 * 1 / 4;
        this.bgHeight = this.numRows * this.childSpriteHeight + (this.numRows + 2) * this.tileGap + this.topMargin;
        this.backgroundSprite = new Sprite();
        this.backgroundSprite.pos.x = this.x + this.bgWidth / 2;
        this.backgroundSprite.pos.y = this.y + this.bgHeight / 2;
        this.backgroundSprite.collider = 'static';
        this.backgroundSprite.overlaps(allSprites);
        this.backgroundSprite.layer = -1;
        this.backgroundSprite.draw = () => {
            push();

            if (this.stroke == null) {
                strokeWeight(1);
                stroke("black");
            }
            else {
                strokeWeight(2);
                stroke(this.stroke);
            }

            let rectW = this.bgWidth;
            let rectH = this.bgHeight;

            // Draw rect
            fill("#1c1c1c");
            rect(0, 0, rectW, rectH);

            // Draw header text
            noStroke();
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
        if (this.canAddchild()) {
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

            // We need to have different code if we are adding Client vs SpriteCollection
            let currSprite;
            let newSprite;

            if (this.childArr[i] instanceof Client) {
                currSprite = this.childGridView[this.childGridView.length - 1 - i];
                newSprite = this.childArr[i].sprite;
                newSprite.position.x = currSprite.position.x;
                newSprite.position.y = currSprite.position.y;

                // Update client
                this.childArr[i].clientCollection = this;
            }
            else if (this.childArr[i] instanceof SpriteCollection) {
                currSprite = this.childGridView[this.childGridView.length - 1 - i];
                this.childArr[i].repositionSprite(currSprite.position.x, currSprite.position.y);
                // Assign the bgSprite of the child as newSprite, so this.childGridView will still be accurate in reflecting 
                // the total number of sprites this spriteCollection can hold
                newSprite = this.childArr[i].backgroundSprite;
            }

            // Replace the sprite in-place
            this.childGridView[this.childGridView.length - 1 - i] = newSprite;
            currSprite.remove();
        }

        this.childGridView.update();
    }

    empty() {
        this.childPlaceholder.removeAll();
        this.childGridView = new Tiles(
            this.cleanTileArr,
            this.x + this.childSpriteWidth / 2 + this.tileGap,
            this.y + this.childSpriteHeight / 2 + this.tileGap + this.topMargin + this.tileGap,
            this.childSpriteWidth + this.tileGap,
            this.childSpriteHeight + this.tileGap
        );
    }

    repositionSprite(x, y) {
        // (x,y) is the centre of the sprite
        this.x = x - this.w / 2;
        this.y = y - this.h / 2;

        // We need to shift all sprites in the childGridView to the new position
        let dx = x - this.backgroundSprite.position.x;
        let dy = y - this.backgroundSprite.position.y;

        // Shift position of all sprites
        this.backgroundSprite.position.x = x;
        this.backgroundSprite.position.y = y;

        for (let i = 0; i < this.childGridView.length; i++) {
            this.childGridView[i].position.x += dx;
            this.childGridView[i].position.y += dy;
        }
    }

    removeAllSprites() {
        // Iterate through children, marking them all as removed
        // Iterate backwards otherwise funny things may happen

        for (let i = this.childArr.length - 1; i >= 0; i--) {
            if (this.childArr[i] instanceof Client) {
                this.childArr[i].remove();
            }
            else if (this.childArr[i] instanceof SpriteCollection) {
                this.childArr[i].removeAllSprites();
            }
        }

        for (let i = this.childGridView.length - 1; i >= 0; i--) {
            if (this.childGridView[i].removed == false) {
                this.childGridView[i].remove();
            }
        }

        this.childPlaceholder.tile = '{';
        this.childPlaceholder.removeAll();
        this.childPlaceholder.tile = '{';
        this.backgroundSprite.remove();
        this.spriteRemoved = true;
    }

    isCollectionMousePressed() {
        // For some reason, checking mouse press on the backgroundSprite doesn't work directly, so we have to use mouseX and mouseY
        return mouseX > this.x && mouseY > this.y && mouseX < this.x + this.w && mouseY < this.y + this.h && mouse.pressing();
    }

    isChildMousePressed() {
        for (let i = 0; i < this.childArr.length; i++) {
            if (this.childArr[i] instanceof Client && this.childArr[i].isMousePressed() == true) {
                return true;
            }
            else if (this.childArr[i] instanceof SpriteCollection && this.childArr[i].isCollectionMousePressed() == true) {
                return true;
            }
        }

        return false;
    }

    getClickedChild() {
        for (let i = 0; i < this.childArr.length; i++) {
            if (this.childArr[i] instanceof Client && this.childArr[i].isMousePressed() == true) {
                return this.childArr[i];
            }
            else if (this.childArr[i] instanceof SpriteCollection && this.childArr[i].isCollectionMousePressed() == true) {
                return this.childArr[i];
            }
        }

        return null;
    }

    // Function to remove the outline on all children
    removeAllStroke() {
        this.stroke = null;
        for (let i = 0; i < this.childArr.length; i++) {
            if (this.childArr[i] instanceof Client) {
                this.childArr[i].stroke = null;
            }
            else if (this.childArr[i] instanceof SpriteCollection) {
                this.childArr[i].removeAllStroke();
            }
        }
    }
}