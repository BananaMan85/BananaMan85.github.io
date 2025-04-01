// 2d grid assignment
// William Sherwood
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//inspiration:
//https://www.youtube.com/watch?v=TZfh8hpJIxo

let entities = {
  trees: [],
  pawns: [],
};
let world = [];
let treeCount = 5;
let cellSize = 50;
let pawnsInPlace = false;
let gridWidth, gridHeight;
const DOVE = 0;
const HAWK = 1;

//results for each type of encounter
let doveDove = 3;
let doveHawk = 0.5;
let hawkDove = 2.5;
let hawkHawk = 0.5;

function setup() {
  createCanvas(800, 800);
  
  gridWidth = width/cellSize;
  gridHeight = height/cellSize;

  world = generateEmptyWorld(gridWidth, gridHeight);

  placeTrees();

  for (let i = 0; i < 11; i++){
    createPawn(DOVE);
  }
}

function draw() {
  background(220);

  drawWorld();
  updateWorld();

  for (let pawn of entities.pawns){
    pawn.findDestination();
    pawn.move();
    for (let tree of entities.trees){
      tree.updatePawns();
    }
  }
}

function createPawn(strategy){
  let x;
  let y;

  //pick random corner
  if (random() < 0.5){
    x = 0;
  }
  else{
    x = gridWidth-1;
  }
  if (random() < 0.5){
    y = 0;
  }
  else{
    y = gridHeight-1;
  }

  //move a random amount on a random axis
  if (random() < 0.5){
    x += floor(random(gridWidth));
    x %= gridWidth;
  }
  else{
    y += floor(random(gridHeight));
    y %= gridHeight;
  }

  entities.pawns.push(new Pawn(x, y, strategy));
}

function placeTrees(){
  for (let i = 0; i < treeCount; i++){
    let treeX = floor(random(1, gridWidth - 1));
    let treeY = floor(random(1, gridHeight - 1));
    let isTaken = true;
    while (isTaken){
      isTaken = false;
      for (let tree of entities.trees){
        if (tree.x === treeX && tree.y === treeY){
          isTaken = true;
        }
      }
    }
    entities.trees.push(new Tree(treeX, treeY));
  }
}

function randomizePawnOrder(){
  for (let i = entities.pawns.length - 1; i > 0; i--){
    let j = floor(random(i+1));
    [entities.pawns[i], entities.pawns[j]] = [entities.pawns[j], entities.pawns[i]];
  }
}

function generateEmptyWorld(width, height){
  let newGrid = [];
  for (let y = 0; y < height; y++){
    newGrid.push([]);
    for (let x = 0; x < width; x++){
      newGrid[y].push([]);
    }
  }

  return newGrid;
}

class Entity {

  constructor (x, y){
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
  }
}

class Pawn extends Entity{

  constructor (x, y, strategy){
    super(x, y);
    this.strategy = strategy;
    this.food = 0;
    this.destination = [];
    this.atTree = false;
    this.die = false;

  }

  findDestination(){
    if (this.destination.length === 0 || this.die){
      if (this.die){
        this.destination = [this.homeX, this.homeY];
        return;
      }
  
      let tree = entities.trees[floor(random(entities.trees.length))];
      while (tree.full){
        if (isWorldFull()){
          this.die = true;
          return;
        }
        tree = entities.trees[floor(random(entities.trees.length))];
      }
      tree.pawns++;
      this.destination = [tree.x, tree.y];
    }
  }

  move(){
    let distX;
    let distY;

    if (this.die){
      distX = this.homeX - this.x;
      distY = this.homeY - this.y;
    }
    else if (!this.atTree){
      distX = this.destination[0] - this.x;
      distY = this.destination[1] - this.y;
    }
    
    if (distX === 0 && distY === 0){
      if (!this.die){
        this.atTree = true;
        return;
      }
      else{
        return;
      }
    }

    if ((distX !== 0 || distY !== 0) && !this.atTree){
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
  }
}

class Tree extends Entity{

  constructor (x, y){
    super(x, y);
    this.pawns = 0;
    this.full = false;

  }

  updatePawns(){
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

      if (world[y][x].includes('tree')){
        fill("black");
        textAlign(CENTER,CENTER);
        textSize(cellSize/2);
        text('1', x*cellSize + cellSize/2, y*cellSize + cellSize/2);
      }
      else if (world[y][x].includes('pawn')){
        fill("black");
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
      world[y][x] = [];
    }
  }

  for (let pawn of entities.pawns){
    let x = pawn.x;
    let y = pawn.y;

    world[y][x].push('pawn');
  }

  for (let tree of entities.trees){
    let x = tree.x;
    let y = tree.y;

    world[y][x].push('tree');
  }
}

function isWorldFull(){
  for (let tree of entities.trees){
    if (!tree.full){
      return false;
    }
  }
  
  return true;
}

function checkPawnsInPlace(){
  for (let pawn of entities.pawns){
    if (pawn.x !== pawn.destination[0] || pawn.y !== pawn.destination[1]){
      pawnsInPlace = false;
    }
  }

  pawnsInPlace = true;
}

function runLogic(){

  
  //remove dead pawns
  for (let pawn of entities.pawns){
    if (pawn.die){
      let index = entities.pawns.indexOf(pawn);
      entities.pawns.splice(index, 1);
    }
  }

  for (let tree of entities.trees){
    let pawnsindexes = [];

    for (let pawn of entities.pawns){
      let index = entities.pawns.indexOf(pawn);

      //record which pawns are at this tree
      if (pawn.destination[0] === tree.x && pawn.destination[1] === tree.y){
        pawnsindexes.push(index);
      }
    }

    if (pawnsindexes.length === 1){
      entities.pawns[pawnsindexes[0]].food = 2;
    }
    else if (pawnsindexes.length === 2){
      let strategies = [entities.pawns[pawnsindexes[0]].strategy, entities.pawns[pawnsindexes[1]].strategy];
      for (let i = 0; i < 2; i++){
        entities.pawns[pawnsindexes[i]].food = foodResult(strategies[i], strategies[-i+1]);
      }
    }
  }
}

function foodResult(strat1, strat2){
  if (strat1 === DOVE){
    if (strat2 === DOVE){
      return doveDove;
    }
    else if (strat2 === HAWK){
      return doveHawk;
    }
  }
  if (strat1 === HAWK){
    if (strat2 === DOVE){
      return hawkDove;
    }
    else if (strat2 === HAWK){
      return hawkHawk;
    }
  }
}

function goHome(){
  for (let pawn of entities.pawns){
    pawn.destination = [pawn.homeX, pawn.homeY];
  }
}

function newGeneration(){
  for (let pawn of entities.pawns){
    pawn.food-1;
    if (pawn.food < 1){
      if (random() > pawn.food*-1){
        let index = entities.pawns.indexOf(pawn);
        entities.pawns.splice(index, 1);
      }
    }
    else{
      for (i = 0; i < floor(pawn.food); i++){
        createPawn(pawn.strategy);
      }
      if (random() < pawn.food - floor(pawn.food)){
        createPawn(pawn.strategy);
      }
    }
  }
}