// A dirt simple breakout game expanded from this tutorial:
// https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/
// Made by Brianna Rainey <https://rainey.tech>
const gamediv = document.getElementById("game");
const canvas = document.createElement("canvas");
gamediv.appendChild(canvas);
canvas.width = gamediv.offsetWidth;
canvas.height = gamediv.offsetHeight;
const ctx = canvas.getContext("2d");
const purple = "#993f70";
let rightPressed = false;
let leftPressed = false;
let score = 0;
let lives = 3;
let livesColour = "#000";
let gameOver = false;
let gameOverScene = false;
let gamePaused = false;
let bricks = [];
let balls = [];

let pause_button = document.getElementById("pause_button");
pause_button.addEventListener("click", pauseGame, false);

// Load sprites, then start the game
let sprites = new Image();
sprites.addEventListener("load", function () {
    canvas.addEventListener("touchstart", touchStartHandler, false);
    canvas.addEventListener("touchmove", touchMoveHandler, false);
    canvas.addEventListener("mousedown", mouseDownHandler, false);
    canvas.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    startGame();
    draw();
});
sprites.src = "/static/client/rainey_arcade/js/breakout/powerups.png";

// Timer for pausing the ball during countdowns
// and giving invincibility frames after a death
let timer = {
    ballPause: 0,
    diedRecently: 0,
    dying: 0,
};

// Universal truths about a ball
let globalBall = {
    speed: 4,
    radius: 12,
    colour: "#000",
};

function ball(i, x = canvas.width / 2, y = canvas.height - 64) {
    this.i = i; // index in ball array
    this.x = x;
    this.y = y;
    this.dx = globalBall.speed;
    this.dy = -globalBall.speed;
    // left is 0, right is 1
    this.dir = 1;

    this.draw = function (x, y) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, globalBall.radius, 0, Math.PI * 2);
        ctx.fillStyle = globalBall.colour;
        ctx.fill();
        ctx.closePath();
    };

    this.move = function () {
        if (timer.ballPause > 0) {
            timer.ballPause--;
            return;
        }
        this.x += this.dx;
        this.y += this.dy;
        if (timer.dying > 0) {
            // A ball already fell off the bottom recently
            timer.dying--;
            if (timer.dying == 0) {
                if (lives < 0) {
                    beginGameOver()
                } else {
                    resetBall();
                }
            }
            return;
        }

        if (
            // ball collides with horizontal walls
            this.x + this.dx > canvas.width - globalBall.radius ||
            this.x + this.dx < globalBall.radius
        ) {
            // reverse ball direction and add some random angle
            this.dx = -this.dx;
            if (this.dx < 0) {
                this.dx -= Math.random() * (globalBall.speed - 4);
            } else {
                this.dx += Math.random() * (globalBall.speed - 4);
            }
        }
        if (this.y + this.dy < globalBall.radius) {
            // collision with ceiling, reverse vertical direction
            this.dy = -this.dy;
        } else if (this.y + this.dy > canvas.height - globalBall.radius) {
            // Mayday! this ball is at the bottom of the screen!
            if (
                this.x + globalBall.radius > paddle.x &&
                this.x - globalBall.radius < paddle.x + paddle.width
            ) {
                // collision with paddle
                this.dy = -this.dy;
                if (this.dx < 0) {
                    var dir = 0;
                    if (this.dx <= -globalBall.speed) {
                        this.dx =
                            -globalBall.speed -
                            Math.random() * ((globalBall.speed - 4) * 1);
                    }
                } else {
                    var dir = 1;
                    if (this.dx >= globalBall.speed) {
                        this.dx =
                            globalBall.speed +
                            Math.random() * ((globalBall.speed - 4) * 1);
                    }
                }
                if (this.x - paddle.x < paddle.width / 2) {
                    // Ball hit left side of paddle
                    let movement = Math.floor(
                        -(this.x - (paddle.x + paddle.width / 2)) / 12
                    );
                    if (dir == 0) {
                        // Ball moving left
                        this.dx -= movement;
                        if (paddle.dir == 1) {
                            this.dx += 3;
                        }
                    } else {
                        // Ball moving right
                        this.dx -= movement;
                    }
                } else {
                    // Ball hit right side of paddle
                    let movement = Math.floor(
                        -(paddle.x + paddle.width / 2 - this.x) / 12
                    );
                    if (dir == 0) {
                        this.dx += movement;
                    } else {
                        this.dx += movement;
                        if (paddle.dir == 0) {
                            this.dx -= 3;
                        }
                    }
                }
            } else {
                // This ball hit bottom of the screen
                if (balls.length > 1 && timer.dying == 0) {
                    // Not final ball but not invincible so remove this ball
                    balls.splice(this.i, 1);
                    for (let i = 0; i < balls.length; i++) {
                        balls[i].i = i;
                    }
                } else if (balls.length == 1) {
                    timer.dying = 30;
                    if (lives > 0) {
                        timer.diedRecently = 90;
                    }
                    lives--;
                }
            }
        }
    };

    this.collideWithBricks = function () {
        for (let col = 0; col < level.columnCount; col++) {
            for (let row = 0; row < level.rowCount; row++) {
                let b = bricks[col][row];
                if (
                    b.broken == 0 &&
                    this.x > b.x &&
                    this.x < b.x + b.width &&
                    this.y > b.y &&
                    this.y < b.y + b.height
                ) {
                    if (
                        this.dx >= -globalBall.speed &&
                        this.dx <= globalBall.speed &&
                        Math.random() * 10 < 1
                    ) {
                        if (this.dx < 0) {
                            this.dx = this.dx + 3;
                        } else {
                            this.dx = this.dx - 3;
                        }
                    }
                    this.dy = -this.dy;
                    if (
                        this.dx >= -globalBall.speed &&
                        this.dx <= globalBall.speed
                    ) {
                        this.dx =
                            -this.dx +
                            randomChoice([
                                0, 0, 0, 0, 0, 0, 1, 1, -1, -1, 2, -2,
                            ]);
                    } else {
                        this.dx = -this.dx;
                    }
                    b.broken = 1;
                    score++;
                    spawnPowerup(b.x, b.y, this.i);
                    if (score % (level.rowCount * level.columnCount) == 0) {
                        createBricks();
                    }
                }
            }
        }
    };
}
balls[0] = new ball(0);

