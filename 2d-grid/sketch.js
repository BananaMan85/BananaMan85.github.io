// 2d grid assignment || Evolutionary Game Theory
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
let data = {
  day: 0,
  pawns: 0,
  doves: 0,
  hawks: 0,
  pDoves: 0,
  pHawks: 0,
  history: {
    doves: [],
    hawks: [],
  },
};
let world = [];
let treeCount = 100;
let treeDensity = 1/4; //amount of the board that will be populated by trees
let cellSize = 50;
let pawnsInPlace = false;
let foodGiven, foodUsed = false;
let gridWidth, gridHeight; 
let gameCycle = [findTrees, goHome, newGeneration];
let gameState = 0;
const DOVE = 0;
const HAWK = 1;

//results for each type of encounter
//                      DOVE  HAWK
let rewardMatrix = [[2, 1.75, 0.5], //DOVE
                    [2, 1.5, 0.75]];//HAWK

function setup() {
  createCanvas(800, 800);
  
  gridWidth = width/cellSize;
  gridHeight = height/cellSize;

  treeCount = floor((gridWidth-2) * (gridHeight-2) * (treeDensity));

  world = generateEmptyWorld(gridWidth, gridHeight);

  placeTrees();

  for (let i = 0; i < 2; i++){
    createPawn(DOVE);
  }
  for (let i = 0; i < 2; i++){
    createPawn(HAWK);
  }
}

function draw() {
  background(220);

  drawWorld();
  updateWorld();
  updateData();

  gameCycle[gameState]();
}

function keyPressed(){
  if (key === ' '){
    nextGameState();
  }
}

function drawGraph(history){


}

function updateData(){
  data.pawns = 0;
  data.doves = 0;
  data.hawks = 0;
  for (let pawn of entities.pawns){
    data.pawns++;
    if (pawn.strategy === DOVE){
      data.doves++;
    }
    else if (pawn.strategy === HAWK){
      data.hawks++;
    }
  }

  data.pDoves = data.doves/data.pawns;
  data.pHawks = data.hawks/data.pawns;
}

function nextGameState(){
  checkPawnsInPlace();
  if (pawnsInPlace){
    gameState++;

    if (gameState >= gameCycle.length){
      entities.pawns = shuffleArray(entities.pawns);
      data.day++;
      gameState = 0;
      foodGiven = false;
      foodUsed = false;
      for (let pawn of entities.pawns){
        pawn.destination = [pawn.homeX, pawn.homeY];
        pawn.atDestination = false;
      }
    }
  }
}

function findTrees(){
  for (let pawn of entities.pawns){
    pawn.findDestination();
    pawn.move();
    for (let tree of entities.trees){
      tree.updatePawns();
    }
  }
  
  if (!foodGiven){
    checkPawnsInPlace();
    if (pawnsInPlace){
      runLogic();
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

  //move a random amount on one random axis
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
  // for (let i = 0; i < treeCount; i++){
  //   let treeX = floor(random(1, gridWidth - 1));
  //   let treeY = floor(random(1, gridHeight - 1));
  //   let isTaken = true;
  //   while (isTaken){
  //     isTaken = false;
  //     for (let tree of entities.trees){
  //       if (tree.x === treeX && tree.y === treeY){
  //         isTaken = true;
  //       }
  //     }
  //   }
  //   entities.trees.push(new Tree(treeX, treeY));
  // }

  let availablePositions = [];

  for (let x = 1; x < gridWidth - 1; x++){
    for (let y = 1; y < gridHeight - 1; y++){
      availablePositions.push([x, y]);
    }
  }

  availablePositions = shuffleArray(availablePositions);

  for (let i = 0; i < treeCount && i < availablePositions.length; i++){
    let [treeX, treeY] = availablePositions[i];
    entities.trees.push(new Tree(treeX, treeY));
  }
}

function shuffleArray(array){
  for (let i = array.length - 1; i > 0; i--){
    let j = floor(random(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
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
    this.food = 1;
    this.destination = [x, y];
    this.atDestination = false;
    this.die = false;

  }

  findDestination(){
    if ((this.destination[0] === this.homeX && this.destination[1] === this.homeY) || this.die){
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
      //remove dead pawns
      let index = entities.pawns.indexOf(this);
      entities.pawns.splice(index, 1);
    }
    else if (!this.atDestination){
      distX = this.destination[0] - this.x;
      distY = this.destination[1] - this.y;
    }
    
    if (distX === 0 && distY === 0){
      if (!this.die){
        this.atDestination = true;
        return;
      }
      else{
        return;
      }
    }

    if ((distX !== 0 || distY !== 0) && !this.atDestination){
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
      return;
    }
  }

  pawnsInPlace = true;
}

function runLogic(){
  foodGiven = true;

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
      entities.pawns[pawnsindexes[0]].food = rewardMatrix[entities.pawns[pawnsindexes[0]].strategy][0];;
    }
    else if (pawnsindexes.length === 2){
      for (let i = 0; i < 2; i++){
        entities.pawns[pawnsindexes[i]].food = rewardMatrix[entities.pawns[pawnsindexes[0]].strategy][entities.pawns[pawnsindexes[1]].strategy+1];;
      }
    }
  }
}

function goHome(){
  for (let tree of entities.trees){
    tree.pawns = 0;
  }
  for (let pawn of entities.pawns){
    pawn.atDestination = false;
    pawn.destination = [pawn.homeX, pawn.homeY];
    pawn.move();
  }
  
}

function newGeneration(){
  if (!foodUsed){
    for (let pawn of entities.pawns){
      pawn.food -= 1;
      if (pawn.food < 0){
        if (random() < pawn.food*-1){
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

      pawn.food = 0;
    }

    foodUsed = true;
  }
}