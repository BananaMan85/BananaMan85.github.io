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
const MAX_PAWNS_PER_TREE = 2;
const SHOW_MY_GRAPH = 0;
const SHOW_MATRIX = 1;
const CHANGE_CONDITIONS = 2;
const SHOW_EXAMPLES = 3;
const SHOW_GAME_RULES = 4;
const DOVE = 0;
const HAWK = 1;
const TREE = -1;
const GRID_WIDTH = -2;
const GRID_HEIGHT = -3;
const CORNER_ROUNDING = 10;
let world = [];
let availableTrees = [];
let autoPlay = false;
let skipMovement = false;
let initialDoves = 5;
let initialHawks = 5;
let treeCount = 1;
let treeDensity = 1/4; //amount of the board that will be populated by trees
let pawnsInPlace = false;
let foodGiven = true;
let foodUsed = false;
let cellSize = 50;
let gridWidth, gridHeight; 
let newGridWidth = 24;
let newGridHeight = 7;
let gameCycle = [findTrees, goHome, newGeneration];
let gameState = 2;
let display = [drawGraph, drawMatrix, drawChangeConditions, drawExamples, drawGameRules];
let displayState = CHANGE_CONDITIONS;
let clickReleased = true;
let treeMap = new Map();
let pawnMap = new Map();

let fullTree, halfTree, emptyTree, grass, doveImage, hawkImage; //variables to hold images

//results for each type of encounter
//                Alone DOVE HAWK
let rewardMatrix = [[2, 7/4, 2/4], //DOVE
                    [2, 6/4, 3/4]];//HAWK


function preload(){
  fullTree = loadImage("images/apple-tree.jpg");
  halfTree = loadImage("images/half-apple-tree.jpg");
  emptyTree = loadImage("images/tree.jpg");
  grass = loadImage("images/grass.jpg");
  doveImage = loadImage("images/dove.jpg");
  hawkImage = loadImage("images/hawk.jpg");
}
                    
function setup() {
  //setup window canvas
  createCanvas(windowWidth, windowHeight);

  //setup world grid
  newGridHeight = floor(newGridWidth * (height/2/width));
  applyConditions();
}

function draw() {
  
  let displayParameter;

  //draw the world grid, buttons for user and update the world
  drawWorld();
  drawButtons();
  updateWorld();
  updateData();

  //update and draw the info display
  if (displayState === SHOW_MY_GRAPH){
    displayParameter = data.history;
  }
  display[displayState](displayParameter);

  //run the current game state
  gameCycle[gameState]();

  //automatically progress the game if autoplay is on
  if (autoPlay){
    nextGameState();
  }
}

//generic class for either pawns or trees
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

    if (skipMovement){
      this.x = this.destination[0];
      this.y = this.destination[1];
    }
    else if (!skipMovement){
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
}

class Tree extends Entity{

  constructor (x, y){
    super(x, y);
    this.pawns = 0;
    this.food = 'full';
  }
}

function keyPressed(){
  //move to the next game state when any key is pressed
  nextGameState();
}

function drawArrow(x1, y1, x2, y2, size = 10){
  stroke(0, 255);
  strokeWeight(2);
  fill(0, 255);

  let angle = atan2(y2 - y1, x2 - x1);

  let arrowX1 = x2 - size * cos(angle - PI / 6);
  let arrowY1 = y2 - size * sin(angle - PI / 6);
  let arrowX2 = x2 - size * cos(angle + PI / 6);
  let arrowY2 = y2 - size * sin(angle + PI / 6);

  line(x1, y1, x2, y2);

  triangle(x2, y2, arrowX1, arrowY1, arrowX2, arrowY2);
}

function drawButton(x, y, w, h, label, size, color1, color2, action, corners = [0, 0, 0, 0], parameters = [null, null, null, null]){
  //draws a button which runs a function when pressed

  let isHovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  fill(isHovered ? color2 : color1); //change colour when hovered
  stroke(0, 255);
  strokeWeight(2);
  rect(x, y, w, h, corners[0], corners[1], corners[2], corners[3]);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(size);
  strokeWeight(0);
  text(label, x + w/2, y + h/2);

  //when the button is clicked run the button's function
  if (isHovered && mouseIsPressed && clickReleased){
    action(parameters[0], parameters[1], parameters[2], parameters[3]);
    clickReleased = false;
  }
}

