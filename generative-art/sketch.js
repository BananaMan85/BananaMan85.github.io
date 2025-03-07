// Generative art demo
// Using object notation and arrays
// March 7, 2025

let someLine; 
let lines = [];
const LINE_SIZE = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  fillRows(); 
}

function draw() {
  background(220);
  for (let someLine of lines){
    line(someLine.x1, someLine.y1, someLine.x2, someLine.y2);
  }
}

function spawnLine(x, y, theSize){
  let choice = random(100);
  let theLine;
  if (choice < 50){
    //negative slope
    theLine = {
      x1: x-theSize/2,
      y1: y-theSize/2,
      x2: x+theSize/2,
      y2: y+theSize/2,
    };
  }  
  else{
    //positive slope
    theLine = {
      x1: x-theSize/2,
      y1: y+theSize/2,
      x2: x+theSize/2,
      y2: y-theSize/2,
    };
  }
  return theLine;
}

function fillRows(){
  for (let y = 0; y < height; y += LINE_SIZE){
    for (let x = 0; x < width; x += LINE_SIZE){
      lines.push(spawnLine(x, y, LINE_SIZE));
    }
  }
}