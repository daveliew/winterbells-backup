/** @type {HTMLCanvasElement} */
//! TO DO LIST
//* core game build
//? add viewport + fix bg image
//? add condition that after first bell is caught, gameover sequence triggered
//? add sprites
//? add bird to double bonus
//* optimisation
//? create background image
//? add delta time
//? save max score
//? add pre-rendering for main character
//? ==> https://www.html5rocks.com/en/tutorials/canvas/performance/
//? ==> https://developer.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
//? refactor code --> clear all //? stuff.

//* ***DATA*** *//
const canvas = document.getElementById("game-layer");
const ctx = canvas.getContext("2d");

const audioObj = new Audio("/assets/winterbells.mp3");
audioObj.play();

const GAME_WIDTH = 600;
const GAME_HEIGHT = 450;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const colWidth = Math.floor((canvas.width * 0.9) / numBellCols);
const SCREEN_X_MID = Math.floor(canvas.width / 2);

const gravityPull = 3;
const difficulty = 3;
const framesPerSnow = 200;

const numBells = 10; //* change number of bells
const bellSpacing = canvas.height / 7; //vertical height
const playerJump = bellSpacing * 2;
const playerJumpVelocity = -8;
const minBellHeight = playerJump - bellSize;

let playerActivated = false;

let mouseClick = false;
let gameFrame = 0;
let lowestBell = {}; //! is this useless?

let playerHeight = 0;
let crossedHeight = false;
let score = 0;
let cameraPositionY = 0;

const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

//* ***MAIN PROGRAMME*** *//

//* Generate bell *//
//? refactor this to Simon's suggestion if there's time --> next bell takes a random pos from the array of possibilities
// [ - - - X - - -] 5
// [ - X - - - - -] 4
// [ - - - X - - -] 3
// [ - - - - - X -] 2
// [ - - X - - - -] 1
const bellXpos = [
  SCREEN_X_MID - colWidth * 3,
  SCREEN_X_MID - colWidth * 2,
  SCREEN_X_MID - colWidth * 1,
  SCREEN_X_MID,
  SCREEN_X_MID + colWidth * 1,
  SCREEN_X_MID + colWidth * 2,
  SCREEN_X_MID + colWidth * 3,
];

let prevX = 0;
let currX = Math.floor(bellXpos.length / 2); //3, start at centre

const randBellX = () => {
  prevX = currX;
  while (
    currX === prevX || //prevents a random bell from having same X as a previous bell
    currX - prevX <= -difficulty || //prevents a bell from being too far from a current bell
    currX - prevX >= difficulty
  ) {
    currX = Math.floor(Math.random() * bellXpos.length);
  }
  return currX;
};

const generateBell = (posY) => {
  let prevY = posY;
  while (bellArray.length < numBells) {
    let newX = randBellX();
    let bell = new Bell(bellXpos[newX], prevY);
    prevY -= bellSpacing;
    lowestBell = bell;
    bellArray.push(bell);
  }
  console.log("***BELLS CREATED***", bellArray);
};

const bellRender = (arr) => {
  const bellTranslation = bellSpacing;

  for (let i = 0; i < arr.length; i++) {
    if (crossedHeight || arr[1].y < canvas.height / 4) {
      //! tune this (BELL)
      // if (crossedHeight) {
      arr[i].y = arr[i].y + bellTranslation;
      console.log("we're going places!");
    }
    arr[i].update();
    arr[i].draw();
    hasCollided(player, arr[i]);
    if (arr[i].collided === true || arr[i].y > canvas.height - 100) {
      arr.splice(i, 1); // remove bell from array to manage total #objects
    }
  }
  const minBells = Math.floor(numBells / 2);
  if (arr.length <= minBells) {
    generateBell(arr[0].y - bellSpacing * minBells);
  }

  crossedHeight = false; // reset trigger for bell translation
};

//* Collision Detection Function *//
const hasCollided = (player, bell) => {
  const collisionDistance = player.width + bell.size;

  const distance = Math.sqrt(
    Math.pow(player.x - bell.x, 2) + Math.pow(player.y - bell.y, 2)
  );

  if (distance < collisionDistance) {
    player.collided = true;
    bell.collided = true;
    player.y = playerJump;
    player.velocityY = playerJumpVelocity;
    player.addScore();
    return true;
  }
};

//* ***EVENT LISTENERS*** *//

document.addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

//? fix this code
document.addEventListener("mousedown", (event) => {
  playerActivated = true;
  mouseClick = true;
  player.jumping = false;
  player.velocityY = playerJumpVelocity;
  // player.y += -30;
  console.log(event + "detected");

  //? find a way to remove mousedown after click so that player must use bells to jump
  //? https://www.geeksforgeeks.org/javascript-removeeventlistener-method-with-examples/
});

// const stopGameLoop = () => {
//   window.cancelAnimationFrame(requestAnimationFrameId);
// };

//* *** INITIALIZE GAME  *** *//
const player = new Player();
generateSnow();
generateBell(player.y - canvas.height / 2);

//*Handle Dynamic Frames using timeStamp (research Delta Time)
let secondsPassed,
  oldTimeStamp,
  timeStamp,
  highestHeight = 0;

let movingSpeed = 50;

//* *** GAME LOOP *** *//
const gameLoop = (timeStamp) => {
  //* time calculation
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  secondsPassed = Math.min(secondsPassed, 0.1);
  oldTimeStamp = timeStamp;

  //* reset variables for next frame phase
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  playerHeight = Math.floor((canvas.height - player.y) / 100);

  if (playerHeight > highestHeight) {
    highestHeight = playerHeight;
    // console.log("playerHeight", playerHeight, "highestHeight", highestHeight);
    crossedHeight = true;
    if (highestHeight >= 2 && highestHeight % 2 === 0) {
      //! tune this
      crossedHeight = false;
      console.log("CROSSED HEIGHT!");
    }
  }

  //* bell code
  bellRender(bellArray);

  //* player code
  player.update(secondsPassed);
  player.draw();
  // lowestBell = bellArray[0];
  // hasCollided(player, lowestBell); //! think about which bell it is later

  //* snow code
  snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
  snowCtx.fillStyle = "rgba(40,48,56,0.25)";
  snowRender(snow.snowArray);
  if (gameFrame % framesPerSnow === 0) {
    generateSnow(); //only generate snow every 200 frames
    // console.log("***BELLS STATUS***", bellArray);
  }

  //* screen cosmetics
  ctx.font = "20px Lucida";
  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${score}`, 20, 25);
  particlesHandler();

  //* Incrementors + resets
  hue += 2; // change snow colour
  gameFrame++;

  requestAnimationFrame(gameLoop); // recursive game loop

  //! TEST AREA
  console.log("player X pos and velocity", player.x, player.velocityX);
  // console.log("player Y pos and velocity", player.y, player.velocityY);
  console.log(mouse);
};

gameLoop(timeStamp);
