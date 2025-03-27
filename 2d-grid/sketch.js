// 2d grid assignment
// William Sherwood
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//https://www.youtube.com/watch?v=TZfh8hpJIxo

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

class Entity {

  constructor (x, y){
    this.pos = world[y][x];
  }
}

class Pawn extends Entity{

  constructor (x, y){
    super(x, y);
    this.food = 0;

  }
}

class Tree extends Entity{

  constructor (x, y){
    super(x, y);
    this.pawns = 0;

  }
}