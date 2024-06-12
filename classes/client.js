class Client {
    constructor(clientName, clientRoomCode, clientCollection, happyImg, irritatedImg, angryImg, fontStyle, isNewClient) {
        // Assign args to variables
        this.username = clientName;
        this.roomCode = clientRoomCode;
        this.happyImg = happyImg;
        this.irritatedImg = irritatedImg;
        this.angryImg = angryImg;
        this.fontStyle = fontStyle;
        this.clientCollection = clientCollection;

        // Clients can be happy, irritated, or angry
        this.clientStates = {
            Happy: 0,
            Irritated: 1,
            Angry: 2,
            Dead: 3
        }
        // Set the initial state to happy
        this.clientState = this.clientStates.Happy;

        // Create a sprite for each "client" in the game
        this.sprite = new Sprite();
        this.sprite.collider = 'static';
        this.sprite.overlaps(allSprites);
        // Note that because we are overriding the sprite's draw function,
        // the x y of the position of the sprite now takes the center of the sprite as reference

        // Size of sprite should be based on sketch size, so everything scales properly
        this.w = width * 1 / 6 * 1 / 4;
        this.h = width * 1 / 6 * 1 / 4;

        this.sprite.draw = () => {
            push();

            // Size of sprite should be based on sketch size, so everything scales properly
            let spriteLength = width * 1 / 6 * 1 / 4;

            noStroke();
            // Change the fill color based on the client state
            if (this.clientState == this.clientStates.Happy) {
                fill("#6ccb5f");
            }
            else if (this.clientState == this.clientStates.Irritated) {
                fill("#c9b300");
            }
            else if (this.clientState == this.clientStates.Angry) {
                fill("#ff99a4");
            }

            rect(0, 0, spriteLength, spriteLength);

            // Draw an emoticon depending on the client state
            // Image dimensions should scale correctly
            let imgX = (-spriteLength / 2) + spriteLength / 5;
            let imgY = (-spriteLength / 2) + spriteLength / 5;
            let imgW = spriteLength / 3;
            let imgH = spriteLength / 3;
            if (this.clientState == this.clientStates.Happy) {
                image(this.happyImg, imgX, imgY, imgW, imgH);
            }
            else if (this.clientState == this.clientStates.Irritated) {
                image(this.irritatedImg, imgX, imgY, imgW, imgH);
            }
            else if (this.clientState == this.clientStates.Angry) {
                image(this.angryImg, imgX, imgY, imgW, imgH);
            }

            // Draw text
            fill("black");
            textFont(this.fontStyle);
            textSize(spriteLength / 5);
            // hacky numbers
            text(this.username, (-spriteLength / 2) + spriteLength / 10, imgY + imgH + spriteLength / 12);
            textSize(spriteLength / 1.1 / 4);
            text(this.roomCode, (-spriteLength / 2) + spriteLength / 11, imgY + imgH + spriteLength / 3);

            pop();
        }

        this.changeStateFunction = () => {
            if (this.clientState == this.clientStates.Happy) {
                this.clientState = this.clientStates.Irritated;
            }
            else if (this.clientState == this.clientStates.Irritated) {
                this.clientState = this.clientStates.Angry;
            }
            else if (this.clientState == this.clientStates.Angry) {
                this.clientCollection.remove(this);
                clearInterval(this.clientTimer);
            }
        }

        // Start a timer to update client state, if applicable
        this.clientTimer = null;
        if (isNewClient == true) {
            this.clientTimer = setInterval(() => {
                this.changeStateFunction();
            }, 5000);
        }
    }

    remove() {
        if (this.clientTimer != null) {
            clearInterval(this.clientTimer);
        }
        this.sprite.remove();
    }

    isMousePressed() {
        return this.sprite.mouse.pressing();
    }
}