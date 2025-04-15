// Connected Nodes OOP demo

let nodes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  nodes.push(new MovingPoint(random(width), random(height)));
}

function draw() {
  background(220);

  for (let node of nodes){
    node.update();
    node.connect(nodes);
  }

  for (let node of nodes){
    node.display();
  }
}

function mouseClicked(){
  nodes.push(new MovingPoint(mouseX, mouseY));
}

class MovingPoint {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.speed = 3;
    this.radius = 15;
    this.xTime = random(1000);
    this.yTime = random(1000);
    this.deltaTime = 0.01;
    this.color = color(random(255), random(255), random(255));
    this.reach = 100;
    this.maxRadius = 50;
    this.minRadius = 15;
  }

  display() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.radius*2);
  }

  update() {
    this.move();
    this.wrap();
    this.adjustSizeWithMouse();
  }

  move() {
    let dx = map(noise(this.xTime), 0, 1, -this.speed, this.speed);
    let dy = map(noise(this.yTime), 0, 1, -this.speed, this.speed);

    this.xTime += this.deltaTime;
    this.yTime += this.deltaTime;

    this.x += dx;
    this.y += dy;
  }

  wrap(){
    if (this.x - this.radius > width){
      this.x -= width + this.radius;
    }
    if (this.x + this.radius < 0){
      this.x += width + this.radius;
    }
    if (this.y - this.radius > height){
      this.y -= height + this.radius;
    }
    if (this.y + this.radius < 0){
      this.y += height + this.radius;
    }
  }

  adjustSizeWithMouse(){
    let distance = dist(this.x, this.y, mouseX, mouseY);

    if (distance <= this.reach){
      this.radius = map(distance, 0, this.reach, this.maxRadius, this.minRadius);
    }
    else {
      this.radius = this.minRadius;
    }
  }

  connect(nodesArray) {
    for (let node of nodesArray){
      if (this !== node){
        if (dist(node.x, node.y, this.x, this.y) <= this.reach){
          stroke(this.color);
          line(node.x, node.y, this.x, this.y);
        }
      }
    }
  }
}