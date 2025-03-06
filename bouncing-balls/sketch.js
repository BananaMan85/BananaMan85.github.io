// Bouncing ball object demo

let ballArray = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  for (let ball of ballArray){
    moveBalls(ball);
    displayBalls(ball);
  }
}

function moveBalls(ball){
  //move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  //wrap around the screen
  if (ball.x - ball.radius > width){
    ball.x -= width + ball.radius*2;
  }
  else if (ball.x + ball.radius < 0){
    ball.x += width + ball.radius*2;
  }
  else if (ball.y + ball.radius < 0){
    ball.y += height + ball.radius*2;
  }
  else if (ball.y - ball.radius > height){
    ball.y -= height + ball.radius*2;
  }
}

function displayBalls(ball){
  //display ball
  noStroke();
  fill("red");
  circle(ball.x, ball.y, ball.radius*2);
}

function spawnBall(){
  let someBall = {
    x: random(width),
    y: random(height),
    radius: random(15, 40),
    dx: random(-5, 5),
    dy: random(-5, 5),
  };
  ballArray.push(someBall);
}

function mousePressed(){
  spawnBall();
}