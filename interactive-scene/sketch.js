// Interactive Scene
// William Sherwood
// March 3, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


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
let accuracySpeed = 3;
let keyJustPressed = false;
let aimX;
let aimY;
let speedX;
let speedY;
let inertia = 1/50;
let noiseOffsetX = 0;
let noiseOffsetY = 1000; // Seperate noiseX from noiseY
let noiseIncrement = 0.03;
let driftX = 0;
let driftY = 0;
let wander = 1;
let shotX;
let shotY;
let shots = [];

let aimColor;

let drawColoredTargetScene = true;
let pickAccuracyScene = true;
let drawAimScene = true;
let drawShotsScene = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  changeSize();
  
  aimColor = color(255,255,255);
  aimColor.setAlpha(128);
  
  aimX = random(x-size/2, x+size/2);
  aimY = random(y-size/2, y+size/2);
}

function draw() {
  background(240);
  runScenes();
  
  keyJustPressed = false;
}


function runScenes(){
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
  for (let i = 0; i < theColors.length; i++){
    fill(theColors[i]);
    circle(x, y, size - i*(size/10));
  }
}

function pickAccuracy(){  
  fill(aimColor);
  if (growAccuracy !== "stop"){
    circle(x, y, accuracy);
    if (growAccuracy === "grow"){
      accuracy += accuracySpeed;
      if (accuracy >= size){
        growAccuracy = "shrink";
      }
    }
    else if (growAccuracy === "shrink"){
      accuracy -= accuracySpeed;
      if (accuracy <= 0){
        growAccuracy = "grow";
      }
    }

    if (keyJustPressed){
      growAccuracy = "stop";
      drawAimScene = true;
    }
  }
}

function drawAim(){
  fill(aimColor);
  circle(aimX, aimY, accuracy);
  
  speedX = (mouseX - aimX) * inertia;
  speedY = (mouseY - aimY) * inertia;
  
  if (dist(mouseX, mouseY, aimX, aimY) < accuracy){
  
    driftX = map(noise(noiseOffsetX), 0, 1, -wander, wander);
    driftY = map(noise(noiseOffsetY), 0, 1, -wander, wander);

    noiseOffsetX += noiseIncrement;
    noiseOffsetY += noiseIncrement;
  }
  
  aimX += speedX + driftX;
  aimY += speedY + driftY;
  
  // console.log('X: ' + driftX);
  // console.log('Y: ' + driftY);
  // console.log(dist(mouseX, mouseY, aimX, aimY) < accuracy)
}

function shoot(){
  fill("black");
  shotX = random(aimX, aimX + (((accuracy/2)**2)**(1/2) * cos(random(0, 2*PI))));
  shotY = random(aimY, aimY + (((accuracy/2)**2)**(1/2) * sin(random(0, 2*PI))));

  console.log("X: " + shotX);
  console.log("Y: " + shotY);

  shots += [shotX, shotY];
  circle(shotX, shotY, 10);
  console.log(shots);

}

function drawShots(){
  for (let i = 0; i < shots.length; i++){
    circle(int(shots[i][0]), int(shots[i][1], 10), 10);
  }
}


function keyPressed(){
  if (!keyJustPressed){
    keyJustPressed = true;
  }
  shoot();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  changeSize();
}

function changeSize(){
  x = width / 2;
  y = height / 2;
  if (width <= height){
    size = width*(2/3);
  }
  else{
    size = height*(2/3);
  }
}