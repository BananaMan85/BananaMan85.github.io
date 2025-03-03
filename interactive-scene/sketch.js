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

let aimColor;

//state variables for drawing scenes
let drawColoredTargetScene = true;
let pickAccuracyScene = true;
let drawAimScene = false;
let drawShotsScene = true;
let allowShoot = false;

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
  textSize((size*(2/3))/10);
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
  if (allowShoot){
    shoot();
  }
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