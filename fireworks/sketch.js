// Fireworks OOP Demo
class Particle{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.dx = random(-5, 5);
    this.dy = random(-5, 5);
    this.radius = 2;
    this.r = 255;
    this.g = 0;
    this.b = 0;
    this.opacity = 255;
  }

  display(){
    noStroke();
    fill(color(this.r, this.g, this.b, this.opacity));
    circle(this.x, this.y, this.radius*2);
  }

  update(){
    this.x += this.dx;
    this.y += this.dy;
    this.opacity -= 5;

    if (this.opacity <= 0){
      let index = theFireworks.indexOf(this);
      theFireworks.splice(index, 1);
    }
  }
}

const FIREWORKS_PER_CLICK = 1000;
let theFireworks = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  for (let firework of theFireworks){
    firework.update();
    firework.display();
  }
}

function mouseClicked(){
  for (let i = 0; i < FIREWORKS_PER_CLICK; i++){
    let firework = new Particle(mouseX, mouseY);
    theFireworks.push(firework);
  }
}
