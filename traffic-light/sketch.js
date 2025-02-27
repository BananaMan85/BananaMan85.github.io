// Traffic Light Starter Code
// Your Name Here
// The Date Here

// GOAL: make a 'traffic light' simulator. For now, just have the light
// changing according to time. You may want to investigate the millis()
// function at https://p5js.org/reference/#/p5/millis

let theColors = ["green", "yellow", "red"];
let trafficColor = 0;
let waitTime = 1000;
let timePassed = 0;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(255);
  drawOutlineOfLights();
  changeColor();
  fillLights();
}

function drawOutlineOfLights() {
  //box
  rectMode(CENTER);
  fill(0);
  rect(width/2, height/2, 75, 200, 10);

  //lights
  fill(255);
  ellipse(width/2, height/2 - 65, 50, 50); //top
  ellipse(width/2, height/2, 50, 50); //middle
  ellipse(width/2, height/2 + 65, 50, 50); //bottom
}

function changeColor(){
  if (millis() - timePassed > waitTime){
    timePassed = millis();
    trafficColor += 1;
    trafficColor %= 3;
  }
}

function fillLights(){
  fill(theColors[trafficColor]);
  if (trafficColor === 0){
    ellipse(width/2, height/2 + 65, 50, 50); //bottom
  }
  else if (trafficColor === 1){
    ellipse(width/2, height/2, 50, 50); //middle
  }
  else if (trafficColor === 2){
    ellipse(width/2, height/2 - 65, 50, 50); //top
  }
}