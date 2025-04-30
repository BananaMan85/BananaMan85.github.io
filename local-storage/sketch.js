// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"


let numOfClicks;

function setup() {
  createCanvas(windowWidth, windowHeight);
  numOfClicks = getItem('score') || 0;
}

function draw() {
  background(220);

  displayClicks();
}

function displayClicks(){
  fill('black');
  textSize(50);
  textAlign(CENTER,CENTER);
  text(numOfClicks, width/2, height/2);
}

function mousePressed(){
  numOfClicks++;
  storeItem('score', numOfClicks);
}
