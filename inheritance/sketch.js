// OOP Inheritance

let shapes = []

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 50; i++){
    let theColor = color(random(255), random(255), random(255));
    let choice = random(100);
    if (choice < 25){
      shapes.push(new Circle(random(width), random(height), theColor, random(30, 40)));
    }
    else if (choice < 50){
      shapes.push(new Shape(random(width), random(height), theColor));
    }
    else if (choice < 75){
      shapes.push(new Square(random(width), random(height), theColor, random(30, 40)));
    }
    else{
      shapes.push(new MovingCricle(random(width), random(height), theColor, random(30, 40)));
    }
  }
}

function draw() {
  background(220);
  for (let shape of shapes){
    shape.display();
  }
}

class Shape{

  constructor(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;
  }

  display(){
    //placeholder
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, 30, 60);
  }
}

class Circle extends Shape{

  constructor(x, y, color, r){
    super(x, y, color);
    this.radius = r;
  }

  display(){
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.radius*2);
  }
}

class Square extends Shape {

  constructor(x, y, color, size){
    super(x, y, color);
    this.size = size;
  }

  display(){
    noStroke();
    fill(this.color);
    rectMode(CENTER);
    rect(this.x, this.y, this.size);
  }
}

class MovingCricle extends Circle{

  constructor(x, y, color, r){
    super(x, y, color, r);
    this.dx = random(-5, 5);
    this.dy = random(-5, 5);
  }

  update(){
    this.x += this.dx;
    this.y += this.dy;

    // if (this.x > width){
    //   this.x -= width;
    // }
    // if (this.x < width){
    //   this.x += width;
    // }
    // if(this.y > height){
    //   this.y -= height;
    // }
    // if(this.y < height){
    //   this.y += height;
    // }
  }

  display(){
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.radius * 2);
    this.update();
  }
}