let paddle = {
    colour: purple,
    height: 16,
    width: 96,
    speed: 8,
    x: (canvas.width - 96) / 2,
    dir: 0,
};

let level = {
    rowCount: 3,
    columnCount: 7,
    offsetTop: 64,
    offsetLeft: 32,
    brickPadding: 8,
};

let defaultBrick = {
    colour: purple,
    width: 76,
    height: 24,
};

function brick(x, y) {
    this.x = x;
    this.y = y;
    this.broken = 0;
    this.colour = defaultBrick.colour;
    this.width = defaultBrick.width;
    this.height = defaultBrick.height;
}

let powerup = {
    falling: 0,
    colour: [
        "#000", // nothing
        "#008000", // grow paddle
        "#BA0707", // shrink paddle
        "#FFA500", // faster ball
        "#800080", // slower ball
        "#3E3E3E", // multiball
    ],
    width: 25, //defaultBrick.width / 3
    height: defaultBrick.height,
    x: 0,
    y: 0,
    dy: globalBall.speed,
    dx: 0,
};

function createBricks() {
    for (let col = 0; col < level.columnCount; col++) {
        bricks[col] = [];
        for (let row = 0; row < level.rowCount; row++) {
            let brickX =
                col * (defaultBrick.width + level.brickPadding) +
                level.offsetLeft;
            let brickY =
                row * (defaultBrick.height + level.brickPadding) +
                level.offsetTop;
            bricks[col][row] = new brick(brickX, brickY);
        }
    }
}


function beginGameOver() {
    if (gameOverScene) return
    gameOver = true;
    gameOverScene = true;
    show_send_score_button();
}

