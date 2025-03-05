// Bouncing ball object demo

let ballArray = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  for (let ball of ballArray){
    //move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    //wrap around the screen
    ball.x += width + ball.radius;
    ball.x %= width;
    ball.x -= ball.radius;
    ball.y += height + ball.radius;
    ball.y %= height;
    ball.y -= ball.radius;

    //display ball
    fill("red");
    circle(ball.x, ball.y, ball.radius*2);
  }
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