function mouseReleased(){
  //when mouse click is released allow buttons to be pressed again
  clickReleased = true;
}

function drawButtons(){
  //draws the button for user to use to change how the game operates

  //create position variables for the quadrant
  let areaWidth = width/2;
  let areaHeight = height/2;
  let areaX = 0;
  let areaY = areaHeight;
  let bufferX = areaWidth/5;
  let bufferY = areaHeight/5;
  let size = areaWidth/40;

  //draw and outline the quadrant
  fill(240);
  stroke(0);
  strokeWeight(2);
  rect(areaX, areaY, areaWidth, areaHeight);

  //update position variables for the buttons within the quadrant
  areaWidth -= bufferX*2;
  areaX += bufferX;
  areaHeight -= bufferY*2;
  areaY += bufferY;
  let buttonWidth = areaWidth/2;
  let buttonHeight = areaHeight/4;

  //find if autoplay or skip movement are enabled
  let autoPlayTag = autoPlay ? "On" : "Off";
  let skipMovementTag = skipMovement ? "On" : "Off";

  //draw each button in their places
  drawButton(areaX, areaY, buttonWidth, buttonHeight, "Graph", size, color(255, 255), color(0, 100), changeDisplay, [CORNER_ROUNDING, 0, 0 ,0], [SHOW_MY_GRAPH]);
  drawButton(areaX + buttonWidth, areaY, buttonWidth, buttonHeight, "Reward Matrix", size, color(255, 255), color(0, 100), changeDisplay, [0, CORNER_ROUNDING, 0 ,0], [SHOW_MATRIX]);
  drawButton(areaX, areaY + buttonHeight, buttonWidth, buttonHeight, "Change Conditions", size, color(255, 255), color(0, 100), changeDisplay, [0, 0, 0, 0], [CHANGE_CONDITIONS]);
  drawButton(areaX + buttonWidth, areaY + buttonHeight, buttonWidth, buttonHeight, "Examples", size, color(255, 255), color(0, 100), changeDisplay, [0, 0, 0, 0], [SHOW_EXAMPLES]);
  drawButton(areaX, areaY + buttonHeight*2, buttonWidth, buttonHeight, `Autoplay: ${autoPlayTag}`, size, color(255, 255), color(0, 100), toggleAutoPlay, [0, 0, 0, 0]);
  drawButton(areaX + buttonWidth, areaY + buttonHeight*2, buttonWidth, buttonHeight, `Skip Movement: ${skipMovementTag}`, size, color(255, 255), color(0, 100), toggleSkipMovement, [0, 0, 0, 0]);
  drawButton(areaX, areaY + buttonHeight*3, buttonWidth, buttonHeight, "Reset", size, color(255, 255), color(0, 100), applyConditions, [0, 0, 0, CORNER_ROUNDING]);
  drawButton(areaX + buttonWidth, areaY + buttonHeight*3, buttonWidth, buttonHeight, "Game Rules", size, color(255, 255), color(0, 100), changeDisplay, [0, 0, CORNER_ROUNDING, 0], [SHOW_GAME_RULES]);

}

function toggleAutoPlay(){
  //toggle autoplay on or off
  autoPlay = !autoPlay;
}

function toggleSkipMovement(){
  //toggle skip movement on or off
  skipMovement = !skipMovement;
}

function changeDisplay(newDisplay){
  //update what information is displayed 
  displayState = newDisplay;
}

function changeConditions(condition){
  //changes a specifiic initial condition of the simulation
  
  let num = Number(prompt('Enter the new value')); //get a number from the user

  //user input must be a number
  if (num || num === 0){
    if (condition === DOVE){ //update the initial dove count with a minimum of 0
      initialDoves = round(max(0, num));
    }
    else if (condition === HAWK){ //update the initial hawk count with a minimum of 0
      initialHawks = round(max(0, num));
    }
    else if (condition === TREE){ //update the tree density that must be between 0 and 1
      treeDensity = round(max(0, min(1, num)), 2);
    }
    else if (condition === GRID_WIDTH){ //update the grid width with a minimum of 4 and change the grid height accordingly
      newGridWidth = round(max(4, num));
      newGridHeight = floor(newGridWidth * (height/2/width));
    }
    else if (condition === GRID_HEIGHT){ //update the grid height with a minimum of 4 and change the grid width accordingly
      newGridHeight = round(max(4, num));
      newGridWidth = floor(newGridHeight * (width/(height/2)));
    }
  }
}

