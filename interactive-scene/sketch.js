// Interactive Scene
// William Sherwood
// March 4, 2025
//
// Extra for Experts:
// This project can adjust to the user resizing the window through the changeSize() function.
// This project uses the mouse wheel as an input when selecting the difficulty for the game

//initialize global variables
let theColors = [
  "white",
  "white",
  "black",
  "black",
  "blue",
  "blue",
  "red",
  "red",
  "yellow",
  "yellow",
];
let x;
let y;
let size;
let accuracy = 50;
let growAccuracy = "grow";
let accuracySpeed = 10;
let keyJustPressed = false;
let aimX;
let aimY;
let inertia = 1/50;
let noiseOffsetX = 0;
let noiseOffsetY = 1000; //Seperate noiseX from noiseY
let noiseIncrement = 0.03;
let wander = 1;
let shots = [];
let score;
let shootDelay = 1000; //1 second delay between shots
let shootTimeCounter = 0;
let difficultyChoices = ["Easy", "Medium", "Hard"];
let difficulty = 0;
let shotsRemaining;
let startButtonPoints = [];
let helpButtonPoints = []

let aimColor;

//state variables for drawing scenes
let drawColoredTargetScene = false;
let pickAccuracyScene = false;
let drawAimScene = false;
let drawShotsScene = false;
let drawStartScreenScene = true;
let allowShoot = false;
let displayHowToPlay = false;

function setup() {
  //setup canvas
  createCanvas(windowWidth, windowHeight);
  changeSize();
  
  //create transparent color
  aimColor = color(255,255,255);
  aimColor.setAlpha(128);
  
  //randomize starting position for aim
  aimX = random(x-size/2, x+size/2);
  aimY = random(y-size/2, y+size/2);
}

function draw() {
  background(240);
  runScenes();
  
  keyJustPressed = false;
}

function runScenes(){
  //run selected scenes
  if (drawColoredTargetScene){
    drawColoredTarget();
  }
  if (pickAccuracyScene){
    pickAccuracy();
  }
  if (drawAimScene){
    drawAim();
  }
  if (drawShotsScene){
    drawShots();
  }
  if (drawStartScreenScene){
    drawStartScreen();
  }
}

function drawColoredTarget() {
  //draw target
  for (let i = 0; i < theColors.length; i++){
    fill(theColors[i]);
    circle(x, y, size - i*(size/10));
  }
}

function pickAccuracy(){  
  //allow player to pick accuracy
  fill(aimColor);
  circle(x, y, accuracy);

  //grow or shrink accuracy circle up to size of target
  if (growAccuracy === "grow"){
    accuracy += accuracySpeed;
    if (accuracy >= size){
      growAccuracy = "shrink";
    }
  }
  else if (growAccuracy === "shrink"){
    accuracy -= accuracySpeed;
    if (accuracy <= size - 9*(size/10)){
      accuracy = size - 9*(size/10);
      growAccuracy = "grow";
    }
  }

  //select accuracy and begin shooting
  if (keyJustPressed){
    pickAccuracyScene = false;
    drawAimScene = true;
    allowShoot = true;
  }
}

function drawAim(){
  //draw where the player is aiming
  fill(aimColor);
  circle(aimX, aimY, accuracy);

  let driftX = 0;
  let driftY = 0;
  let speedX;
  let speedY;
  
  //cause aim to drag behind cursor
  speedX = (mouseX - aimX) * inertia;
  speedY = (mouseY - aimY) * inertia;
  
  //cause aim to 'wander' around the mouse when close to the mouse
  if (dist(mouseX, mouseY, aimX, aimY) < accuracy){
  
    driftX = map(noise(noiseOffsetX), 0, 1, -wander, wander);
    driftY = map(noise(noiseOffsetY), 0, 1, -wander, wander);

    noiseOffsetX += noiseIncrement;
    noiseOffsetY += noiseIncrement;
  }
  
  //move aim according to speed and drift
  aimX += speedX + driftX;
  aimY += speedY + driftY;
}

