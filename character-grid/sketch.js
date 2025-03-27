// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let grid = {
  array: [],
  width: 0,
  height: 0,
};
const CELL_SIZE = 50;
const OPEN_TILE = 0;
const WALL = 1;
const PLAYER = 9;
let thePlayer = {
  x: 0,
  y: 0,
};
let grassImg;
let pathImg;

function preload(){
  grassImg = loadImage('grass.png');
  pathImg = loadImage('paving.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  grid.width = ceil(width/CELL_SIZE);
  grid.height = ceil(height/CELL_SIZE);
  
  grid.array = generateRandomGrid(grid.height, grid.width);
}

function draw() {
  background(220);

  drawGrid();

}

function generateEmptyGrid(cols, rows){
  let newGrid = [];
  for (let y = 0; y < cols; y++){
    newGrid.push([]);
    for (let x = 0; x < rows; x++){
      newGrid[y].push(0);
    }
  }

  //add the player to the grid
  newGrid[thePlayer.y][thePlayer.x] = PLAYER;

  return newGrid;
}

function generateRandomGrid(cols, rows){
  let newGrid = [];
  for (let y = 0; y < cols; y++){
    newGrid.push([]);
    for (let x = 0; x < rows; x++){
      if (random(100) < 50){
        newGrid[y].push(1);
      }
      else{
        newGrid[y].push(0);
      }
    }
  }

  //add the player to the grid
  newGrid[thePlayer.y][thePlayer.x] = PLAYER;

  return newGrid;
}

function drawGrid(){
  let array = grid.array;
  for (let y = 0; y < array.length; y++){
    for (let x = 0; x < array[y].length; x++){
      if (array[y][x] === OPEN_TILE){
        // fill('white');
        image(pathImg, x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE);
      }
      else if (array[y][x] === WALL){
        image(grassImg, x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE);
      }
      else if (array[y][x] === PLAYER){
        fill('red');
        rect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function movePlayer(x, y){
  if (x >= 0 && x < grid.width && y >= 0 && y < grid.height && grid.array[y][x] === OPEN_TILE){
    grid.array[thePlayer.y][thePlayer.x] = OPEN_TILE;
  
    thePlayer.x = x;
    thePlayer.y = y;
  
    grid.array[thePlayer.y][thePlayer.x] = PLAYER;
  }
}

function keyPressed(){
  if (key === "r"){
    grid.array = generateRandomGrid(grid.height, grid.width);
  }
  else if (key === 'e'){
    grid.array =  generateEmptyGrid(grid.height, grid.width);
  }
  else if (key === 'w'){
    //move up
    movePlayer(thePlayer.x, thePlayer.y-1);
  }
  else if (key === 'a'){
    //move left
    movePlayer(thePlayer.x-1, thePlayer.y);
  }
  else if (key === 's'){
    //move down
    movePlayer(thePlayer.x, thePlayer.y+1);
  }
  else if (key === 'd'){
    //move right
    movePlayer(thePlayer.x+1, thePlayer.y);
  }
}

function mouseClicked(){
  let row = floor(mouseX/CELL_SIZE);
  let col = floor(mouseY/CELL_SIZE);

  
  if (row <= grid.width && col <= grid.height && row >= 0 && col >= 0){
    //self
    toggleCell(row, col);

    // //neighnours
    // if (row + 1 <= SQAURE_DIMENSIONS){
    //   toggleCell(row+1, col);
    // }
    // if (row - 1 <= SQAURE_DIMENSIONS && row - 1 >= 0){
    //   toggleCell(row-1, col);
    // }
    // if(col + 1 <= SQAURE_DIMENSIONS && col + 1 >= 0){
    //   toggleCell(row, col+1);
    // }
    // if(col - 1 <= SQAURE_DIMENSIONS && col - 1 >= 0){
    //   toggleCell(row, col-1);
    // }
  }
}

function toggleCell(row, col){
  let cell = grid.array[col][row];

  if (cell === WALL){
    cell = OPEN_TILE;
  }
  else if (cell === OPEN_TILE){
    cell = WALL;
  }

  grid.array[col][row] = cell;
}