// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


class Walker {
  constructor (x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = 10;
    this.radius = 5;
  }

  display(){
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.radius*2);
  }

  move(){
    let choice = random(100);
    if (choice < 25){
      //up
      this.y -= this.speed;
    }
    else if (choice < 50){
      //down
      this.y += this.speed;
    }
    else if (choice < 75){
      //left
      this.x -= this.speed;
    }
    else{
      this.x += this.speed;
    }
  }
}

let walkers = [];

// let walker;
// let will;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // walker = new Walker(width/2, height/2, color(255, 0, 0));
  // will = new Walker(width/4, height/4, color(0, 0, 255));
}

function draw() {
  // background(220);
//   walker.display();
//   will.display();
//   walker.move();
//   will.move();
  drawWalkers();
  moveWalkers();
  
}

function drawWalkers(){
  for (let walker of walkers){
    walker.display();
  }
}

function moveWalkers(){
  for (let walker of walkers){
    walker.move();
  }
}

function spawnWalker(x, y){
  walkers.push(new Walker(x, y, color(random(256), random(256), random(256))));
}

function mouseClicked(){
  spawnWalker(mouseX, mouseY);
}
