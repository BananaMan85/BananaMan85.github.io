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
  return newGrid;
}

function drawGrid(){
  let array = grid.array;
  for (let y = 0; y < array.length; y++){
    for (let x = 0; x < array[y].length; x++){
      fill(array[y][x] ? "black" : "white");
      rect(x*CELL_SIZE, y*CELL_SIZE, CELL_SIZE);
    }
  }
}

function keyPressed(){
  if (key === "r"){
    grid.array = generateRandomGrid(grid.height, grid.width);
  }
  else if (key === 'e'){
    grid.array =  generateEmptyGrid(grid.height, grid.width);
  }
}