// 2D Array grid demo

const SQAURE_DIMENSIONS = 10;
let cellSize;
let gridSize = 0;
let grid;


function setup() {
  grid = generateGrid(SQAURE_DIMENSIONS, SQAURE_DIMENSIONS);
  findGridSize();
  
  createCanvas(windowWidth, windowHeight);
  cellSize = min(width, height) / gridSize;
}

function draw() {
  background(220);
  displayGrid();
}

function displayGrid(){
  for (let y = 0; y<grid.length; y++){
    for (let x = 0; x<grid[y].length; x++){
      fill(grid[y][x] ? "black" : "white");
      rect (x*cellSize, y*cellSize, cellSize, cellSize);
    }
  }
}

function generateGrid(cols, rows){
  let newGrid = [];
  for (let y = 0; y < rows; y++){
    newGrid.push([]);
    for (let x = 0; x < cols; x++){
      if (random(100) < 50){
        newGrid[y].push(1);
      }
      else{
        newGrid[y].push(0);
      }
    }
  }
  return newGrid; 
}

function generateEmptyGrid(cols, rows){
  let newGrid = [];
  for (let y = 0; y < rows; y++){
    newGrid.push([]);
    for (let x = 0; x < cols; x++){
      newGrid[y].push(0);
    }
  }
  return newGrid;
}

function findGridSize(){
  gridSize = 0;
  for (let row of grid){
    gridSize = max(gridSize, row.length);
  }
  gridSize = max(gridSize, grid.length);
}

function keyPressed(){
  if (key === "r"){
    grid = generateGrid(SQAURE_DIMENSIONS, SQAURE_DIMENSIONS);
    findGridSize();
  }
  else if (key === 'e'){
    grid =  generateEmptyGrid(SQAURE_DIMENSIONS, SQAURE_DIMENSIONS);
    findGridSize();
  }
}

function mouseClicked(){
  let row = floor(mouseX/cellSize);
  let col = floor(mouseY/cellSize);

  toggleCell(row, col);
}

function toggleCell(row, col){
  let cell = grid[col][row];

  cell = -cell + 1;

  grid[col][row] = cell;
}