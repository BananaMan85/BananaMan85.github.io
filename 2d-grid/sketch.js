// 2d grid assignment
// William Sherwood
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//https://www.youtube.com/watch?v=TZfh8hpJIxo

let entities = {
  trees: [],
  pawns: [],
};
let world = [];
let treeCount = 5;
let cellSize = 50;

function setup() {
  createCanvas(800, 800);

  world = generateEmptyWorld(width/cellSize, height/cellSize);

  for (let i = 0; i < treeCount; i++){
    entities.trees.push(new Tree(i+1, i+1));

  }
  for (let i = 0; i < 1; i++){

    entities.pawns.push(new Pawn(0, 0));
  }
}

function draw() {
  background(220);

  drawWorld();
  updateWorld();

  for (let pawn of entities.pawns){
    pawn.findTree();
    pawn.move();
    for (let tree of entities.trees){
      tree.updatePawns();
    }
  }
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
    this.x = x;
    this.y = y;
  }
}

class Pawn extends Entity{

  constructor (x, y){
    super(x, y);
    this.food = 0;
    this.nextTree = null;
    this.atTree = false;

  }

  findTree(){
    if (this.nextTree && this.nextTree.full && !this.atTree){
      this.nextTree = null;
    }
    if (!this.nextTree){
      let tree = entities.trees[floor(random(entities.trees.length))];
      while (tree.full){
        tree = entities.trees[floor(random(entities.trees.length))];
      }
      this.nextTree ??= tree;
    }
  }

  move(){
    if (!this.atTree){
      let distX = this.nextTree.x - this.x;
      let distY = this.nextTree.y - this.y;
  
      if (distX !== 0 || distY !== 0){
        if (abs(distX) > abs(distY)){
          if (distX > 0){
            this.x += 1;
          }
          else{
            this.x -= 1;
          }
        }
        else{
          if (distY > 0){
            this.y += 1;
          }
          else{
            this.y -= 1;
          }
        }
      }

      distX = this.nextTree.x - this.x;
      distY = this.nextTree.y - this.y;
      if (distX === 0 && distY === 0){
        this.atTree = true;
      }
    }
  }
}

class Tree extends Entity{

  constructor (x, y){
    super(x, y);
    this.pawns = 0;
    this.full = false;

  }

  updatePawns(){
    this.pawns = 0;
    for (let pawn of entities.pawns){
      if (pawn.x === this.x && pawn.y === this.y && pawn.nextTree.x === this.x && pawn.nextTree.y === this.y){
        this.pawns++;
      }
    }
    if (this.pawns >= 2){
      this.full = true;
    }
    else{
      this.full = false;
    }
  }
}

function drawWorld(){
  for (let y = 0; y < world.length; y++){
    for (let x = 0; x < world[y].length; x++){
      fill("white");
      rect(x*cellSize, y*cellSize, cellSize, cellSize);

      if (world[y][x] === 'tree'){
        fill("black")
        textAlign(CENTER,CENTER);
        textSize(cellSize/2);
        text('1', x*cellSize + cellSize/2, y*cellSize + cellSize/2);
      }
      else if (world[y][x] === 'pawn'){
        fill("black")
        textAlign(CENTER,CENTER);
        textSize(cellSize/2);
        text('2', x*cellSize + cellSize/2, y*cellSize + cellSize/2);
      }
    }
  }
}

function updateWorld(){
  for (let y = 0; y < world.length; y++){
    for (let x = 0; x < world[y].length; x++){
      world[y][x] = 0;
    }
  }

  for (let pawn of entities.pawns){
    let x = pawn.x;
    let y = pawn.y;

    world[y][x] = 'pawn';
  }

  for (let tree of entities.trees){
    let x = tree.x;
    let y = tree.y;

    world[y][x] = 'tree';
  }
}