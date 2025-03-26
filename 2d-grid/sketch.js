// 2d grid assignment
// William Sherwood
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let world = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
}

function generateEmptyWorld(width, height){
  let newGrid = [];
  for (let y = 0; y < height; y++){
    newGrid.push([]);
    for (let x = 0; x < width; x++){
      newGrid[y].push(0);
    }
  }

  return newGrid;
}

class Pawn {

  constructor (x, y){
    this.home = world[y][x];
    this.pos = world[y][x];
  }
}