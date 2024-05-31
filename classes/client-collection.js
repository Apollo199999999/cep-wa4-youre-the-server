class ClientCollection {
    constructor(x, y, numRows, numCols, collectionHeader, fontStyle) {
        // Assign variables in args
        this.x = x;
        this.y = y;
        this.numRows = numRows;
        this.numCols = numCols;
        this.collectionHeader = collectionHeader;
        this.fontStyle = fontStyle;

        // Define arrays to store clients
        this.clientArr = [];

        // Configure client sprite length
        this.clientSpriteLength = width * 1 / 6 * 1 / 4;

        // Create a Tile object to display clients
        this.clientPlaceholder = new Group();
        this.clientPlaceholder.w = this.clientSpriteLength;
        this.clientPlaceholder.h = this.clientSpriteLength;
        this.clientPlaceholder.tile = '=';
        this.clientPlaceholder.collider = 'static';
        this.clientPlaceholder.overlaps(allSprites);
        this.clientPlaceholder.color = "#2b2b2b";

        this.tileGap = this.clientSpriteLength * 1 / 4;

        // Create a sprite for the background
        this.bgWidth = this.numCols * this.clientSpriteLength + (this.numCols + 1) * this.clientSpriteLength * 1 / 4;
        // Include space for one more sprite so we can add text at the top
        this.bgHeight = (this.numRows + 1) * this.clientSpriteLength + (this.numRows + 2) * this.clientSpriteLength * 1 / 4;
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
            textSize(this.clientSpriteLength * 0.5);
            text(this.collectionHeader, -rectW / 2 + this.tileGap, -rectH / 2 + this.clientSpriteLength / 2 + this.tileGap);
            pop();
        }

        // Create an array of strings to create the tiles from
        this.cleanTileArr = [];
        for (let i = 0; i < this.numRows; i++) {
            let string = "";
            for (let j = 0; j < this.numCols; j++) {
                string += "=";
            }

            this.cleanTileArr.push(string);
        }

        this.clientGridView = new Tiles(
            this.cleanTileArr,
            this.x + this.clientSpriteLength / 2 + this.tileGap,
            this.y + this.clientSpriteLength / 2 + this.tileGap + this.clientSpriteLength + this.tileGap,
            this.clientSpriteLength + this.tileGap,
            this.clientSpriteLength + this.tileGap
        );

    }

    canAddClient() {
        return this.clientArr.length < this.clientGridView.length;
    }

    push(client) {
        if (this.clientArr.length < this.clientGridView.length) {
            // Push a client to the array
            this.clientArr.push(client);

            this.empty();
            this.update();
        }
    }

    remove(client) {
        const index = this.clientArr.indexOf(client);
        if (index > -1) { // only splice array when item is found
            this.clientArr.splice(index, 1);
        }
        
        this.empty();
        this.update();
    }

    update() {
        // Update the clientGridView based on the clientArr
        for (let i = 0; i < this.clientArr.length; i++) {
            // The client arr stores new clients at the back, however, in the array of tiles created, the first tile created is the top left most tile,
            // and since we are adding new clients from the top, we must account for this in our array indices
            let currSprite = this.clientGridView[this.clientGridView.length - 1 - i];
            let newSprite = this.clientArr[i].sprite;
            newSprite.position.x = currSprite.position.x;
            newSprite.position.y = currSprite.position.y;

            // Replace the sprite in-place
            this.clientGridView[this.clientGridView.length - 1 - i] = newSprite;
            currSprite.remove();
        }

        this.clientGridView.update();
    }

    empty() {
        this.clientGridView = new Tiles(
            this.cleanTileArr,
            this.x + this.clientSpriteLength / 2 + this.tileGap,
            this.y + this.clientSpriteLength / 2 + this.tileGap + this.clientSpriteLength + this.tileGap,
            this.clientSpriteLength + this.tileGap,
            this.clientSpriteLength + this.tileGap
        );
    }
}