function startGame() {
    hide_send_score_button();
    score = 0;
    lives = 3;
    gameOverScene = false;
    gameOver = false;
    resetBall();
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.dir = 0;
    createBricks();
}

function resetBall() {
    // change ball colour
    let prevBallColour = globalBall.colour;
    while (globalBall.colour == prevBallColour) {
        globalBall.colour = randomChoice([
            "#043836",
            "#fa482e",
            "#0a827c",
            "#f4a32e",
        ]);
    }

    // remove all balls but the first one, and replace it to center of screen
    while (balls.length > 1) {
        balls.pop();
    }
    balls[0].x = canvas.width / 2;
    balls[0].y = canvas.height - 96;
    globalBall.speed = 4;
    paddle.width = 96;
    balls[0].dy = -globalBall.speed;
    let ch = randomChoice([0, 1]);
    if (ch == 0) {
        balls[0].dx = -globalBall.speed;
        balls[0].dir = 0;
    } else {
        balls[0].dx = globalBall.speed;
        balls[0].dir = 1;
    }
    timer.ballPause = 90;
    timer.dying = 0;
}

function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function spawnPowerup(newX, newY, ballId) {
    if (powerup.falling == 0 && Math.floor(Math.random() * 10) < 5) {
        powerup.x = newX;
        powerup.y = newY;
        powerup.dx = -balls[ballId].dx;
        powerup.falling = randomChoice([1, 2, 3, 4, 5]);
    }
}

/*
 * CONTROL HANDLERS
 */
function touchStartHandler(e) {
    if (gameOver == true) {
        startGame();
    } else {
        touchMoveHandler(e);
    }
    e.preventDefault();
}

function touchMoveHandler(e) {
    // get relative (to canvas) x coord of touch
    let touch = e.changedTouches[0];
    let mouseX = touch.pageX - gamediv.offsetLeft;
    if (mouseX > 0 && mouseX < canvas.width) {
        let oldPaddleX = paddle.x;
        paddle.x = mouseX - paddle.width / 2;
        if (oldPaddleX - paddle.x < 0) {
            paddle.dir = 1;
        } else {
            paddle.dir = 0;
        }
    }
    e.preventDefault();
}

document.getScroll = function () {
    // https://stackoverflow.com/revisions/2481776/3
    if (window.scrollY != undefined) {
        return [scrollX, scrollY];
    } else {
        let sx,
            sy,
            d = document,
            r = d.documentElement,
            b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
    }
};

function mouseMoveHandler(e) {
    // Get relative (to canvas and scroll position) coords of mouse
    let scroll_position = document.getScroll();
    let mouseX = e.clientX - gamediv.offsetLeft + scroll_position[0];
    if (mouseX > 0 && mouseX < canvas.width) {
        let oldPaddleX = paddle.x;
        paddle.x = mouseX - paddle.width / 2;
        if (oldPaddleX - paddle.x < 0) {
            paddle.dir = 1;
        } else {
            paddle.dir = 0;
        }
    }
}

function mouseDownHandler(e) {
    if (e.button == 0 && gameOver == true && gamePaused == false) {
        startGame();
    }
}

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
        paddle.dir = 1;
    } else if (e.keyCode == 37) {
        leftPressed = true;
        paddle.dir = 0;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    } else if (e.keyCode == 32 && gameOver == true && gamePaused == false) {
        startGame();
    } else if (e.keyCode == 80) {
        pauseGame();
    }
}

