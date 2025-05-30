/* eslint-disable indent */
// Sierpinski Triangle demo

let initialTriangle = [
  {x: 800, y:50},
  {x: 50, y: 700},
  {x: 1550, y: 700}
];

let theColors = ['blue', 'cyan', 'green', 'purple', 'red', 'yellow', 'orange', 'brown'];

let theDepth = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  
}

function mousePressed(){
  if (theDepth < 8){
    background(220);
    sierpinkski(initialTriangle, theDepth);
    theDepth++;
  }
}

function sierpinkski(points, depth){
  //shell triangle
  fill(theColors[depth]);
  triangle(points[0].x, points[0].y, 
           points[1].x, points[1].y, 
           points[2].x, points[2].y
  );

  //escape

  if (depth > 0){
    //pattern 
    //bottom left
    sierpinkski([midpoint(points[0], points[1]), 
                 points[1],
                 midpoint(points[1], points[2])],
                 depth - 1
    );

    sierpinkski([midpoint(points[0], points[1]), 
                 points[0],
                 midpoint(points[2], points[0])],
                 depth - 1
    );

    sierpinkski([midpoint(points[2], points[1]), 
                 points[2],
                 midpoint(points[0], points[2])],
                 depth - 1
    );
  }



}

function midpoint(point1, point2){
  let midX = (point1.x + point2.x) / 2;
  let midY = (point1.y + point2.y) / 2;

  return {x: midX, y: midY};
}