function shoot(){
  //shoot at the target based on accuracy circle
  shotsRemaining -= 1;

  //choose random point in aim circle to shoot
  let angle = random(0, 2*PI);
  let pointRadius = random(0, (accuracy/2)**2);
  let shotX = pointRadius**(1/2) * cos(angle) + aimX;
  let shotY = pointRadius**(1/2) * sin(angle) + aimY;

  //add shot loaction to array of shots
  shots.push(shotX);
  shots.push(shotY);

  //add new shot to score total
  checkScore();
}

function drawShots(){
  //draw all current shots on the target
  fill("white");
  for (let i = 0; i < shots.length; i += 2){
    circle(Number(shots[i]), Number(shots[i+1]), size/100);
  }

  //display score
  fill('red');
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);
  text("Score: " + score, x, y + height*(2/5));

  //display remaining shots
  text("Shots: " + shotsRemaining, x, y + height*(2/5) + size*(2/3)/10);
}

function checkScore(){
  //add score from most recent shot

  //find distance of shot from the centre
  let distance = dist(x, y, shots.slice(-2)[0], shots.slice(-1)[0]);

  //add 1 to score for every ring that the shot is inside of
  for (let i = 0; i < theColors.length; i++){
    if (distance < (size - i*(size/10))/2){
      score += 1;
    }
  }
}

function keyPressed(){
  //when a key is pressed
  if (!keyJustPressed){
    keyJustPressed = true;
  }

  //reset the game when 'r' is pressed
  if (key === 'r'){
    drawColoredTargetScene = false;
    pickAccuracyScene = false;
    drawAimScene = false;
    drawShotsScene = false;
    drawStartScreenScene = true;
    allowShoot = false;
    displayHowToPlay = false;
  }
}

function mousePressed(){
  //when the mouse is clicked

  //shoot when allowed and a 1 second delay has passed and the player has shots remaining
  if (allowShoot && millis() - shootTimeCounter > shootDelay && shotsRemaining > 0){
    shoot();
    shootTimeCounter = millis();
  }

  //clicking a button on the start screen
  if (drawStartScreenScene){
    if (isMouseInRect(startButtonPoints[0], startButtonPoints[1], startButtonPoints[2], startButtonPoints[3])){
        start();
      }
    if (isMouseInRect(helpButtonPoints[0], helpButtonPoints[1], helpButtonPoints[2], helpButtonPoints[3])){
        displayHowToPlay = true;
      }
  }
}

function isMouseInRect(x, y, w, h){
  //check if the mouse is in a rectangle with the top left corner at coordinates (x,y), width w, and height h
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function start(){
  //begin running the game

  //reset game states and start proper scenes
  drawStartScreenScene = false;
  drawColoredTargetScene = true;
  pickAccuracyScene = true;
  drawShotsScene = true;
  shotsRemaining = 10;
  score = 0;
  shots = [];

  //update the variables associated with difficulty
  if (difficultyChoices[difficulty] === "Easy"){
    wander = 0.5;
    accuracySpeed = 15;
    noiseIncrement = 0.2;
  }
  else if (difficultyChoices[difficulty] === "Medium"){
    wander = 2.5;
    accuracySpeed = 30;
    noiseIncrement = 0.2;
  }
  else if (difficultyChoices[difficulty] === "Hard"){
    wander = 5;
    accuracySpeed = 75;
    noiseIncrement = 0.2;
  }
}

function drawStartScreen(){
  //display the start screen
  difficultySelector();
  startButton();
  howToPlayButton();

  //display the instructions for the game
  if (displayHowToPlay){
    fill('red');
    textAlign(CENTER, CENTER);
    textSize(size*(2/3)/10);
    text("Use scroll wheel to select difficulty", x, height*(2/5) + height/5 + y/20);
    text("Press any key to stop accuracy circle", x, height*(2/5) + height/5 + y/20 + size*(2/3)/10);
    text("Left click to shoot", x, height*(2/5) + height/5 + y/20 + (size*(2/3)/10)*2);
    text("Press 'r' to reset", x, height*(2/5) + height/5 + y/20 + (size*(2/3)/10)*3);
  }  
}

function difficultySelector(){
  //display the current difficulty selected
  let difficultyText = difficultyChoices[difficulty];
  let buffer = x/50
  let textY = height*(2/5)
  
  //create the parameters for the points of the triangles
  let trianglePoints = [];
  trianglePoints.push(x + textWidth(difficultyText)/2 + buffer);
  trianglePoints.push(textY + textSize(difficultyText)/2);
  trianglePoints.push(x + textWidth(difficultyText)/2 + buffer);
  trianglePoints.push(textY - textSize(difficultyText)/2);
  trianglePoints.push(x + textWidth(difficultyText)/2 + buffer*3);
  trianglePoints.push(textY);

  //draw the selected difficulty on the screen
  fill('red');
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);
  text(difficultyText, x, textY);

  triangle(trianglePoints[0], trianglePoints[1], trianglePoints[2], trianglePoints[3], trianglePoints[4], trianglePoints[5]);
  triangle((trianglePoints[0] - x)*-1 + x, trianglePoints[1], (trianglePoints[2] - x)*-1 + x, trianglePoints[3], (trianglePoints[4] - x)*-1 + x, trianglePoints[5]);
}