/*
 * DRAWING FUNCTIONS
 */

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(
        paddle.x,
        canvas.height - paddle.height,
        paddle.width,
        paddle.height
    );
    ctx.fillStyle = paddle.colour;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let col = 0; col < level.columnCount; col++) {
        for (let row = 0; row < level.rowCount; row++) {
            if (bricks[col][row].broken == 0) {
                ctx.beginPath();
                ctx.rect(
                    bricks[col][row].x,
                    bricks[col][row].y,
                    bricks[col][row].width,
                    bricks[col][row].height
                );
                ctx.fillStyle = bricks[col][row].colour;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawPowerup() {
    if (powerup.falling == 0) {
        return;
    }
    ctx.beginPath();
    ctx.rect(powerup.x, powerup.y, powerup.width, powerup.height);
    ctx.fillStyle = powerup.colour[powerup.falling];
    ctx.fill();
    ctx.closePath();
    ctx.drawImage(
        sprites,
        25 * powerup.falling,
        0,
        25,
        24,
        powerup.x,
        powerup.y,
        25,
        24
    );
}

function drawScore() {
    ctx.font = "16pt Verdana";
    ctx.fillStyle = "#000";
    ctx.fillText(`Score: ${score}`, 12, 20);
}

function drawLives() {
    ctx.font = "16pt Verdana";
    if (timer.diedRecently > 0) {
        if (timer.diedRecently % 15 == 0 && livesColour == "#000") {
            livesColour = "#ff0000";
        } else if (
            (timer.diedRecently % 15 == 0 && livesColour == "#ff0000") ||
            timer.diedRecently == 1
        ) {
            livesColour = "#000";
        }
        timer.diedRecently--;
    }
    ctx.fillStyle = livesColour;
    if (lives == -1) {
        var livesText = "0";
    } else {
        var livesText = lives.toString();
    }
    ctx.fillText(`Lives: ${livesText}`, canvas.width - 96, 20);
}

function drawGameOver() {
    ctx.font = "36pt Verdana";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("Game Over", canvas.width / 2 - 132, canvas.height / 2 - 32);
    ctx.font = "16pt Verdana";
    ctx.fillText(
        "left-click to restart",
        canvas.width / 2 - 92,
        canvas.height / 2 + 22
    );
    drawMuffin(ctx);
}

function drawPauseScreen() {
    ctx.font = "36pt Verdana";
    ctx.fillStyle = "#333";
    ctx.fillText("Paused", canvas.width / 2 - 90, canvas.height / 2);
}

function drawCountdown() {
    let num = Math.floor(timer.ballPause / 30) + 1;
    ctx.font = "36pt Verdana";
    ctx.fillStyle = purple;
    ctx.fillText(num, canvas.width / 2 - 4, canvas.height / 2 + 8);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gamePaused == true) {
        drawPauseScreen();
        requestAnimationFrame(draw);
        return;
    }
    for (let i = 0; i < balls.length; i++) {
        balls[i].move();
    }
    movePaddle();
    movePowerup();

    if (gameOver == true) {
        drawGameOver();
    } else {
        for (let i = 0; i < balls.length; i++) {
            balls[i].draw();
            balls[i].collideWithBricks();
        }
        drawBricks();
        collidePowerupWithPaddle();
        drawPaddle();
        drawPowerup();
        drawLives();
    }
    drawScore();
    if (timer.ballPause > 0) {
        drawCountdown();
    }
    requestAnimationFrame(draw);
}

/*
 * MOVING & COLLIDING
 */

function collidePowerupWithPaddle() {
    if (
        powerup.falling > 0 &&
        powerup.x + powerup.width >= paddle.x &&
        powerup.x < paddle.x + paddle.width &&
        powerup.y + powerup.height > canvas.height - paddle.height
    ) {
        switch (powerup.falling) {
            case 1: // grow paddle
                paddle.width += 32;
                break;
            case 2: // shrink paddle
                if (paddle.width > 32) {
                    paddle.width -= 32;
                }
                break;
            case 3: // faster ball
                globalBall.speed += 2;
                break;
            case 4: // slower ball
                if (globalBall.speed > 2) {
                    globalBall.speed -= 2;
                }
                break;
            case 5: // multi-ball
                let newBalls = [];
                for (let i = 0; i < balls.length && balls.length < 17; i++) {
                    // create new ball for every ball that currently exists
                    newBalls.push(
                        new ball(balls.length + i, balls[i].x, balls[i].y)
                    );
                }
                balls = balls.concat(newBalls);
                break;
        }
        powerup.falling = 0;
    }
}

function movePowerup() {
    powerup.x += powerup.dx;
    powerup.y += powerup.dy;
    if (powerup.x > canvas.width - powerup.width || powerup.x < 0) {
        powerup.dx = -powerup.dx;
    }
    if (powerup.y == canvas.height - powerup.height) {
        powerup.falling = 0;
    }
}

function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width / 2) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0 - paddle.width / 2) {
        paddle.x -= paddle.speed;
    }
}