function applyConditions(){
  //resets the simulation with the current starting conditions

  //reset all variables
  data.day = 0;
  data.history.doves = [];
  data.history.hawks = [];
  entities.trees = [];
  entities.pawns = [];
  gameState = 2;
  foodGiven = false;
  foodUsed = true;

  //update the grid size
  gridWidth = newGridWidth;
  gridHeight = newGridHeight;

  //update the cell size based on the grid size
  cellSize = min(width/gridWidth, height/2/gridHeight);

  //update the tree count based on the tree density
  treeCount = floor((gridWidth-2) * (gridHeight-2) * treeDensity);

  //reset the world
  world = generateEmptyWorld(gridWidth, gridHeight);

  //populate the world with trees
  placeTrees();
  fillAvailableTrees();
  
  //populate the world with pawns
  for (let i = 0; i < initialDoves; i++){
    entities.pawns.push(createPawn(DOVE));
  }
  for (let i = 0; i < initialHawks; i++){
    entities.pawns.push(createPawn(HAWK));
  }

}

function drawExamples(){
  //draws the examples of different simulation variants
  let areaWidth = width/2;
  let areaHeight = height/2;
  let areaX = areaWidth;
  let areaY = areaHeight;
  let bufferX = areaWidth/5;
  let bufferY = areaHeight/5;
  let size = areaWidth/40;

  //draw quadrant background
  fill(240);
  stroke(0);
  strokeWeight(2);
  rect(areaX, areaY, areaWidth, areaHeight);

  areaWidth -= bufferX*2;
  areaX += bufferX;
  areaHeight -= bufferY*2;
  areaY += bufferY;
  let buttonWidth = areaWidth/3;
  let buttonHeight = areaHeight/3;

}

function drawGameRules(){
  //displays the game rules
  let areaWidth = width/2;
  let areaHeight = height/2;
  let areaX = areaWidth;
  let areaY = areaHeight;
  let bufferX = areaWidth/5;
  let bufferY = areaHeight/5;
  let size = areaWidth/40;

  //draw quadrant background
  fill(240);
  stroke(0);
  strokeWeight(2);
  rect(areaX, areaY, areaWidth, areaHeight);

  // areaWidth -= bufferX*2;
  // areaX += bufferX;
  // areaHeight -= bufferY*2;
  // areaY += bufferY;
  
  //write game rules
  push();
  fill(0);
  strokeWeight(0);
  textSize(size * (3/4));
  textAlign(LEFT, CENTER);
  rectMode(CENTER);
  text(`-Each pawn moves to a random tree 
    \n-When alone, a pawn will eat as much food as it can reach (2) 
    \n-If a dove meets a dove, they share and work together to get more food
    \n-If a hawk meets a hawk, they fight and lose some energy
    \n-If a dove meets a hawk, the hawk steals food from the dove
    \n-A pawn creates 1 offspring per food
    \n-Remaining food converts to a probability for another offspring
    \n-Each pawn only lives for one day
    \n(See Reward Matrix for specific values)`,
  areaX + areaWidth/2 + size, areaY + areaHeight/2, areaWidth, areaHeight);
  pop();

  //draw images
  let treeSize = size*5;
  let treeX = areaX + areaWidth - areaWidth/4;
  let treeY = areaY + areaHeight/2;
  imageMode(CENTER);
  fill(0);
  strokeWeight(0);
  textSize(size * (3/4));
  textAlign(CENTER, CENTER);
  image(fullTree, treeX, treeY, treeSize, treeSize);
  image(doveImage, treeX - treeSize/2, treeY + treeSize/2, treeSize/4, treeSize/4);
  text("Dove", treeX - treeSize/2 - size/2, treeY + treeSize * (3/4), size);
  image(hawkImage, treeX + treeSize/2, treeY + treeSize/2, treeSize/4, treeSize/4);
  text("Hawk", treeX + treeSize/2 - size/2, treeY + treeSize * (3/4), size);
}