function startButton(){
  //display the start button
  let buttonText = "Start"
  let buttonBuffer = x/50;

  //create the parameters for the points of the start button
  startButtonPoints = [];
  startButtonPoints.push(x - textWidth(buttonText)/2 - buttonBuffer);
  startButtonPoints.push(height*(2/5) + height/20);
  startButtonPoints.push(textWidth(buttonText) + buttonBuffer*2);
  startButtonPoints.push(y/10);

  //draw the start button on the screen
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);

  fill("red");
  rect(startButtonPoints[0], startButtonPoints[1], startButtonPoints[2], startButtonPoints[3]);

  fill('white');
  text("Start", x, height*(2/5) + height/20 + y/20);
}

function howToPlayButton(){
  //display the how to play button
  let buttonText = "How To Play"
  let buttonBuffer = x/50;

  //create the parameters for the points of the help button
  helpButtonPoints = [];
  helpButtonPoints.push(x - textWidth(buttonText)/2 - buttonBuffer);
  helpButtonPoints.push(height*(2/5) + height/8);
  helpButtonPoints.push(textWidth(buttonText) + buttonBuffer*2);
  helpButtonPoints.push(y/10);

  //draw the how to play button on the screen
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);

  fill("red");
  rect(helpButtonPoints[0], helpButtonPoints[1], helpButtonPoints[2], helpButtonPoints[3]);

  fill('white');
  text(buttonText, x, height*(2/5) + height/8 + y/20);
}

function mouseWheel(event){
  //change difficulty based on mouse scroll wheel

  //increase difficulty when scrolling up and decrease when scrolling down
  if (event.delta < 0){
    difficulty += 1;
    difficulty %= difficultyChoices.length;
  }
  else if(event.delta > 0){
    difficulty += -1 + difficultyChoices.length;
    difficulty %= difficultyChoices.length;
  }
  return false;
}

function windowResized() {
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  changeSize();
}

function changeSize(){
  //adjust variables to account for new window size
  let oldSize = size;
  let oldX = x
  let oldY = y
  x = width / 2;
  y = height / 2;

  size = min(width, height)*(2/3);

  //adjust sizes and locations to account for new window size
  if (oldSize){
    accuracy = map(accuracy, 0, oldSize, 0, size);
    for (let i = 0; i < shots.length; i += 2){
      let relX = (shots[i] - oldX) / oldSize;
      let relY = (shots[i + 1] - oldY) / oldSize;
      
      shots[i] = x + relX * size;
      shots[i + 1] = y + relY * size;
    }
  }
}