// A dirt simple breakout game based on this tutorial:
// https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/
// Made by brianna at tassaron.com
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
var purple = "#993f70";
var rightPressed = false;
var leftPressed = false;
var score = 0;
var lives = 3;
var livesColour = "#000";
var gameOver = false;
var ballPause = 0;
var diedRecently = 0;
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
var paddleSpeed = 8;
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

// powerup crap
var fallingPowerup = 0;
var powerupColour = [
    "#000",    // nothing
    "#008000", // grow paddle
    "#BA0707", // shrink paddle
    "#FFA500", // faster ball
    "#800080"  // slower ball
];
var powerupWidth = brickWidth / 3;
var powerupHeight = brickHeight;
var powerupX = 0;
var powerupY = 0;
var powerupDy = speed;
var powerupDx = 0;


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
    speed = 4;
    paddleWidth = 96;
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

function spawnPowerup(newx, newy) {
    if (
        fallingPowerup == 0 &&
        Math.floor(Math.random() * 10) < 5
        ) {
            powerupX = newx;
            powerupY = newy;
            powerupDx = -dx;
            fallingPowerup = randomChoice([1,2,3,4]);
    }
}

/*
 * CONTROL HANDLER CRAP
 */
 function touchStartHandler(e) {
    if (gameOver == true) {
        startGame();
    }
    e.preventDefault();
 }

 function touchMoveHandler(e) {
    // get relative (to canvas) x coord of touch
    touch = e.changedTouches[0];
    var mouseX = touch.pageX - canvas.offsetLeft;
    if (mouseX > 0 && mouseX < canvas.width) {
        var oldPaddleX = paddleX;
        paddleX = mouseX - paddleWidth / 2;
        if (oldPaddleX - paddleX < 0) {
            paddleDir = 1;
        } else {
            paddleDir = 0;
        }
    }
    e.preventDefault();
 }

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

function drawPowerup() {
    if (fallingPowerup == 0) {
        return;
    }
    ctx.beginPath();
    ctx.rect(powerupX, powerupY, powerupWidth, powerupHeight);
    ctx.fillStyle = powerupColour[fallingPowerup];
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = "16pt Verdana";
    ctx.fillStyle = "#000";
    ctx.fillText(`Score: ${score}`, 12, 20);
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
    ctx.fillText("left-click to restart", canvas.width/2 - 92, canvas.height/2 + 22);
    drawMuffin(ctx);
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
    movePowerup();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameOver == true) {
        drawGameOver();
    } else {
        drawBall();
        drawBricks();
        collideBallWithBricks();
        collidePowerupWithPaddle();
        drawPaddle();
        drawPowerup();
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
                        dx = -dx + randomChoice(
                            [0, 0, 0, 0, 0, 0, 1, 1, -1, -1, 2, -2]
                        );
                    } else {
                        dx = -dx;
                    }
                    b.broken = 1;
                    score++;
                    spawnPowerup(b.x, b.y);
                    if (score % (brickRowCount * brickColumnCount) == 0) {
                        createBricks();
                    }
            }
        }
    }
}

function collidePowerupWithPaddle() {
        if (
            fallingPowerup > 0 &&
            powerupX + powerupWidth >= paddleX &&
            powerupX < paddleX + paddleWidth &&
            powerupY + powerupHeight > canvas.height - paddleHeight
            ) {
                switch (fallingPowerup) {
                case 1: // grow paddle
                    paddleWidth += 32;
                    break;
                case 2: // shrink paddle
                    if (paddleWidth > 32) {
                        paddleWidth -= 32;
                    }
                    break;
                case 3: // faster ball
                    speed += 2;
                    break;
                case 4: // slower ball
                    if (speed > 2) {
                        speed -= 2;
                    }
                    break;
                }
                fallingPowerup = 0;
        }
}


