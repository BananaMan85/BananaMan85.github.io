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
let availableTrees = [];
let treeCount = 1;
let treeDensity = 1/4; //amount of the board that will be populated by trees
let cellSize = 50;
let pawnsInPlace = false;
let foodGiven = true;
let foodUsed = false;
let gridWidth, gridHeight; 
let gameCycle = [findTrees, goHome, newGeneration];
let gameState = 2;
let display = [drawGraph, drawMatrix ];
let displayState = 1;
let clickReleased = true;
const DOVE = 0;
const HAWK = 1;

//results for each type of encounter
//                      DOVE  HAWK
let rewardMatrix = [[2, 7/4, 2/4], //DOVE
                    [2, 6/4, 3/4]];//HAWK


 
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
    if (this.destination[0] === this.homeX && this.destination[1] === this.homeY || this.die){
      if (this.die){
        this.destination = [this.homeX, this.homeY];
        return;
      }
      if (availableTrees.length === 0){
        this.die = true;
        return;
      }

      let tree = availableTrees.pop();

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
      return;
    }
    else{
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

function setup() {
  createCanvas(1200, 700);
  
  gridWidth = width/cellSize;
  gridHeight = height/2/cellSize;

  treeCount = floor((gridWidth-2) * (gridHeight-2) * treeDensity);

  world = generateEmptyWorld(gridWidth, gridHeight);

  placeTrees();
  fillAvailableTrees();

  for (let i = 0; i < 5; i++){
    entities.pawns.push(createPawn(DOVE));
  }
  for (let i = 0; i < 5; i++){
    entities.pawns.push(createPawn(HAWK));
  }
}

function draw() {
  background(220);

  let displayParameter;
  if (displayState === 0){
    displayParameter = data.history;
  }

  drawWorld();
  display[displayState](displayParameter);
  updateWorld();
  updateData();

  gameCycle[gameState]();
}

function keyPressed(){
  if (key === ' '){
    nextGameState();
  }
}

function drawButton(x, y, w, h, label, size, color1, color2, action, a = null, b = null, c = null, d = null){
  //draws a button which runs a function when pressed

  let isHovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  fill(isHovered ? color2 : color1); //change colour when hovered
  stroke(0, 255);
  strokeWeight(2);
  rect(x, y, w, h, 10);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(size);
  text(label, x + w/2, y + h/2);

  //when the button is clicked run the button's function
  if (isHovered && mouseIsPressed && clickReleased){
    action(a, b, c, d);
    clickReleased = false;
  }
}

function mouseReleased(){
  //when mouse click is released allow buttons to be pressed again
  clickReleased = true;
}

function drawMatrix(){
  let matrixWidth = width/2;
  let matrixHeight = height/2;
  let matrixX = width - matrixWidth;
  let matrixY = height - matrixHeight;
  let bufferX = matrixWidth/5;
  let bufferY = matrixHeight/5;
  let size = matrixHeight/20;

  //draw graph background
  fill(240);
  stroke(0);
  rect(matrixX, matrixY, matrixWidth, matrixHeight);

  matrixWidth -= bufferX*2;
  matrixX += bufferX;
  matrixHeight -= bufferY*2;
  matrixY += bufferY
  let cellWidth = matrixWidth/2;
  let cellHeight = matrixHeight/2;

  for (let y = 0; y < rewardMatrix.length; y++){

    let strategy;
    if (y === DOVE){
      strategy = 'Dove';
    }
    else if (y === HAWK){
      strategy = 'Hawk';
    }
    fill(0);
    textSize(size);
    textAlign(RIGHT, CENTER);
    text(strategy, matrixX, matrixY + cellHeight * y + cellHeight/2);

    textAlign(CENTER, BOTTOM);
    text(`vs. ${strategy}`, matrixX + cellWidth * y + cellWidth/2, matrixY);

    for (let x = 1; x < rewardMatrix[y].length; x++){
      let x1 = matrixX + cellWidth * (x-1);
      let y1 = matrixY + cellHeight * y;
      let w = cellWidth;
      let h = cellHeight;
      
      drawButton(x1, y1, w, h, rewardMatrix[y][x], size, color(255, 255), color(0, 100), changeRewardMatrix, matrixX, matrixY, matrixWidth, matrixHeight);
    }
  }


}

function drawGraph(history){
  let graphWidth = width/2;
  let graphHeight = height/2;
  let graphX = width - graphWidth;
  let graphY = height - graphHeight;
  let bufferX = graphWidth/15;
  let bufferY = graphHeight/15;
  let lineSize = graphHeight/400;

  //draw graph background
  fill(240);
  stroke(0);
  rect(graphX, graphY, graphWidth, graphHeight);

  graphWidth -= bufferX*2;
  graphX += bufferX;
  graphHeight -= bufferY*2;
  graphY += bufferY

  let days = history.doves.length;

  if (days >= 2){
    let step = graphWidth / (days-1);

    //draw doves area
    stroke(0, 255);
    fill(0, 0, 255);
    beginShape();
    vertex(graphX, graphY + graphHeight);
    for (let i = 0; i < days; i++){
      let x  = graphX + i * step;
      let yDove = map(history.doves[i], 0, 1, graphY + graphHeight, graphY);
      vertex(x, yDove);
    }
    vertex (graphX + graphWidth, graphY + graphHeight);
    endShape(CLOSE);

    //draw hawks area
    stroke(0, 255);
    fill(255, 0, 0);
    beginShape();
    vertex(graphX, graphY);
    for (let i = 0; i < days; i++){
      let x = graphX + i * step;
      let yHawk = map(history.hawks[i], 0, 1, graphY, graphY + graphHeight);
      vertex(x, yHawk);
    }
    vertex (graphX + graphWidth, graphY);
    endShape(CLOSE);

    //draw markers for y-axis (amount of a certain strategy)
    for (let i = 1; i > 0; i -= 0.2){
      fill('black');
      stroke(0, 255);
      rect(graphX - bufferX/2, graphY + graphHeight - graphHeight*i - lineSize/2, bufferX, lineSize);
      textAlign(RIGHT, CENTER);
      textSize(lineSize*15);
      text(round(i, 1), graphX - bufferX/2, graphY + graphHeight - graphHeight*i);
    }

    //draw markers for x-axis (days passed)
    for (let i = 0; i < days; i++){
      fill('black');
      stroke(0, 255);
      rect(graphX + i * step - lineSize/2, graphY + graphHeight - bufferY/2, lineSize, bufferY);
      textAlign(CENTER, TOP);
      textSize(lineSize*15);
      text(i, graphX + i * step, graphY + graphHeight + bufferY/2);
    }

    //indicator for total days passed
    textAlign(CENTER, BOTTOM);
    text (days-1, graphX + graphWidth + bufferX/2, graphY + graphHeight);
  }

}

function changeRewardMatrix(x, y, w, h){
  let rewardLocation = [];
  let num = Number(prompt('Enter the new value'));

  if (mouseX > x && mouseX < x + w/2){
    if (mouseY > y && mouseY < y + h/2){
      rewardLocation = [1, 0];
      if (num){
        rewardMatrix[rewardLocation[1]][rewardLocation[0]] = num;
      }
      
    }
    else if (mouseY > y + h/2 && mouseY < y + h){
      rewardLocation = [1, 1];
      if (num){
        rewardMatrix[rewardLocation[1]][rewardLocation[0]] = num;
      }
    }
  }
  else if (mouseX > x + w/2 && mouseX < x + w){
    if (mouseY > y && mouseY < y + h/2){
      rewardLocation = [2, 0];
      if (num){
        rewardMatrix[rewardLocation[1]][rewardLocation[0]] = num;
      }
    }
    else if (mouseY > y + h/2 && mouseY < y + h){
      rewardLocation = [2, 1];
      if (num){
        rewardMatrix[rewardLocation[1]][rewardLocation[0]] = num;
      }
    }
  }
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
  if (pawnsInPlace && foodGiven){
    gameState++;

    if (gameState >= gameCycle.length){
      entities.pawns = shuffleArray(entities.pawns);
      // mixPawns();
      fillAvailableTrees();
      data.day++;
      gameState = 0;
      foodGiven = false;
      foodUsed = false;

      data.history.doves.push(data.pDoves);
      data.history.hawks.push(data.pHawks);

      for (let pawn of entities.pawns){
        pawn.destination = [pawn.homeX, pawn.homeY];
        pawn.atDestination = false;
      }
    }
  }
}

function mixPawns(){
  let doves = entities.pawns.filter(p => p.strategy === DOVE);
  let hawks = entities.pawns.filter(p => p.strategy === HAWK);
  let newPawns = [];

  while (doves.length > 0 && hawks.length > 0) {
    newPawns.push(doves.pop());
    newPawns.push(hawks.pop());
  }

  // Append the remaining pawns (only one type will be left)
  newPawns = newPawns.concat(doves).concat(hawks);

  entities.pawns = newPawns;
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

  return new Pawn(x, y, strategy);
}

function placeTrees(){

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

function fillAvailableTrees(){
  availableTrees = [];
  for (let i = 0; i < 2; i++){
    for (let tree of entities.trees){
      availableTrees.push(tree);
    }
  }

  availableTrees = shuffleArray(availableTrees);
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

function drawWorld(xOffset = 0, yOffset = 0){
  for (let y = 0; y < world.length; y++){
    yCoord = y * cellSize;
    for (let x = 0; x < world[y].length; x++){
      xCoord = x * cellSize;

      fill("white");
      stroke(0, 255);
      rect(xCoord+xOffset, yCoord+yOffset, cellSize, cellSize);

      if (world[y][x].includes('tree')){
        fill("black");
        textAlign(CENTER,CENTER);
        textSize(cellSize/2);
        text('T', xCoord + xOffset + cellSize/2, yCoord + yOffset + cellSize/2);
      }
      else if (world[y][x].includes('pawn')){
        fill("black");
        textAlign(CENTER,CENTER);
        textSize(cellSize/2);
        text('P', xCoord + xOffset + cellSize/2, yCoord + yOffset + cellSize/2);
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
    let pawnsAtTree = entities.pawns.filter(pawn => 
      pawn.destination[0] === tree.x && pawn.destination[1] === tree.y
    );
  
    if (pawnsAtTree.length === 1){
      let pawn = pawnsAtTree[0];
      pawn.food = rewardMatrix[pawn.strategy][0];
    }

    else if (pawnsAtTree.length === 2){
      let pawn1 = pawnsAtTree[0];
      let pawn2 = pawnsAtTree[1];

      pawn1.food = rewardMatrix[pawn1.strategy][pawn2.strategy+1];
      pawn2.food = rewardMatrix[pawn2.strategy][pawn1.strategy+1];
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
    let newPawns = [];

    for (let pawn of entities.pawns){
      let food = pawn.food;
      let strategy = pawn.strategy;

      for (let i = 0; i < floor(food); i++){
        newPawns.push(createPawn(strategy));
      }

      if (random() < food - floor(food)){
        newPawns.push(createPawn(strategy));
      }
    }

    entities.pawns = newPawns;
    foodUsed = true;
  }
}
