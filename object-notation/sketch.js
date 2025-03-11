// Arrays and object notation assignment
// William Sherwood
// March 20, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let scaleFactor ={
  width: 800,
  height: 800,
  x: 1,
  y: 1,
};

let shared;

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org", 
  );
  shared = partyLoadShared("shared", { x: 100, y: 100 });
}

function setup() {
  createCanvas(800, 800);
}

function draw() {
  background(220);
}

function windowResized() {
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  
  //change scale factor based on new window size
  scaleFactor.x = width/scaleFactor.width;
  scaleFactor.y = height/scaleFactor.height;
}
