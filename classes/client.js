class Client {
    constructor(clientName, clientRoomCode, clientCollection, happyImg, irritatedImg, angryImg, fontStyle, isNewClient, clientAni, irritatedSfx, angrySfx, requestSfx, deathSfx) {
        // Assign args to variables
        this.username = clientName;
        this.roomCode = clientRoomCode;
        this.happyImg = happyImg;
        this.irritatedImg = irritatedImg;
        this.angryImg = angryImg;
        this.fontStyle = fontStyle;
        this.clientCollection = clientCollection;
        this.clientAni = clientAni;
        this.irritatedSfx = irritatedSfx;
        this.angrySfx = angrySfx;
        this.requestSfx = requestSfx;
        this.deathSfx = deathSfx;

        // spriteRemoved property to track whether our sprite has already been removed
        this.spriteRemoved = false;

        // Stroke property so we can outline the sprite
        this.stroke = null;

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
        this.sprite.layer = 1;
        this.sprite.collider = 'static';
        this.sprite.overlaps(allSprites);
        this.sprite.visible = true;

        // Note that because we are overriding the sprite's draw function,
        // the x y of the position of the sprite now takes the center of the sprite as reference

        // Size of sprite should be based on sketch size, so everything scales properly
        this.w = width * 1 / 6 * 1 / 4;
        this.h = width * 1 / 6 * 1 / 4;

        // Variable to control whether to show the "..." animation/whether a client has a request
        this.hasRequest = false;

        // Configure animation and draw function
        this.sprite.spriteSheet = this.clientAni;
        this.sprite.anis.frameDelay = 10;
        this.sprite.addAnis({
            bubble: { row: 0, frames: 3, w: 337, h: 200 }
        });

        this.sprite.draw = () => {
            push();

            // Size of sprite should be based on sketch size, so everything scales properly
            let spriteLength = width * 1 / 6 * 1 / 4;

            if (this.stroke == null) {
                noStroke();
            }
            else {
                strokeWeight(2);
                stroke(this.stroke);
            }

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
            noStroke();
            textFont(this.fontStyle);
            textSize(spriteLength / 5);
            // hacky numbers
            text(this.username, (-spriteLength / 2) + spriteLength / 10, imgY + imgH + spriteLength / 12);
            textSize(spriteLength / 1.1 / 4);
            text(this.roomCode, (-spriteLength / 2) + spriteLength / 11, imgY + imgH + spriteLength / 3);

            pop();

            // Draw "..." animation if applicable
            if (this.hasRequest == true) {
                // hacky numbers pt2
                this.sprite.ani.draw(this.w * 2 / 4, -this.h / 2.7, 0, this.h / 300, this.h / 300);
            }
        }

        this.sprite.width = this.w;
        this.sprite.height = this.h;
        this.sprite.changeAni('bubble');

        this.changeStateFunction = () => {
            if (this.clientState == this.clientStates.Happy) {
                this.clientState = this.clientStates.Irritated;
                if (GV_ShouldPlaySfx) this.irritatedSfx.play();
                GV_UserSatisfaction -= 2;
            }
            else if (this.clientState == this.clientStates.Irritated) {
                this.clientState = this.clientStates.Angry;
                if (GV_ShouldPlaySfx) this.angrySfx.play();
                GV_UserSatisfaction -= 2;
            }
            else if (this.clientState == this.clientStates.Angry) {
                GV_UserSatisfaction -= 2;
                if (GV_ShouldPlaySfx) this.deathSfx.play();
                this.remove();
            }
        }

        // Create a random uuid so that the "resolve client requests" window can identify us, only necessary if we are not a new client
        this.resolveWindowId = null
        // Keep track of whether the resolve client requests window is opened
        this.resolveWindowOpened = false;
        // Keep track of what content type the client is requesting. Generated using Math.random, and processed in the createResolveWindow() function in sktech.js
        this.requestContentType = 0;

        // Start a timer to update client state, if applicable
        this.clientTimer = null;
        this.roomTimer = null;
        if (isNewClient == true) {
            this.startChangeStateTimer();
        }
        else {
            this.startRoomTimer();
            this.resolveWindowId = crypto.randomUUID();
        }
    }

    remove() {
        if (this.clientTimer != null) {
            clearInterval(this.clientTimer);
        }

        if (this.roomTimer != null) {
            clearInterval(this.roomTimer);
        }

        if (this.clientCollection != null) {
            this.clientCollection.remove(this);
        }

        // Remove the corresponding "resolve window" if applicable
        this.removeResolveWindow();

        this.sprite.remove();
        this.spriteRemoved = true;
    }

    removeResolveWindow() {
        if (this.resolveWindowId) {
            let resolveWindows = document.getElementsByClassName("resolve-window");
            for (let i = 0; i < resolveWindows.length; i++) {
                if (resolveWindows[i].dataset.clientRoomCode == this.roomCode && resolveWindows[i].dataset.clientUUID == this.resolveWindowId) {
                   resolveWindows[i].remove();
                   this.resolveWindowOpened = false;
                }
            }
        }
    }

    isMousePressed() {
        return this.sprite.mouse.pressing();
    }

    startChangeStateTimer() {
        this.clientTimer = setInterval(() => {
            this.changeStateFunction();
        }, 5500 - GV_GameLevel * 100);
    }

    startRoomTimer() {
        this.roomTimer = setInterval(() => {
            this.generateRequest()
        }, random(5500, 8000));
    }

    generateRequest() {
        if (GV_NewClientsRemaining <= 0 && this.hasRequest == false) {
            // Probability of generating request depends on game level
            let probability = Math.random();
            if (probability < Math.min(0.05 * GV_GameLevel, 0.4)) {
                if (GV_ShouldPlaySfx) this.requestSfx.play();
                this.hasRequest = true;
                this.requestContentType = Math.random();
                this.startChangeStateTimer();
            }
        }
    }

    changeStateNoPenalty() {
        if (this.clientState == this.clientStates.Happy) {
            if (GV_ShouldPlaySfx) this.irritatedSfx.play();
            this.clientState = this.clientStates.Irritated;
        }
        else if (this.clientState == this.clientStates.Irritated) {
            if (GV_ShouldPlaySfx) this.angrySfx.play();
            this.clientState = this.clientStates.Angry;
        }
        else if (this.clientState == this.clientStates.Angry) {
            if (GV_ShouldPlaySfx) this.deathSfx.play();
            this.remove();
        }
    }
}