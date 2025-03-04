// Interactive Scene
// William Sherwood
// March 4, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//https://stackoverflow.com/questions/32642399/simplest-way-to-plot-points-randomly-inside-a-circle

//initilize variables
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
let speedX;
let speedY;
let inertia = 1/50;
let noiseOffsetX = 0;
let noiseOffsetY = 1000; //Seperate noiseX from noiseY
let noiseIncrement = 0.03;
let driftX = 0;
let driftY = 0;
let wander = 1;
let shots = [];
let score = 0;
let shootDelay = 1000; //1 second delay between shots
let shootTimeCounter = 0;
let difficultyChoices = ["Easy", "Medium", "Hard"];
let difficulty = 0;

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

  //grow or shrink accuracy circle, stop when a key is pressed
  if (growAccuracy === "grow"){
    accuracy += accuracySpeed;
    if (accuracy >= size){
      growAccuracy = "shrink";
    }
  }
  else if (growAccuracy === "shrink"){
    accuracy -= accuracySpeed;
    if (accuracy <= size - 9*(size/10)){
      growAccuracy = "grow";
    }
  }

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
  //choose random point in aim circle to shoot
  let angle = random(0, 2*PI);
  let pointRadius = random(0, (accuracy/2)**2);

  let shotX = pointRadius**(1/2) * cos(angle) + aimX;
  let shotY = pointRadius**(1/2) * sin(angle) + aimY;

  //add shot loaction to array of shots
  append(shots, shotX);
  append(shots, shotY);

  //add new shot to score total
  checkScore();
}

function drawShots(){
  //draw all current shots on the target
  fill("white");
  for (let i = 0; i < shots.length; i += 2){
    circle(Number(shots[i]), Number(shots[i+1]), 10);
  }

  //display score
  fill('red');
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);
  text("Score: " + score, x, y + height*(2/5));
}

function checkScore(){
  //add score from most recent shot
  let distance = dist(x, y, shots.slice(-2)[0], shots.slice(-1)[0]);
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
}

function mousePressed(){
  //when the mouse is clicked

  //shooting
  if (allowShoot && millis() - shootTimeCounter > shootDelay){
    shoot();
    shootTimeCounter = millis();
  }

  //clicking a button
  if (drawStartScreenScene){
    if (mouseX > x - x/8 && mouseX < x/4 + x - x/8){
      if (mouseY > height*(2/5) + height/20 && mouseY < y/10 + height*(2/5) + height/20){
        drawStartScreenScene = false;
        drawColoredTargetScene = true;
        pickAccuracyScene = true;
        drawShotsScene = true;
      }
      if (mouseY > height*(2/5) + height/8 && mouseY < y/10 + height*(2/5) + height/8){
        displayHowToPlay = true;
      }
    }
  }

}

function drawStartScreen(){
  difficultySelector();
  startButton();
  howToPlayButton();
  if (displayHowToPlay){
    fill('red');
    textAlign(CENTER, CENTER);
    textSize(size*(2/3)/10);
    text("Use scroll wheel to select difficulty", x, height*(2/5) + height/5 + y/20);
    text("Press any key to stop accuracy circle", x, height*(2/5) + height/5 + y/20 + size*(2/3)/10);
    text("Left click to shoot", x, height*(2/5) + height/5 + y/20 + (size*(2/3)/10)*2);
  }  
}

function difficultySelector(){
  //display the current difficulty selected
  fill('red');
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);
  text(difficultyChoices[difficulty], x, height*(2/5));

  if (difficultyChoices[difficulty] === "Easy"){
    wander = 0.5;
    accuracySpeed = 5;
    noiseIncrement = 0.2;
  }
  else if (difficultyChoices[difficulty] === "Medium"){
    wander = 1;
    accuracySpeed = 15;
    noiseIncrement = 0.3;
  }
  else if (difficultyChoices[difficulty] === "Hard"){
    wander = 5;
    accuracySpeed = 30;
    noiseIncrement = 0.6;
  }
}

function startButton(){
  //display the start button
  fill("red");
  rect(x - x/8, height*(2/5) + height/20, x/4, y/10);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);
  text("Start", x, height*(2/5) + height/20 + y/20);
}

function howToPlayButton(){
  //display the how to play button
  fill("red");
  rect(x - x/8, height*(2/5) + height/8, x/4, y/10);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(size*(2/3)/10);
  text("How to Play", x, height*(2/5) + height/8 + y/20);
}

function mouseWheel(event){
  //change difficulty based on mouse scroll wheel

  //increase difficulty when scrolling up and decrease when scrolling down
  if (event.delta < 0){
    difficulty += 1;
    difficulty %= 3;
  }
  else if(event.delta > 0){
    difficulty -= 1;
    if (difficulty < 0){
      difficulty = 2;
    }
  }
  return false;
}

function windowResized() {
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  changeSize();
}

function changeSize(){
  //adjust locations to account for new window size
  let oldSize = size;
  x = width / 2;
  y = height / 2;
  if (width <= height){
    size = width*(2/3);
  }
  else{
    size = height*(2/3);
  }
  if (oldSize){
    accuracy = map(accuracy, 0, oldSize, 0, size);
    for (let i = 0; i < shots.length; i++){
      shots[i] = map(shots[i], 0, oldSize, 0, size);
    }
  }
}