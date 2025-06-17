// Final Exam Ball OOP
// William Sherwood

let radiusRange = [10, 20];
let maxSpeed = 5;
let ballArray = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Add 5 initial balls
  for (let i = 0; i < 5; i++){
    ballArray.push(createBall());
  }
}

function draw() {
  background(220);

  // Iterate through every ball to move and display it
  for (let ball of ballArray){
    ball.move();
    ball.display();
  }
}

class Ball{

  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.dx = random(-maxSpeed, maxSpeed);
    this.dy = random(-maxSpeed, maxSpeed);
    this.radius = r;
    this.color = color(random(255), random(255), random(255)); // random colour
  }

  move(){
    this.x += this.dx;
    this.y += this.dy;

    // Reverse horizontal speed if past the width of the screen
    if (this.x + this.radius >= width){
      this.dx *= -1;
    }
    else if (this.x - this.radius <= 0){
      this.dx *= -1;
    }

    // Reverse the vertical speed if past the height of the screen
    if (this.y + this.radius >= height){
      this.dy *= -1;
    }
    else if (this.y - this.radius <= 0){
      this.dy *= -1;
    }
  }

  display(){

    // Draw the ball to the screen
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.radius*2);
  }

  checkIfPointInsideBall(x, y){

    // Check if a point (Where the mouse is clicked) is inside the ball
    if (dist(this.x, this.y, x, y) < this.radius){

      // Find the index of the ball in the ballArray and remove it
      let index = ballArray.indexOf(this);
      ballArray.splice(index, 1);
    }
  }
}

function createBall(){
  // Returns a newly created Ball

  let radius = random(radiusRange[0], radiusRange[1]);

  // Don't allow the ball to spawn already slightly outside of the screen
  let x = random(radius, width - radius);
  let y = random(radius, height - radius);

  return new Ball(x, y, radius);
}

function keyPressed(){
  // Add a new ball to the ballArray
  ballArray.push(createBall());
}

function mousePressed(){
  //Remove balls that are clicked on 
  for (let ball of ballArray){
    ball.checkIfPointInsideBall(mouseX, mouseY);
  }
}