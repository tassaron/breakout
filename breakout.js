// A dirt simple breakout game based on this tutorial:
// https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/
// Made by brianna at tassaron.com
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var rightPressed = false;
var leftPressed = false;
var score = 0;
var lives = 3;
var livesColour = "#000";
var gameOver = false;
var diedRecently = 0;
var ballPause = 0;
var purple = "#993f70";
var dying = 0;

// ball crap
var ballRadius = 12;
var ballColour = "#000";
var prevBallColour = "#000";
var x = canvas.width / 2;
var y = canvas.height - 64;
var speed = 4;
var dx = speed;
var dy = -speed;
var dir = 1;

// paddle crap
var paddleColour = purple;
var paddleHeight = 16;
var paddleWidth = 96;
var paddleSpeed = 7;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleDir = 0;

// bricks crap
var brickColour = purple;
var brickRowCount = 3;
var brickColumnCount = 7;
var brickWidth = 76;
var brickHeight = 24;
var brickPadding = 8;
var brickOffsetTop = 64;
var brickOffsetLeft = 32;
var bricks = [];


/*
 * BASIC CRAP
 */
function createBricks() {
    for (var col = 0; col < brickColumnCount; col++) {
        bricks[col] = [];
        for (var row = 0; row < brickRowCount; row++) {
            bricks[col][row] = { x: 0, y: 0, broken: 0 };
        }
    }
}

function startGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    resetBall();
    paddleX = (canvas.width - paddleWidth) / 2;
    paddleDir = 0;
    createBricks();
}

function resetBall() {
    while (ballColour == prevBallColour) {
        ballColour = randomChoice([
            "#043836",
            "#fa482e",
            "#0a827c",
            "#f4a32e",
        ])
    }
    prevBallColour = ballColour;
    x = canvas.width / 2;
    y = canvas.height - 96;
    dy = -speed;
    var ch = randomChoice([0, 1]);
    if (ch == 0) {
        dx = -speed;
        dir = 0;
    } else {
        dx = speed;
        dir = 1;
    }
    ballPause = 90;
    dying = 0;
}

function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

/*
 * CONTROL HANDLER CRAP
 */
function mouseMoveHandler(e) {
    // get relative (to canvas) x coord of mouse
    var mouseX = e.clientX - canvas.offsetLeft;
    if (mouseX > 0 && mouseX < canvas.width) {
        var oldPaddleX = paddleX;
        paddleX = mouseX - paddleWidth / 2;
        if (oldPaddleX - paddleX < 0) {
            paddleDir = 1;
        } else {
            paddleDir = 0;
        }
    }
}

function mouseDownHandler(e) {
    if (e.button == 0 && gameOver == true) {
        startGame();
    }
}

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
        paddleDir = 1;
    } else if (e.keyCode == 37) {
        leftPressed = true;
        paddleDir = 0;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    } else if (e.keyCode == 32 && gameOver == true) {
        startGame();
    }
}