function drawChangeConditions(){
  //draws the buttons to change to initial conditions of the game

  //create the position varibles for the quadrant
  let areaWidth = width/2;
  let areaHeight = height/2;
  let areaX = areaWidth;
  let areaY = areaHeight;
  let bufferX = areaWidth/5;
  let bufferY = areaHeight/5;
  let size = areaWidth/40;

  //draw quadrant background
  fill(240);
  stroke(0);
  strokeWeight(2);
  rect(areaX, areaY, areaWidth, areaHeight);
  
  //update the position variables for the buttons
  areaWidth -= bufferX*2;
  areaX += bufferX;
  areaHeight -= bufferY*2;
  areaY += bufferY;
  let buttonWidth = areaWidth/2;
  let buttonHeight = areaHeight/3;

  //draw each button in their place
  drawButton(areaX, areaY, buttonWidth, buttonHeight, `Initial Doves: ${initialDoves}`, size, color(255, 255), color(0, 100), changeConditions, [CORNER_ROUNDING, 0, 0 ,0], [DOVE]);
  drawButton(areaX + buttonWidth, areaY, buttonWidth, buttonHeight, `Initial Hawks: ${initialHawks}`, size, color(255, 255), color(0, 100), changeConditions, [0, CORNER_ROUNDING, 0 ,0], [HAWK]);
  drawButton(areaX, areaY + buttonHeight, buttonWidth, buttonHeight, `World Width: ${newGridWidth}`, size, color(255, 255), color(0, 100), changeConditions, [0, 0, 0, 0], [GRID_WIDTH]);
  drawButton(areaX + buttonWidth, areaY + buttonHeight, buttonWidth, buttonHeight, `World Height: ${newGridHeight}`, size, color(255, 255), color(0, 100), changeConditions, [0, 0, 0, 0], [GRID_HEIGHT]);
  drawButton(areaX, areaY + buttonHeight*2, buttonWidth, buttonHeight, `Tree Density: ${treeDensity}`, size, color(255, 255), color(0, 100), changeConditions, [0, 0, 0, CORNER_ROUNDING], [TREE]);
  drawButton(areaX + buttonWidth, areaY + buttonHeight*2, buttonWidth, buttonHeight, `Apply Conditions`, size, color(255, 255), color(0, 100), applyConditions, [0, 0, CORNER_ROUNDING, 0]);
}

