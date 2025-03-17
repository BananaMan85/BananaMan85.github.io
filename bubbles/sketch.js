//Bubble Object Notation Arrays Demo

let theBubbles = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 10; i++){
    spawnBubble();
  }

  //spawn a new bubble every 0.5 s
  window.setInterval(spawnBubble, 500);
}

function draw() {
  noStroke();
  background(220);
  for (let bubble of theBubbles){
    //randomize movement
    bubble.dx = random(-5, 5);
    bubble.dy = random(-5, 5);

    //draw bubble
    fill(bubble.r, bubble.g, bubble.b);
    circle(bubble.x, bubble.y, bubble.radius*2);

    //move bubble
    bubble.x += bubble.dx;
    bubble.y += bubble.dy;
  }

}

function spawnBubble(){
  let someBubble = {
    x: random(width),
    y: random(height),
    radius: random(40, 80),
    r: random(255),
    g: random(255),
    b: random(255),
    dx: random(-5, 5),
    dy: random(-5, 5),
  };
  theBubbles.push(someBubble);
}

function mouseClicked(){
  for (let bubble of theBubbles){
    if (dist(mouseX, mouseY, bubble.x, bubble.y) < bubble.radius){
      let index = theBubbles.indexOf(bubble);
      theBubbles.splice(index, 1);
    }
  }
}