function movePowerup() {
    powerupX += powerupDx;
    powerupY += powerupDy;
    if (
        powerupX > canvas.width - powerupWidth ||
        powerupX < 0
        ) {
            powerupDx = -powerupDx
    }
    if (powerupY == canvas.height - powerupHeight) {
        fallingPowerup = 0;
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
            if (dx < 0) {
                dx -= Math.random() * (speed - 4);
            } else {
                dx += Math.random() * (speed - 4);
            }
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
                    if (dx <= -speed) {
                        dx = -speed - Math.random() * ((speed - 4)*1);
                    }
                } else {
                    var dir = 1;
                    if (dx >= speed) {
                        dx = speed + Math.random() * ((speed - 4)*1);
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
            if (lives > 0) {
                diedRecently = 90;
            }
            lives--;
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
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchmove", touchMoveHandler, false);
canvas.addEventListener("mousedown", mouseDownHandler, false);
canvas.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
startGame();
draw()
// dedicated to strong bad apparently


function drawMuffin(ctx) {
    // this function was generated by canvg
    ctx.save();
    ctx.strokeStyle="rgba(0,0,0,0)";
    ctx.miterLimit=4;
    ctx.scale(0.26666666666666666,0.26666666666666666);
    ctx.save();
    ctx.restore();
    ctx.save();
    ctx.translate(789.7776,402.66194);
    ctx.save();
    var g = ctx.createLinearGradient(431.43823,309.14993,455.10641,306.89993);
    g.addColorStop(0,"rgba(255, 92, 102, 1)");
    g.addColorStop(0.25,"rgba(255, 92, 102, 1)");
    g.addColorStop(0.5,"rgba(255, 77, 95, 1)");
    g.addColorStop(0.75,"rgba(255, 77, 95, 1)");
    g.addColorStop(1,"rgba(255, 92, 102, 1)");
    var canvas = document.createElement("canvas");
    canvas.width = 1044;
    canvas.height = 504;
    var ctx1 = canvas.getContext("2d");
    ctx1.fillStyle=g;
    ctx1.save();
    ctx1.strokeStyle="rgba(0,0,0,0)";
    ctx1.miterLimit=4;
    ctx1.beginPath();
    ctx1.moveTo(0,0);
    ctx1.lineTo(1044,0);
    ctx1.lineTo(1044,504);
    ctx1.lineTo(0,504);
    ctx1.closePath();
    ctx1.clip();
    ctx1.save();
    ctx1.translate(81,-208);
    ctx1.save();
    ctx1.beginPath();
    ctx1.moveTo(-10000,-10000);
    ctx1.lineTo(20000,-10000);
    ctx1.quadraticCurveTo(20000,-10000,20000,-10000);
    ctx1.lineTo(20000,20000);
    ctx1.quadraticCurveTo(20000,20000,20000,20000);
    ctx1.lineTo(-10000,20000);
    ctx1.quadraticCurveTo(-10000,20000,-10000,20000);
    ctx1.lineTo(-10000,-10000);
    ctx1.quadraticCurveTo(-10000,-10000,-10000,-10000);
    ctx1.closePath();
    ctx1.fill();
    ctx1.stroke();
    ctx1.restore();
    ctx1.restore();
    ctx1.restore();
    var p = ctx1.createPattern(ctx1.canvas,"no-repeat");
    ctx.fillStyle=p;
    ctx.strokeStyle="#000000";
    ctx.strokeStyle="rgba(0, 0, 0, 1)";
    ctx.lineWidth=7;
    ctx.lineJoin="round";
    ctx.miterLimit="4";
    ctx.beginPath();
    ctx.moveTo(288.18821,43.31544);
    ctx.lineTo(298.70770000000005,169.54932);
    ctx.bezierCurveTo(411.67574,184.59742,478.46090000000004,170.90475,529.22173,150.79719);
    ctx.bezierCurveTo(536.12483,96.3052,531.47084,-5.348219999999998,524.19067,28.679630000000003);
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle="#9e6432";
    ctx.fillStyle="rgba(158, 100, 50, 1)";
    ctx.strokeStyle="#000000";
    ctx.strokeStyle="rgba(0, 0, 0, 1)";
    ctx.lineWidth=7;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.miterLimit="4";
    ctx.beginPath();
    ctx.moveTo(526.86343,-21.43929);
    ctx.bezierCurveTo(543.19005,-48.707570000000004,513.40583,-69.40107,465.71123,-78.02789);
    ctx.bezierCurveTo(190.31725999999998,-125.75193999999999,231.11788,108.26156999999999,325.15244,52.03463000000001);
    ctx.bezierCurveTo(343.09062,64.98277,368.36647,66.92441000000001,400.90815,57.96730000000001);
    ctx.bezierCurveTo(416.24449,65.65659000000001,433.48974,67.61916000000001,452.47679,64.35634);
    ctx.bezierCurveTo(474.88674,65.60239,496.49178,63.830040000000004,514.08535,47.01467);
    ctx.bezierCurveTo(567.6820399999999,42.80888,556.14154,-3.9877599999999944,526.86343,-21.439289999999993);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle="#f5ff22";
    ctx.fillStyle="rgba(245, 255, 34, 1)";
    ctx.strokeStyle="#000000";
    ctx.strokeStyle="rgba(0, 0, 0, 1)";
    ctx.lineWidth=7;
    ctx.lineJoin="round";
    ctx.miterLimit="4";
    ctx.beginPath();
    ctx.moveTo(244.37647,-143.28752);
    ctx.lineTo(274.00412,-24.177139999999994);
    ctx.lineTo(492.33707000000004,-53.38428999999999);
    ctx.lineTo(462.25362000000007,-169.30013);
    ctx.lineTo(421.23073000000005,-85.78594);
    ctx.lineTo(361.9754300000001,-161.54198);
    ctx.lineTo(329.6129200000001,-78.94055);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.save();
    ctx.translate(789.7776,402.66194);
    ctx.save();
    ctx.fillStyle="rgba(0,0,0,0)";
    ctx.strokeStyle="#000000";
    ctx.strokeStyle="rgba(0, 0, 0, 1)";
    ctx.lineWidth=7;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.miterLimit="4";
    ctx.beginPath();
    ctx.moveTo(397.99094,146.86723);
    ctx.bezierCurveTo(409.15273,138.63389,428.84109,136.55501,443.0638,145.90707);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle="rgba(0, 0, 0, 1)";
    ctx.strokeStyle="#000000";
    ctx.strokeStyle="rgba(0, 0, 0, 1)";
    ctx.lineWidth=7;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.miterLimit="4";
    ctx.transform(0.84606142,0,0,1,123.64927,-204);
    ctx.beginPath();
    ctx.moveTo(274.711,302.51621220000004);
    ctx.bezierCurveTo(279.59255366631373,302.51621220000004,283.5498348,305.6820370890404,283.5498348,309.58728);
    ctx.bezierCurveTo(283.5498348,313.4925229109596,279.59255366631373,316.6583478,274.711,316.6583478);
    ctx.bezierCurveTo(269.8294463336863,316.6583478,265.87216520000004,313.4925229109596,265.87216520000004,309.58728);
    ctx.bezierCurveTo(265.87216520000004,305.6820370890404,269.8294463336863,302.51621220000004,274.711,302.51621220000004);
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle="rgba(0, 0, 0, 1)";
    ctx.strokeStyle="#000000";
    ctx.strokeStyle="rgba(0, 0, 0, 1)";
    ctx.lineWidth=7;
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.miterLimit="4";
    ctx.transform(0.98343684,0,0,1.0755093,86.541108,-226.36949);
    ctx.beginPath();
    ctx.moveTo(394.91913,297.5664491);
    ctx.bezierCurveTo(398.23858634729015,297.5664491,400.9295374,299.9408177891661,400.9295374,302.86975);
    ctx.bezierCurveTo(400.9295374,305.79868221083393,398.23858634729015,308.1730509,394.91913,308.1730509);
    ctx.bezierCurveTo(391.59967365270984,308.1730509,388.9087226,305.79868221083393,388.9087226,302.86975);
    ctx.bezierCurveTo(388.9087226,299.9408177891661,391.59967365270984,297.5664491,394.91913,297.5664491);
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.restore();
    ctx.moveTo(80000,80000)
}