function drawMatrix(){
  //draws the reward matrix display

  //create the position variables for the quadrant
  let matrixWidth = width/2;
  let matrixHeight = height/2;
  let matrixX = matrixWidth;
  let matrixY = matrixHeight;
  let bufferX = matrixWidth/5;
  let bufferY = matrixHeight/5;
  let size = matrixWidth/40;

  //draw quadrant background
  fill(240);
  stroke(0);
  strokeWeight(2);
  rect(matrixX, matrixY, matrixWidth, matrixHeight);

  //write to the bottom left of the quadrant
  fill(0);
  strokeWeight(0);
  textSize(size);
  textAlign(LEFT, BOTTOM);
  text("Rewards Shown For Pawn on the Left", matrixX, matrixY + matrixHeight);

  //update position variables for the buttons
  matrixWidth -= bufferX*2;
  matrixX += bufferX;
  matrixHeight -= bufferY*2;
  matrixY += bufferY;
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
    strokeWeight(0);
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
      let corners = [0, 0, 0, 0];

      if (y === 0){
        if (x === 1){
          corners[0] = CORNER_ROUNDING;
        }
        else if (x === 2){
          corners[1] = CORNER_ROUNDING;
        }
      }
      else if (y === 1){
        if (x === 1){
          corners[3] = CORNER_ROUNDING;
        }
        else if (x === 2){
          corners[2] = CORNER_ROUNDING;
        }
      }
      
      drawButton(x1, y1, w, h, rewardMatrix[y][x], size, color(255, 255), color(0, 100), changeRewardMatrix, corners, [matrixX, matrixY, matrixWidth, matrixHeight]);
    }
  }
  
  for (let x = 1; x < rewardMatrix[0].length; x++){
    let x1 = matrixX + cellWidth * (x-1);
    let w = cellWidth;
    let h = cellHeight;

    if (rewardMatrix[0][x] < rewardMatrix[1][x]){
      drawArrow(x1 + w/2 - w/4, matrixY + h/2, x1 + w/2 - w/4, matrixY + h/2 + h, size/2);
    }
    else if (rewardMatrix[1][x] < rewardMatrix[0][x]){
      drawArrow(x1 + w/2 - w/4, matrixY + h/2 + h, x1 + w/2 - w/4, matrixY + h/2, size/2);
    }
    else{
      strokeWeight(size/4);
      line(x1 + w/2 - w/4 - w/8, matrixY + h - h/8, x1 + w/2 - w/4 + w/8, matrixY + h - h/8);
      line(x1 + w/2 - w/4 - w/8, matrixY + h + h/8, x1 + w/2 - w/4 + w/8, matrixY + h + h/8);
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
  let lineSize = min(graphHeight, graphWidth)/200;

  //draw graph background
  fill(240);
  stroke(0);
  strokeWeight(2);
  rect(graphX, graphY, graphWidth, graphHeight);

  graphWidth -= bufferX*2;
  graphX += bufferX;
  graphHeight -= bufferY*2;
  graphY += bufferY;

  let days = history.doves.length;

  if (days >= 2){
    let step = graphWidth / (days-1);

    //draw doves area
    stroke(0, 255);
    strokeWeight(2);
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
    strokeWeight(2);
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
      strokeWeight(lineSize);
      line(graphX - bufferX/2, graphY + graphHeight - graphHeight*i, graphX + bufferX/2, graphY + graphHeight - graphHeight*i);
      textAlign(RIGHT, CENTER);
      textSize(lineSize*6);
      strokeWeight(0);
      text(round(i, 1), graphX - bufferX/2, graphY + graphHeight - graphHeight*i);
    }

    //draw markers for x-axis (days passed)
    for (let i = 0; i < days; i++){
      fill('black');
      stroke(0, 255);
      strokeWeight(lineSize);
      line(graphX + i * step, graphY + graphHeight - bufferY/2, graphX + i * step, graphY + graphHeight + bufferY/2);
      textAlign(CENTER, TOP);
      textSize(lineSize*6);
      strokeWeight(0);
      text(i, graphX + i * step, graphY + graphHeight + bufferY/2);
    }

    //indicator for total days passed
    textAlign(CENTER, BOTTOM);
    text (days-1, graphX + graphWidth + bufferX/2, graphY + graphHeight);
  }
  else {
    textAlign(CENTER, CENTER);
    textSize(lineSize*20);
    fill(0, 255);
    stroke(0, 255);
    strokeWeight(0);
    text("Not Enough Data!", graphX + graphWidth/2, graphY + graphHeight/2);
  }

}

