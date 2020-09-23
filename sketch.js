/* 
 *  Derived from Aidan Lincoln's Handtrack to leds
 *  Aidan Lincoln aidanlincoln@nyu.edu
 *  ITP/NYU
 *  Handtrack.js victordibia
 *  https://github.com/victordibia/handtrack.js/
 */


const video = document.getElementById("webCam");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let updateNote = document.getElementById("message");

//turn video on or off
let renderVideo = false;

let videoLoaded = false;
let model = null;
let xCord;
let yCord;
let xCord2;
let yCord2;
let xFullCord;
let yFullCord;

const modelParams = {
    flipHorizontal: true,  // flip e.g for video  
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.07,     // ioU threshold for non-max suppression
    scoreThreshold: 0.6,   // confidence threshold for predictions.
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = ""
    startVideo();
});


function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        // console.log("video started", status);
        if (status) {
            updateNote.innerText = ""
            videoLoaded = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}


function runDetection() {
  model.detect(video).then(predictions => {
    if(predictions[0]){
      let bboxX = predictions[0].bbox[0] + predictions[0].bbox[2]/2;
      let bboxY = predictions[0].bbox[1] + predictions[0].bbox[3]/2;
      xCord = bboxX;
      yCord = bboxY;
      if(predictions[1]){
        let bboxX2 = predictions[1].bbox[0] + predictions[1].bbox[2]/2;
        let bboxY2 = predictions[1].bbox[1] + predictions[1].bbox[3]/2;
        xCord2 = bboxX2;
        yCord2 = bboxY2;
      }
      else{
        xCord2 = null;
        yCord2 = null;
      }
    }
    else{
      xCord = null;
      yCord = null;
      xCord2 = null;
      yCord2 = null;
    }
    if(renderVideo){
      model.renderPredictions(predictions, canvas, context, video);
    }
    if (videoLoaded) {
      requestAnimationFrame(runDetection);
    }
  });
}



// the snake is divided into small segments, which are drawn and edited on each 'draw' call
let numSegments = 10;
let direction = 'right';

const xStart = 0; //starting x coordinate for snake
const yStart = 250; //starting y coordinate for snake
const diff = 10;

let xCor = [];
let yCor = [];

let xFruit = 0;
let yFruit = 0;
let scoreElem;

function setup() {
  scoreElem = createDiv('Score = 0');
  scoreElem.position(20, 20);
  scoreElem.id = 'score';
  scoreElem.style('color', 'white');

  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(15);
  stroke(255);
  strokeWeight(10);
  updateFruitCoordinates();

  for (let i = 0; i < numSegments; i++) {
    xCor.push(xStart + i * diff);
    yCor.push(yStart);
  }

  
}

function draw() {
  background(0);
  for (let i = 0; i < numSegments - 1; i++) {
    line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
  }
  xFullCord = map(xCord, 0, 600, 0, window.innerWidth)
  yFullCord = map(yCord, 0, 400, 0, window.innerHeight)
  updateSnakeCoordinates();
  checkGameStatus();
  checkForFruit();
  console.log(xFullCord, yFullCord)
  console.log(xFullCord)
  if(xCord != null && yCord != null){
    ellipse(xFullCord, yFullCord, width/12);
  }
  if(xCord2 != null && yCord2 != null){
     ellipse(xCord2, yCord2, width/12);
  }

}

/*
 The segments are updated based on the direction of the snake.
 All segments from 0 to n-1 are just copied over to 1 till n, i.e. segment 0
 gets the value of segment 1, segment 1 gets the value of segment 2, and so on,
 and this results in the movement of the snake.

 The last segment is added based on the direction in which the snake is going,
 if it's going left or right, the last segment's x coordinate is increased by a
 predefined value 'diff' than its second to last segment. And if it's going up
 or down, the segment's y coordinate is affected.
*/
function updateSnakeCoordinates() {
  for (let i = 0; i < numSegments - 1; i++) {
    xCor[i] = xCor[i + 1];
    yCor[i] = yCor[i + 1];
  }
  switch (direction) {
    case 'right':
      xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'up':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
      break;
    case 'left':
      xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'down':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
      break;
  }
    if(xFullCord > innerWidth* 2/3 && yFullCord > innerHeight/2)
    {
      if (direction !== 'left')
      {
        direction = 'right';
        console.log('right')
      } 
    } else if (xFullCord < innerWidth/3 && yFullCord > innerHeight/2){
      if (direction !== 'right') {
        direction = 'left';
        console.log('left')

      }
    } else if (xFullCord > innerWidth/4 && xFullCord < innerWidth * 2/3 && yFullCord > innerHeight/2) {
      if (direction !== 'up') {
        direction = 'down';
        console.log('down')

      }
    } else if (xFullCord > innerWidth/3 && xFullCord < innerWidth * 2/3 && yFullCord < innerHeight/2){
      if (direction !== 'down') {
        direction = 'up';
      }
    }
  }
  

/*
 I always check the snake's head position xCor[xCor.length - 1] and
 yCor[yCor.length - 1] to see if it touches the game's boundaries
 or if the snake hits itself.
*/
function checkGameStatus() {
  if (
    xCor[xCor.length - 1] > width ||
    xCor[xCor.length - 1] < 0 ||
    yCor[yCor.length - 1] > height ||
    yCor[yCor.length - 1] < 0 ||
    checkSnakeCollision()
  ) {
    noLoop();
    const scoreVal = parseInt(scoreElem.html().substring(8));
    scoreElem.html('Game ended! Your score was : ' + scoreVal);
  }
}

/*
 If the snake hits itself, that means the snake head's (x,y) coordinate
 has to be the same as one of its own segment's (x,y) coordinate.
*/
function checkSnakeCollision() {
  const snakeHeadX = xCor[xCor.length - 1];
  const snakeHeadY = yCor[yCor.length - 1];
  for (let i = 0; i < xCor.length - 1; i++) {
    if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
      return true;
    }
  }
}

/*
 Whenever the snake consumes a fruit, I increment the number of segments,
 and just insert the tail segment again at the start of the array (basically
 I add the last segment again at the tail, thereby extending the tail)
*/
function checkForFruit() {
  point(xFruit, yFruit);
  if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
    const prevScore = parseInt(scoreElem.html().substring(8));
    scoreElem.html('Score = ' + (prevScore + 1));
    xCor.unshift(xCor[0]);
    yCor.unshift(yCor[0]);
    numSegments++;
    updateFruitCoordinates();
  }
}

function updateFruitCoordinates() {
  /*
    The complex math logic is because I wanted the point to lie
    in between 100 and width-100, and be rounded off to the nearest
    number divisible by 10, since I move the snake in multiples of 10.
  */

  xFruit = floor(random(10, (width - 100) / 10)) * 10;
  yFruit = floor(random(10, (height - 100) / 10)) * 10;
}

function keyPressed() {
  switch (keyCode) {
    case 74:
      if (direction !== 'right') {
        direction = 'left';
      }
      break;
    case 76:
      if (direction !== 'left') {
        direction = 'right';
      }
      break;
    case 73:
      if (direction !== 'down') {
        direction = 'up';
      }
      break;
    case 75:
      if (direction !== 'up') {
        direction = 'down';
      }
      break;
  }
}