/*
* DRAWING CRAP
*/
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = ballColour;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = paddleColour;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (var col = 0; col < brickColumnCount; col++) {
        for (var row = 0; row < brickRowCount; row++) {
            if (bricks[col][row].broken == 0) {
                var brickX = (col * (brickWidth + brickPadding)) + brickOffsetLeft;
                var brickY = (row * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[col][row].x = brickX;
                bricks[col][row].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColour;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16pt Verdana";
    ctx.fillStyle = "#000";
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
    ctx.font = "16pt Verdana";
    if (diedRecently > 0) {
        if (
            diedRecently % 15 == 0 &&
            livesColour == "#000"
            ) {
                livesColour = "#ff0000";
        } else if (
            diedRecently % 15 == 0 &&
            livesColour == "#ff0000" ||
            diedRecently == 1) {
                livesColour = "#000";
        }
        diedRecently--;
    }
    ctx.fillStyle = livesColour;
    if (lives == -1) {
        var livesText = "0";
    } else {
        var livesText = lives.toString();
    }
    ctx.fillText(`Lives: ${livesText}`, canvas.width-96, 20);
}

function drawGameOver() {
    ctx.font = "36pt Verdana";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("Game Over", canvas.width/2 - 132, canvas.height/2 - 32);
    ctx.font = "16pt Verdana";
    ctx.fillText("left-click to restart", canvas.width/2 - 100, canvas.height/2 + 22);
}

function drawCountdown() {
    num = Math.floor(ballPause / 30) + 1;
    ctx.font = "36pt Verdana";
    ctx.fillStyle = purple;
    ctx.fillText(num, canvas.width/2 - 4, canvas.height/2 + 8);
}

function draw() {
    moveBall();
    movePaddle();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameOver == true) {
        drawGameOver();
    } else {
        drawBall();
        drawBricks();
        collideBallWithBricks();
        drawPaddle();
        drawLives();
    }
    drawScore();
    if (ballPause > 0) {
        drawCountdown();
    }
    requestAnimationFrame(draw);
}

/*
 * MOVING & COLLIDING CRAP
 */
function collideBallWithBricks() {
    for (var col = 0; col < brickColumnCount; col++) {
        for (var row = 0; row < brickRowCount; row++) {
            var b = bricks[col][row];
            if (
                b.broken == 0 &&
                x > b.x &&
                x < b.x + brickWidth &&
                y > b.y &&
                y < b.y + brickHeight
                ) {
                    if (
                        dx >= -speed &&
                        dx <= speed &&
                        Math.random() * 10 < 1
                        ) {
                            if (dx < 0) {
                                dx = dx + 3;
                            } else {
                                dx = dx - 3;
                            }
                    }
                    dy = -dy;
                    if (dx >= -speed && dx <= speed) {
                        dx = -dx + randomChoice([0, 0, 0, 1, -1]);
                    } else {
                        dx = -dx;
                    }
                    b.broken = 1;
                    score++;
                    if (score % (brickRowCount * brickColumnCount) == 0) {
                        createBricks();
                    }
            }
        }
    }
}

function moveBall() {
    if (ballPause > 0) {
        ballPause--;
        return;
    }
    x += dx;
    y += dy;
    if (dying > 0) {
        // crap is currently falling off the bottom of the screen
        dying--;
        if (dying == 0) {
            if (lives < 0) {
                gameOver = true;
            } else {
                resetBall();
            }
        }
        return;
    }

    if (
        x + dx > canvas.width - ballRadius ||
        x + dx < ballRadius
        ) {
            dx = -dx
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (
            x + ballRadius > paddleX &&
            x - ballRadius < paddleX + paddleWidth
            ) {
                // crap collides with paddle
                dy = -dy;
                if (dx < 0) {
                    var dir = 0;
                    if (dx < -speed) {
                        dx = -speed;
                    }
                } else {
                    var dir = 1;
                    if (dx > speed) {
                        dx = speed;
                    }
                }
                if (x - paddleX < paddleWidth / 2) {
                    // crap hit left side of paddle
                    var movement = Math.floor(-(x - (paddleX + paddleWidth/2)) / 12);
                    if (dir == 0) {
                        // crap moving left
                        dx -= movement;
                        if (paddleDir == 1) {
                            dx += 3;
                        }
                    } else {
                        // crap moving right
                        dx -= movement;
                    }
                } else {
                    // crap hit right side of paddle
                    var movement = Math.floor(-((paddleX + paddleWidth/2) - x) / 12);
                    if (dir == 0) {
                        // crap moving left
                        dx += movement;
                    } else {
                        // crap moving right
                        dx += movement;
                        if (paddleDir == 0) {
                            dx -= 3;
                        }
                    }
                }
        } else {
            // crap hit bottom of the screen
            dying = 30;
            lives--;
            if (lives > 0) {
                diedRecently = 90;
            }
        }
    }
}

function movePaddle() {
    if (
        rightPressed &&
        paddleX < canvas.width - (paddleWidth/2)
        ) {
            paddleX += paddleSpeed;
    }
    else if (
        leftPressed &&
        paddleX > 0 - (paddleWidth/2)
        ) {
            paddleX -= paddleSpeed;
    }
}

/*
 * START THE CRAP
 */
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
startGame();
draw()
// dedicated to strong bad apparently