function changeRewardMatrix(x, y, w, h){
  let rewardLocation = [];
  let num = Number(prompt('Enter the new value'));

  if (num){
    if (mouseX > x && mouseX < x + w/2){
      if (mouseY > y && mouseY < y + h/2){
        rewardLocation = [1, 0];
        rewardMatrix[rewardLocation[1]][rewardLocation[0]] = num;
      }
      else if (mouseY > y + h/2 && mouseY < y + h){
        rewardLocation = [1, 1];
        rewardMatrix[rewardLocation[1]][rewardLocation[0]] = num;
      }
    }
    else if (mouseX > x + w/2 && mouseX < x + w){
      if (mouseY > y && mouseY < y + h/2){
        rewardLocation = [2, 0];
        rewardMatrix[rewardLocation[1]][rewardLocation[0]] = num;
      }
      else if (mouseY > y + h/2 && mouseY < y + h){
        rewardLocation = [2, 1];
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
  if (pawnsInPlace && (foodGiven || foodUsed)){
    gameState++;

    if (gameState >= gameCycle.length){
      entities.pawns = shuffleArray(entities.pawns);
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

function findTrees(){
  for (let pawn of entities.pawns){
    pawn.findDestination();
    pawn.move();
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
  treeMap.clear();
  let availablePositions = [];

  for (let x = 1; x < gridWidth - 1; x++){
    for (let y = 1; y < gridHeight - 1; y++){
      availablePositions.push([x, y]);
    }
  }

  availablePositions = shuffleArray(availablePositions);

  for (let i = 0; i < treeCount && i < availablePositions.length; i++){
    let [treeX, treeY] = availablePositions[i];
    let tree = new Tree(treeX, treeY);
    entities.trees.push(tree);
    treeMap.set(`${treeX}, ${treeY}`, tree);
  }
}

function fillAvailableTrees(){
  availableTrees = [];
  for (let i = 0; i < MAX_PAWNS_PER_TREE; i++){
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
  for (let y = 0; y <= world.length; y++){
    let yCoord = y * cellSize;
    for (let x = world[0].length; x >= 0; x--){
      let xCoord = x * cellSize;

      imageMode(CORNER);
      image(grass, xCoord + xOffset, yCoord + yOffset, cellSize, cellSize);

      if (y < world.length && x < world[y].length){
        if (world[y][x].includes('tree')){
          let tree = treeMap.get(`${x}, ${y}`);
          if (tree.food === 'empty'){
            image(emptyTree, xCoord + xOffset, yCoord + yOffset, cellSize, cellSize);
          }
          else if (tree.food === 'half'){
            image(halfTree, xCoord + xOffset, yCoord + yOffset, cellSize, cellSize);
          }
          else if (tree.food === 'full'){
            image(fullTree, xCoord + xOffset, yCoord + yOffset, cellSize, cellSize);
          }
        }
        if (world[y][x].includes('pawn')){
          let pawns = pawnMap.get(`${x}, ${y}`);
          let doves = pawns.filter(pawn => pawn.strategy === DOVE);
          let hawks = pawns.filter(pawn => pawn.strategy === HAWK);
          let counter = 0;

          imageMode(CENTER);
          for (let dove of doves){
            image(doveImage, xCoord + xOffset + ((counter + 0.5) / pawns.length) * cellSize, yCoord + yOffset + cellSize * (3/4), cellSize/4, cellSize/4);
            counter++;
          }
          for (let hawk of hawks){
            image(hawkImage, xCoord + xOffset + ((counter + 0.5) / pawns.length) * cellSize, yCoord + yOffset + cellSize * (3/4), cellSize/4, cellSize/4);
            counter++;
          }
        }
      }
    }
  }
}

function updateWorld(){
  pawnMap.clear();

  for (let y = 0; y < world.length; y++){
    for (let x = 0; x < world[y].length; x++){
      world[y][x] = [];
    }
  }

  for (let pawn of entities.pawns){
    let x = pawn.x;
    let y = pawn.y;

    let key = `${x}, ${y}`;

    if (!pawnMap.has(key)){
      pawnMap.set(key, []);
    }
    pawnMap.get(key).push(pawn);

    world[y][x].push('pawn');
  }

  for (let tree of entities.trees){
    let x = tree.x;
    let y = tree.y;

    world[y][x].push('tree');
  }
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
      tree.food = 'half';
      let pawn = pawnsAtTree[0];
      pawn.food = rewardMatrix[pawn.strategy][0];
    }

    else if (pawnsAtTree.length === MAX_PAWNS_PER_TREE){
      let pawn1 = pawnsAtTree[0];
      let pawn2 = pawnsAtTree[1];

      pawn1.food = rewardMatrix[pawn1.strategy][pawn2.strategy+1];
      pawn2.food = rewardMatrix[pawn2.strategy][pawn1.strategy+1];

      if (pawn1.strategy === DOVE && pawn2.strategy === DOVE){
        tree.food = 'empty';
      }
      else{
        tree.food = 'half';
      }
    }
  }
}

function goHome(){
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
    foodGiven = false;
    for (let tree of entities.trees){
      tree.pawns = 0;
      tree.food = 'full';
    }
  }
}
