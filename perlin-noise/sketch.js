// Perlin Noise Demo
// Moving a circle

let x;
let y;
let noiseX = 0;
let noiseY = 1000;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);

  x = noise(noiseX) * width;
  y = noise(noiseY) * height;
  noStroke();
  fill('black');
  circle(x, y, 50);

  noiseX += 0.005;
  noiseY += 0.005;

}

function updateNoise(){

}