function pauseGame() {
    if (gamePaused == true) {
        gamePaused = false;
    } else {
        gamePaused = true;
    }
}

function drawMuffin(ctx) {
    // this function was generated by canvg
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0)";
    ctx.miterLimit = 4;
    ctx.scale(0.26666666666666666, 0.26666666666666666);
    ctx.save();
    ctx.restore();
    ctx.save();
    ctx.translate(789.7776, 402.66194);
    ctx.save();
    let g = ctx.createLinearGradient(
        431.43823,
        309.14993,
        455.10641,
        306.89993
    );
    g.addColorStop(0, "rgba(255, 92, 102, 1)");
    g.addColorStop(0.25, "rgba(255, 92, 102, 1)");
    g.addColorStop(0.5, "rgba(255, 77, 95, 1)");
    g.addColorStop(0.75, "rgba(255, 77, 95, 1)");
    g.addColorStop(1, "rgba(255, 92, 102, 1)");
    let canvas = document.createElement("canvas");
    canvas.width = 1044;
    canvas.height = 504;
    let ctx1 = canvas.getContext("2d");
    ctx1.fillStyle = g;
    ctx1.save();
    ctx1.strokeStyle = "rgba(0,0,0,0)";
    ctx1.miterLimit = 4;
    ctx1.beginPath();
    ctx1.moveTo(0, 0);
    ctx1.lineTo(1044, 0);
    ctx1.lineTo(1044, 504);
    ctx1.lineTo(0, 504);
    ctx1.closePath();
    ctx1.clip();
    ctx1.save();
    ctx1.translate(81, -208);
    ctx1.save();
    ctx1.beginPath();
    ctx1.moveTo(-10000, -10000);
    ctx1.lineTo(20000, -10000);
    ctx1.quadraticCurveTo(20000, -10000, 20000, -10000);
    ctx1.lineTo(20000, 20000);
    ctx1.quadraticCurveTo(20000, 20000, 20000, 20000);
    ctx1.lineTo(-10000, 20000);
    ctx1.quadraticCurveTo(-10000, 20000, -10000, 20000);
    ctx1.lineTo(-10000, -10000);
    ctx1.quadraticCurveTo(-10000, -10000, -10000, -10000);
    ctx1.closePath();
    ctx1.fill();
    ctx1.stroke();
    ctx1.restore();
    ctx1.restore();
    ctx1.restore();
    let p = ctx1.createPattern(ctx1.canvas, "no-repeat");
    ctx.fillStyle = p;
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(288.18821, 43.31544);
    ctx.lineTo(298.70770000000005, 169.54932);
    ctx.bezierCurveTo(
        411.67574,
        184.59742,
        478.46090000000004,
        170.90475,
        529.22173,
        150.79719
    );
    ctx.bezierCurveTo(
        536.12483,
        96.3052,
        531.47084,
        -5.348219999999998,
        524.19067,
        28.679630000000003
    );
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#9e6432";
    ctx.fillStyle = "rgba(158, 100, 50, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(526.86343, -21.43929);
    ctx.bezierCurveTo(
        543.19005,
        -48.707570000000004,
        513.40583,
        -69.40107,
        465.71123,
        -78.02789
    );
    ctx.bezierCurveTo(
        190.31725999999998,
        -125.75193999999999,
        231.11788,
        108.26156999999999,
        325.15244,
        52.03463000000001
    );
    ctx.bezierCurveTo(
        343.09062,
        64.98277,
        368.36647,
        66.92441000000001,
        400.90815,
        57.96730000000001
    );
    ctx.bezierCurveTo(
        416.24449,
        65.65659000000001,
        433.48974,
        67.61916000000001,
        452.47679,
        64.35634
    );
    ctx.bezierCurveTo(
        474.88674,
        65.60239,
        496.49178,
        63.830040000000004,
        514.08535,
        47.01467
    );
    ctx.bezierCurveTo(
        567.6820399999999,
        42.80888,
        556.14154,
        -3.9877599999999944,
        526.86343,
        -21.439289999999993
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#f5ff22";
    ctx.fillStyle = "rgba(245, 255, 34, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(244.37647, -143.28752);
    ctx.lineTo(274.00412, -24.177139999999994);
    ctx.lineTo(492.33707000000004, -53.38428999999999);
    ctx.lineTo(462.25362000000007, -169.30013);
    ctx.lineTo(421.23073000000005, -85.78594);
    ctx.lineTo(361.9754300000001, -161.54198);
    ctx.lineTo(329.6129200000001, -78.94055);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.save();
    ctx.translate(789.7776, 402.66194);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(397.99094, 146.86723);
    ctx.bezierCurveTo(
        409.15273,
        138.63389,
        428.84109,
        136.55501,
        443.0638,
        145.90707
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.transform(0.84606142, 0, 0, 1, 123.64927, -204);
    ctx.beginPath();
    ctx.moveTo(274.711, 302.51621220000004);
    ctx.bezierCurveTo(
        279.59255366631373,
        302.51621220000004,
        283.5498348,
        305.6820370890404,
        283.5498348,
        309.58728
    );
    ctx.bezierCurveTo(
        283.5498348,
        313.4925229109596,
        279.59255366631373,
        316.6583478,
        274.711,
        316.6583478
    );
    ctx.bezierCurveTo(
        269.8294463336863,
        316.6583478,
        265.87216520000004,
        313.4925229109596,
        265.87216520000004,
        309.58728
    );
    ctx.bezierCurveTo(
        265.87216520000004,
        305.6820370890404,
        269.8294463336863,
        302.51621220000004,
        274.711,
        302.51621220000004
    );
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.transform(0.98343684, 0, 0, 1.0755093, 86.541108, -226.36949);
    ctx.beginPath();
    ctx.moveTo(394.91913, 297.5664491);
    ctx.bezierCurveTo(
        398.23858634729015,
        297.5664491,
        400.9295374,
        299.9408177891661,
        400.9295374,
        302.86975
    );
    ctx.bezierCurveTo(
        400.9295374,
        305.79868221083393,
        398.23858634729015,
        308.1730509,
        394.91913,
        308.1730509
    );
    ctx.bezierCurveTo(
        391.59967365270984,
        308.1730509,
        388.9087226,
        305.79868221083393,
        388.9087226,
        302.86975
    );
    ctx.bezierCurveTo(
        388.9087226,
        299.9408177891661,
        391.59967365270984,
        297.5664491,
        394.91913,
        297.5664491
    );
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.restore();
    ctx.moveTo(80000, 80000);
}

function show_send_score_button() {
    // If embedded on Rainey Arcade, integrate with the send_score_button
    const send_score_button = document.getElementById("send_score_button");
    if (send_score_button) {
        function sendScore(e) {
            send_score(
                document.getElementById("game_title").dataset.filename,
                score,
                send_score_button.dataset.csrfToken,
            );
            e.currentTarget.setAttribute("style", "display: none;");
            e.currentTarget.removeEventListener("click", sendScore);
            e.stopPropagation();
        }
        send_score_button.setAttribute("style", "z-index: 100; display: block; left: 50%; bottom: 30%; transform: translate(-50%);");
        send_score_button.addEventListener("click", sendScore);
    }
}

function hide_send_score_button() {
    const send_score_button = document.getElementById("send_score_button");
    send_score_button.setAttribute("style", "display: none;");

    // Remove event listeners by cloning the button
    // sorta hacky but it's good enough for now
    const clone = send_score_button.cloneNode(true);
    send_score_button.parentNode.replaceChild(clone, send_score_button);
}