// Terrain Generation Demo


let terrain = [];
const NUMBER_OF_RECTS = 5000;

function setup() {
  createCanvas(windowWidth, windowHeight);
  generateTerrain(width/NUMBER_OF_RECTS);
}

function draw() {
  background(220);
  noStroke();
  fill('green');

  for (let someRect of terrain){
    rect(someRect.x, someRect.y, someRect.w, someRect.h);
  }
}

function generateTerrain(widthOfRect){
  for (let i = 0; i < NUMBER_OF_RECTS; i++){
    terrain.push(spawnRectangle(i * widthOfRect, noise(i*0.0008)*height, widthOfRect));
  }
}

function spawnRectangle(leftSide, rectHeight, rectWidth){
  let theRect = {
    x: leftSide,
    y: height - rectHeight,
    w: rectWidth,
    h: rectHeight,
  };
  return theRect;
}